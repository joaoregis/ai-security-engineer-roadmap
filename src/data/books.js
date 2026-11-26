// Biblioteca local: arquivos da pasta books/ (servidos em /books/<arquivo>).
// Para catalogar um arquivo novo: adicione uma entrada aqui. Arquivos não catalogados
// aparecem na aba Biblioteca como "não catalogados".
// chapters: [título, página do PDF] — a página é a do leitor de PDF (física), não a impressa no rodapé.
// Nos módulos, um passo aponta para o livro com: book: '<arquivo>', page: N.

export const BOOKS = [
  {
    file: 'LLMAll_pt-BR.pdf',
    title: 'OWASP Top 10 para Aplicações LLM 2025 (tradução pt-BR)',
    short: 'OWASP LLM Top 10 (pt-BR)',
    author: 'OWASP GenAI Security Project — tradução oficial para o português brasileiro',
    year: 2025,
    kind: 'Referência oficial',
    why: 'A "bíblia" dos riscos de LLM em português. Cada risco traz descrição, exemplos, estratégias de prevenção e cenários de ataque — leia junto com as aulas da Fase 1 e 2.',
    modules: ['m1_0', 'm1_1', 'm1_2', 'm2_1', 'm2_3', 'm3_2'],
    chapters: [
      ['Carta dos líderes & novidades de 2025', 5],
      ['LLM01 — Injeção de Prompt', 8],
      ['LLM02 — Divulgação de Informações Sensíveis', 13],
      ['LLM03 — Cadeia de Suprimentos', 17],
      ['LLM04 — Envenenamento de Dados e Modelos', 22],
      ['LLM05 — Manipulação Imprópria de Saída', 26],
      ['LLM06 — Autonomia Excessiva', 29],
      ['LLM07 — Vazamento de Prompt do Sistema', 33],
      ['LLM08 — Fraquezas em Vetores e Embeddings', 36],
      ['LLM09 — Desinformação', 39],
      ['LLM10 — Consumo Irrestrito', 43],
      ['Apêndice 1 — Arquitetura e threat model', 48]
    ]
  }
];

export const bookUrl = (file, page) => `/books/${encodeURIComponent(file)}${page ? `#page=${page}` : ''}`;
