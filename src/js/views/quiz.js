// Aba Simulado SCS-C03: modo Estudo (correção imediata) ou Prova (cronômetro, correção no final),
// filtros por domínio/origem, histórico, desempenho por domínio e revisão das erradas.
import { SCS_QUESTIONS, SCS_DOMAINS } from '../../data/scs-questions.js';
import { AWS_DOMAINS } from '../../data/aws.js';
import { store, persist } from '../state.js';
import { $, esc, shuffle, fmtDuration, todayIso, tone, toast } from '../utils.js';

const BY_ID = Object.fromEntries(SCS_QUESTIONS.map(q => [q.id, q]));
const DOMAIN_IDS = Object.keys(SCS_DOMAINS).map(Number);
const LETTERS = 'ABCDEF';
const EXAM_MS_PER_Q = (170 / 65) * 60000; // ritmo da prova real: 170 min / 65 questões

// Configuração da próxima sessão (não persistida).
const setup = { mode: 'study', count: '20', source: 'all', domains: new Set(DOMAIN_IDS), confirmFinish: false };

const weightOf = d => (AWS_DOMAINS[d - 1] && AWS_DOMAINS[d - 1].weight) || '';
const isCorrect = (q, ans = []) => ans.length === q.answer.length && q.answer.every(i => ans.includes(i));
const session = () => store.state.quizSession;

function isValidSession(s) {
  return s && Array.isArray(s.ids) && s.ids.length > 0 && s.ids.every(id => BY_ID[id]) &&
    s.answers && typeof s.answers === 'object' && Number.isInteger(s.idx) && s.idx >= 0 && s.idx < s.ids.length;
}

function pool() {
  const stats = store.state.quizStats;
  return SCS_QUESTIONS.filter(q => setup.domains.has(q.domain)).filter(q =>
    setup.source === 'unseen' ? !stats[q.id] :
    setup.source === 'wrong' ? stats[q.id] && stats[q.id].last === false : true);
}

// Questões que contam para a nota: na prova, todas; no estudo, as já corrigidas.
const gradedIds = s => (s.mode === 'exam' ? s.ids : s.ids.filter(id => s.checked[id]));

function recordStat(id, correct) {
  const prev = store.state.quizStats[id] || { seen: 0, correct: 0 };
  store.state.quizStats[id] = { seen: prev.seen + 1, correct: prev.correct + (correct ? 1 : 0), last: correct };
}

function startSession(ids, mode) {
  store.state.quizSession = {
    mode, ids, answers: {}, checked: {}, flagged: {}, idx: 0,
    startedAt: Date.now(), finishedAt: null, logged: false
  };
  setup.confirmFinish = false;
}

function finishSession() {
  const s = session();
  const graded = gradedIds(s);
  if (!graded.length) { // nada respondido: só descarta
    store.state.quizSession = null;
    return;
  }
  if (s.mode === 'exam') graded.forEach(id => recordStat(id, isCorrect(BY_ID[id], s.answers[id])));
  const correct = graded.filter(id => isCorrect(BY_ID[id], s.answers[id])).length;
  s.finishedAt = Date.now();
  store.state.quizHistory.push({
    date: todayIso(), mode: s.mode, total: graded.length, correct,
    pct: Math.round((correct / graded.length) * 100), ms: s.finishedAt - s.startedAt
  });
  store.state.quizHistory = store.state.quizHistory.slice(-50);
}

/* ------------------------------------------------------------------ views */
function domainStats() {
  const stats = store.state.quizStats;
  return DOMAIN_IDS.map(d => {
    const qs = SCS_QUESTIONS.filter(q => q.domain === d);
    const seen = qs.filter(q => stats[q.id]);
    const lastRight = seen.filter(q => stats[q.id].last).length;
    return { d, total: qs.length, seen: seen.length, lastRight, pct: seen.length ? Math.round((lastRight / seen.length) * 100) : null };
  });
}

function setupView() {
  const stats = store.state.quizStats;
  const unseen = SCS_QUESTIONS.filter(q => !stats[q.id]).length;
  const wrong = SCS_QUESTIONS.filter(q => stats[q.id] && stats[q.id].last === false).length;
  const available = pool().length;
  const n = setup.count === 'all' ? available : Math.min(Number(setup.count), available);
  const pill = (attr, val, cur, label) => `<button class="pill" data-${attr}="${val}" aria-pressed="${cur === val}">${label}</button>`;
  const history = [...store.state.quizHistory].reverse().slice(0, 8);

  return `
    <div class="grid-2 quiz-setup">
      <div class="card stack">
        <div>
          <h2 class="card-title">Novo simulado</h2>
          <p class="card-sub">${SCS_QUESTIONS.length} questões autorais no estilo de cenário da prova, com explicação em português.</p>
        </div>
        <div class="field"><span class="field-label">Modo</span>
          <div class="pills">
            ${pill('q-mode', 'study', setup.mode, 'Estudo · correção a cada questão')}
            ${pill('q-mode', 'exam', setup.mode, 'Prova · cronômetro e correção no final')}
          </div>
        </div>
        <div class="field"><span class="field-label">Quantidade</span>
          <div class="pills">
            ${['10', '20', '30'].map(c => pill('q-count', c, setup.count, c)).join('')}
            ${pill('q-count', 'all', setup.count, 'Todas')}
          </div>
        </div>
        <div class="field"><span class="field-label">Origem</span>
          <div class="pills">
            ${pill('q-source', 'all', setup.source, 'Todas')}
            ${pill('q-source', 'unseen', setup.source, `Nunca respondidas (${unseen})`)}
            ${pill('q-source', 'wrong', setup.source, `Errei na última vez (${wrong})`)}
          </div>
        </div>
        <div class="field"><span class="field-label">Domínios</span>
          <div class="pills">
            ${DOMAIN_IDS.map(d => `<button class="pill" data-q-domain="${d}" aria-pressed="${setup.domains.has(d)}">D${d} ${esc(SCS_DOMAINS[d])} <span class="muted">${esc(weightOf(d))}</span></button>`).join('')}
          </div>
        </div>
        <button class="btn btn-primary btn-block" data-q-start ${n ? '' : 'disabled'}>${n ? `Começar · ${n} ${n === 1 ? 'questão' : 'questões'}` : 'Nenhuma questão com esses filtros'}</button>
        <p class="kpi-sub">Prova real: 65 questões (50 pontuadas) em 170 min ≈ ${fmtDuration(EXAM_MS_PER_Q)} por questão. No modo Prova, o cronômetro usa esse ritmo como meta.</p>
      </div>

      <div class="stack">
        <div class="card stack">
          <h2 class="card-title">Desempenho por domínio</h2>
          <p class="card-sub">Acerto na última tentativa de cada questão já respondida.</p>
          ${domainStats().map(s => `
            <div class="stack gap-xs">
              <div class="row-between small"><span><strong>D${s.d}</strong> ${esc(SCS_DOMAINS[s.d])} <span class="muted">· ${esc(weightOf(s.d))}</span></span>
                <span class="mono ${s.pct === null ? 'muted' : ''}" style="${s.pct === null ? '' : `color:var(--${tone(s.pct)})`}">${s.pct === null ? '—' : s.pct + '%'}</span></div>
              <span class="progress"><span class="progress-fill" style="width:${s.pct || 0}%"></span></span>
              <span class="kpi-sub">${s.seen}/${s.total} vistas · ${s.lastRight} certas</span>
            </div>`).join('')}
        </div>
        <div class="card stack">
          <h2 class="card-title">Histórico</h2>
          ${history.length ? history.map(h => `
            <div class="mock-row">
              <div class="row"><span class="badge badge-${tone(h.pct)}">${h.pct}%</span><span class="small">${h.correct}/${h.total} · ${h.mode === 'exam' ? 'Prova' : 'Estudo'}</span></div>
              <span class="kpi-sub mono">${esc(h.date)} · ${fmtDuration(h.ms || 0)}</span>
            </div>`).join('') : '<p class="kpi-sub">Nenhuma sessão ainda.</p>'}
        </div>
      </div>
    </div>`;
}

function optionsHtml(q, ans, reveal, disabled) {
  const multi = q.answer.length > 1;
  return `<div class="quiz-options" role="${multi ? 'group' : 'radiogroup'}" aria-label="Alternativas">
    ${q.options.map((o, i) => {
      const sel = ans.includes(i);
      let cls = sel ? ' selected' : '';
      if (reveal) cls += q.answer.includes(i) ? ' correct' : sel ? ' wrong' : '';
      return `<label class="quiz-opt${cls}">
        <input type="${multi ? 'checkbox' : 'radio'}" name="quiz-opt" data-q-opt="${i}"${sel ? ' checked' : ''}${disabled ? ' disabled' : ''} />
        <span class="quiz-letter">${LETTERS[i]}</span><span>${esc(o)}</span>
      </label>`;
    }).join('')}
  </div>`;
}

const answerLetters = q => q.answer.map(i => LETTERS[i]).join(' e ');

function questionView(s) {
  const q = BY_ID[s.ids[s.idx]];
  const ans = s.answers[q.id] || [];
  const exam = s.mode === 'exam';
  const checked = !exam && !!s.checked[q.id];
  const multi = q.answer.length > 1;
  const answered = s.ids.filter(id => (s.answers[id] || []).length).length;
  const last = s.idx === s.ids.length - 1;
  const unanswered = s.ids.length - answered;

  const feedback = checked ? `
    <div class="callout ${isCorrect(q, ans) ? 'ok' : 'danger'}">
      <div class="callout-title">${isCorrect(q, ans) ? '✓ Correta' : `✗ Incorreta — resposta: ${answerLetters(q)}`}</div>
      ${esc(q.explanation)}
    </div>` : '';

  const studyActions = checked
    ? `<button class="btn btn-primary" data-q-next>${last ? 'Ver resultado' : 'Próxima →'}</button>`
    : `<button class="btn btn-primary" data-q-check ${ans.length === q.answer.length ? '' : 'disabled'}>Confirmar resposta</button>`;

  const examActions = `
    <div class="row">
      <button class="btn" data-q-prev ${s.idx === 0 ? 'disabled' : ''}>← Anterior</button>
      <button class="btn pressed-amber" data-q-flag aria-pressed="${!!s.flagged[q.id]}">⚑ Marcar para revisar</button>
    </div>
    <button class="btn btn-primary" data-q-next ${last ? 'disabled' : ''}>Próxima →</button>`;

  const finishLabel = setup.confirmFinish
    ? (unanswered ? `Confirmar: ${unanswered} sem resposta contam como erro` : 'Confirmar finalização')
    : (exam ? 'Finalizar prova' : 'Encerrar sessão');

  return `
    <div class="card stack quiz-card">
      <div class="row-between">
        <div class="row">
          <span class="code-tag">Questão ${s.idx + 1} de ${s.ids.length}</span>
          <span class="badge badge-sky">D${q.domain} · ${esc(SCS_DOMAINS[q.domain])}</span>
          ${multi ? '<span class="badge badge-amber">Choose two</span>' : ''}
        </div>
        <div class="row">
          ${exam ? '<span id="quiz-timer" class="badge mono"></span>' : ''}
          <button class="btn btn-sm ${setup.confirmFinish ? 'btn-danger' : ''}" data-q-finish>${finishLabel}</button>
        </div>
      </div>
      <span class="progress"><span class="progress-fill" style="width:${Math.round((answered / s.ids.length) * 100)}%"></span></span>
      <p class="quiz-question">${esc(q.question)}</p>
      ${optionsHtml(q, ans, checked, checked)}
      ${multi && !checked ? `<p class="kpi-sub">Selecione ${q.answer.length} alternativas.</p>` : ''}
      ${feedback}
      <div class="row-between">${exam ? examActions : `<span></span>${studyActions}`}</div>
      ${exam ? `
        <div class="quiz-nav" aria-label="Navegação entre questões">
          ${s.ids.map((id, i) => `<button class="quiz-dot${(s.answers[id] || []).length ? ' answered' : ''}${s.flagged[id] ? ' flagged' : ''}" data-q-goto="${i}"${i === s.idx ? ' aria-current="true"' : ''} aria-label="Questão ${i + 1}">${i + 1}</button>`).join('')}
        </div>
        <p class="kpi-sub">Azul = respondida · âmbar = marcada para revisar. Você pode voltar e mudar respostas até finalizar.</p>` : ''}
    </div>`;
}

function resultView(s) {
  const graded = gradedIds(s);
  const correct = graded.filter(id => isCorrect(BY_ID[id], s.answers[id])).length;
  const pct = Math.round((correct / graded.length) * 100);
  const wrongIds = graded.filter(id => !isCorrect(BY_ID[id], s.answers[id]));
  const verdict = pct >= 80 ? 'Acima da meta de 80% 🎯' : pct >= 72 ? 'Perto da linha de corte — revise os domínios mais fracos' : 'Abaixo da meta — volte às explicações e aos módulos da Fase 4';

  const perDomain = DOMAIN_IDS.map(d => {
    const ids = graded.filter(id => BY_ID[id].domain === d);
    const ok = ids.filter(id => isCorrect(BY_ID[id], s.answers[id])).length;
    return { d, n: ids.length, ok };
  }).filter(x => x.n);

  return `
    <div class="card hero">
      <div class="hero-text">
        <span class="eyebrow">${s.mode === 'exam' ? 'Resultado da prova' : 'Resultado do estudo'}</span>
        <h2><span style="color:var(--${tone(pct)})">${pct}%</span> · ${correct} de ${graded.length} corretas</h2>
        <p class="muted small">${verdict} · tempo ${fmtDuration(s.finishedAt - s.startedAt)}</p>
        <p class="kpi-sub">A prova real usa nota escalonada (aprovação 750/1000). Use 80% aqui como referência de preparo, não como equivalência.</p>
      </div>
      <div class="row">
        ${s.logged ? '<span class="badge badge-emerald">✓ No rastreador AWS</span>' : '<button class="btn" data-q-log>Registrar no rastreador AWS</button>'}
        ${wrongIds.length ? `<button class="btn" data-q-retry>Refazer as ${wrongIds.length} erradas</button>` : ''}
        <button class="btn btn-primary" data-q-new>Novo simulado</button>
      </div>
    </div>

    <div class="card stack">
      <h2 class="card-title">Por domínio</h2>
      <div class="grid-2 gap-sm">
        ${perDomain.map(x => {
          const p = Math.round((x.ok / x.n) * 100);
          return `<div class="stack gap-xs">
            <div class="row-between small"><span><strong>D${x.d}</strong> ${esc(SCS_DOMAINS[x.d])}</span><span class="mono" style="color:var(--${tone(p)})">${x.ok}/${x.n}</span></div>
            <span class="progress"><span class="progress-fill" style="width:${p}%"></span></span>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="stack">
      <h2 class="card-title">Revisão das questões</h2>
      ${graded.map((id, i) => {
        const q = BY_ID[id];
        const ans = s.answers[id] || [];
        const ok = isCorrect(q, ans);
        return `
          <details class="card review-item ${ok ? 'ok' : 'warn'}"${ok ? '' : ' open'}>
            <summary class="row-between">
              <span class="row"><span class="badge ${ok ? 'badge-emerald' : 'badge-red'}">${ok ? '✓' : '✗'} ${i + 1}</span><span class="badge">D${q.domain}</span>
                <span class="small review-title">${esc(q.question.slice(0, 110))}${q.question.length > 110 ? '…' : ''}</span></span>
              ${'<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>'}
            </summary>
            <div class="stack" style="margin-top:12px">
              <p class="quiz-question">${esc(q.question)}</p>
              ${optionsHtml(q, ans, true, true)}
              ${ans.length ? '' : '<p class="kpi-sub">Sem resposta.</p>'}
              <div class="callout ${ok ? 'ok' : 'info'}"><div class="callout-title">Explicação · resposta ${answerLetters(q)}</div>${esc(q.explanation)}</div>
            </div>
          </details>`;
      }).join('')}
    </div>`;
}

export function render() {
  if (session() && !isValidSession(session())) store.state.quizSession = null;
  const s = session();
  $('quiz-root').innerHTML = !s ? setupView() : s.finishedAt ? resultView(s) : questionView(s);
  const answered = Object.keys(store.state.quizStats).length;
  $('quiz-badge').textContent = `${answered}/${SCS_QUESTIONS.length} questões vistas`;
  tick();
}

// Atualiza só o cronômetro (chamado a cada segundo pelo main.js).
export function tick() {
  const s = session();
  const el = $('quiz-timer');
  if (!el || !s || s.mode !== 'exam' || s.finishedAt) return;
  const elapsed = Date.now() - s.startedAt;
  const budget = EXAM_MS_PER_Q * s.ids.length;
  el.textContent = `⏱ ${fmtDuration(elapsed)} / ${fmtDuration(budget)}`;
  el.className = `badge mono ${elapsed > budget ? 'badge-red' : elapsed > budget * 0.8 ? 'badge-amber' : ''}`;
}

/* ------------------------------------------------------------------ eventos */
export function bind(ctx) {
  const root = $('quiz-root');
  const focusTop = () => { const el = root.querySelector('[data-q-opt]') || root.querySelector('button'); if (el) el.focus({ preventScroll: true }); root.scrollIntoView({ block: 'start' }); };

  root.addEventListener('click', e => {
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    const d = t.dataset;
    const s = session();

    // configuração
    if (d.qMode) { setup.mode = d.qMode; return render(); }
    if (d.qCount) { setup.count = d.qCount; return render(); }
    if (d.qSource) { setup.source = d.qSource; return render(); }
    if (d.qDomain) {
      const n = Number(d.qDomain);
      if (setup.domains.has(n) && setup.domains.size > 1) setup.domains.delete(n); else setup.domains.add(n);
      return render();
    }
    if ('qStart' in d) {
      const picked = shuffle(pool()).slice(0, setup.count === 'all' ? undefined : Number(setup.count)).map(q => q.id);
      startSession(picked, setup.mode);
      ctx.commit();
      return focusTop();
    }

    // sessão em andamento
    if ('qCheck' in d) {
      const q = BY_ID[s.ids[s.idx]];
      s.checked[q.id] = true;
      recordStat(q.id, isCorrect(q, s.answers[q.id]));
      return ctx.commit('[data-q-next]');
    }
    if ('qNext' in d) {
      if (s.mode === 'study' && s.idx === s.ids.length - 1) finishSession();
      else s.idx = Math.min(s.ids.length - 1, s.idx + 1);
      setup.confirmFinish = false;
      ctx.commit();
      return focusTop();
    }
    if ('qPrev' in d) { s.idx = Math.max(0, s.idx - 1); persist(); render(); return focusTop(); }
    if (d.qGoto !== undefined) { s.idx = Number(d.qGoto); persist(); render(); return focusTop(); }
    if ('qFlag' in d) { const id = s.ids[s.idx]; s.flagged[id] = !s.flagged[id]; persist(); return render(); }
    if ('qFinish' in d) {
      if (!setup.confirmFinish) { setup.confirmFinish = true; return render(); }
      setup.confirmFinish = false;
      finishSession();
      ctx.commit();
      return root.scrollIntoView({ block: 'start' });
    }

    // resultado
    if ('qLog' in d) {
      const graded = gradedIds(s);
      const correct = graded.filter(id => isCorrect(BY_ID[id], s.answers[id])).length;
      store.state.awsMocks.push({
        id: `qz_${s.startedAt}`, date: todayIso(),
        name: `Simulado interno · ${graded.length} questões (${s.mode === 'exam' ? 'prova' : 'estudo'})`,
        score: Math.round((correct / graded.length) * 100)
      });
      s.logged = true;
      toast('Registrado no rastreador da aba AWS.', 'success');
      return ctx.commit();
    }
    if ('qRetry' in d) {
      const wrong = gradedIds(s).filter(id => !isCorrect(BY_ID[id], s.answers[id]));
      startSession(shuffle(wrong), s.mode);
      ctx.commit();
      return focusTop();
    }
    if ('qNew' in d) { store.state.quizSession = null; return ctx.commit(); }
  });

  root.addEventListener('change', e => {
    const i = e.target.dataset.qOpt;
    if (i === undefined) return;
    const s = session();
    const q = BY_ID[s.ids[s.idx]];
    const n = Number(i);
    if (q.answer.length > 1) {
      const cur = new Set(s.answers[q.id] || []);
      if (e.target.checked) cur.add(n); else cur.delete(n);
      s.answers[q.id] = [...cur].sort();
    } else {
      s.answers[q.id] = [n];
    }
    setup.confirmFinish = false;
    persist();
    render();
    const el = root.querySelector(`[data-q-opt="${n}"]`);
    if (el) el.focus({ preventScroll: true });
  });
}
