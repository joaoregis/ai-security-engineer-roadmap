// Aba OWASP: matriz LLM Top 10 + cenários agênticos, modo revisão ativa e lista oficial MCP Top 10.
import { OWASP_THREATS, OWASP_MCP_TOP10 } from '../../data/owasp.js';
import { store } from '../state.js';
import { $, esc } from '../utils.js';

const CATEGORIES = ['Todos', ...new Set(OWASP_THREATS.map(t => t.category))];

export function render() {
  const { state, filters } = store;
  $('owasp-cats').innerHTML = CATEGORIES.map(c =>
    `<button class="pill" data-owasp-cat="${esc(c)}" aria-pressed="${filters.owaspCategory === c}">${esc(c)}</button>`).join('');
  $('owasp-review').setAttribute('aria-pressed', String(filters.owaspReview));

  const q = filters.owaspSearch.trim().toLowerCase();
  const list = OWASP_THREATS.filter(t =>
    (filters.owaspCategory === 'Todos' || t.category === filters.owaspCategory) &&
    (!q || Object.values(t).join(' ').toLowerCase().includes(q)));
  const studied = OWASP_THREATS.filter(t => state.owaspStudied[t.code]).length;
  $('owasp-counter').textContent = `${list.length} de ${OWASP_THREATS.length} · ${studied} estudadas`;

  $('owasp-grid').innerHTML = list.length ? list.map(t => {
    const isStudied = !!state.owaspStudied[t.code];
    return `
      <article class="card threat${isStudied ? ' studied' : ''}">
        <div class="row-between">
          <div class="row">
            <span class="badge ${t.code.startsWith('LLM') ? 'badge-sky' : 'badge-emerald'}"><strong>${esc(t.code)}</strong></span>
            <span class="badge">${esc(t.category)}</span>
          </div>
          <span class="badge ${t.severity === 'Crítica' ? 'badge-red' : 'badge-amber'}">${esc(t.severity)}</span>
        </div>
        <h3>${esc(t.title)}</h3>
        ${t.official ? `<p class="small muted">Mapeia para: <span class="mono">${esc(t.official)}</span></p>` : ''}
        <p class="small muted">${esc(t.desc)}</p>
        <details${filters.owaspReview ? '' : ' open'}>
          <summary class="btn btn-sm"><span class="when-closed">Pensei na resposta — revelar ataque &amp; mitigação</span><span class="when-open">Esconder respostas</span></summary>
          <div class="threat-body">
            <div class="callout danger"><div class="callout-title">Exemplo de ataque</div>${esc(t.attack)}</div>
            <div class="callout ok"><div class="callout-title">Mitigação determinística</div>${esc(t.mitigation)}</div>
            <div class="callout warn"><div class="callout-title">O que NÃO basta</div>${esc(t.caveat)}</div>
          </div>
        </details>
        <label class="check-row" style="margin-top:auto">
          <input type="checkbox" class="check" data-owasp="${esc(t.code)}"${isStudied ? ' checked' : ''} />
          <span>Domino esta ameaça (sei explicar ataque e mitigação)</span>
        </label>
      </article>`;
  }).join('') : '<div class="card empty">Nenhuma ameaça encontrada para esse filtro.</div>';

  $('mcp-official').innerHTML = OWASP_MCP_TOP10.map(([code, title]) => `<li><code>${esc(code)}</code>${esc(title)}</li>`).join('');
}

export function bind(ctx) {
  const { filters } = store;
  $('owasp-search').addEventListener('input', e => { filters.owaspSearch = e.target.value; render(); });
  $('owasp-review').addEventListener('click', () => { filters.owaspReview = !filters.owaspReview; render(); });
  $('owasp-cats').addEventListener('click', e => {
    const b = e.target.closest('[data-owasp-cat]');
    if (b) { filters.owaspCategory = b.dataset.owaspCat; render(); }
  });
  $('owasp-grid').addEventListener('change', e => {
    const code = e.target.dataset.owasp;
    if (!code) return;
    store.state.owaspStudied[code] = e.target.checked;
    ctx.commit(`[data-owasp="${code}"]`);
  });
}
