// Ponto de entrada: navegação, tema, orquestração dos re-renders e boot.
// Cada view exporta render() (estado → DOM) e bind(ctx) (eventos da própria aba).
import { MODULES } from '../data/roadmap.js';
import { OWASP_THREATS } from '../data/owasp.js';
import { PORTFOLIO_PROJECTS } from '../data/portfolio.js';
import { INTERVIEW_QUESTIONS } from '../data/interviews.js';
import { SCS_QUESTIONS } from '../data/scs-questions.js';
import { store, persist, loadFromServer, onStorageStatus, TAB_IDS } from './state.js';
import { metrics } from './metrics.js';
import { $, ICON } from './utils.js';
import * as dashboard from './views/dashboard.js';
import * as roadmap from './views/roadmap.js';
import * as owasp from './views/owasp.js';
import * as aws from './views/aws.js';
import * as quiz from './views/quiz.js';
import * as portfolio from './views/portfolio.js';
import * as interviews from './views/interviews.js';
import * as library from './views/library.js';
import { BOOKS } from '../data/books.js';

const VIEWS = [dashboard, roadmap, owasp, aws, quiz, portfolio, interviews, library];
const TAB_LABELS = {
  dashboard: 'Dashboard',
  roadmap: 'Trilha de Estudos',
  owasp: 'OWASP LLM & MCP',
  aws: 'AWS SCS-C03',
  quiz: 'Simulado SCS-C03',
  portfolio: 'Portfólio',
  interviews: 'Entrevistas',
  library: 'Biblioteca'
};

function applyTheme() {
  const dark = store.state.theme !== 'light';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelectorAll('[data-theme-label]').forEach(el => { el.textContent = dark ? '☀ Modo claro' : '☾ Modo escuro'; });
}

function renderNav() {
  const st = store.state;
  const m = metrics();
  const quizLast = st.quizHistory[st.quizHistory.length - 1];
  const badge = {
    dashboard: `${m.overallPct}%`,
    roadmap: `${m.doneModules}/${MODULES.length}`,
    owasp: `${m.doneOwasp}/${OWASP_THREATS.length}`,
    aws: m.mockAvg !== null ? `${m.mockAvg}%` : `${m.doneAws}/${m.totalAws}`,
    quiz: quizLast ? `${quizLast.pct}%` : `${SCS_QUESTIONS.length}q`,
    portfolio: `${m.doneProjects}/${PORTFOLIO_PROJECTS.length}`,
    interviews: `${m.mastered}/${INTERVIEW_QUESTIONS.length}`,
    library: String(BOOKS.length)
  };
  const current = id => (st.activeTab === id ? ' aria-current="page"' : '');
  $('desktop-nav').innerHTML = TAB_IDS.map(id =>
    `<button class="nav-btn" data-tab="${id}"${current(id)}>${ICON[id]}<span>${TAB_LABELS[id]}</span><span class="nav-badge">${badge[id]}</span></button>`).join('');
  $('mobile-nav').innerHTML = TAB_IDS.map(id =>
    `<button class="tab-chip" data-tab="${id}"${current(id)}>${TAB_LABELS[id]}</button>`).join('');
  document.querySelectorAll('.panel').forEach(p => { p.hidden = p.id !== `panel-${st.activeTab}`; });
  $('sidebar-pct').textContent = `${m.overallPct}%`;
  $('sidebar-bar').style.width = `${m.overallPct}%`;
  $('mobile-pct').textContent = `${m.overallPct}%`;
}

function renderAll() {
  applyTheme();
  renderNav();
  VIEWS.forEach(v => v.render());
}

function setTab(id) {
  if (!TAB_IDS.includes(id)) return;
  store.state.activeTab = id;
  persist();
  renderNav();
  window.scrollTo(0, 0);
}

// Salva, re-renderiza tudo (barato: poucas dezenas de KB de HTML) e devolve o foco ao controle.
function commit(focusSelector) {
  persist();
  renderAll();
  if (focusSelector) {
    const el = document.querySelector(focusSelector);
    if (el) el.focus({ preventScroll: true });
  }
}

const ctx = { commit, setTab, renderAll };

const STATUS = {
  server: ['badge badge-emerald', 'Salvo em progress.json'],
  error: ['badge badge-red', 'Falha ao salvar — servidor parado? Exporte um backup']
};
onStorageStatus(s => { [$('storage-badge').className, $('storage-badge').textContent] = STATUS[s]; });

// Eventos globais: troca de aba (inclusive links internos das views) e tema.
document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-theme-toggle]');
  if (!t) return;
  if (t.dataset.tab) setTab(t.dataset.tab);
  else { store.state.theme = store.state.theme === 'light' ? 'dark' : 'light'; persist(); applyTheme(); }
});

VIEWS.forEach(v => v.bind(ctx));
renderAll(); // primeiro render com o espelho local (instantâneo)
$('boot-warning').remove();
setInterval(quiz.tick, 1000);
loadFromServer().then(renderAll);
