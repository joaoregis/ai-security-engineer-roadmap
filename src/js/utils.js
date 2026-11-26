// Helpers puros de DOM, texto, datas e ícones.

export const $ = id => document.getElementById(id);
export const clone = o => JSON.parse(JSON.stringify(o));

export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function todayIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function addDays(iso, days) {
  const [y, m, d] = String(iso).split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  date.setDate(date.getDate() + Math.ceil(days));
  return date.toLocaleDateString('pt-BR');
}

export const fmtNum = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
export const stripPhase = t => t.replace(/^Fase \d+:\s*/, '');
export const tone = s => (s >= 80 ? 'emerald' : s >= 75 ? 'sky' : 'amber');

export function fmtDuration(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h ? `${h}h${String(m).padStart(2, '0')}m` : `${m}:${s}`;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  $('toast-box').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 260); }, 2800);
}

export function copyText(text) {
  const p = navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject();
  p.then(() => toast('Código copiado!', 'success'), () => toast('Não deu para copiar — selecione o código manualmente.', 'warn'));
}

const svg = (body, w = 18) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICON = {
  dashboard: svg('<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>'),
  roadmap: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
  owasp: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'),
  aws: svg('<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>'),
  quiz: svg('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
  portfolio: svg('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
  interviews: svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
  check: svg('<polyline points="20 6 9 17 4 12"/>', 14),
  chevron: '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
  warn: svg('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', 14),
  library: svg('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>')
};

// Mini-markdown das aulas (conteúdo nosso, mas escapado mesmo assim):
// ### título · - lista · 1. lista · > destaque · **negrito** · `código` · *itálico* · blocos ~~~ ... ~~~
export function md(src) {
  const out = [];
  let list = null, para = [], code = null;
  // Trechos `código` ficam intactos (ex.: `s3:*` não vira itálico).
  const inline = s => esc(s).split(/(`[^`]+`)/).map(part => /^`[^`]+`$/.test(part)
    ? `<code>${part.slice(1, -1)}</code>`
    : part.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*([^*\s][^*]*?)\*/g, '<em>$1</em>')).join('');
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
    if (list) out.push(`</${list}>`);
    list = null;
  };
  for (const raw of String(src).split('\n')) {
    if (code) {
      if (raw.trim() === '~~~') { out.push(`<pre class="lesson-code"><code>${esc(code.join('\n'))}</code></pre>`); code = null; }
      else code.push(raw);
      continue;
    }
    const line = raw.trim();
    if (line === '~~~') { flush(); code = []; continue; }
    if (!line) { flush(); continue; }
    if (line.startsWith('### ')) { flush(); out.push(`<h4>${inline(line.slice(4))}</h4>`); continue; }
    if (line.startsWith('> ')) { flush(); out.push(`<div class="callout info lesson-callout">${inline(line.slice(2))}</div>`); continue; }
    const li = /^(-|\d+\.) (.*)$/.exec(line);
    if (li) {
      const tag = li[1] === '-' ? 'ul' : 'ol';
      if (para.length || list !== tag) { flush(); out.push(`<${tag}>`); list = tag; }
      out.push(`<li>${inline(li[2])}</li>`);
      continue;
    }
    if (list) flush();
    para.push(line);
  }
  if (code) out.push(`<pre class="lesson-code"><code>${esc(code.join('\n'))}</code></pre>`);
  flush();
  return out.join('');
}
