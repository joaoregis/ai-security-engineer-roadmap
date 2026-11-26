// Fase 5 — Portfólio Sênior & Preparação para Entrevistas.

export const FASE5 = [
  {
    id: 'm5_1', phase: 5, code: '5.1', hours: 10,
    title: 'Construção de 3 Projetos Defensivos no GitHub',
    goal: 'Ao final você tem pelo menos um repositório público que prova, com testes automatizados, que sabe construir controles de segurança para IA — com threat model, arquitetura e testes adversariais rodando no CI.',
    onTheJob: 'Recrutadores e entrevistadores de segurança querem evidência, não lista de cursos. Um repositório que mostra "aqui está o ataque, aqui está o controle, aqui está o teste que prova que o controle funciona" é exatamente o artefato que um AI Security Engineer produz no trabalho: controles codificados, testados e documentados.',
    lesson: `### O que um portfólio de segurança precisa provar
Três coisas, nesta ordem:

1. **Você entende o problema**: um threat model curto mostrando ameaças concretas.
2. **Você constrói a solução**: código que implementa controles determinísticos.
3. **Você prova que funciona**: testes automatizados que executam o ataque e mostram o bloqueio.

O terceiro ponto é o que diferencia um portfólio sênior. "Implementei um filtro de PII" é uma afirmação; "este teste envia um CPF e confirma que ele não chega ao modelo nem ao log" é uma **prova**.

### Os três projetos sugeridos
Os blueprints detalhados estão na aba **Portfólio** deste app. Resumo:

- **AI Gateway endurecido**: autenticação por chave virtual, limite de tokens e orçamento por tenant, mascaramento de PII e log seguro. Junta os Módulos 2.3 e 3.1.
- **Servidor MCP endurecido**: escopos por tool, allowlist, validação de schema, aprovação humana para escrita e trilha de auditoria. Junta os Módulos 2.2 e 3.2.
- **RAG multi-tenant seguro**: pré-filtragem com Row Level Security, defesa contra envenenamento na ingestão e testes de vazamento entre tenants. Junta os Módulos 2.1 e 3.1.

Comece por **um**. Um projeto terminado e bem documentado vale mais do que três pela metade.

### Testes adversariais automatizados
Ferramentas como **Promptfoo** e **NVIDIA garak** enviam automaticamente muitas variações de ataques (prompt injection, jailbreak, vazamento de dados) contra a sua aplicação e relatam o que passou. Colocá-las no **GitHub Actions** faz cada pull request ser testado — exatamente como times maduros fazem. Mas atenção: elas são **complementares**. O núcleo do seu portfólio são testes **determinísticos** dos seus controles (ex.: "usuário do tenant A nunca recebe chunk do tenant B"), que passam ou falham sempre do mesmo jeito.

### Como escrever o README
Quem avalia vai gastar dois minutos no seu repositório. Na primeira tela, mostre:

1. **Uma frase**: o que o projeto protege e contra o quê.
2. **Diagrama** de arquitetura com as trust boundaries.
3. **Tabela de ameaças → controles → teste que prova**.
4. **Como rodar** com um comando (Docker Compose), com dados 100% sintéticos.
5. **Limitações conhecidas** — mostrar o que o projeto *não* resolve é sinal de maturidade.

### Regra ética inegociável
Nada do seu emprego atual: nem código, nem nomes de tabelas, nem arquitetura interna identificável, nem dados reais. Use dados sintéticos e cenários genéricos.`,
    glossary: [
      ['Teste adversarial', 'Teste que executa um ataque e verifica que ele é bloqueado.'],
      ['Red teaming automatizado', 'Ferramentas que geram e disparam muitas variações de ataque.'],
      ['CI', 'Integração contínua: testes rodando automaticamente a cada mudança.'],
      ['Dados sintéticos', 'Dados inventados com formato realista, sem informação real.'],
      ['Limitações conhecidas', 'O que o sistema não cobre — documentar é sinal de senioridade.']
    ],
    steps: [
      { kind: 'do', title: 'Escolher o primeiro projeto nos blueprints', tab: 'portfolio', minutes: 30, focus: 'Leia os três blueprints, escolha um e copie o checklist dele para as anotações deste módulo.' },
      { kind: 'read', title: 'Promptfoo — Red team quickstart', url: 'https://www.promptfoo.dev/docs/red-team/quickstart/', minutes: 30, focus: 'Entenda como configurar alvos e plugins de ataque. Rode localmente contra um endpoint de teste.' },
      { kind: 'read', title: 'Promptfoo — GitHub Action', url: 'https://www.promptfoo.dev/docs/integrations/github-action/', minutes: 30, focus: 'Veja como rodar os testes a cada pull request.' },
      { kind: 'read', title: 'NVIDIA garak (README)', url: 'https://github.com/NVIDIA/garak', minutes: 20, focus: 'Entenda o conceito de probes e detectors. Compare com o Promptfoo: quando usaria cada um?' },
      { kind: 'do', title: 'Construir o projeto escolhido (primeira versão)', minutes: 360, focus: 'Ordem: threat model de 1 página → controles → testes determinísticos provando o bloqueio → docker compose → README no formato da aula → testes adversariais no CI.' },
      { kind: 'do', title: 'Revisão final do repositório', minutes: 30, focus: 'Peça para alguém (ou para uma IA) ler só o README por 2 minutos e explicar o que o projeto faz. Se não conseguir, reescreva a primeira tela.' }
    ],
    checkpoint: [
      { q: 'Qual a diferença entre um teste determinístico de controle e um teste adversarial automatizado?', a: 'O determinístico verifica uma propriedade fixa do controle (ex.: o tenant A nunca recebe dados do B) e passa ou falha sempre igual. O adversarial dispara muitas variações de ataque contra o comportamento do modelo; é útil para descobrir fraquezas, mas é probabilístico e complementar.' },
      { q: 'O que precisa aparecer na primeira tela do README?', a: 'O que o projeto protege e contra o quê, diagrama com trust boundaries, tabela ameaça → controle → teste, como rodar com um comando usando dados sintéticos e limitações conhecidas.' },
      { q: 'Por que mostrar limitações conhecidas ajuda em vez de atrapalhar?', a: 'Porque segurança é sobre trade-offs e risco residual. Documentar o que não está coberto mostra que você entende o modelo de ameaça e não vende falsa sensação de segurança — comportamento esperado de alguém sênior.' }
    ],
    concepts: [
      'Estrutura de repositório de nível sênior: diagrama de arquitetura, Threat Model STRIDE de 1 página, testes automatizados de segurança (provando o bloqueio de ataques) e métricas de latência.',
      'Execução reprodutível com Docker Compose e CI no GitHub Actions rodando testes adversariais em cada Pull Request.'
    ],
    exampleTitle: 'Estrutura Ideal de README para Portfólio de AI Security',
    exampleCode: `repo-hardened-ai-gateway/
├── docs/
│   ├── architecture.md        # Fluxo de dados + Trust Boundaries
│   └── threat-model-stride.md # 6 ameaças concretas + controles P0
├── src/                       # Middleware (PII scrubber, JWT ACL, Token Budget)
├── tests/security/            # Testes provando bloqueio de BOLA, LLM01, LLM02 e LLM10
├── .github/workflows/sec.yml  # CI rodando pytest + Promptfoo adversarial
└── docker-compose.yml         # Sobe tudo localmente com dados 100% sintéticos`,
    caveat: 'Regra de ouro ética e jurídica: NUNCA reutilize código proprietário, nomes de tabelas, schemas internos ou dados reais da empresa atual. Use exclusivamente dados sintéticos e repositórios públicos limpos.'
  },
  {
    id: 'm5_2', phase: 5, code: '5.2', hours: 6,
    title: 'Posicionamento & Simulação de System Design de Segurança',
    goal: 'Ao final você conta sua história de transição de forma convincente, responde perguntas de system design de segurança com um método claro e conversa com profissionais de segurança usando o vocabulário certo, sem decorar.',
    onTheJob: 'A entrevista é uma amostra do trabalho: o entrevistador quer ver como você pensa quando um time te mostra um design novo. Ele não espera que você saiba tudo — espera que você faça as perguntas certas, identifique as trust boundaries, priorize riscos e discuta trade-offs com calma.',
    lesson: `### Como costumam ser as etapas
Varia por empresa, mas o comum é:

1. **Conversa com recrutador**: sua história e motivação.
2. **Técnica aprofundada**: perguntas sobre OWASP LLM, AppSec, nuvem, incidentes que você viveu.
3. **System design de segurança**: "desenhe um assistente com RAG para documentos de RH — como você o protege?".
4. **Comportamental**: conflito com times, priorização, como você convence alguém.
5. Às vezes, um **exercício prático**: revisar um código, um design ou um relatório de pentest.

### Sua história de transição
Você não está começando do zero: vem de backend distribuído, GenAI, observabilidade e incidentes — exatamente as bases do cargo. Estruture em três partes:

- **De onde você vem**: o que construiu e operou (sistemas distribuídos, integrações com IA, observabilidade).
- **O ponto de virada**: um momento concreto em que você percebeu o problema de segurança (ex.: um design de RAG que vazaria dados entre clientes).
- **O que já fez a respeito**: esta trilha, a certificação, o portfólio — com evidências.

### O método STAR para perguntas comportamentais
**S**ituação (contexto em 1–2 frases) → **T**arefa (qual era sua responsabilidade) → **A**ção (o que **você** fez, com detalhes técnicos) → **R**esultado (de preferência com número: risco reduzido, tempo economizado, incidente evitado). Prepare de 4 a 6 histórias reais que você possa adaptar.

### Método de 5 passos para system design de segurança
1. **Esclarecer**: que dados (pessoais? de vários clientes?), quem usa, se há ações que alteram algo, requisitos de compliance.
2. **Desenhar** o fluxo e marcar as 3 principais trust boundaries.
3. **Listar as ameaças principais** (4 no máximo), usando a língua da área: "LLM01 indireta pelos documentos", "LLM08 vazamento entre tenants", "LLM06 agente com permissão de escrita", "LLM10 custo".
4. **Propor controles em camadas**, começando pelos determinísticos: pré-filtragem por permissão, credenciais do usuário, schema estrito, aprovação humana, limites — e só depois detecção (guardrails).
5. **Fechar com trade-offs**: latência, custo, experiência do desenvolvedor, o que fica como risco aceito, como medir (testes no CI, alertas) e o plano de resposta (kill switch).

### Falar como alguém da área
Não é decorar jargão — é usar os termos para ser **preciso**. Frases que você vai ouvir e usar:

- "Qual é o **blast radius** se o modelo for completamente enganado?"
- "Isso é um **controle** ou só **detecção**?"
- "Em nome de **qual principal** essa tool executa?"
- "Onde está a **trust boundary** aqui?"
- "Isso é **P0** para o lançamento ou vai para o backlog como **risco aceito**?"
- "Como vamos **provar** que o controle funciona — tem teste?"

E duas atitudes que contam muito:

- **Pensar em voz alta**: o entrevistador avalia o raciocínio, não só a resposta.
- **Dizer "não sei" do jeito certo**: "não trabalhei com isso diretamente; eu abordaria assim…" vale mais do que inventar.

### Como treinar
Use o simulador da aba **Entrevistas**: leia a pergunta, responda **em voz alta** (grave no celular se puder), só então revele o gabarito e compare. Marque "Revisar" ou "Dominada" com honestidade. Os podcasts dos módulos (formato debate) também ajudam a acostumar o ouvido com o vocabulário.`,
    glossary: [
      ['STAR', 'Situação, Tarefa, Ação, Resultado — estrutura para respostas comportamentais.'],
      ['System design de segurança', 'Entrevista em que você desenha e protege um sistema ao vivo.'],
      ['Trade-off', 'O que se ganha e o que se perde com uma decisão (segurança × latência × custo).'],
      ['Risco residual', 'O risco que sobra depois dos controles.'],
      ['Kill switch', 'Capacidade de desligar rapidamente uma funcionalidade em incidente.']
    ],
    steps: [
      { kind: 'do', title: 'Escrever sua história de transição (3 partes)', minutes: 45, focus: 'De onde vem, ponto de virada, o que já fez. Leia em voz alta e ajuste até caber em 2 minutos.' },
      { kind: 'do', title: 'Preparar 5 histórias no formato STAR', minutes: 60, focus: 'Ex.: um incidente que você resolveu, uma decisão de arquitetura difícil, um conflito com outro time, algo que você automatizou, um erro seu e o que aprendeu.' },
      { kind: 'do', title: 'Treinar o simulador de entrevistas em voz alta', tab: 'interviews', minutes: 120, focus: 'Uma pergunta por vez: responda em voz alta antes de revelar o gabarito. Repita as marcadas como "Revisar" em dias diferentes.' },
      { kind: 'do', title: '2 simulações de system design cronometradas', minutes: 90, focus: 'Escolha 2 cenários (ex.: assistente RAG de RH; agente que comenta no Jira). 40 minutos cada, aplicando os 5 passos, desenhando no papel e falando em voz alta.' }
    ],
    checkpoint: [
      { q: 'Quais são os 5 passos para uma resposta de system design de segurança?', a: 'Esclarecer escopo e dados; desenhar fluxo e trust boundaries; listar as principais ameaças; propor controles em camadas (determinísticos primeiro); fechar com trade-offs, medição e resposta.' },
      { q: 'Como responder quando não sabe algo numa entrevista?', a: 'Admitir com tranquilidade e mostrar raciocínio: "não trabalhei diretamente com isso; eu começaria por…", conectando com princípios que você domina.' },
      { q: 'Conte sua história de transição em até 2 minutos.', a: 'Resposta pessoal: de onde você vem (backend distribuído, GenAI, observabilidade, incidentes), o ponto de virada concreto e as evidências do que já fez (trilha, certificação, portfólio).' }
    ],
    concepts: [
      'Storytelling técnico sênior (formato STAR + Arquitetura): conectar vivência em backend distribuído, GenAI, observabilidade e incidentes diretamente à redução mensurável de risco.',
      'Equilíbrio pragmático em entrevistas: discutir trade-offs concretos entre nível de segurança, latência p95, custo de inferência e fricção para desenvolvedores.'
    ],
    exampleTitle: 'Estrutura de Resposta em System Design de AI Security (5 Passos)',
    exampleCode: `1. Clarificar escopo & criticidade dos dados (LGPD/PII? Multi-tenant? Ações mutáveis?)
2. Desenhar fluxo de dados e marcar 3 Trust Boundaries principais
3. Listar Top 4 ameaças (ex.: LLM01 indireta, LLM06 agência, LLM08 cross-tenant, LLM10 custo)
4. Propor controles determinísticos em camadas (Gateway, ACL pré-busca, IAM/MCP, HITL)
5. Fechar com trade-offs (latência p95, observabilidade sem PII, Kill-Switch e testes no CI)`,
    caveat: 'Evite listar apenas nomes de ferramentas comerciais ("colocaria um WAF e um guardrail X"). Entrevistadores sênior avaliam como você raciocina sobre trade-offs entre segurança, latência, custo e experiência do desenvolvedor.'
  }
];
