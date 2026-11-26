// Servidor local da trilha — Node puro (ES modules), zero dependências. Use: npm start
//   node server.js            → http://localhost:5173
//   node server.js --open     → idem e abre o navegador
//   PORT=8080 node server.js  → outra porta
// Salva o progresso em progress.json (na raiz do projeto; fora do Git).
// Serve src/ (o app, incluindo src/materiais/ com áudios, vídeos, slides etc. do Gemini Notebook)
// e books/ em /books/ (PDFs e afins).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const ROOT = path.dirname(SELF);
const SRC = path.join(ROOT, 'src'); // só isto é servido como arquivo estático
const MAX_BODY = 1024 * 1024; // 1 MB: progresso real fica em poucos KB
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf', '.epub': 'application/epub+zip', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};
// books/ é servida em /books/ só com estes formatos (nada executável, nada de HTML).
const BOOK_RE = /\.(pdf|epub|md|txt|png|jpe?g)$/i;
// Materiais do Gemini Notebook por módulo, em src/materiais/: <id>[-sufixo].<ext> (ex.: m1_1-video.mp4).
const MATERIAL_RE = /^m\d+_\d+(-[\w-]+)?\.(mp3|m4a|wav|ogg|webm|mp4|pdf|pptx|png|jpe?g|md|txt)$/i;
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'"
};

const MAX_UPLOAD = 1024 ** 3; // 1 GB: resumos em vídeo podem ser grandes

// Nome seguro para um material enviado pelo app: <módulo>-<nome original sem acento, só [a-z0-9-]>.<ext>
function materialName(mod, original) {
  const ext = path.extname(original).toLowerCase();
  const slug = path.basename(original, path.extname(original))
    .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'material';
  return `${mod}-${slug}${ext}`;
}

function createServer({ port, dataFile = path.join(ROOT, 'progress.json'), booksDir = path.join(ROOT, 'books'), materialsDir = path.join(SRC, 'materiais') }) {
  // Bloqueia DNS rebinding: só aceita requisições endereçadas a localhost nesta porta.
  const allowedHosts = new Set([`localhost:${port}`, `127.0.0.1:${port}`]);

  function send(res, status, body, type = 'text/plain; charset=utf-8', extra = {}) {
    res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': type, ...extra });
    res.end(body);
  }

  // Resolve o caminho dentro de base; null se escapar dela (path traversal).
  const inside = (base, p) => { const f = path.resolve(base, '.' + p); return f.startsWith(base + path.sep) ? f : null; };

  // Streaming com suporte a Range (o <audio> precisa disso para avançar/voltar).
  function serveFile(req, res, file) {
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) return send(res, 404, 'Not found');
      const headers = { ...SECURITY_HEADERS, 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes' };
      let start = 0, end = st.size - 1, status = 200;
      const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
      if (m && (m[1] || m[2])) {
        start = m[1] ? Number(m[1]) : Math.max(0, st.size - Number(m[2]));
        end = m[1] && m[2] ? Math.min(Number(m[2]), st.size - 1) : st.size - 1;
        if (start > end) { res.writeHead(416, { ...SECURITY_HEADERS, 'Content-Range': `bytes */${st.size}` }); return res.end(); }
        status = 206;
        headers['Content-Range'] = `bytes ${start}-${end}/${st.size}`;
      }
      headers['Content-Length'] = st.size ? end - start + 1 : 0;
      res.writeHead(status, headers);
      if (req.method === 'HEAD' || !st.size) return res.end();
      fs.createReadStream(file, { start, end }).pipe(res);
    });
  }

  const listDir = (res, dir, re) => fs.readdir(dir, (err, names) =>
    send(res, 200, JSON.stringify(err ? [] : names.filter(n => re.test(n)).sort()), 'application/json; charset=utf-8', { 'Cache-Control': 'no-store' }));

  // POST /api/materials?module=m1_0&name=<nome original>  (corpo = bytes do arquivo)
  // Exige application/octet-stream: um formulário de outro site não consegue enviar esse tipo
  // sem preflight CORS (que este servidor nunca aprova), além do check de Origin acima.
  function uploadMaterial(req, res) {
    const q = new URL(req.url, 'http://x').searchParams;
    const mod = q.get('module') || '';
    if (!/^m\d+_\d+$/.test(mod)) return send(res, 400, 'Bad module');
    if (req.headers['content-type'] !== 'application/octet-stream') return send(res, 415, 'Binary only');
    if (Number(req.headers['content-length']) > MAX_UPLOAD) return send(res, 413, 'Too large');
    let name = materialName(mod, q.get('name') || '');
    if (!MATERIAL_RE.test(name)) return send(res, 415, 'Format not allowed');
    fs.mkdirSync(materialsDir, { recursive: true });
    const ext = path.extname(name), stem = name.slice(0, -ext.length);
    for (let i = 2; fs.existsSync(path.join(materialsDir, name)); i++) name = `${stem}-${i}${ext}`; // nunca sobrescreve
    const dest = path.join(materialsDir, name), tmp = `${dest}.part`;
    const out = fs.createWriteStream(tmp);
    let size = 0, failed = false;
    const fail = (status, msg) => {
      if (failed) return;
      failed = true;
      out.destroy();
      fs.rm(tmp, { force: true }, () => {});
      if (!res.headersSent) send(res, status, msg);
      req.destroy();
    };
    req.on('data', c => { size += c.length; if (size > MAX_UPLOAD) fail(413, 'Too large'); });
    req.on('aborted', () => fail(400, 'Aborted'));
    out.on('error', () => fail(500, 'Write failed'));
    out.on('finish', () => {
      if (failed) return;
      fs.rename(tmp, dest, err => (err ? send(res, 500, 'Write failed')
        : send(res, 201, JSON.stringify({ name }), 'application/json; charset=utf-8')));
    });
    req.pipe(out);
  }

  return http.createServer((req, res) => {
    if (!allowedHosts.has(req.headers.host)) return send(res, 403, 'Forbidden host');
    const origin = req.headers.origin;
    if (origin && !allowedHosts.has(origin.replace(/^https?:\/\//, ''))) return send(res, 403, 'Forbidden origin');

    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
    catch { return send(res, 400, 'Bad request'); }

    if (pathname === '/api/books' && req.method === 'GET') return listDir(res, booksDir, BOOK_RE);
    if (pathname === '/api/materials' && req.method === 'GET') return listDir(res, materialsDir, MATERIAL_RE);
    if (pathname === '/api/materials' && req.method === 'POST') return uploadMaterial(req, res);

    if (pathname === '/api/state') {
      const api = { 'Cache-Control': 'no-store' };
      if (req.method === 'GET') {
        return fs.readFile(dataFile, 'utf8', (err, txt) =>
          send(res, 200, err ? '{}' : txt, 'application/json; charset=utf-8', api));
      }
      if (req.method === 'PUT') {
        if (!String(req.headers['content-type']).startsWith('application/json')) return send(res, 415, 'JSON only');
        let size = 0;
        const chunks = [];
        req.on('data', c => {
          size += c.length;
          if (size > MAX_BODY) { send(res, 413, 'Too large'); req.destroy(); }
          else chunks.push(c);
        });
        req.on('end', () => {
          if (res.writableEnded) return;
          let obj;
          try { obj = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return send(res, 400, 'Invalid JSON'); }
          if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return send(res, 400, 'Object expected');
          const tmp = `${dataFile}.tmp`; // escrita atômica: nunca deixa progress.json pela metade
          fs.writeFile(tmp, JSON.stringify(obj, null, 2), err => {
            if (err) return send(res, 500, 'Write failed');
            fs.rename(tmp, dataFile, err2 => send(res, err2 ? 500 : 204, '', 'text/plain', api));
          });
        });
        return;
      }
      return send(res, 405, 'Method not allowed', 'text/plain', { Allow: 'GET, PUT' });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    if (pathname.startsWith('/books/')) {
      const book = inside(booksDir, pathname.slice('/books'.length));
      if (!book || !BOOK_RE.test(book)) return send(res, 404, 'Not found');
      return serveFile(req, res, book);
    }
    // Só arquivos dentro de src/ (nada de progress.json, server.js, backup/ ou path traversal).
    const file = inside(SRC, pathname === '/' ? '/index.html' : pathname);
    if (!file) return send(res, 404, 'Not found');
    serveFile(req, res, file);
  });
}

export { createServer };

// Executado diretamente (npm start / node server.js), e não importado pelos testes.
if (process.argv[1] && path.resolve(process.argv[1]) === SELF) {
  const port = Number(process.env.PORT) || 5173;
  createServer({ port }).listen(port, '127.0.0.1', () => {
    const url = `http://localhost:${port}`;
    console.log(`Trilha AI Security rodando em ${url}  (Ctrl+C para parar)`);
    if (process.argv.includes('--open')) {
      const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
        : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
      spawn(cmd, args, { stdio: 'ignore', detached: true }).unref();
    }
  });
}
