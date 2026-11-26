// Aba Entrevistas: flashcards com gabarito sênior, red flags e autoavaliação.
import { INTERVIEW_QUESTIONS } from '../../data/interviews.js';
import { store, persist } from '../state.js';
import { metrics } from '../metrics.js';
import { $, esc } from '../utils.js';

const TOPICS = ['Todos', ...new Set(INTERVIEW_QUESTIONS.map(q => q.topic))];

export function render() {
  const { state, filters } = store;
  $('iv-topics').innerHTML = TOPICS.map(t =>
    `<button class="pill" data-iv-topic="${esc(t)}" aria-pressed="${filters.ivTopic === t}">${esc(t)}</button>`).join('');
  const review = INTERVIEW_QUESTIONS.filter(q => state.interviewStatus[q.id] === 'review').length;
  $('iv-mastered').textContent = `Dominadas: ${metrics().mastered}/${INTERVIEW_QUESTIONS.length}`;
  $('iv-review').textContent = `Revisar: ${review}`;

  $('iv-list').innerHTML = INTERVIEW_QUESTIONS
    .filter(q => filters.ivTopic === 'Todos' || q.topic === filters.ivTopic)
    .map(q => {
      const st = state.interviewStatus[q.id] || 'none';
      const num = String(INTERVIEW_QUESTIONS.indexOf(q) + 1).padStart(2, '0');
      return `
        <article class="card stack question ${st}">
          <div class="row-between">
            <div class="row"><span class="code-tag">Q${num}</span><span class="badge badge-sky">${esc(q.topic)}</span></div>
            <div class="row" role="group" aria-label="Seu nível nesta pergunta">
              <button class="btn btn-sm pressed-amber" data-iv-id="${esc(q.id)}" data-iv-status="review" aria-pressed="${st === 'review'}">↻ Revisar</button>
              <button class="btn btn-sm pressed-emerald" data-iv-id="${esc(q.id)}" data-iv-status="mastered" aria-pressed="${st === 'mastered'}">✓ Dominada</button>
            </div>
          </div>
          <h3>${esc(q.question)}</h3>
          <details class="answer" data-iv="${esc(q.id)}"${state.interviewRevealed[q.id] ? ' open' : ''}>
            <summary class="btn btn-sm"><span class="when-closed">Revelar gabarito &amp; red flags</span><span class="when-open">Ocultar gabarito</span></summary>
            <div class="answer-body">
              <div class="callout ok">
                <div class="callout-title">Resposta nível sênior / staff</div>
                <ul class="bullets emerald">${q.seniorAnswer.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
              </div>
              <div class="grid-2">
                <div class="callout info"><div class="callout-title">O que estão avaliando</div>${esc(q.evaluating)}</div>
                <div class="callout danger">
                  <div class="callout-title">Red flags</div>
                  <ul class="bullets red small">${q.redFlags.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
                </div>
              </div>
            </div>
          </details>
        </article>`;
    }).join('');
}

export function bind(ctx) {
  const panel = $('panel-interviews');
  panel.addEventListener('click', e => {
    const t = e.target.closest('[data-iv-topic],[data-iv-status]');
    if (!t) return;
    if (t.dataset.ivTopic) {
      store.filters.ivTopic = t.dataset.ivTopic;
      render();
      return;
    }
    const { ivId, ivStatus } = t.dataset;
    const statuses = store.state.interviewStatus;
    statuses[ivId] = statuses[ivId] === ivStatus ? 'none' : ivStatus;
    ctx.commit(`[data-iv-id="${ivId}"][data-iv-status="${ivStatus}"]`);
  });
  panel.addEventListener('toggle', e => {
    const id = e.target.dataset && e.target.dataset.iv;
    if (!id) return;
    store.state.interviewRevealed[id] = e.target.open;
    persist();
  }, true);
}
