// Aba AWS SCS-C03: fluxo IAM, rastreador de simulados externos (gráfico) e checklist dos 6 domínios.
import { AWS_DOMAINS, IAM_EVAL_STEPS } from '../../data/aws.js';
import { store } from '../state.js';
import { metrics } from '../metrics.js';
import { $, esc, plural, tone, todayIso, toast } from '../utils.js';

function renderChart(mocks) {
  if (!mocks.length) return '<div class="chart-empty">Adicione o primeiro simulado para ver sua curva de evolução.</div>';
  // Barras e linhas de referência na MESMA escala (% da altura) → alinhamento exato.
  const last = mocks.slice(-10);
  const offset = mocks.length - last.length;
  return `
    <div class="chart-line" style="bottom:80%;border-color:var(--emerald)"><span style="color:var(--emerald)">80% meta</span></div>
    <div class="chart-line cut" style="bottom:75%;border-color:var(--amber)"><span style="color:var(--amber)">75% ~corte</span></div>
    ${last.map((item, i) => {
      const sc = Math.max(0, Math.min(100, Number(item.score)));
      return `<div class="chart-col" title="${esc(item.name)} — ${sc}% (${esc(item.date)})">
        <div class="chart-bar" style="height:${sc}%;background:var(--${tone(sc)})"><span style="color:var(--${tone(sc)})">${sc}%</span></div>
        <span class="chart-x">#${offset + i + 1}</span>
      </div>`;
    }).join('')}`;
}

export function render() {
  const st = store.state;
  const m = metrics();
  $('aws-progress').textContent = `${m.doneAws}/${m.totalAws} tópicos`;

  $('iam-flow').innerHTML = IAM_EVAL_STEPS.map((step, i) => `
    <div class="iam-step">
      <span class="iam-num tone tone-${step.tone}">${esc(step.num)}</span>
      <div style="flex:1;min-width:0">
        <div class="row-between"><strong class="small">${esc(step.label)}</strong><span class="iam-result tone tone-${step.tone}">${esc(step.result)}</span></div>
        <div class="kpi-sub" style="margin-top:2px">${esc(step.note)}</div>
      </div>
    </div>
    ${i < IAM_EVAL_STEPS.length - 1 ? '<div class="iam-arrow" aria-hidden="true">↓</div>' : ''}`).join('');

  $('aws-domains').innerHTML = AWS_DOMAINS.map(d => {
    const done = d.tasks.filter(t => st.awsSubtasks[t.id]).length;
    const full = done === d.tasks.length;
    return `
      <article class="card stack${full ? ' ok' : ''}">
        <div class="row-between">
          <div>
            <span class="eyebrow">${esc(d.code)} · peso ${esc(d.weight)}</span>
            <h3 class="card-title">${esc(d.name)}</h3>
          </div>
          <span class="badge ${full ? 'badge-emerald' : ''}">${done}/${d.tasks.length}</span>
        </div>
        <div class="service-tags">${d.services.map(s => `<span class="badge">${esc(s)}</span>`).join('')}</div>
        <div class="divider"></div>
        <div>${d.tasks.map(t => `
          <label class="check-row">
            <input type="checkbox" class="check" data-aws="${esc(t.id)}"${st.awsSubtasks[t.id] ? ' checked' : ''} />
            <span>${esc(t.text)}</span>
          </label>`).join('')}</div>
      </article>`;
  }).join('');

  const mocks = st.awsMocks;
  const readiness = $('aws-readiness');
  $('mock-chart').innerHTML = renderChart(mocks);
  if (!mocks.length) {
    readiness.className = 'badge';
    readiness.textContent = 'Sem simulados';
    $('mock-avg').textContent = 'Média: --';
    $('mock-list').innerHTML = '';
    return;
  }
  $('mock-avg').textContent = `Média: ${m.mockAvg}% (${plural(mocks.length, 'teste')})`;
  readiness.className = `badge badge-${tone(m.mockAvg)}`;
  readiness.textContent = m.mockAvg >= 80 ? '✓ Pronto para agendar' : m.mockAvg >= 75 ? 'Na linha de corte (75–79%)' : 'Em preparação (< 75%)';
  $('mock-list').innerHTML = [...mocks].reverse().map(item => `
    <div class="mock-row">
      <div style="min-width:0">
        <div class="row"><span class="badge badge-${tone(Number(item.score))}">${Number(item.score)}%</span><strong class="small">${esc(item.name)}</strong></div>
        <div class="kpi-sub mono">${esc(item.date)}</div>
      </div>
      <button class="btn btn-sm btn-danger" data-delete-mock="${esc(item.id)}" aria-label="Excluir simulado ${esc(item.name)}">Excluir</button>
    </div>`).join('');
}

export function bind(ctx) {
  $('mock-date').value = todayIso();

  $('aws-domains').addEventListener('change', e => {
    const id = e.target.dataset.aws;
    if (!id) return;
    store.state.awsSubtasks[id] = e.target.checked;
    ctx.commit(`[data-aws="${id}"]`);
  });

  $('mock-list').addEventListener('click', e => {
    const b = e.target.closest('[data-delete-mock]');
    if (!b) return;
    store.state.awsMocks = store.state.awsMocks.filter(x => String(x.id) !== b.dataset.deleteMock);
    ctx.commit();
    toast('Simulado removido.', 'warn');
  });

  $('mock-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('mock-name').value.trim();
    const raw = $('mock-score').value;
    const score = Number(raw);
    if (!name || raw === '' || !Number.isFinite(score) || score < 0 || score > 100) {
      toast('Preencha nome e nota entre 0 e 100.', 'warn');
      return;
    }
    store.state.awsMocks.push({ id: `mk_${Date.now()}`, name, score, date: $('mock-date').value || todayIso() });
    $('mock-name').value = '';
    $('mock-score').value = '';
    ctx.commit();
    toast(`Simulado registrado (${score}%)`, score >= 80 ? 'success' : '');
  });
}
