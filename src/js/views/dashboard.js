// Aba Dashboard: próximo passo, KPIs, linha do tempo das fases, calculadora e backup.
import { PHASES } from '../../data/roadmap.js';
import { OWASP_THREATS } from '../../data/owasp.js';
import { PORTFOLIO_PROJECTS } from '../../data/portfolio.js';
import { store, persist, replaceState } from '../state.js';
import { metrics, phaseSchedule, weekly, weeksFor } from '../metrics.js';
import { $, esc, addDays, todayIso, plural, stripPhase, tone, toast, ICON } from '../utils.js';
import { openModule, jumpToPhase, nextStep, stepLinks } from './roadmap.js';

const STATE_LABEL = { done: 'Concluída', current: 'Em andamento', todo: 'A fazer' };

export function render() {
  const st = store.state;
  const m = metrics();
  const w = weekly();
  const next = m.nextModule;

  const ns = next && nextStep(next);
  const links = ns && ns.step ? stepLinks(ns.step) : {};
  const material = links.book || links.url;
  $('dash-next').innerHTML = next
    ? `<div class="hero-text">
         <span class="eyebrow">Próximo passo · Módulo ${esc(next.code)}</span>
         <h2>${ns.step ? esc(ns.step.title) : 'Responder o checkpoint e concluir o módulo'}</h2>
         <p class="muted small">${esc(next.title)} · passo ${ns.step ? ns.index + 1 : ns.steps.length} de ${ns.steps.length}${ns.step ? ` · ~${ns.step.minutes} min` : ''}</p>
         ${ns.step ? `<p class="small">${esc(ns.step.focus)}</p>` : ''}
         <span class="progress"><span class="progress-fill" style="width:${Math.round((ns.done / ns.steps.length) * 100)}%"></span></span>
         <p class="muted small">${esc(stripPhase(PHASES.find(p => p.id === next.phase).title))} · ${next.hours}h · ~${weeksFor(next.hours)} semana(s) no seu ritmo</p>
       </div>
       <div class="row">
         ${material ? `<a class="btn" href="${esc(material)}" target="_blank" rel="noopener noreferrer">Abrir material ↗</a>` : ''}
         <button class="btn btn-primary" data-open-module="${next.id}">Abrir módulo →</button>
       </div>`
    : `<div class="hero-text">
         <span class="eyebrow emerald">Trilha concluída</span>
         <h2>Todos os ${m.totalModules} módulos concluídos</h2>
         <p class="muted small">Agora: simulados até média ≥ 80% e treino no simulador de entrevistas.</p>
       </div>
       <button class="btn btn-primary" data-tab="quiz">Ir para o Simulado →</button>`;

  const mockSub = m.mockAvg === null ? 'Meta segura: ≥ 80%'
    : `${m.mockAvg >= 80 ? 'Pronto para agendar!' : 'Continue calibrando'} (${plural(m.mockCount, 'simulado')})`;
  $('dash-kpis').innerHTML = `
    <div class="card"><div class="kpi-label">Progresso geral</div>
      <div class="kpi-value" style="color:var(--emerald)">${m.overallPct}%</div>
      <span class="progress" style="margin-top:8px"><span class="progress-fill" style="width:${m.overallPct}%"></span></span></div>
    <div class="card"><div class="kpi-label">Módulos</div>
      <div class="kpi-value" style="color:var(--sky)">${m.doneModules}/${m.totalModules}</div>
      <div class="kpi-sub">${m.totalHours - m.remainingHours}h de ${m.totalHours}h</div></div>
    <div class="card"><div class="kpi-label">Ameaças OWASP</div>
      <div class="kpi-value" style="color:var(--sky)">${m.doneOwasp}/${OWASP_THREATS.length}</div>
      <div class="kpi-sub">Portfólio: ${m.doneProjects}/${PORTFOLIO_PROJECTS.length} projetos</div></div>
    <div class="card"><div class="kpi-label">Média simulados AWS</div>
      <div class="kpi-value" style="color:${m.mockAvg === null ? 'var(--text-3)' : `var(--${tone(m.mockAvg)})`}">${m.mockAvg === null ? '--' : m.mockAvg + '%'}</div>
      <div class="kpi-sub">${esc(mockSub)}</div></div>`;

  $('dash-timeline').innerHTML = phaseSchedule().map(s => `
    <button class="tl-step ${s.status}" data-jump-phase="${s.phase.id}" aria-label="Abrir fase ${s.phase.id}">
      <span class="tl-head"><span class="tl-num">${s.status === 'done' ? ICON.check : s.phase.id}</span><span class="badge tl-state ${s.status === 'current' ? 'badge-sky' : s.status === 'done' ? 'badge-emerald' : ''}">${STATE_LABEL[s.status]}</span></span>
      <span class="tl-title">${esc(stripPhase(s.phase.title))}</span>
      <span class="progress"><span class="progress-fill" style="width:${s.pct}%"></span></span>
      <span class="tl-meta"><span>${s.done}/${s.mods.length} · ${s.phase.hours}h</span><span>Alvo ${s.target}</span></span>
    </button>`).join('');

  $('hours-slider').value = w;
  $('hours-val').textContent = `${w}h / semana`;
  $('start-date').value = st.startDate;
  $('calc-total').textContent = `${m.totalHours}h · ${m.remainingHours}h restantes`;
  $('calc-plan').textContent = addDays(st.startDate, (m.totalHours / w) * 7);
  $('calc-plan-sub').textContent = `${Math.ceil(m.totalHours / w)} semanas a partir do início`;
  $('calc-real').textContent = m.remainingHours ? addDays(todayIso(), (m.remainingHours / w) * 7) : 'Concluída!';
  $('calc-real-sub').textContent = m.remainingHours ? `hoje + ${Math.ceil(m.remainingHours / w)} semanas no ritmo atual` : 'Nenhuma hora restante';
}

function exportJson() {
  const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `ai-security-trilha-${todayIso()}.json` });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
  toast('Backup exportado!', 'success');
}

function importJson(file, ctx) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('formato');
      replaceState(parsed);
      persist();
      ctx.renderAll();
      toast('Progresso importado!', 'success');
    } catch {
      toast('Arquivo JSON inválido.', 'error');
    }
  };
  reader.readAsText(file);
}

export function bind(ctx) {
  $('panel-dashboard').addEventListener('click', e => {
    const t = e.target.closest('[data-open-module],[data-jump-phase]');
    if (!t) return;
    if (t.dataset.openModule) openModule(t.dataset.openModule, ctx);
    else jumpToPhase(t.dataset.jumpPhase, ctx);
  });

  $('hours-slider').addEventListener('input', e => {
    store.state.weeklyHours = Number(e.target.value);
    ctx.commit();
  });
  $('start-date').addEventListener('change', e => {
    if (!e.target.value) return;
    store.state.startDate = e.target.value;
    ctx.commit();
  });

  $('btn-export').addEventListener('click', exportJson);
  $('import-file').addEventListener('change', e => {
    if (e.target.files[0]) importJson(e.target.files[0], ctx);
    e.target.value = '';
  });
  $('btn-reset').addEventListener('click', () => { $('reset-confirm').hidden = !$('reset-confirm').hidden; });
  $('btn-reset-cancel').addEventListener('click', () => { $('reset-confirm').hidden = true; });
  $('btn-reset-confirm').addEventListener('click', () => {
    replaceState({ theme: store.state.theme });
    persist();
    $('reset-confirm').hidden = true;
    ctx.renderAll();
    toast('Progresso resetado.', 'warn');
  });
}
