// Aba Trilha: "o trabalho" + fases e módulos. Cada módulo: objetivo → aula → vocabulário →
// exemplo → roteiro guiado (aula, kit do Gemini Notebook, fontes com foco) → checkpoint → anotações.
import { PHASES, MODULES, ROLE } from '../../data/roadmap.js';
import { BOOKS, bookUrl } from '../../data/books.js';
import { STUDIO } from '../../data/studio.js';
import { store, persist } from '../state.js';
import { phaseSchedule, weeksFor } from '../metrics.js';
import { $, esc, md, stripPhase, copyText, toast, ICON } from '../utils.js';

const KIND = { aula: 'Aula', listen: 'Notebook', read: 'Ler', watch: 'Assistir', lab: 'Lab', do: 'Praticar' };
const stepKey = (mod, key) => `${mod.id}#${key}`;
const readMinutes = text => Math.max(10, Math.round(text.split(/\s+/).length / 150 / 5) * 5);
const host = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };
const fmtMin = m => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}` : `${m} min`);
const NOTEBOOK_RE = /^https:\/\/(notebook|notebooklm)\.google\.com\//;

let materials = []; // arquivos em src/materiais/ (via /api/materials)

// Roteiro completo do módulo: a aula e o podcast vêm antes das fontes externas.
export function moduleSteps(mod) {
  return [
    { key: 'aula', kind: 'aula', title: 'Ler a aula deste módulo (acima) com calma', minutes: readMinutes(mod.lesson), focus: 'Leia até conseguir explicar cada seção com suas palavras. Use o vocabulário e anote dúvidas.' },
    { key: 'pod', kind: 'listen', title: 'Estudar com o Gemini Notebook: vídeo, áudio, mapa mental, cartões e questionário', minutes: 45, focus: 'Monte o notebook do módulo uma vez e use cada material do Studio no momento certo: vídeo e mapa mental logo após a aula, áudio no trajeto, cartões nos dias seguintes e questionário antes de concluir o módulo.' },
    ...mod.steps.map((s, i) => ({ ...s, key: String(i) }))
  ];
}

export function nextStep(mod) {
  const steps = moduleSteps(mod);
  const isDone = s => !!store.state.stepsDone[stepKey(mod, s.key)];
  const index = steps.findIndex(s => !isDone(s) && !s.optional);
  return { steps, index, step: steps[index] || null, done: steps.filter(isDone).length };
}

export const stepLinks = step => ({
  book: step.book ? bookUrl(step.book, step.page) : null,
  url: step.url || null
});

function bookLabel(file) {
  const b = BOOKS.find(x => x.file === file);
  return b ? b.short : file;
}

// ---------- Kit do Gemini Notebook (texto e prompts para colar no Studio) ----------
function lessonText(mod) {
  return [
    `Módulo ${mod.code} — ${mod.title}`, '',
    `Objetivo: ${mod.goal}`, '',
    `Como isso aparece no trabalho: ${mod.onTheJob}`, '',
    mod.lesson.replace(/~~~/g, ''), '',
    'Vocabulário:', ...mod.glossary.map(([t, d]) => `- ${t}: ${d}`), '',
    'Perguntas de checkpoint (estilo entrevista):', ...mod.checkpoint.map(c => `- ${c.q}\n  Resposta esperada: ${c.a}`)
  ].join('\n');
}

const sourceLinks = mod => [...new Set(mod.steps.filter(s => s.url && !s.optional && (s.kind === 'read' || s.kind === 'watch')).map(s => s.url))];

const AUDIO_EXT = /\.(mp3|m4a|wav|ogg)$/i;
const VIDEO_EXT = /\.(mp4|webm)$/i;
const IMG_EXT = /\.(png|jpe?g)$/i;
const modMaterials = mod => materials.filter(f => f.startsWith(`${mod.id}.`) || f.startsWith(`${mod.id}-`));

// ---------- Velocidade dos players (vale para todos; salva no progresso) ----------
const SPEEDS = [1, 1.25, 1.5, 1.75, 2];
const rate = () => (SPEEDS.includes(store.state.playbackRate) ? store.state.playbackRate : 1);
const speedPills = () => `<div class="pills speed" role="group" aria-label="Velocidade">${SPEEDS.map(r =>
  `<button class="pill" data-speed="${r}" aria-pressed="${r === rate()}">${r}x</button>`).join('')}</div>`;
const mediaEls = () => document.querySelectorAll('#roadmap-list audio, #roadmap-list video');

function applySpeed() {
  mediaEls().forEach(m => { m.defaultPlaybackRate = rate(); m.playbackRate = rate(); });
  document.querySelectorAll('#roadmap-list [data-speed]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.speed) === rate())));
}

// Re-render recria os <audio>: guarda posição/estado antes e restaura depois, para marcar um
// passo não interromper o que está tocando.
function snapshotMedia() {
  return [...mediaEls()].filter(m => m.currentTime > 0).map(m => ({ src: m.getAttribute('src'), t: m.currentTime, playing: !m.paused }));
}
function restoreMedia(snap) {
  applySpeed();
  for (const s of snap) {
    const m = [...mediaEls()].find(x => x.getAttribute('src') === s.src);
    if (!m) continue;
    const resume = () => { m.currentTime = s.t; if (s.playing) m.play().catch(() => {}); };
    if (m.readyState >= 1) resume(); else m.addEventListener('loadedmetadata', resume, { once: true });
  }
}

// Arquivos salvos em src/materiais/: player de áudio/vídeo, imagem clicável, link para PDF/PPTX/texto.
function renderMaterials(files) {
  if (!files.length) return '';
  const src = f => `materiais/${encodeURIComponent(f)}`;
  const rank = f => [VIDEO_EXT, AUDIO_EXT, IMG_EXT].findIndex(re => re.test(f)) >>> 0; // vídeo, áudio, imagem, resto
  const docs = files.filter(f => rank(f) > 2);
  return `<div class="materials">${files.filter(f => rank(f) <= 2).sort((a, b) => rank(a) - rank(b)).map(f => {
    if (AUDIO_EXT.test(f)) return `<figure class="material"><figcaption>${esc(f)}</figcaption><audio controls preload="metadata" src="${src(f)}"></audio>${speedPills()}</figure>`;
    if (VIDEO_EXT.test(f)) return `<figure class="material wide"><figcaption>${esc(f)}</figcaption><video controls preload="metadata" src="${src(f)}"></video>${speedPills()}</figure>`;
    return `<figure class="material"><figcaption>${esc(f)}</figcaption><a href="${src(f)}" target="_blank" rel="noopener"><img src="${src(f)}" alt="${esc(f)}" loading="lazy" /></a></figure>`;
  }).join('')}</div>
  ${docs.length ? `<div class="ref-links">${docs.map(f => `<a class="link-chip" href="${src(f)}" target="_blank" rel="noopener">📄 ${esc(f)} ↗</a>`).join('')}</div>` : ''}`;
}

function renderStudio(mod) {
  const nb = store.state.notebooks[mod.id];
  const files = modMaterials(mod);
  const books = [...new Set(mod.steps.map(s => s.book).filter(Boolean))];
  const saveAs = s => (s.file ? 'Baixe e adicione aqui no módulo.' : 'Fica no notebook: abra pelo link do notebook.');
  return `
    ${renderMaterials(files)}
    <label class="upload-zone" data-upload-zone="${mod.id}">
      <input type="file" multiple hidden data-upload="${mod.id}" accept="audio/*,video/*,image/*,.pdf,.pptx,.md,.txt" />
      <span>📎 <strong>Adicionar arquivos do Notebook</strong>: clique ou arraste para cá (áudio, vídeo, imagem, PDF, slides). Não precisa renomear.</span>
    </label>
    <div class="ref-links">
      ${nb ? `<a class="link-chip" href="${esc(nb)}" target="_blank" rel="noopener noreferrer">Abrir meu notebook ↗</a>` : ''}
      <a class="link-chip" href="https://notebook.google.com/" target="_blank" rel="noopener noreferrer">Gemini Notebook ↗</a>
    </div>
    <details class="pod-setup"${files.length || nb ? '' : ' open'}>
      <summary>Kit do Gemini Notebook para este módulo</summary>
      <ol class="pod-steps">
        <li>No Gemini Notebook (antigo NotebookLM), crie um notebook chamado <strong>Trilha ${esc(mod.code)}</strong>.</li>
        <li>Adicione as fontes:
          <button class="link-chip" data-pod-copy="lesson" data-pod-mod="${mod.id}">Copiar aula</button> (cole como texto)
          ${sourceLinks(mod).length ? `e <button class="link-chip" data-pod-copy="links" data-pod-mod="${mod.id}">Copiar ${sourceLinks(mod).length} links</button> (cole como sites)` : ''}
          ${books.length ? `e envie ${books.map(b => `<code>books/${esc(b)}</code>`).join(', ')}` : ''}.
          <span class="muted">Se algum link for recusado ("tipo de URL não é suportado"), abra a página no navegador, copie o texto (Ctrl+A, Ctrl+C) e adicione como texto colado. A aula copiada já cobre o essencial.</span></li>
        <li>No painel <strong>Studio</strong>, gere os materiais abaixo, na ordem em que fazem sentido no estudo. Quando a opção permitir personalizar, cole o prompt e peça a saída em português.</li>
        <li>Baixe o que for arquivo e use <strong>Adicionar arquivos do Notebook</strong> acima (ou arraste). Pode ter vários do mesmo tipo, por exemplo o áudio em Deep Dive e o em Debate: cada um ganha o seu player.</li>
      </ol>
      <div class="studio-grid">${STUDIO.map(s => `
        <div class="studio-item">
          <div class="row-between"><strong>${esc(s.label)}</strong>${s.prompt
            ? `<button class="link-chip" data-studio="${s.id}" data-pod-mod="${mod.id}">Copiar prompt</button>`
            : '<span class="badge">sem prompt</span>'}</div>
          <p class="small">${esc(s.when)}</p>
          <p class="small muted">${saveAs(s)}</p>
        </div>`).join('')}</div>
      <label class="field">
        <span class="field-label">Link do seu notebook deste módulo</span>
        <input type="url" class="input" data-notebook="${mod.id}" value="${esc(nb || '')}" placeholder="https://notebook.google.com/…" />
      </label>
    </details>`;
}

// ---------- Render ----------
function renderStep(mod, s, n) {
  const key = stepKey(mod, s.key);
  const done = !!store.state.stepsDone[key];
  const { book, url } = stepLinks(s);
  const chips = [
    book ? `<a class="link-chip book-chip" href="${esc(book)}" target="_blank" rel="noopener">📖 ${esc(bookLabel(s.book))} · p. ${s.page}</a>` : '',
    url ? `<a class="link-chip" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${book ? 'Versão online (EN)' : esc(host(url))} <span aria-hidden="true">↗</span></a>` : '',
    s.tab ? `<button class="link-chip" data-tab="${esc(s.tab)}">Abrir no app →</button>` : ''
  ].join('');
  return `
    <li class="step${done ? ' done' : ''}${s.optional ? ' optional' : ''}">
      <input type="checkbox" class="check" data-step="${esc(key)}"${done ? ' checked' : ''} aria-label="Concluí o passo ${n}: ${esc(s.title)}" />
      <div class="step-body">
        <div class="step-head">
          <span class="step-num">${n}</span>
          <span class="badge kind-${s.kind}">${KIND[s.kind]}</span>
          <strong>${esc(s.title)}</strong>
          <span class="muted small">~${fmtMin(s.minutes)}</span>
          ${s.optional ? '<span class="badge">Opcional</span>' : ''}
          ${s.cost ? `<span class="badge badge-amber">${esc(s.cost)}</span>` : ''}
        </div>
        <p class="step-focus"><span class="muted">Foco:</span> ${esc(s.focus)}</p>
        ${chips ? `<div class="ref-links">${chips}</div>` : ''}
        ${s.kind === 'listen' ? renderStudio(mod) : ''}
      </div>
    </li>`;
}

function renderModule(mod) {
  const st = store.state;
  const done = !!st.completedModules[mod.id];
  const { steps, done: doneSteps } = nextStep(mod);
  const left = steps.filter(s => !s.optional && !st.stepsDone[stepKey(mod, s.key)]).reduce((a, s) => a + s.minutes, 0);
  const allDone = steps.every(s => s.optional || st.stepsDone[stepKey(mod, s.key)]);
  return `
    <article class="module${done ? ' done' : ''}" id="mod-${mod.id}">
      <input type="checkbox" class="check" data-done="${mod.id}"${done ? ' checked' : ''} aria-label="Marcar módulo ${esc(mod.code)} como concluído" />
      <details data-mod="${mod.id}"${st.expandedModules[mod.id] ? ' open' : ''}>
        <summary>
          <div class="module-head-text">
            <div class="row">
              <span class="code-tag">Módulo ${esc(mod.code)}</span><span class="badge">${mod.hours}h</span>
              <span class="badge${allDone ? ' badge-emerald' : ''}">${doneSteps}/${steps.length} passos${left ? ` · ~${fmtMin(left)} restantes` : ''}</span>
              ${done ? '<span class="badge badge-emerald">Concluído</span>' : ''}
            </div>
            <h3>${esc(mod.title)}</h3>
          </div>
          ${ICON.chevron}
        </summary>
        <div class="module-body">
          <div class="grid-2 gap-sm">
            <div class="callout info"><div class="callout-title">🎯 Objetivo do módulo</div>${esc(mod.goal)}</div>
            <div class="callout"><div class="callout-title">💼 Como isso aparece no trabalho</div>${esc(mod.onTheJob)}</div>
          </div>

          <section class="stack gap-sm">
            <span class="eyebrow">📖 Aula</span>
            <div class="lesson">${md(mod.lesson)}</div>
            <div class="callout ok"><div class="callout-title">Resumo em 1 minuto</div>${md(mod.concepts.map(c => `- ${c}`).join('\n'))}</div>
          </section>

          <section class="stack gap-sm">
            <span class="eyebrow emerald">🗣 Vocabulário para usar com naturalidade</span>
            <dl class="glossary">${mod.glossary.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
          </section>

          <div class="code-card">
            <div class="code-head"><span>${esc(mod.exampleTitle)}</span><button class="btn btn-sm" data-copy="${mod.id}">Copiar</button></div>
            <pre><code>${esc(mod.exampleCode)}</code></pre>
          </div>
          <div class="callout warn">
            <div class="callout-title">${ICON.warn} Armadilhas de sênior</div>
            ${esc(mod.caveat)}
          </div>

          <section class="stack gap-sm">
            <span class="eyebrow">🧭 Roteiro de estudo — faça na ordem</span>
            <ol class="steps">${steps.map((s, i) => renderStep(mod, s, i + 1)).join('')}</ol>
          </section>

          <section class="stack gap-sm">
            <span class="eyebrow">✅ Checkpoint — responda em voz alta antes de abrir</span>
            ${allDone && !done ? '<div class="callout ok">Roteiro completo! Se você responde todas as perguntas abaixo com segurança, marque o módulo como concluído (caixa à esquerda do título).</div>' : ''}
            <div class="stack gap-sm">${mod.checkpoint.map((c, i) => `
              <details class="checkpoint">
                <summary><span class="code-tag">P${i + 1}</span><span>${esc(c.q)}</span></summary>
                <div class="callout ok">${esc(c.a)}</div>
              </details>`).join('')}</div>
          </section>

          <label class="field">
            <span class="field-label">Minhas anotações (salvas automaticamente)</span>
            <textarea class="textarea" rows="3" data-note="${mod.id}" placeholder="Aprendizados dos labs, dúvidas, links…">${esc(st.moduleNotes[mod.id] || '')}</textarea>
          </label>
        </div>
      </details>
    </article>`;
}

function renderRole() {
  const open = store.state.expandedModules.role;
  const modCode = id => (MODULES.find(m => m.id === id) || {}).code;
  $('roadmap-role').innerHTML = `
    <details class="card role-card" data-mod="role"${open ? ' open' : ''}>
      <summary>
        <div>
          <span class="eyebrow">Comece aqui</span>
          <h2>O trabalho de um AI Security Engineer</h2>
          <p class="muted small">O que você vai fazer no dia a dia, com quem vai conversar e como esta trilha te leva até lá.</p>
        </div>
        ${ICON.chevron}
      </summary>
      <div class="role-body stack">
        <p>${esc(ROLE.summary)}</p>
        <div class="stack gap-sm">
          <span class="eyebrow">Responsabilidades, com um exemplo real de cada</span>
          <div class="grid-2 gap-sm">${ROLE.duties.map(([t, d, id]) => `
            <div class="ref">
              <strong>${esc(t)}</strong>
              <p class="muted small">${esc(d)}</p>
              <div class="ref-links"><button class="link-chip" data-goto-mod="${id}">Treinado no Módulo ${esc(modCode(id))} →</button></div>
            </div>`).join('')}</div>
        </div>
        <div class="grid-2">
          <div class="stack gap-sm">
            <span class="eyebrow">Uma semana típica</span>
            <dl class="glossary week">${ROLE.week.map(([d, t]) => `<div><dt>${esc(d)}</dt><dd>${esc(t)}</dd></div>`).join('')}</dl>
          </div>
          <div class="stack gap-sm">
            <span class="eyebrow">Com quem você conversa</span>
            <p class="small">${esc(ROLE.peers)}</p>
            <span class="eyebrow">Os 4 pilares desta trilha</span>
            <dl class="glossary">${ROLE.pillars.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
          </div>
        </div>
        <div class="stack gap-sm">
          <span class="eyebrow emerald">Frases que você vai ouvir e usar</span>
          <ul class="bullets">${ROLE.phrases.map(p => `<li>“${esc(p)}”</li>`).join('')}</ul>
        </div>
      </div>
    </details>`;
}

function moduleMatches(mod, q) {
  const { state, filters } = store;
  const done = !!state.completedModules[mod.id];
  if (filters.roadmapStatus === 'done' && !done) return false;
  if (filters.roadmapStatus === 'pending' && done) return false;
  if (!q) return true;
  return [mod.code, mod.title, mod.goal, mod.onTheJob, mod.lesson, mod.caveat, mod.exampleTitle, mod.exampleCode, ...mod.concepts,
    ...mod.glossary.flat(), ...mod.steps.map(s => `${s.title} ${s.focus}`), ...mod.checkpoint.map(c => c.q), state.moduleNotes[mod.id] || '']
    .join(' ').toLowerCase().includes(q);
}

function updateToggleAllLabel() {
  $('btn-toggle-all').textContent = MODULES.every(m => store.state.expandedModules[m.id]) ? 'Recolher todos' : 'Expandir todos';
}

export function render() {
  const { filters } = store;
  renderRole();
  $('roadmap-phase').innerHTML = `<option value="all">Todas as fases</option>` +
    PHASES.map(p => `<option value="${p.id}">Fase ${p.id}: ${esc(stripPhase(p.title))}</option>`).join('');
  $('roadmap-phase').value = filters.roadmapPhase;
  $('roadmap-search').value = filters.roadmapSearch;
  document.querySelectorAll('#roadmap-status [data-status]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.status === filters.roadmapStatus)));
  updateToggleAllLabel();

  const q = filters.roadmapSearch.trim().toLowerCase();
  const html = phaseSchedule().map(s => {
    if (filters.roadmapPhase !== 'all' && String(s.phase.id) !== filters.roadmapPhase) return '';
    const mods = s.mods.filter(mod => moduleMatches(mod, q));
    if (!mods.length) return '';
    return `
      <section class="phase-block ${s.status}">
        <header class="phase-head">
          <span class="phase-num">${s.status === 'done' ? ICON.check : s.phase.id}</span>
          <div class="phase-head-text">
            <span class="eyebrow">Fase ${s.phase.id}</span>
            <h2>${esc(stripPhase(s.phase.title))}</h2>
            <p>${esc(s.phase.subtitle)}</p>
          </div>
          <div class="row">
            <span class="badge">${s.phase.hours}h · ~${weeksFor(s.phase.hours)} sem</span>
            <span class="badge ${s.status === 'done' ? 'badge-emerald' : ''}">${s.done}/${s.mods.length} módulos</span>
            <span class="badge badge-sky">Alvo ${s.target}</span>
          </div>
        </header>
        <div class="phase-mods">${mods.map(renderModule).join('')}</div>
      </section>`;
  }).join('');
  const snap = snapshotMedia();
  $('roadmap-list').innerHTML = html || '<div class="card empty">Nenhum módulo corresponde aos filtros.</div>';
  restoreMedia(snap);
}

export function openModule(id, ctx) {
  Object.assign(store.filters, { roadmapSearch: '', roadmapPhase: 'all', roadmapStatus: 'all' });
  store.state.expandedModules[id] = true;
  ctx.setTab('roadmap');
  render();
  const el = $(`mod-${id}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function jumpToPhase(phaseId, ctx) {
  Object.assign(store.filters, { roadmapSearch: '', roadmapPhase: String(phaseId), roadmapStatus: 'all' });
  ctx.setTab('roadmap');
  render();
}

export function bind(ctx) {
  const panel = $('panel-roadmap');
  const { filters } = store;

  panel.addEventListener('click', e => {
    const t = e.target.closest('[data-copy],[data-status],[data-pod-copy],[data-studio],[data-speed],[data-goto-mod]');
    if (!t) return;
    const d = t.dataset;
    if (d.copy) {
      const mod = MODULES.find(x => x.id === d.copy);
      if (mod) copyText(mod.exampleCode);
    } else if (d.podCopy || d.studio) {
      const mod = MODULES.find(x => x.id === d.podMod);
      if (!mod) return;
      const studio = STUDIO.find(x => x.id === d.studio);
      copyText(studio ? studio.prompt(mod) : { lesson: lessonText, links: m => sourceLinks(m).join('\n') }[d.podCopy](mod));
    } else if (d.speed) {
      store.state.playbackRate = Number(d.speed);
      persist(); // sem re-render: só ajusta os players
      applySpeed();
    } else if (d.gotoMod) {
      openModule(d.gotoMod, ctx);
    } else {
      filters.roadmapStatus = d.status;
      render();
    }
  });

  panel.addEventListener('change', e => {
    const d = e.target.dataset;
    if (d.done) {
      store.state.completedModules[d.done] = e.target.checked;
      ctx.commit(`[data-done="${d.done}"]`);
    } else if (d.step) {
      store.state.stepsDone[d.step] = e.target.checked;
      ctx.commit(`[data-step="${d.step}"]`);
    } else if (d.upload) {
      uploadFiles(d.upload, [...e.target.files]);
      e.target.value = '';
    } else if (d.notebook) {
      const v = e.target.value.trim();
      if (v && !NOTEBOOK_RE.test(v)) {
        toast('Cole um link do Gemini Notebook (https://notebook.google.com/…).', 'error');
        e.target.value = store.state.notebooks[d.notebook] || '';
        return;
      }
      if (v) store.state.notebooks[d.notebook] = v;
      else delete store.state.notebooks[d.notebook];
      ctx.commit();
    }
  });

  // 'toggle' de <details> não borbulha: escuta na fase de captura.
  panel.addEventListener('toggle', e => {
    const id = e.target.dataset && e.target.dataset.mod;
    if (!id) return;
    store.state.expandedModules[id] = e.target.open;
    persist();
    updateToggleAllLabel();
  }, true);

  panel.addEventListener('input', e => {
    const id = e.target.dataset.note;
    if (id) { store.state.moduleNotes[id] = e.target.value; persist(); }
  });

  $('roadmap-search').addEventListener('input', e => { filters.roadmapSearch = e.target.value; render(); });
  $('roadmap-phase').addEventListener('change', e => { filters.roadmapPhase = e.target.value; render(); });
  $('btn-toggle-all').addEventListener('click', () => {
    const open = !MODULES.every(m => store.state.expandedModules[m.id]);
    MODULES.forEach(m => { store.state.expandedModules[m.id] = open; });
    persist();
    render();
  });

  // Arrastar arquivos do Explorer/Downloads direto para o módulo.
  panel.addEventListener('dragover', e => {
    const zone = e.target.closest('[data-upload-zone]');
    if (!zone) return;
    e.preventDefault();
    zone.classList.add('dragging');
  });
  panel.addEventListener('dragleave', e => {
    const zone = e.target.closest('[data-upload-zone]');
    if (zone) zone.classList.remove('dragging');
  });
  panel.addEventListener('drop', e => {
    const zone = e.target.closest('[data-upload-zone]');
    if (!zone) return;
    e.preventDefault();
    zone.classList.remove('dragging');
    uploadFiles(zone.dataset.uploadZone, [...e.dataTransfer.files]);
  });

  loadMaterials();
}

function loadMaterials() {
  return fetch('/api/materials').then(r => (r.ok ? r.json() : [])).then(list => { materials = list; render(); }).catch(() => {});
}

// Envia para src/materiais/; o servidor gera o nome (<módulo>-<nome-original>.<ext>) e nunca sobrescreve.
async function uploadFiles(modId, files) {
  for (const f of files) {
    toast(`Enviando ${f.name}…`);
    const r = await fetch(`/api/materials?module=${encodeURIComponent(modId)}&name=${encodeURIComponent(f.name)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: f
    }).catch(() => null);
    if (r && r.ok) {
      toast(`Adicionado: ${(await r.json()).name}`, 'success');
    } else {
      const why = !r ? 'servidor parado?'
        : r.status === 415 ? 'formato não aceito'
          : r.status === 405 ? 'servidor desatualizado: pare e rode npm start de novo'
            : r.status === 413 ? 'arquivo maior que 1 GB' : `erro ${r.status}`;
      toast(`Não enviei ${f.name} (${why}).`, 'error');
    }
  }
  await loadMaterials();
}
