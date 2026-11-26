// Aba Portfólio: blueprints de projetos com checklist.
import { PORTFOLIO_PROJECTS } from '../../data/portfolio.js';
import { store } from '../state.js';
import { metrics } from '../metrics.js';
import { $, esc } from '../utils.js';

export function render() {
  const st = store.state;
  $('portfolio-badge').textContent = `${metrics().doneProjects}/${PORTFOLIO_PROJECTS.length} concluídos`;
  $('portfolio-list').innerHTML = PORTFOLIO_PROJECTS.map(p => {
    const done = p.tasks.filter(t => st.portfolioTasks[t.id]).length;
    const pct = Math.round((done / p.tasks.length) * 100);
    const full = done === p.tasks.length;
    return `
      <article class="card stack${full ? ' ok' : ''}">
        <div class="project-head">
          <div style="flex:1;min-width:240px">
            <div class="row"><span class="badge badge-sky">Blueprint</span>${full ? '<span class="badge badge-emerald">✓ Pronto para o GitHub</span>' : ''}</div>
            <h2>${esc(p.title)}</h2>
            <p class="muted" style="margin-top:4px;font-size:13.5px">${esc(p.overview)}</p>
            <div class="row" style="margin-top:10px">${p.stack.map(s => `<span class="badge badge-emerald">${esc(s)}</span>`).join('')}</div>
          </div>
          <div class="project-progress">
            <div class="row-between mono small"><span class="muted">${done}/${p.tasks.length}</span><strong style="color:var(--emerald)">${pct}%</strong></div>
            <span class="progress" style="margin-top:5px"><span class="progress-fill" style="width:${pct}%"></span></span>
          </div>
        </div>
        <div class="grid-2">
          <div class="inset">
            <div class="eyebrow">Controles-chave de segurança</div>
            <ul class="bullets small emerald" style="margin-top:8px">${p.controls.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
          </div>
          <div class="callout info">
            <div class="callout-title">Como apresentar em entrevista</div>
            ${esc(p.pitch)}
          </div>
        </div>
        <div class="stack gap-sm">
          <span class="eyebrow muted">Checklist passo a passo</span>
          ${p.tasks.map(t => `
            <label class="check-row boxed">
              <input type="checkbox" class="check" data-portfolio="${esc(t.id)}"${st.portfolioTasks[t.id] ? ' checked' : ''} />
              <span>${esc(t.text)}</span>
            </label>`).join('')}
        </div>
      </article>`;
  }).join('');
}

export function bind(ctx) {
  $('portfolio-list').addEventListener('change', e => {
    const id = e.target.dataset.portfolio;
    if (!id) return;
    store.state.portfolioTasks[id] = e.target.checked;
    ctx.commit(`[data-portfolio="${id}"]`);
  });
}
