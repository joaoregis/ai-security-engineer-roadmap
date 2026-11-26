// Fase 3 — AppSec & API Security Sênior.

export const FASE3 = [
  {
    id: 'm3_1', phase: 3, code: '3.1', hours: 10,
    title: 'OWASP API Security Top 10 & AuthN/AuthZ',
    goal: 'Ao final você explica e encontra BOLA, falhas de JWT e SSRF, entende o que cada campo de um JWT significa e sabe por que agentes que buscam URLs são "máquinas de SSRF".',
    onTheJob: 'Toda funcionalidade de IA em produção é exposta por uma API — e todo agente chama APIs. Na prática, boa parte dos achados graves num app de IA não é "prompt injection": é um endpoint /conversations/{id} sem checagem de dono, ou uma ferramenta de "ler URL" que alcança a rede interna. Revisar APIs é trabalho de toda semana.',
    lesson: `### Por que API security numa trilha de IA
O modelo fica atrás de APIs: a API do chat, a API de upload de documentos, a API que o agente chama para agir. Se a API falha em autorização, não importa quão bem protegido está o prompt. Por isso o **OWASP API Security Top 10** é a segunda "bíblia" desta trilha.

### O OWASP API Security Top 10 (2023), um por um
- **API1 — Broken Object Level Authorization (BOLA)**: a API não confere se o objeto pedido pertence a quem pediu. Trocar \`/conversas/41\` por \`/conversas/42\` devolve a conversa de outra pessoa. É o problema nº 1 há anos.
- **API2 — Broken Authentication**: falhas no login ou nos tokens — tokens que não expiram, senhas fracas sem limite de tentativas, JWT mal validado.
- **API3 — Broken Object Property Level Authorization**: o objeto é seu, mas a API expõe ou aceita **campos** que não deveria. Ex.: a resposta inclui \`custo_interno\`; ou você envia \`{"plano": "enterprise"}\` e a API aceita (*mass assignment*).
- **API4 — Unrestricted Resource Consumption**: sem limites de tamanho, quantidade ou custo — primo do LLM10.
- **API5 — Broken Function Level Authorization (BFLA)**: um usuário comum consegue chamar uma **função** de administrador (ex.: \`DELETE /admin/usuarios/7\`).
- **API6 — Unrestricted Access to Sensitive Business Flows**: um fluxo legítimo usado de forma abusiva e automatizada (comprar todos os ingressos com bots, criar milhares de contas trial).
- **API7 — Server Side Request Forgery (SSRF)**: a API busca uma URL fornecida pelo usuário e o atacante a aponta para dentro da sua rede.
- **API8 — Security Misconfiguration**: CORS aberto, mensagens de erro detalhadas, cabeçalhos de segurança ausentes, debug ligado.
- **API9 — Improper Inventory Management**: APIs antigas ou esquecidas (\`/v1\`, ambientes de teste) continuam no ar sem proteção.
- **API10 — Unsafe Consumption of APIs**: confiar cegamente nos dados que vêm de APIs de terceiros — exatamente o que um agente faz ao ler resultados de ferramentas.

### BOLA na prática
~~~
# VULNERÁVEL: autentica, mas não autoriza
@app.get("/conversas/{conversa_id}")
def obter(conversa_id: int, usuario = Depends(usuario_autenticado)):
    return db.buscar_conversa(conversa_id)

# CORRETO: o filtro de dono faz parte da consulta
@app.get("/conversas/{conversa_id}")
def obter(conversa_id: int, usuario = Depends(usuario_autenticado)):
    conversa = db.buscar_conversa(conversa_id, dono_id=usuario.id, tenant_id=usuario.tenant_id)
    if conversa is None:
        raise HTTPException(404)   # 404 e não 403: não confirma que o ID existe
    return conversa
~~~
Repare que IDs aleatórios (UUID) **dificultam** adivinhar, mas **não resolvem** BOLA: IDs vazam em logs, URLs e respostas. A checagem de dono é obrigatória.

### JWT do zero
Um **JWT** (JSON Web Token) tem três partes separadas por pontos: \`cabeçalho.conteúdo.assinatura\`, cada uma codificada em *base64url*.

- **Cabeçalho**: o algoritmo de assinatura (\`alg\`, ex.: RS256) e às vezes qual chave usar (\`kid\`).
- **Conteúdo (claims)**: \`iss\` (quem emitiu), \`sub\` (sobre quem — o usuário), \`aud\` (para qual serviço o token foi emitido), \`exp\` (quando expira), \`iat\` (quando foi emitido), além de claims próprias como \`tenant_id\` e \`roles\`.
- **Assinatura**: prova que ninguém alterou o conteúdo.

> Base64 **não é criptografia**. Qualquer pessoa lê o conteúdo de um JWT. Nunca coloque segredos nele.

Validar um JWT corretamente significa: conferir a **assinatura** com um **algoritmo fixo** (não o que vier no cabeçalho), e conferir \`iss\`, \`aud\` e \`exp\`. Ataques clássicos quando isso falha:

- **alg: none** — o atacante remove a assinatura e diz que o algoritmo é "nenhum"; bibliotecas mal configuradas aceitam.
- **Confusão de algoritmo** — o servidor usa RS256 (chave pública/privada). O atacante troca para HS256 (segredo compartilhado) e assina com a **chave pública**, que é… pública. Se o servidor aceitar o \`alg\` do token, valida a assinatura falsa.
- **Injeção no kid** — o campo \`kid\` é usado para buscar a chave num arquivo ou banco sem validação, permitindo apontar para uma chave controlada pelo atacante.
- **Segredo fraco** — HS256 com segredo curto pode ser quebrado por força bruta.
- **Não validar aud** — um token emitido para o serviço A é aceito pelo serviço B.

### OAuth e OpenID Connect em um parágrafo
**OAuth 2.0** é um protocolo de **delegação de autorização**: um usuário permite que um aplicativo acesse algo em nome dele, e o aplicativo recebe um **access token**. **OpenID Connect (OIDC)** é uma camada em cima do OAuth para **autenticação**: além do access token, o app recebe um **ID token** (um JWT) dizendo quem é o usuário. Regra prática: o **ID token** é para o app saber quem logou; para chamar APIs, usa-se o **access token**.

### SSRF e por que agentes são "máquinas de SSRF"
Imagine uma ferramenta de agente \`ler_pagina(url)\`. O atacante (diretamente ou via prompt injection) pede para ler \`http://169.254.169.254/latest/meta-data/iam/security-credentials/\`. Esse é o endereço do **serviço de metadados da instância (IMDS)** na AWS — e, numa máquina EC2 configurada só com IMDSv1, ele devolve **credenciais temporárias** do papel da instância. O vazamento da Capital One em 2019 envolveu exatamente SSRF + credenciais obtidas pelo serviço de metadados.

Defesas:
1. **Allowlist** de domínios quando possível.
2. Resolver o DNS e **bloquear IPs privados**, loopback e link-local (169.254.0.0/16) — conferindo o IP **no momento da conexão**, para evitar truques de DNS.
3. **Não seguir redirecionamentos** automaticamente (ou revalidar cada um).
4. Exigir **IMDSv2** nas instâncias: ele exige um token obtido por uma requisição PUT com cabeçalho especial, o que derruba a maioria dos SSRF simples via GET.
5. Rodar o "buscador de URLs" numa rede isolada, sem acesso à rede interna.

### GraphQL: atenção especial
Uma única requisição GraphQL pode conter muitas operações (*batching*, *aliases*), o que **burla limites por requisição** e pode disparar dezenas de chamadas caras de LLM. Em produção: desligar *introspection*, limitar profundidade e custo das queries.`,
    glossary: [
      ['BOLA / IDOR', 'Acessar objeto de outro usuário trocando o ID. Falha de autorização por objeto.'],
      ['BFLA', 'Usuário comum chamando função administrativa.'],
      ['Mass assignment', 'API aceita campos que o usuário não deveria poder definir.'],
      ['JWT claims', 'iss (emissor), sub (usuário), aud (destinatário), exp (expiração), iat (emissão).'],
      ['alg confusion', 'Trocar RS256 por HS256 e assinar com a chave pública.'],
      ['OAuth × OIDC', 'Delegação de autorização (access token) × identidade (ID token).'],
      ['SSRF', 'Fazer o servidor requisitar um endereço escolhido pelo atacante.'],
      ['IMDS / IMDSv2', 'Serviço de metadados da EC2 / versão que exige token de sessão.'],
      ['Introspection', 'Recurso do GraphQL que expõe o schema inteiro.']
    ],
    steps: [
      { kind: 'read', title: 'OWASP API Security Top 10 — 2023', url: 'https://api-security.owasp.org/editions/2023/en/0x11-t10/', minutes: 45, focus: 'Abra cada item e leia "Is the API Vulnerable?" e "How To Prevent". Compare com os exemplos da aula.' },
      { kind: 'watch', title: 'APIsec University — OWASP API Security Top 10 and Beyond', url: 'https://au.apisec.ai/courses/owasp-api-security-top-10-and-beyond', minutes: 180, focus: 'Curso gratuito com certificado. Faça no ritmo de 1 a 2 itens por sessão; use as anotações do módulo para registrar um exemplo seu de cada item.' },
      { kind: 'lab', title: 'PortSwigger — Access control (labs)', url: 'https://portswigger.net/web-security/access-control', minutes: 90, focus: 'Leia o material e faça os labs de nível Apprentice sobre IDOR e controle de acesso horizontal/vertical. É BOLA e BFLA na prática.' },
      { kind: 'lab', title: 'PortSwigger — JWT attacks (labs)', url: 'https://portswigger.net/web-security/jwt', minutes: 90, focus: 'Faça os labs de assinatura não verificada, alg none e segredo fraco. Se sobrar tempo, o de confusão de algoritmo.' },
      { kind: 'lab', title: 'PortSwigger — SSRF (labs)', url: 'https://portswigger.net/web-security/ssrf', minutes: 60, focus: 'Faça os labs básicos contra servidor local e contra outro sistema do back-end. Pense: e se essa URL viesse de um agente?' },
      { kind: 'read', title: 'OWASP Cheat Sheet — Authorization', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html', minutes: 20, focus: 'Princípios: negar por padrão, checar em toda requisição, preferir controle baseado em atributos/relacionamentos.' },
      { kind: 'read', title: 'OWASP Cheat Sheet — SSRF Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html', minutes: 20, focus: 'Os dois casos (allowlist possível ou não) e a validação de IP após resolução DNS.' },
      { kind: 'read', title: 'AWS — Instance Metadata Service (IMDSv2)', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html', minutes: 15, focus: 'Entenda como o IMDSv2 funciona (token via PUT) e por que ele mitiga SSRF. Isso cai na SCS-C03.' }
    ],
    checkpoint: [
      { q: 'O que é BOLA e por que usar UUID no lugar de ID sequencial não resolve?', a: 'É a API não verificar se o objeto pertence a quem pediu. UUID só dificulta adivinhar; IDs vazam em logs, URLs e respostas. A correção é checar posse (dono/tenant) na própria consulta em todo endpoint.' },
      { q: 'Quais claims de um JWT você valida e por quê?', a: 'Assinatura com algoritmo fixo (impede alg none/confusão), iss (emissor confiável), aud (token emitido para este serviço), exp (não expirado). Depois usa sub/tenant/roles para autorização.' },
      { q: 'Por que uma ferramenta de agente que lê URLs é perigosa e como protegê-la?', a: 'Porque vira SSRF: o atacante (inclusive via prompt injection) aponta para a rede interna ou para o IMDS e obtém credenciais. Proteção: allowlist, bloqueio de IPs privados/link-local após resolver DNS, sem redirecionamentos, rede isolada e IMDSv2.' },
      { q: 'Qual a diferença entre ID token e access token?', a: 'O ID token (OIDC) diz ao app quem é o usuário autenticado. O access token (OAuth) é apresentado às APIs para autorizar o acesso. APIs não devem aceitar ID tokens como autorização.' }
    ],
    concepts: [
      'BOLA/IDOR (API1) e BFLA (API5): checar posse do recurso (ex.: histórico de chat, thread de agente, arquivo anexado) em todo endpoint.',
      'Vulnerabilidades clássicas de JWT: `alg: none`, `kid` injection, Key Confusion (RS256 vs HS256) e ausência de validação de `iss`/`aud`/`exp`.',
      'SSRF (API7): quando ferramentas de agente fazem fetch de URLs externas e atingem redes internas ou AWS IMDS (`169.254.169.254`).'
    ],
    exampleTitle: 'Checklist Prático de Revisão de API REST/GraphQL Expondo IA',
    exampleCode: `[ ] 1. BOLA: GET /v1/conversations/{id} valida owner_id == jwt.sub E tenant_id?
[ ] 2. JWT: Biblioteca valida assinatura com algoritmo fixo (allowlist RS256), iss, aud e exp?
[ ] 3. SSRF: Fetchers de URL resolvem DNS e bloqueiam IPs privados, loopback e 169.254.169.254?
[ ] 4. GraphQL: Introspection desabilitada em prod + Query Depth Limit + Cost/Complexity Limit?
[ ] 5. Rate Limit: Limite aplicado por identidade/tenant E custo de tokens (não só por IP)?
[ ] 6. IMDSv2: Instâncias AWS exigem HttpTokens=required (mitiga SSRF simples via GET)?`,
    caveat: 'APIs GraphQL mal configuradas permitem query batching, aliases repetidos e introspection, possibilitando bypass de rate limits tradicionais e disparando dezenas de chamadas caras de LLM em uma única requisição HTTP.'
  },
  {
    id: 'm3_2', phase: 3, code: '3.2', hours: 10,
    title: 'Threat Modeling (STRIDE), OWASP ASVS & Laboratórios Ofensivos',
    goal: 'Ao final você conduz uma sessão de threat modeling de 45 minutos para uma funcionalidade com IA usando STRIDE, prioriza os controles e usa o ASVS como checklist de requisitos.',
    onTheJob: 'Threat modeling é provavelmente a atividade mais "sênior" do cargo: um time abre um RFC ("vamos lançar um agente que lê tickets e consulta o data lake") e você conduz uma conversa de 45 minutos que termina com uma lista curta de controles obrigatórios antes do lançamento. É também a parte mais cobrada em entrevistas de system design de segurança.',
    lesson: `### O que é threat modeling
É pensar **de forma estruturada** em como um sistema pode ser atacado **antes** de ele ser construído (ou mudado), para decidir quais proteções incluir. O **Threat Modeling Manifesto** resume tudo em quatro perguntas:

1. **No que estamos trabalhando?** (desenhar o sistema)
2. **O que pode dar errado?** (levantar ameaças)
3. **O que vamos fazer a respeito?** (decidir controles)
4. **Fizemos um bom trabalho?** (revisar e melhorar)

Não é um documento de 50 páginas — é uma **conversa guiada** com o time que vai construir.

### Passo 1: desenhar o sistema (DFD)
Um **diagrama de fluxo de dados** simples, com cinco elementos:

- **Entidade externa** (retângulo): quem ou o que está fora do seu controle — usuário, provedor de LLM, API de terceiros.
- **Processo** (círculo): código seu que processa dados — backend, agente, gateway.
- **Armazenamento** (duas linhas paralelas): banco de dados, banco vetorial, bucket S3, logs.
- **Fluxo de dados** (seta): o que passa de um ponto a outro.
- **Trust boundary** (linha tracejada): onde o nível de confiança muda.

As ameaças se concentram nas **setas que cruzam linhas tracejadas**.

### Passo 2: STRIDE — o que pode dar errado
STRIDE é um checklist de seis categorias. Cada uma viola uma propriedade de segurança:

- **S — Spoofing (falsificação de identidade)** → viola **autenticação**. Ex.: alguém reutiliza o token de outro usuário para falar com o agente.
- **T — Tampering (adulteração)** → viola **integridade**. Ex.: um ticket externo com prompt injection indireta altera o comportamento do agente; alguém altera documentos indexados.
- **R — Repudiation (repúdio)** → viola **não repúdio**. Ex.: o agente apagou algo e não há registro de quem pediu.
- **I — Information disclosure (vazamento)** → viola **confidencialidade**. Ex.: a consulta ao data lake devolve dados pessoais que o usuário não pode ver.
- **D — Denial of service (negação de serviço)** → viola **disponibilidade**. Ex.: loop infinito do agente, query que varre a tabela inteira, Denial of Wallet.
- **E — Elevation of privilege (elevação de privilégio)** → viola **autorização**. Ex.: o agente usa uma conta de serviço de administrador e o usuário consegue ações que não teria.

Para cada fluxo que cruza uma trust boundary, pergunte: "qual letra do STRIDE se aplica aqui?".

### Passo 3: decidir e priorizar
Nem toda ameaça precisa ser resolvida antes do lançamento. Para cada uma, decida:

- **Mitigar** (implementar um controle) — com prioridade: **P0** (bloqueia o lançamento), **P1** (logo depois), **P2** (backlog).
- **Aceitar** o risco (com alguém responsável assinando).
- **Transferir** (seguro, contrato) ou **evitar** (não construir aquela funcionalidade).

Bons controles P0 são **concretos e testáveis**: "a ferramenta de consulta usa credencial somente leitura limitada às views X e Y", e não "melhorar a segurança do agente".

### Como conduzir uma sessão de 45 minutos
1. **5 min** — contexto: objetivo da funcionalidade, dados envolvidos, quem usa.
2. **10 min** — desenhar o DFD junto com o time, marcando trust boundaries.
3. **15 min** — percorrer as setas com STRIDE, anotando ameaças.
4. **10 min** — priorizar: escolher no máximo 5–6 controles P0.
5. **5 min** — combinar responsáveis e como cada controle será testado.

### OWASP ASVS: a lista de requisitos
O **ASVS (Application Security Verification Standard)** é um catálogo de **requisitos verificáveis** de segurança para aplicações (autenticação, sessão, controle de acesso, validação, criptografia, logs…), em três níveis: **nível 1** (o mínimo), **nível 2** (o recomendado para a maioria das aplicações com dados sensíveis) e **nível 3** (aplicações críticas). Use-o de dois jeitos: como **checklist de design review** ("o requisito de controle de acesso X está atendido?") e como **critério de aceite** em histórias de usuário. A versão atual é a **5.0**, lançada em 2025.

### Por que treinar ataque se o trabalho é defender
Você só defende bem o que já viu ser atacado. Laboratórios como o **OWASP Juice Shop** (uma loja propositalmente vulnerável) mostram como pequenas falhas se combinam em ataques reais. Essa experiência dá credibilidade quando você conversa com pentesters e quando explica um risco para um time de desenvolvimento.

### LLM05 na prática: Text-to-SQL
Um recurso "pergunte aos dados" transforma a pergunta do usuário em SQL com um LLM e executa. Se o SQL gerado for executado com um usuário de banco com permissão ampla, o modelo (enganado ou só errando) pode ler tabelas proibidas ou até apagar dados. Controles: usuário de banco **somente leitura**, acesso apenas a **views** sanitizadas, **allowlist** de tabelas, limite de linhas e tempo, e **Row Level Security**.`,
    glossary: [
      ['Threat modeling', 'Análise estruturada de como um sistema pode ser atacado, antes de construí-lo.'],
      ['DFD', 'Diagrama de fluxo de dados: entidades, processos, armazenamentos, fluxos e trust boundaries.'],
      ['STRIDE', 'Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.'],
      ['Não repúdio', 'Poder provar quem fez o quê (logs de auditoria confiáveis).'],
      ['P0 / P1 / P2', 'Prioridade do controle: bloqueia lançamento / logo depois / backlog.'],
      ['Risco aceito', 'Risco conhecido que alguém responsável decidiu não mitigar agora.'],
      ['ASVS', 'Catálogo de requisitos verificáveis de segurança de aplicações, em 3 níveis.'],
      ['Text-to-SQL', 'LLM que gera SQL a partir de linguagem natural — exige credenciais mínimas.']
    ],
    steps: [
      { kind: 'read', title: 'Threat Modeling Manifesto', url: 'https://www.threatmodelingmanifesto.org/', minutes: 15, focus: 'Leia os valores e princípios. Guarde as 4 perguntas — você vai citá-las em entrevistas.' },
      { kind: 'read', title: 'OWASP Cheat Sheet — Threat Modeling', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html', minutes: 35, focus: 'Siga o passo a passo (modelar o sistema, identificar ameaças com STRIDE, responder, revisar). Compare com o roteiro de 45 minutos da aula.' },
      { kind: 'read', title: 'OWASP Top 10 LLM (pt-BR) — Apêndice 1: arquitetura e threat model', book: 'LLMAll_pt-BR.pdf', page: 48, minutes: 20, focus: 'Estude o diagrama de arquitetura de aplicação LLM com as trust boundaries marcadas. Tente aplicar STRIDE em 3 setas dele.' },
      { kind: 'read', title: 'OWASP ASVS (página do projeto)', url: 'https://asvs.owasp.org/', minutes: 40, focus: 'Entenda os níveis 1, 2 e 3 e baixe a versão mais recente. Leia só os capítulos de autorização/controle de acesso e de tokens; o resto é consulta.' },
      { kind: 'read', title: 'Pwning OWASP Juice Shop — como rodar', url: 'https://pwning.owasp-juice.shop/companion-guide/latest/part1/running.html', minutes: 20, focus: 'Use a opção com Docker/Podman. Rode só localmente.' },
      { kind: 'lab', title: 'OWASP Juice Shop — desafios de 1 e 2 estrelas', url: 'https://owasp.org/projects/juice-shop', minutes: 180, focus: 'Ache o Score Board e resolva desafios de 1 e 2 estrelas, priorizando categorias de controle de acesso, autenticação e injeção. Para cada um, anote a letra do STRIDE e o controle que preveniria.' },
      { kind: 'lab', title: 'Opcional — TryHackMe / Hack The Box (salas de IA e web)', url: 'https://tryhackme.com/', minutes: 120, optional: true, cost: 'Baixo custo', focus: 'Procure salas sobre segurança de IA/LLM e web. Opcional: use se gostar de formato guiado estilo CTF.' },
      { kind: 'do', title: 'Exercício: threat model de 1 página de um agente', minutes: 60, focus: 'Agente que lê tickets do Jira e consulta um data lake. Faça o DFD, aplique STRIDE, escolha 5 controles P0 testáveis. Use a tabela do exemplo deste módulo como modelo. Esse documento vai para o portfólio.' }
    ],
    checkpoint: [
      { q: 'Quais são as quatro perguntas do threat modeling?', a: 'No que estamos trabalhando? O que pode dar errado? O que vamos fazer a respeito? Fizemos um bom trabalho?' },
      { q: 'Dê um exemplo de cada letra do STRIDE num agente que consulta dados.', a: 'S: token reutilizado; T: ticket com injeção indireta; R: ação sem log de quem pediu; I: consulta devolve PII restrita; D: loop/consulta sem limite; E: agente com conta de serviço administradora.' },
      { q: 'O que torna um controle "bom" para P0?', a: 'Ser concreto, ter responsável e ser testável — ex.: "credencial somente leitura limitada às views X e Y, com teste automatizado provando que a tabela Z é negada".' },
      { q: 'Para que serve o ASVS e qual nível usar na maioria das aplicações?', a: 'É um catálogo de requisitos verificáveis usado como checklist de design review e critério de aceite. O nível 2 é o recomendado para a maioria das aplicações que lidam com dados sensíveis.' }
    ],
    concepts: [
      'STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege) aplicado a fluxos distribuídos + IA.',
      'Improper Output Handling (LLM05): como texto gerado por modelo vira SQL Injection em Text-to-SQL, Stored XSS em UIs ou RCE em sandboxes mal isolados.',
      'Uso pragmático do OWASP ASVS em design reviews com squads antes da escrita do código.'
    ],
    exampleTitle: 'Tabela STRIDE Enxuta — Agente que Lê Tickets Jira e Consulta Data Lake',
    exampleCode: `| STRIDE | Cenário Concreto no Agente | Mitigação Obrigatória (P0) |
|--------|----------------------------|----------------------------|
| S (Spoofing) | Token de usuário forjado/reutilizado | JWT RS256 curto + OAuth On-Behalf-Of |
| T (Tampering) | Ticket externo com Indirect Injection | Separar dados/controle + validação de schema |
| R (Repudiation) | Ação sem rastreio de quem solicitou | Audit log imutável (user_sub + tool + hash) |
| I (Info Disc.) | Query no Lake retorna PII restrita | View sanitizada + RLS + PII scrubber na saída |
| D (DoS) | Query full-scan ou loop de agente | Query timeout + max_steps + token budget |
| E (Elev. Priv) | Agente usa Service Account Admin | Credencial Read-Only + Allowlist de views |`,
    caveat: 'Threat Modeling burocrático de 50 páginas feito após o deploy ninguém lê. Conduza sessões enxutas de 45 minutos no momento do RFC/Design Doc focadas em Trust Boundaries, fluxos de dados e controles P0 codificáveis.'
  }
];
