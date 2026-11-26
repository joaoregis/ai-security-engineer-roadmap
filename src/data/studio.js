// Kit do Gemini Notebook (antigo NotebookLM): os 8 materiais do painel "Studio".
// Para cada um: quando usar no estudo, prompt de personalização (se a opção aceitar) e se gera
// um arquivo para baixar (file: true) e adicionar ao módulo pelo botão "Adicionar arquivos".
// O servidor salva em src/materiais/ como <id-do-módulo>-<nome-original>.<ext>.

const terms = (mod, n) => mod.glossary.slice(0, n).map(g => g[0]).join(', ');
const questions = (mod, n) => mod.checkpoint.slice(0, n).map(c => c.q).join(' ');
const topics = mod => (mod.lesson.match(/^### .+$/gm) || []).map(h => h.slice(4)).slice(0, 6).join('; ');
const base = mod => `em português do Brasil, para um desenvolvedor backend em transição para AI Security Engineer, sobre "${mod.title}"`;

export const STUDIO = [
  {
    id: 'video', label: 'Resumo de vídeo', file: true,
    when: 'Primeiro contato ou revisão visual (~10 min): ver os fluxos e as defesas desenhados.',
    prompt: mod => `Vídeo ${base(mod)}. Explique do básico ao avançado, nesta ordem: ${topics(mod)}. Mostre os fluxos de dados e onde ficam as trust boundaries. Termine com um resumo de 3 pontos.`
  },
  {
    id: 'audio', label: 'Resumo de áudio', file: true,
    when: 'Fixar no trajeto ou na academia. Gere em Deep Dive (aprender) e em Debate (treinar argumentação) e adicione os dois: cada um ganha seu player.',
    prompt: mod => `Episódio ${base(mod)}. Objetivo: ${mod.goal} Explique sem pular fundamentos, com analogias e exemplos concretos. ` +
      `Use e explique com naturalidade: ${terms(mod, 6)}. Separe sempre controle determinístico de probabilístico. ` +
      `Termine respondendo como engenheiros sêniores numa entrevista: ${questions(mod, 2)}`
  },
  {
    id: 'mapa', label: 'Mapa mental', file: true,
    when: 'Logo depois da aula: enxergar a estrutura do assunto e achar o que você ainda não sabe explicar.',
    prompt: null
  },
  {
    id: 'cartoes', label: 'Cartões de estudo', file: false,
    when: 'Memorizar o vocabulário. Revise 1, 3 e 7 dias depois (repetição espaçada).',
    prompt: mod => `Cartões em português do Brasil. Frente: um termo ou pergunta; verso: explicação curta com um exemplo concreto. Inclua estes termos: ${terms(mod, 20)}. Inclua também estas perguntas: ${questions(mod, 10)}`
  },
  {
    id: 'quiz', label: 'Questionário', file: false,
    when: 'Antes de marcar o módulo como concluído: teste de verdade, sem consultar.',
    prompt: mod => `Questionário ${base(mod)}, nível intermediário, no estilo de entrevista técnica. Priorize cenários práticos ("o que você faria se…") e explique cada resposta.`
  },
  {
    id: 'slides', label: 'Apresentação de slides', file: true,
    when: 'Revisão rápida antes de entrevistas, ou treinar explicar o tema em voz alta, slide a slide.',
    prompt: mod => `Apresentação ${base(mod)}. Um conceito por slide, cada um com um exemplo concreto. Inclua um slide de vocabulário (${terms(mod, 8)}) e termine com estas perguntas de entrevista: ${questions(mod, 4)}`
  },
  {
    id: 'infografico', label: 'Infografia', file: true,
    when: 'Uma página-resumo para revisar ou postar no LinkedIn/portfólio (confira os fatos antes).',
    prompt: mod => `Infográfico ${base(mod)}: objetivo, conceitos-chave e as principais defesas, com visual limpo e pouco texto.`
  },
  {
    id: 'relatorio', label: 'Relatórios', file: true,
    when: 'Guia de estudo escrito para reler ou imprimir.',
    prompt: mod => `Guia de estudo ${base(mod)}: resumo em linguagem simples, conceitos-chave com exemplos, erros comuns e perguntas de revisão com respostas.`
  }
];
