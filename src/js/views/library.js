// Aba Biblioteca: livros/PDFs da pasta books/, com capítulos (link direto para a página)
// e os módulos que os usam. Mostra também arquivos da pasta que ainda não foram catalogados.
import { BOOKS, bookUrl } from '../../data/books.js';
import { MODULES } from '../../data/roadmap.js';
import { $, esc } from '../utils.js';
import { openModule } from './roadmap.js';

let onDisk = null; // null = ainda carregando; [] = pasta vazia/inexistente
let serverOld = false; // /api/books não existe: servidor antigo ainda rodando

export function render() {
  $('library-loose').innerHTML = serverOld
    ? `<div class="callout danger"><div class="callout-title">Servidor desatualizado</div>
       O servidor que está rodando é de uma versão anterior e não serve a pasta books/. Feche a janela do servidor (Ctrl+C) e abra o <code>iniciar.cmd</code> de novo.</div>`
    : '';
  const missing = onDisk ? BOOKS.filter(b => !onDisk.includes(b.file)) : [];
  const loose = onDisk ? onDisk.filter(f => !BOOKS.some(b => b.file === f)) : [];

  $('library-list').innerHTML = BOOKS.map(b => {
    const mods = b.modules.map(id => MODULES.find(m => m.id === id)).filter(Boolean);
    const absent = missing.includes(b);
    return `
      <article class="card stack">
        <div class="row-between">
          <div class="stack gap-sm">
            <div class="row"><span class="badge badge-sky">${esc(b.kind)}</span><span class="badge">${b.year}</span>${absent ? '<span class="badge badge-red">Arquivo não encontrado em books/</span>' : ''}</div>
            <h3>${esc(b.title)}</h3>
            <p class="muted small">${esc(b.author)}</p>
          </div>
          ${absent ? '' : `<a class="btn btn-primary" href="${esc(bookUrl(b.file))}" target="_blank" rel="noopener">Abrir PDF ↗</a>`}
        </div>
        <p>${esc(b.why)}</p>
        <div class="stack gap-sm">
          <span class="eyebrow">Capítulos — abre direto na página</span>
          <div class="ref-links">${b.chapters.map(([t, p]) => `<a class="link-chip" href="${esc(bookUrl(b.file, p))}" target="_blank" rel="noopener">${esc(t)} · p. ${p}</a>`).join('')}</div>
        </div>
        <div class="stack gap-sm">
          <span class="eyebrow emerald">Usado nos módulos</span>
          <div class="ref-links">${mods.map(m => `<button class="link-chip" data-lib-mod="${m.id}">${esc(m.code)} — ${esc(m.title)} →</button>`).join('')}</div>
        </div>
      </article>`;
  }).join('');

  if (serverOld) return;
  $('library-loose').innerHTML = loose.length ? `
    <div class="callout warn">
      <div class="callout-title">Arquivos novos na pasta books/ ainda não catalogados</div>
      <ul class="bullets">${loose.map(f => `<li><a href="${esc(bookUrl(f))}" target="_blank" rel="noopener">${esc(f)}</a></li>`).join('')}</ul>
      <p class="small">Peça ao Claude: “cataloga os livros novos da pasta books na trilha”. Ele lê o arquivo, mapeia os capítulos por página e liga cada um aos módulos certos.</p>
    </div>` : '';
}

export function bind(ctx) {
  $('panel-library').addEventListener('click', e => {
    const t = e.target.closest('[data-lib-mod]');
    if (t) openModule(t.dataset.libMod, ctx);
  });
  fetch('/api/books')
    .then(r => { if (r.status === 404) serverOld = true; return r.ok ? r.json() : null; })
    .then(list => { onDisk = list; render(); })
    .catch(() => {});
}
