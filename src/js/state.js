// Estado da aplicação + persistência.
// Fonte de verdade: progress.json via servidor (GET/PUT /api/state).
// O localStorage guarda um espelho, usado para o primeiro render (sem piscar) e
// para migrar automaticamente o progresso quando o progress.json ainda não existe.
import { clone, todayIso } from './utils.js';

const STORAGE_KEY = 'ai_security_workbench_ptbr_v2';
export const TAB_IDS = ['dashboard', 'roadmap', 'owasp', 'aws', 'quiz', 'portfolio', 'interviews', 'library'];

const DEFAULT_STATE = {
  theme: 'dark',
  activeTab: 'dashboard',
  weeklyHours: 8,
  startDate: todayIso(),
  completedModules: {},
  expandedModules: { role: true, m1_0: true },
  moduleNotes: {},
  stepsDone: {},
  notebooks: {},
  playbackRate: 1,
  owaspStudied: {},
  awsSubtasks: {},
  awsMocks: [],
  quizSession: null,
  quizStats: {},
  quizHistory: [],
  portfolioTasks: {},
  interviewRevealed: {},
  interviewStatus: {}
};

// Aceita só chaves conhecidas com o tipo esperado (protege contra JSON importado/corrompido).
export function sanitize(obj) {
  const out = clone(DEFAULT_STATE);
  if (!obj || typeof obj !== 'object') return out;
  for (const k of Object.keys(out)) {
    const v = obj[k];
    if (v === undefined || v === null) continue;
    const ok = Array.isArray(out[k]) ? Array.isArray(v) : typeof v === typeof out[k] && !Array.isArray(v);
    if (ok) out[k] = v;
  }
  out.awsMocks = out.awsMocks.filter(m => m && typeof m === 'object' && Number.isFinite(Number(m.score)));
  out.quizHistory = out.quizHistory.filter(h => h && typeof h === 'object');
  if (!TAB_IDS.includes(out.activeTab)) out.activeTab = 'dashboard';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(out.startDate)) out.startDate = todayIso();
  return out;
}

function readLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
  catch { return null; }
}

// Estado compartilhado: views leem/escrevem store.state; filtros de UI não são persistidos.
export const store = {
  state: sanitize(readLocal()),
  filters: { roadmapSearch: '', roadmapPhase: 'all', roadmapStatus: 'all', owaspSearch: '', owaspCategory: 'Todos', owaspReview: false, ivTopic: 'Todos' }
};

let onStatus = () => {};
export const onStorageStatus = fn => { onStatus = fn; };

let saveTimer = null;
function saveNow(keepalive = false) {
  clearTimeout(saveTimer);
  saveTimer = null;
  return fetch('/api/state', { method: 'PUT', keepalive, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(store.state) })
    .then(r => onStatus(r.ok ? 'server' : 'error'))
    .catch(() => onStatus('error'));
}

export function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store.state)); } catch { /* espelho é opcional */ }
  clearTimeout(saveTimer); // debounce: digitar anotações não gera uma escrita por tecla
  saveTimer = setTimeout(saveNow, 300);
}

// Fechar/recarregar a aba dentro da janela do debounce não pode perder a última alteração.
addEventListener('pagehide', () => { if (saveTimer) saveNow(true); });

export async function loadFromServer() {
  try {
    const r = await fetch('/api/state', { cache: 'no-store' });
    if (!r.ok) throw new Error(String(r.status));
    const remote = await r.json();
    store.state = sanitize(remote && Object.keys(remote).length ? remote : readLocal());
    onStatus('server');
  } catch {
    onStatus('error');
  }
}

export function replaceState(obj) {
  store.state = sanitize(obj);
}
