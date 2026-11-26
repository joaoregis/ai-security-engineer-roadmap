# AI Security Engineer — Roadmap de Estudos

Webapp **local** para conduzir uma transição de carreira de engenharia de software para **AI Security Engineer**. Reúne, num só lugar e com progresso salvo:

- uma **trilha de 13 módulos em 5 fases (126 h)**, cada módulo com aula escrita do zero, vocabulário, roteiro guiado de estudo e checkpoint no estilo entrevista;
- a matriz **OWASP Top 10 for LLM Applications 2025**, cenários agênticos e o **OWASP MCP Top 10**;
- preparação para a certificação **AWS Certified Security – Specialty (SCS-C03)**, com **simulado de 43 questões**;
- integração com o **Gemini Notebook** (antigo NotebookLM) para gerar podcasts, vídeos, mapas mentais, cartões e questionários de cada módulo;
- uma **biblioteca** de PDFs com links que abrem direto no capítulo certo;
- blueprints de **portfólio** e um **simulador de entrevistas**.

Sem banco de dados, sem framework, sem dependências externas: **Node.js + npm** e o navegador.

---

## Sumário

1. [Começando](#1-começando)
2. [Como estudar com o app](#2-como-estudar-com-o-app)
3. [As abas do app](#3-as-abas-do-app)
4. [A trilha: fases e módulos](#4-a-trilha-fases-e-módulos)
5. [Gemini Notebook: podcasts, vídeos e outros materiais](#5-gemini-notebook-podcasts-vídeos-e-outros-materiais)
6. [Biblioteca (pasta `books/`)](#6-biblioteca-pasta-books)
7. [Progresso, backup e migração](#7-progresso-backup-e-migração)
8. [Estrutura do projeto](#8-estrutura-do-projeto)
9. [Editando o conteúdo](#9-editando-o-conteúdo)
10. [Arquitetura técnica](#10-arquitetura-técnica)
11. [Segurança do servidor](#11-segurança-do-servidor)
12. [Testes](#12-testes)
13. [Git: o que entra e o que fica de fora](#13-git-o-que-entra-e-o-que-fica-de-fora)
14. [Solução de problemas](#14-solução-de-problemas)
15. [Fontes, créditos e avisos](#15-fontes-créditos-e-avisos)

---

## 1. Começando

### Requisitos

| Requisito | Versão | Observação |
|---|---|---|
| Node.js | 18 ou superior | Testado com Node 22. Inclui o `npm`. |
| Navegador | Qualquer moderno | Firefox, Chrome ou Edge. |

Não há `npm install` para rodar hoje: o projeto não tem dependências. O `package.json` existe para padronizar os comandos e para receber bibliotecas no futuro, se precisar.

### Rodar

```powershell
npm start
```

Sobe o servidor em **http://localhost:5173** e abre o navegador. Para parar: `Ctrl+C` no terminal.

| Comando | O que faz |
|---|---|
| `npm start` | Sobe o servidor e abre o navegador. |
| `npm run serve` | Sobe o servidor sem abrir o navegador. |
| `npm test` | Roda os testes (servidor + formato das aulas). |
| `iniciar.cmd` | Atalho Windows (duplo clique): roda `npm start`. |

Outra porta: `$env:PORT=8080; npm start` (PowerShell).

> **Importante:** o app **não** funciona abrindo `src/index.html` direto pelo navegador (`file://`). Ele usa ES modules e uma API local; se abrir assim, aparece um aviso explicando. Sempre use `npm start`.

> **Depois de atualizar o código do servidor** (`server.js`), pare (`Ctrl+C`) e rode `npm start` de novo. Mudanças em `src/` (telas e conteúdo) só precisam de um recarregar da página (`Ctrl+F5`).

---

## 2. Como estudar com o app

O app foi desenhado para que você sempre saiba **qual é o próximo passo** e **o que fazer nele**.

1. **Dashboard → "Próximo passo"** mostra exatamente o passo atual do roteiro (ex.: "OWASP LLM01:2025 Injeção de Prompt, ~35 min"), com o foco e um botão para abrir o material.
2. **Cada módulo segue a mesma ordem:**
   1. **Objetivo** e **"Como isso aparece no trabalho"** — por que o tema importa no dia a dia do cargo.
   2. **Aula** — explicação do zero, com analogias e exemplos concretos. É o ponto de partida; não pule.
   3. **Vocabulário** — termos para usar com naturalidade em reuniões e entrevistas.
   4. **Exemplo de código/arquitetura** e **Armadilhas de sênior**.
   5. **Roteiro de estudo** — passos em ordem, cada um com tempo estimado e um **Foco** que diz exatamente o que ler/fazer naquela fonte. Os dois primeiros passos são sempre: ler a aula e estudar com o Gemini Notebook.
   6. **Checkpoint** — perguntas no estilo entrevista. Responda **em voz alta** antes de abrir a resposta.
   7. **Anotações** — salvas automaticamente.
3. **Marque cada passo** ao concluir. Quando o roteiro inteiro estiver marcado e você responder o checkpoint com segurança, **marque o módulo como concluído** (caixa à esquerda do título).
4. **Em paralelo:** use a aba **OWASP** no modo revisão, o **Simulado** por domínio e o **Simulador de Entrevistas** para fixar.

### Ritmo e cronograma

No Dashboard você define **horas por semana** e **data de início**. O app calcula a data-alvo de cada fase e a previsão de término no seu ritmo atual.

---

## 3. As abas do app

| Aba | Para que serve |
|---|---|
| **Dashboard** | Próximo passo, KPIs de progresso, linha do tempo das 5 fases, calculadora de ritmo e backup (exportar/importar/resetar). |
| **Trilha de Estudos** | "O trabalho de um AI Security Engineer" (responsabilidades, semana típica, frases da área) + as 5 fases e 13 módulos. Busca por texto, filtro por fase e status. |
| **OWASP LLM & MCP** | 14 ameaças (LLM01–LLM10 + 4 cenários agênticos/MCP) com cenário, impacto e defesa; **modo revisão** esconde as respostas para testar a memória. Inclui o OWASP MCP Top 10 oficial (beta). |
| **AWS SCS-C03** | Logística da prova (65 questões, 170 min, nota mínima 750), os 6 domínios com pesos oficiais e 18 tarefas de estudo, diagrama de avaliação de políticas IAM e rastreador de simulados (meta ≥ 80%). |
| **Simulado SCS-C03** | 43 questões originais no estilo da prova, distribuídas pelos 6 domínios. Modo **Estudo** (corrige na hora, com explicação) e modo **Prova** (cronômetro no ritmo real, marcar para revisar, correção no final). Filtros por domínio, quantidade e origem (todas / nunca respondidas / erradas). |
| **Portfólio** | 3 blueprints de projetos defensivos para o GitHub (AI Gateway, servidor MCP endurecido, RAG multi-tenant), com checklist. |
| **Entrevistas** | 12 perguntas sênior com gabarito, o que o entrevistador avalia e red flags; marque "Revisar" ou "Dominada". |
| **Biblioteca** | PDFs da pasta `books/`, com capítulos que abrem na página exata e os módulos que usam cada livro. |

Tema claro/escuro no rodapé da barra lateral. Layout responsivo (funciona no celular).

---

## 4. A trilha: fases e módulos

| Fase | Módulo | Horas | Tema |
|---|---|---|---|
| **1 — Fundamentos de AI Security & OWASP LLM Top 10** (22 h) | 1.0 | 6 h | Fundamentos do zero: vocabulário de segurança e como uma aplicação com LLM funciona |
| | 1.1 | 8 h | Mentalidade defensiva: sistemas probabilísticos vs. controles determinísticos |
| | 1.2 | 8 h | OWASP Top 10 for LLM Applications na prática |
| **2 — IA Agêntica, MCP & RAG** (24 h) | 2.1 | 8 h | Blindagem de RAG e bancos vetoriais |
| | 2.2 | 8 h | Segurança de agentes e Model Context Protocol (MCP) |
| | 2.3 | 8 h | AI Gateways, observabilidade e resiliência |
| **3 — AppSec & API Security** (20 h) | 3.1 | 10 h | OWASP API Security Top 10 e AuthN/AuthZ |
| | 3.2 | 10 h | Threat modeling (STRIDE), OWASP ASVS e laboratórios ofensivos |
| **4 — Cloud Security & AWS SCS-C03** (44 h) | 4.1 | 14 h | IAM avançado, Organizations e lógica de avaliação |
| | 4.2 | 14 h | Proteção de dados, KMS e segurança de rede |
| | 4.3 | 16 h | Detecção, resposta a incidentes e governança |
| **5 — Portfólio & Entrevistas** (16 h) | 5.1 | 10 h | Construção de 3 projetos defensivos no GitHub |
| | 5.2 | 6 h | Posicionamento e simulação de system design de segurança |

Os **ids** dos módulos (`m1_0`, `m1_1`, …, `m5_2`) aparecem nos nomes dos materiais e no progresso salvo. Regra: módulo `X.Y` → id `mX_Y`.

### Tipos de passo do roteiro

| Selo | Significa |
|---|---|
| **Aula** | Ler a aula do próprio módulo. |
| **Notebook** | Gerar/usar os materiais do Gemini Notebook (seção 5). |
| **Ler** | Documento, página oficial ou capítulo de livro. Passos com 📖 abrem o PDF da biblioteca na página certa; "Versão online (EN)" abre o original. |
| **Assistir** | Vídeo ou curso. |
| **Lab** | Laboratório prático (PortSwigger, Lakera Agent Breaker, Juice Shop, flaws.cloud…). |
| **Praticar** | Exercício seu (escrever um threat model, um teste, uma política) ou uma aba do app. |

Passos com contorno tracejado são **opcionais**; selos âmbar indicam **custo**.

---

## 5. Gemini Notebook: podcasts, vídeos e outros materiais

O **Gemini Notebook** (notebook.google.com, antigo NotebookLM) gera materiais de estudo a partir das fontes que você envia. Ele não tem API pública, então **a geração é feita por você no site** — o app prepara tudo para levar poucos minutos por módulo.

### Passo a passo (passo 2 de cada módulo, "Kit do Gemini Notebook")

1. Crie um notebook chamado **Trilha X.Y**.
2. **Adicione as fontes** com os botões do kit:
   - **Copiar aula** → cole como texto (é a aula, o vocabulário e o checkpoint do módulo);
   - **Copiar links** → cole como sites (as fontes oficiais do roteiro);
   - envie o PDF da pasta `books/`, quando o módulo usar.
   - Se algum link for recusado ("tipo de URL não é suportado"), abra a página, copie o texto (`Ctrl+A`, `Ctrl+C`) e adicione como texto colado.
3. No painel **Studio**, gere os materiais. Cada um vem com **quando usar** e, quando aceita personalização, um **prompt pronto** (botão "Copiar prompt"):

| Material | Quando usar no estudo | Vai para o app? |
|---|---|---|
| Resumo de vídeo | Logo após a aula: ver fluxos e defesas desenhados | Sim (arquivo) |
| Resumo de áudio | Fixar no trajeto; gere em **Deep Dive** (aprender) e **Debate** (argumentar) | Sim (arquivo) |
| Mapa mental | Depois da aula: ver a estrutura e achar lacunas | Sim (imagem) |
| Cartões de estudo | Vocabulário com repetição espaçada (1, 3 e 7 dias depois) | Fica no notebook |
| Questionário | Antes de concluir o módulo, sem consultar | Fica no notebook |
| Apresentação de slides | Revisão antes de entrevistas; treinar explicar em voz alta | Sim (PDF/PPTX) |
| Infografia | Página-resumo (revisão ou LinkedIn — confira os fatos) | Sim (imagem) |
| Relatórios | Guia de estudo para reler ou imprimir | Sim (PDF/MD) |

4. **Traga os arquivos para o app:** no módulo, use **"Adicionar arquivos do Notebook"** (clique ou arraste da pasta Downloads). **Não precisa renomear**: o servidor salva em `src/materiais/` como `<id-do-módulo>-<nome-original>.<ext>` (ex.: `m1_0-seguranca-de-ia-para-desenvolvedores-backend.m4a`) e **nunca sobrescreve** (acrescenta `-2`, `-3`…).
5. Guarde o **link do notebook** no campo do kit: vira o botão "Abrir meu notebook" (para cartões e questionário).

### Players

- Áudio e vídeo ganham player próprio, com botões de velocidade **1x · 1.25x · 1.5x · 1.75x · 2x**. A velocidade escolhida fica salva e vale para todos.
- Vários arquivos do mesmo tipo convivem (ex.: Deep Dive e Debate lado a lado).
- Marcar um passo enquanto um áudio toca **não interrompe** a reprodução.
- Imagens aparecem em miniatura (clique para abrir); PDF/PPTX/MD aparecem como link.

Formatos aceitos: `mp3 m4a wav ogg webm mp4 pdf pptx png jpg jpeg md txt`, até 1 GB por arquivo. Também dá para copiar arquivos direto em `src/materiais/`, desde que o nome comece com o id do módulo (`m1_0-...`, `m1_0.m4a`).

Para remover um material, apague o arquivo da pasta `src/materiais/`.

---

## 6. Biblioteca (pasta `books/`)

Coloque livros e PDFs úteis em `books/`. A aba **Biblioteca** mostra:

- os livros **catalogados** em `src/data/books.js`, com capítulos que abrem na página exata (`/books/arquivo.pdf#page=N`) e os módulos que os usam;
- um aviso com os arquivos da pasta **ainda não catalogados**.

Livro catalogado hoje: **OWASP Top 10 para Aplicações LLM 2025 (tradução oficial pt-BR)** — `LLMAll_pt-BR.pdf`, usado nos módulos 1.0, 1.1, 1.2, 2.1, 2.3 e 3.2.

| Capítulo | Página |
|---|---|
| Carta dos líderes & novidades de 2025 | 5 |
| LLM01 — Injeção de Prompt | 8 |
| LLM02 — Divulgação de Informações Sensíveis | 13 |
| LLM03 — Cadeia de Suprimentos | 17 |
| LLM04 — Envenenamento de Dados e Modelos | 22 |
| LLM05 — Manipulação Imprópria de Saída | 26 |
| LLM06 — Autonomia Excessiva | 29 |
| LLM07 — Vazamento de Prompt do Sistema | 33 |
| LLM08 — Fraquezas em Vetores e Embeddings | 36 |
| LLM09 — Desinformação | 39 |
| LLM10 — Consumo Irrestrito | 43 |
| Apêndice 1 — Arquitetura e threat model | 48 |

Para catalogar um livro novo, veja a seção 9.

---

## 7. Progresso, backup e migração

- O progresso fica em **`progress.json`**, na raiz do projeto, gravado pelo servidor. Ele **não vai para o Git** (seção 13).
- O navegador guarda um **espelho** no `localStorage` para o primeiro carregamento ser instantâneo e para migrar automaticamente quando o `progress.json` ainda não existe.
- As gravações são agrupadas (300 ms) e há um envio final ao fechar/recarregar a aba, para não perder a última alteração.
- **Backup manual:** Dashboard → **Exportar JSON** / **Importar JSON**. Use para levar o progresso para outra máquina ou guardar uma cópia.
- **Resetar:** Dashboard → Resetar (pede confirmação).

O que é salvo: tema, aba ativa, ritmo e data de início, módulos concluídos e abertos, passos do roteiro, anotações, links dos notebooks, velocidade dos players, ameaças OWASP estudadas, tarefas AWS e simulados registrados, sessão/estatísticas/histórico do Simulado, tarefas do portfólio e status das entrevistas.

> Não renomeie os `id`s de módulos, passos, questões e ameaças: o progresso salvo depende deles.

---

## 8. Estrutura do projeto

```
ai-security-engineer-roadmap/
├── package.json             scripts npm (start, serve, test); "type": "module"
├── server.js                servidor local (Node puro): serve o app, books/ e materiais; API
├── iniciar.cmd              atalho Windows → npm start
├── progress.json            SEU progresso (gerado em runtime; fora do Git)
├── books/                   livros e PDFs (servidos em /books/)
│   └── LLMAll_pt-BR.pdf
├── backup/                  versão original do projeto (arquivo HTML único)
├── tests/
│   ├── server.test.js       segurança e persistência do servidor
│   └── md.test.mjs          mini-markdown das aulas
├── .claude/launch.json      configuração de preview (Claude Code)
└── src/                     o app (única pasta servida como estático)
    ├── index.html           casca da página com todas as abas
    ├── css/styles.css       visual (tokens claro/escuro, componentes, responsivo)
    ├── materiais/           materiais do Gemini Notebook por módulo (m1_0-*.m4a, *.mp4…)
    ├── data/                CONTEÚDO — é aqui que se edita
    │   ├── roadmap.js         fases, "o trabalho de um AI Security Engineer", junção dos módulos
    │   ├── modules/
    │   │   ├── fase1.js       módulos 1.0, 1.1, 1.2
    │   │   ├── fase2.js       módulos 2.1, 2.2, 2.3
    │   │   ├── fase3.js       módulos 3.1, 3.2
    │   │   ├── fase4.js       módulos 4.1, 4.2, 4.3
    │   │   └── fase5.js       módulos 5.1, 5.2
    │   ├── owasp.js           ameaças LLM/agênticas e OWASP MCP Top 10
    │   ├── aws.js             domínios SCS-C03 e fluxo de avaliação IAM
    │   ├── scs-questions.js   banco de questões do Simulado
    │   ├── portfolio.js       blueprints de projetos
    │   ├── interviews.js      perguntas de entrevista
    │   ├── books.js           catálogo da pasta books/
    │   └── studio.js          kit do Gemini Notebook (8 materiais, quando usar, prompts)
    └── js/
        ├── main.js            boot, navegação, tema, re-render
        ├── state.js           estado + persistência (servidor e espelho local)
        ├── metrics.js         progresso e cronograma
        ├── utils.js           helpers, ícones e o renderizador de mini-markdown
        └── views/             uma view por aba: render() + bind(ctx)
            ├── dashboard.js   roadmap.js   owasp.js   aws.js
            └── quiz.js        portfolio.js interviews.js library.js
```

---

## 9. Editando o conteúdo

Todo o conteúdo fica em `src/data/`. Depois de editar, recarregue a página (`Ctrl+F5`). Rode `npm test` se mexer no servidor ou no formato das aulas.

### Módulo (`src/data/modules/faseN.js`)

```js
{
  id: 'm1_1', phase: 1, code: '1.1', hours: 8,        // id nunca muda
  title: '…',
  goal: 'Ao final você…',                              // objetivo
  onTheJob: 'Como isso aparece no trabalho…',
  lesson: `### Título de seção
Parágrafo com **negrito**, *itálico* e \`código\`.

- item de lista
1. lista numerada
> destaque
~~~
bloco de código / diagrama
~~~`,
  glossary: [['Termo', 'Explicação curta']],
  steps: [ /* passos do roteiro, ver abaixo */ ],
  checkpoint: [{ q: 'Pergunta de entrevista', a: 'Resposta esperada' }],
  concepts: ['Resumo em 1 minuto…'],
  exampleTitle: '…', exampleCode: `…`, caveat: 'Armadilha de sênior…'
}
```

- A **aula** usa um mini-markdown próprio: `### título`, `- lista`, `1. lista`, `> destaque`, `**negrito**`, `*itálico*`, código entre crases e blocos entre `~~~`. Tudo é escapado (não aceita HTML).
- Dentro de template literals, escreva crases como `` \` `` e evite `${`.
- **As horas de cada fase (em `roadmap.js`) devem somar as horas dos seus módulos.**

### Passo do roteiro

```js
{
  kind: 'read',            // 'read' | 'watch' | 'lab' | 'do'
  title: 'OWASP LLM01:2025 Injeção de Prompt',
  minutes: 35,
  focus: 'O que exatamente ler/fazer nesta fonte…',
  url: 'https://…',        // opcional: link externo (use o endereço FINAL, sem redirecionamento)
  book: 'LLMAll_pt-BR.pdf', page: 8,   // opcional: abre o livro da biblioteca na página
  tab: 'quiz',             // opcional: abre uma aba do app
  optional: true,          // opcional: passo opcional (contorno tracejado)
  cost: 'Baixo custo'      // opcional: selo de custo
}
```

A aula e o kit do Gemini Notebook entram **automaticamente** como passos 1 e 2. Os links `read`/`watch` não opcionais viram as fontes do botão "Copiar links" — por isso prefira URLs que respondam sem redirecionar (o Notebook recusa redirecionamentos).

### Livro (`src/data/books.js`)

1. Copie o arquivo para `books/` (formatos: PDF, EPUB, MD, TXT, PNG, JPG).
2. Adicione uma entrada:

```js
{
  file: 'arquivo.pdf', title: '…', short: 'Rótulo curto', author: '…', year: 2025,
  kind: 'Referência oficial', why: 'Por que ler…',
  modules: ['m1_2'],
  chapters: [['Capítulo', 12]]   // página do leitor de PDF (física), não a do rodapé
}
```

3. Nos passos, aponte com `book: 'arquivo.pdf', page: N`.

### Questão do Simulado (`src/data/scs-questions.js`)

```js
{ id: 'd4-10', domain: 4, question: '… (em inglês, como na prova)',
  options: ['A', 'B', 'C', 'D'], answer: [1], explanation: '… (em português)' }
```

Dois índices em `answer` = questão "Choose two". Domínios: 1 Detecção · 2 Resposta a Incidentes · 3 Infraestrutura · 4 IAM · 5 Proteção de Dados · 6 Governança.

### Kit do Notebook (`src/data/studio.js`)

Cada material: `{ id, label, file, when, prompt }`. `file: true` indica que gera um arquivo para trazer ao app; `prompt` é uma função `mod => string` (ou `null` quando a opção não aceita personalização).

---

## 10. Arquitetura técnica

### Visão geral

```
Navegador ── ES modules (src/js) ──> render() de cada aba (HTML gerado a partir do estado)
    │                                         ▲
    │ fetch                                   │ store.state
    ▼                                         │
server.js (127.0.0.1:5173) ── progress.json ──┘
    ├─ /                → src/ (estático)
    ├─ /books/*         → books/ (estático, formatos restritos)
    └─ /api/*           → estado, listagens e upload
```

- **Front-end sem framework:** cada view exporta `render()` (estado → DOM) e `bind(ctx)` (eventos da própria aba). `ctx = { commit(focusSelector), setTab, renderAll }`; `commit` salva, re-renderiza tudo e devolve o foco ao controle.
- **Estado:** `store.state` (persistido) e `store.filters` (filtros de UI, não persistidos). `sanitize()` aceita só chaves conhecidas com o tipo esperado — protege contra JSON importado ou corrompido.
- **`<details>` nativo** para acordeões; o estado aberto/fechado é salvo pelo evento `toggle` (fase de captura).
- **Re-render preserva mídia:** antes de redesenhar a trilha, a posição e o estado dos players são guardados e restaurados.

### API

| Método e rota | Função | Respostas |
|---|---|---|
| `GET /api/state` | Lê o progresso | `200` JSON (`{}` se não existe) |
| `PUT /api/state` | Grava o progresso (objeto JSON, até 1 MB, escrita atômica) | `204`, `400`, `413`, `415` |
| `GET /api/books` | Lista arquivos de `books/` nos formatos permitidos | `200` JSON |
| `GET /api/materials` | Lista materiais de `src/materiais/` (`m<fase>_<n>[-sufixo].<ext>`) | `200` JSON |
| `POST /api/materials?module=m1_0&name=<original>` | Envia um material (corpo binário, `application/octet-stream`, até 1 GB) | `201 {"name": …}`, `400`, `413`, `415` |
| `GET /books/<arquivo>` | Serve um livro (com suporte a `Range`) | `200`, `206`, `404`, `416` |
| `GET /<caminho>` | Serve arquivos de `src/` (com suporte a `Range`) | `200`, `206`, `404` |

---

## 11. Segurança do servidor

O servidor é pequeno, mas foi escrito como se fosse exposto — é um projeto de segurança, afinal.

- **Só localhost:** escuta em `127.0.0.1`.
- **Anti DNS rebinding:** recusa requisições cujo `Host` não seja `localhost:<porta>` ou `127.0.0.1:<porta>` (`403`).
- **Origem:** recusa `Origin` que não seja o próprio app (`403`) — bloqueia outros sites tentando escrever no seu progresso ou enviar arquivos.
- **Superfície mínima:** serve só `src/` e `books/`. Nunca expõe `progress.json`, `server.js`, `backup/` ou qualquer coisa fora dessas pastas; path traversal (inclusive codificado, `%2e%2e`, `..%2f`) resulta em `404`.
- **`books/` restrita a formatos inertes:** PDF, EPUB, MD, TXT e imagens — nunca HTML/JS.
- **Gravação de estado:** só objeto JSON, máximo 1 MB, `Content-Type` JSON obrigatório, escrita atômica (arquivo temporário + rename).
- **Upload de materiais:** módulo validado (`m\d+_\d+`), formato por allowlist, nome gerado pelo servidor (sem acentos, só `[a-z0-9-]`, sem caminho), nunca sobrescreve, grava em `.part` e renomeia ao final, limite de 1 GB. Exige `application/octet-stream`, que um formulário de outro site não consegue enviar sem preflight CORS (nunca aprovado).
- **Cabeçalhos:** `Content-Security-Policy` com `script-src 'self'`, `frame-ancestors 'none'`, `form-action 'none'`; `X-Content-Type-Options: nosniff`; `X-Frame-Options: DENY`; `Referrer-Policy: no-referrer`.
- **Front-end:** todo texto dinâmico passa por `esc()`; o mini-markdown escapa antes de formatar; links de notebook só são aceitos se forem `https://notebook.google.com/…` (ou `notebooklm.google.com`).

---

## 12. Testes

```powershell
npm test
```

- **`tests/server.test.js`** sobe o servidor numa porta livre com pastas temporárias e verifica: páginas e módulos servidos; path traversal (vários formatos) bloqueado; `progress.json`, `backup/` e HTML em `books/` não servidos; `Host` e `Origin` estranhos bloqueados; validação de JSON e de tipo; `Range` (parcial, sufixo e fora do limite); listagens filtradas; upload com nome seguro, sem sobrescrever, sem traversal, com formato/módulo/tipo/origem validados e sem arquivos temporários sobrando; ida e volta do progresso.
- **`tests/md.test.mjs`** verifica o mini-markdown das aulas: títulos, parágrafos, listas, destaque, blocos de código e escape de HTML.

---

## 13. Git: o que entra e o que fica de fora

**Entra:** código, conteúdo, `books/`, `backup/` e os materiais de `src/materiais/` (áudios, vídeos, imagens dos módulos).

**Fica de fora** (`.gitignore`):

| Caminho | Motivo |
|---|---|
| `progress.json`, `progress.json.tmp` | progresso pessoal |
| `src/materiais/*.part` | uploads incompletos |
| `graphify-out/` | grafo de conhecimento gerado pelo graphify (regenerável; contém caminhos locais) |
| `.repowise/` | índice local de ferramenta |
| `node_modules/` | dependências (se um dia houver) |
| `.claude/settings.local.json` | configurações locais |

> **Arquivos grandes:** o GitHub recusa arquivos acima de 100 MB e avisa acima de 50 MB. Resumos em vídeo costumam ficar abaixo disso; se algum passar, use **Git LFS** (`git lfs track "src/materiais/*.mp4"`) ou deixe esse arquivo fora do repositório.

---

## 14. Solução de problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| Aviso "rode pelo servidor local" | Página aberta via `file://` | Use `npm start` e abra http://localhost:5173. |
| Biblioteca diz "servidor desatualizado" ou livro "não encontrado" | Servidor iniciado antes de uma atualização do `server.js` | `Ctrl+C` e `npm start` de novo. |
| "Não enviei … (servidor desatualizado)" ao adicionar material | Mesmo caso acima | Reinicie o servidor. |
| `EADDRINUSE` ao iniciar | Já existe um servidor na porta 5173 | Feche o outro terminal ou use outra porta (`$env:PORT=8080; npm start`). |
| Material não aparece no módulo | Nome não começa com o id do módulo, ou página não recarregada | Use "Adicionar arquivos do Notebook" ou renomeie para `mX_Y-…`; `Ctrl+F5`. |
| Gemini Notebook recusa um link | Página com redirecionamento ou bloqueio a robôs | Copie o texto da página e adicione como texto colado. |
| Badge vermelho "Falha ao salvar" | Servidor parado | Inicie o servidor; exporte um backup por segurança. |
| Progresso sumiu ao trocar de máquina | `progress.json` não vai para o Git | Exporte/importe o JSON pelo Dashboard. |

---

## 15. Fontes, créditos e avisos

- **Conteúdo das aulas, roteiros, checkpoints e questões do Simulado:** escritos para este projeto. As questões são **originais e não oficiais**, no estilo da prova — não são questões reais do exame.
- **Dados da SCS-C03** (domínios, pesos, formato da prova) conferidos no [exam guide oficial](https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03.html) e na [página da certificação](https://aws.amazon.com/certification/certified-security-specialty/).
- **OWASP:** [Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/), [OWASP MCP Top 10](https://owasp.org/projects/mcp-top-10) (beta), [API Security Top 10](https://api-security.owasp.org/editions/2023/en/0x11-t10/), [ASVS](https://asvs.owasp.org/) e [Cheat Sheet Series](https://cheatsheetseries.owasp.org/). O PDF em `books/` é a tradução oficial pt-BR do OWASP Top 10 for LLM Applications 2025, publicada pelo OWASP sob licença Creative Commons (CC BY-SA 4.0).
- **Materiais em `src/materiais/`:** gerados no Gemini Notebook a partir das fontes acima.
- Os links externos foram verificados na data de criação; sites mudam. Se um link quebrar, atualize o `url` do passo em `src/data/modules/`.
