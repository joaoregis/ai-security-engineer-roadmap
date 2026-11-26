// Cálculos derivados do estado (progresso, cronograma). Sem DOM.
import { PHASES, MODULES } from '../data/roadmap.js';
import { OWASP_THREATS } from '../data/owasp.js';
import { AWS_DOMAINS } from '../data/aws.js';
import { PORTFOLIO_PROJECTS } from '../data/portfolio.js';
import { INTERVIEW_QUESTIONS } from '../data/interviews.js';
import { store } from './state.js';
import { addDays, fmtNum } from './utils.js';

export const weekly = () => Math.min(40, Math.max(1, Number(store.state.weeklyHours) || 8));
export const weeksFor = hours => fmtNum(hours / weekly());

export function metrics() {
  const st = store.state;
  const awsTasks = AWS_DOMAINS.flatMap(d => d.tasks);
  const pfTasks = PORTFOLIO_PROJECTS.flatMap(p => p.tasks);
  const doneModules = MODULES.filter(m => st.completedModules[m.id]).length;
  const doneAws = awsTasks.filter(t => st.awsSubtasks[t.id]).length;
  const donePf = pfTasks.filter(t => st.portfolioTasks[t.id]).length;
  const doneOwasp = OWASP_THREATS.filter(t => st.owaspStudied[t.code]).length;
  const total = MODULES.length + awsTasks.length + pfTasks.length + OWASP_THREATS.length;
  const totalHours = MODULES.reduce((s, m) => s + m.hours, 0);
  return {
    doneModules, totalModules: MODULES.length,
    doneAws, totalAws: awsTasks.length,
    donePf, totalPf: pfTasks.length,
    doneOwasp,
    doneProjects: PORTFOLIO_PROJECTS.filter(p => p.tasks.every(t => st.portfolioTasks[t.id])).length,
    overallPct: Math.round(((doneModules + doneAws + donePf + doneOwasp) / total) * 100),
    mockAvg: st.awsMocks.length ? Math.round(st.awsMocks.reduce((s, m) => s + Number(m.score), 0) / st.awsMocks.length) : null,
    mockCount: st.awsMocks.length,
    mastered: INTERVIEW_QUESTIONS.filter(q => st.interviewStatus[q.id] === 'mastered').length,
    totalHours,
    remainingHours: MODULES.filter(m => !st.completedModules[m.id]).reduce((s, m) => s + m.hours, 0),
    nextModule: MODULES.find(m => !st.completedModules[m.id])
  };
}

export function phaseSchedule() {
  const st = store.state;
  const w = weekly();
  const next = MODULES.find(m => !st.completedModules[m.id]);
  let cumulative = 0;
  return PHASES.map(phase => {
    cumulative += phase.hours;
    const mods = MODULES.filter(m => m.phase === phase.id);
    const done = mods.filter(m => st.completedModules[m.id]).length;
    return {
      phase, mods, done,
      pct: mods.length ? Math.round((done / mods.length) * 100) : 0,
      target: addDays(st.startDate, (cumulative / w) * 7),
      status: done === mods.length ? 'done' : next && next.phase === phase.id ? 'current' : 'todo'
    };
  });
}
