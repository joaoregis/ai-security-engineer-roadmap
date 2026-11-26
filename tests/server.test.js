// Checagem mínima do servidor: npm test
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createServer } from '../server.js';

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'trilha-'));
  const dataFile = path.join(tmp, 'progress.json');
  const booksDir = path.join(tmp, 'books');
  fs.mkdirSync(booksDir);
  fs.writeFileSync(path.join(booksDir, 'livro.pdf'), '0123456789');
  fs.writeFileSync(path.join(booksDir, 'nota.html'), '<script>alert(1)</script>');
  const materialsDir = path.join(tmp, 'materiais');
  fs.mkdirSync(materialsDir);
  for (const f of ['m1_1-video.mp4', 'm1_1.wav', 'm2_3-slides.pptx', 'm1_1-x.html', 'outro.mp4']) fs.writeFileSync(path.join(materialsDir, f), 'x');
  const srv = createServer({ port: 0, dataFile, booksDir, materialsDir });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  srv.close();
  const real = createServer({ port, dataFile, booksDir, materialsDir }); // recria sabendo a porta (Host check depende dela)
  await new Promise(r => real.listen(port, '127.0.0.1', r));
  const base = `http://127.0.0.1:${port}`;
  const raw = (p, headers = {}) => new Promise(r => http.get({ host: '127.0.0.1', port, path: p, headers }, res => r(res.statusCode)));

  assert.strictEqual((await fetch(base + '/')).status, 200, 'entry page');
  assert.strictEqual((await fetch(base + '/js/main.js')).status, 200, 'module');
  assert.strictEqual(await raw('/js/../../server.js'), 404, 'traversal blocked');
  assert.strictEqual(await raw('/%2e%2e/progress.json'), 404, 'encoded traversal blocked');
  assert.strictEqual(await raw('/js/..%2f..%2fserver.js'), 404, 'encoded slash traversal blocked');
  assert.strictEqual(await raw('/progress.json'), 404, 'progress not served statically');
  assert.strictEqual(await raw('/../backup/ai_security_engineer_trilha.original.html'), 404, 'backup not served');
  assert.strictEqual((await fetch(base + '/index.html')).status, 200, 'index');
  assert.strictEqual(await raw('/', { Host: 'evil.example:' + port }), 403, 'DNS rebinding host blocked');
  assert.strictEqual((await fetch(base + '/api/state', { method: 'PUT', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{}' })).status, 403, 'foreign origin blocked');
  assert.strictEqual((await fetch(base + '/api/state', { method: 'PUT', headers: { 'Content-Type': 'text/plain' }, body: '{}' })).status, 415, 'non-JSON rejected');
  assert.strictEqual((await fetch(base + '/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '[1]' })).status, 400, 'array rejected');

  // books/: só formatos permitidos, sem traversal, com Range
  assert.strictEqual((await fetch(base + '/books/livro.pdf')).status, 200, 'book served');
  assert.strictEqual(await raw('/books/nota.html'), 404, 'html in books not served');
  assert.strictEqual(await raw('/books/../server.js'), 404, 'books traversal blocked');
  assert.strictEqual(await raw('/books/..%2fprogress.json'), 404, 'books encoded traversal blocked');
  const part = await fetch(base + '/books/livro.pdf', { headers: { Range: 'bytes=2-4' } });
  assert.strictEqual(part.status, 206, 'range status');
  assert.strictEqual(await part.text(), '234', 'range body');
  assert.strictEqual(await (await fetch(base + '/books/livro.pdf', { headers: { Range: 'bytes=-3' } })).text(), '789', 'suffix range');
  assert.strictEqual((await fetch(base + '/books/livro.pdf', { headers: { Range: 'bytes=50-' } })).status, 416, 'range out of bounds');
  assert.deepStrictEqual(await (await fetch(base + '/api/books')).json(), ['livro.pdf'], 'books list filtered');
  assert.deepStrictEqual(await (await fetch(base + '/api/materials')).json(), ['m1_1-video.mp4', 'm1_1.wav', 'm2_3-slides.pptx'], 'materials list filtered by module id + format');

  // upload de materiais: nome seguro gerado pelo servidor, sem sobrescrever
  const up = (q, body = 'AUDIO', headers = { 'Content-Type': 'application/octet-stream' }) =>
    fetch(`${base}/api/materials?${q}`, { method: 'POST', headers, body });
  let r = await up('module=m1_0&name=' + encodeURIComponent('Fundamentos — Deep Dive Ação.m4a'));
  assert.strictEqual(r.status, 201, 'upload ok');
  assert.deepStrictEqual(await r.json(), { name: 'm1_0-fundamentos-deep-dive-acao.m4a' }, 'safe name');
  assert.strictEqual(fs.readFileSync(path.join(materialsDir, 'm1_0-fundamentos-deep-dive-acao.m4a'), 'utf8'), 'AUDIO', 'bytes saved');
  r = await up('module=m1_0&name=' + encodeURIComponent('Fundamentos — Deep Dive Ação.m4a'));
  assert.strictEqual((await r.json()).name, 'm1_0-fundamentos-deep-dive-acao-2.m4a', 'no overwrite');
  assert.strictEqual((await up('module=m1_0&name=' + encodeURIComponent('../../server.m4a'))).status, 201, 'traversal in name is neutralized');
  assert.ok(fs.existsSync(path.join(materialsDir, 'm1_0-server.m4a')), 'traversal name stays in materials dir');
  assert.strictEqual((await up('module=../x&name=a.m4a')).status, 400, 'bad module');
  assert.strictEqual((await up('module=m1_0&name=virus.exe')).status, 415, 'format not allowed');
  assert.strictEqual((await up('module=m1_0&name=pagina.html')).status, 415, 'html not allowed');
  assert.strictEqual((await up('module=m1_0&name=a.m4a', 'x', { 'Content-Type': 'text/plain' })).status, 415, 'non-binary rejected');
  assert.strictEqual((await up('module=m1_0&name=a.m4a', 'x', { 'Content-Type': 'application/octet-stream', Origin: 'https://evil.example' })).status, 403, 'foreign origin upload blocked');
  assert.ok(!fs.readdirSync(materialsDir).some(f => f.endsWith('.part')), 'no temp files left');

  const put = await fetch(base + '/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weeklyHours: 10 }) });
  assert.strictEqual(put.status, 204, 'save');
  assert.deepStrictEqual(await (await fetch(base + '/api/state')).json(), { weeklyHours: 10 }, 'roundtrip');

  real.close();
  console.log('server.test.js: OK');
})().catch(e => { console.error(e); process.exit(1); });
