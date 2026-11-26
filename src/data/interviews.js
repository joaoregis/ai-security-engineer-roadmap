// Conteúdo editável da trilha. Não renomeie ids existentes: o progresso salvo depende deles.

export const INTERVIEW_QUESTIONS = [
  {
    id: 'iq1', topic: 'AI/RAG Security',
    question: 'Um produto SaaS usa RAG no OpenSearch para milhares de empresas. Como você garante arquiteturalmente que o Cliente A nunca receba trechos confidenciais do Cliente B?',
    seniorAnswer: [
      'Impor autorização determinística na camada de busca: pre-filtering obrigatório na query k-NN usando `tenant_id` e `roles` extraídos de JWT criptograficamente verificado (nunca de parâmetros sugeridos pelo LLM).',
      'Avaliar isolamento físico (índices dedicados por cliente enterprise) para dados de altíssima criticidade ou requisitos regulatórios.',
      'Sincronizar revogações de permissão do IdP com o índice vetorial para evitar Permission Drift e prefixar chaves de cache semântico com `tenant_id`.',
      'Incluir testes automatizados cross-tenant no CI/CD.'
    ],
    evaluating: 'Se você entende que segurança de RAG mora na camada determinística de dados/identidade e conhece os riscos ocultos de pós-filtragem e cache compartilhado.',
    redFlags: [
      'Confiar em instrução no System Prompt ("só responda documentos do Cliente A").',
      'Fazer pós-filtragem em memória após buscar top-k global sem enxergar vazamento em logs/cache e degradação de recall.'
    ]
  },
  {
    id: 'iq2', topic: 'AI/RAG Security',
    question: 'Como você mitiga Prompt Injection Indireta em um assistente que lê tickets externos e páginas do Confluence para resumir incidentes?',
    seniorAnswer: [
      'Assumir que injeção indireta vai acontecer na camada de texto e projetar contenção fora do modelo (Defense-in-Depth).',
      'Garantir que o agente opere estritamente Read-Only (sem tools mutáveis no mesmo contexto) e sem acesso a dados fora do escopo do usuário autenticado.',
      'Sanitizar toda saída Markdown/HTML e aplicar Content-Security-Policy (CSP) bloqueando carregamento de imagens/links externos (evita exfiltração silenciosa via URL).',
      'Aplicar PII Scrubber na saída e registrar telemetria de anomalias de comportamento.'
    ],
    evaluating: 'Maturidade para não vender "cura milagrosa contra prompt injection" e focar em reduzir o blast radius de forma determinística.',
    redFlags: [
      'Dizer que resolve 100% colocando delimitadores XML ou um segundo LLM verificador.',
      'Ignorar exfiltração via Markdown image rendering ou CSP no frontend.'
    ]
  },
  {
    id: 'iq3', topic: 'Agentes & MCP',
    question: 'Um time quer plugar servidores MCP open-source de terceiros no agente interno conectado ao Datadog e ao Confluence. Quais riscos você aponta e quais controles exige?',
    seniorAnswer: [
      'Apontar três vetores: execução de código arbitrário pelo servidor MCP, Tool Poisoning / Rug Pull (instruções ocultas nas descrições das tools manipulando o LLM) e exfiltração cross-server.',
      'Exigir auditoria do código + pinning por commit/hash das versões e definições de tools aprovadas.',
      'Executar em sandbox/container isolado com egress restrito, usar escopos OAuth granulares Read-Only e emitir logs estruturados de cada invocação.',
      'Segregar contextos: não misturar MCPs externos não confiáveis na mesma sessão que lê dados internos sensíveis.'
    ],
    evaluating: 'Domínio prático da superfície de ataque real do protocolo MCP além de vulnerabilidades genéricas de pacotes.',
    redFlags: [
      'Tratar servidores MCP externos como plugins seguros só porque rodam via JSON-RPC local.',
      'Focar apenas em CVE de dependências e esquecer que docstrings de tools são injetadas no prompt.'
    ]
  },
  {
    id: 'iq4', topic: 'Agentes & MCP',
    question: 'Explique o problema do Confused Deputy em IA Agêntica e como arquitetar autenticação correta para um agente que consulta o Data Lake em nome de analistas.',
    seniorAnswer: [
      'Confused Deputy ocorre quando o agente roda com uma conta de serviço privilegiada e executa ações a pedido de um usuário que não teria acesso direto àquele dado.',
      'Solução: usar identidade dedicada do agente combinada com delegação de identidade do usuário (OAuth On-Behalf-Of / token exchange), propagando o escopo restrito do solicitante até o Databricks/DB.',
      'Enforce Row-Level Security (RLS) / views autorizadas no Data Lake e registrar no audit log tanto `actor_user_sub` quanto `agent_id`.'
    ],
    evaluating: 'Capacidade de unir IAM corporativo moderno (OAuth/OBO) à realidade de agentes autônomos e auditoria.',
    redFlags: [
      'Usar uma Service Account global com acesso amplo e tentar validar permissão apenas no prompt.',
      'Perder a rastreabilidade de qual humano originou a ação do agente.'
    ]
  },
  {
    id: 'iq5', topic: 'AppSec/APIs',
    question: 'Um produto interno gera queries SQL automaticamente a partir de perguntas em linguagem natural (Text-to-SQL). Como blindar contra SQL Injection e vazamento de tabelas sensíveis?',
    seniorAnswer: [
      'Preferir Semantic Layer / Structured Outputs (LLM preenche JSON validado contra Pydantic e templates parametrizados) em vez de SQL livre.',
      'Se SQL livre for inevitável: parsear a AST (ex.: sqlglot) aceitando apenas SELECT em allowlist de views seguras e forçando LIMIT.',
      'Executar com credencial de banco estritamente Read-Only, com acesso apenas a views sem PII (RLS aplicado), timeout curto e teto de bytes escaneados.'
    ],
    evaluating: 'Aplicação prática de LLM05 (Improper Output Handling) com defesa em profundidade na camada de banco de dados.',
    redFlags: [
      'Usar apenas regex bloqueando palavras como "DROP" e "DELETE" (ignora UNION SELECT e leitura de tabelas restritas).',
      'Conectar o serviço de Text-to-SQL com a credencial administrativa da aplicação.'
    ]
  },
  {
    id: 'iq6', topic: 'AppSec/APIs',
    question: 'Nosso agente possui uma tool de "ler URL enviada pelo usuário" para resumir páginas web. Qual vulnerabilidade crítica de AppSec isso abre e como mitigar corretamente?',
    seniorAnswer: [
      'Abre SSRF (Server-Side Request Forgery): o atacante pode apontar para redes internas RFC1918, localhost ou o serviço de metadados da nuvem (`169.254.169.254`) para roubar credenciais da IAM Role.',
      'Mitigação: permitir apenas HTTPS, resolver DNS previamente e bloquear IPs privados/loopback/link-local/IPv6 mapeado, desabilitar redirects automáticos (ou revalidar cada hop) e mitigar DNS Rebinding.',
      'Na infra: isolar o fetcher em subnet/proxy dedicado sem acesso à VPC interna e impor IMDSv2 obrigatório nas instâncias AWS.'
    ],
    evaluating: 'Conexão direta entre OWASP API Top 10 (API7) e recursos comuns de agentes/RAG em nuvem.',
    redFlags: [
      'Bloquear apenas strings literais como "localhost" ou "169.254" (facilmente burlável por DNS ou IP hexadecimal/IPv6).',
      'Esquecer de desabilitar HTTP redirects 302 para destinos internos.'
    ]
  },
  {
    id: 'iq7', topic: 'AppSec/APIs',
    question: 'Quais são os ataques mais comuns em APIs GraphQL que expõem funcionalidades caras de IA e como blindá-las?',
    seniorAnswer: [
      'Principais riscos: BOLA/IDOR em resolvers aninhados, introspection exposta revelando schema interno, query batching / aliases multiplicando chamadas de LLM em 1 HTTP request e queries profundamente aninhadas causando DoS.',
      'Controles: validar autorização em cada resolver/camada de domínio (não só na entrada), desabilitar introspection em produção pública, impor Query Depth Limit, Query Cost/Complexity Analysis e desabilitar batching para resolvers de IA.'
    ],
    evaluating: 'Experiência real de engenharia backend em APIs modernas (GraphQL) traduzida para prevenção de abuso e custo.',
    redFlags: [
      'Confiar apenas em rate limit por requisição HTTP no API Gateway (1 POST GraphQL pode conter 50 aliases de inferência).',
      'Achar que autenticar a rota `/graphql` resolve autorização dos objetos internos.'
    ]
  },
  {
    id: 'iq8', topic: 'Cloud/AWS',
    question: 'Na AWS, uma Lambda na Conta A tem `s3:GetObject` na sua Role, mas recebe `AccessDenied` ao ler um bucket criptografado com KMS (CMK) na Conta B. Quais 4 pontos você audita?',
    seniorAnswer: [
      '1) Identity Policy da Role na Conta A: precisa de `s3:GetObject` E `kms:Decrypt` apontando para a CMK da Conta B.',
      '2) S3 Bucket Policy na Conta B: deve conceder acesso explicitamente à Role da Conta A (acesso cross-account exige Allow dos dois lados).',
      '3) KMS Key Policy na Conta B: precisa permitir `kms:Decrypt` para a Role/Conta A.',
      '4) Controles restritivos: verificar se existe Explicit Deny em Organizations SCP, Permission Boundary ou VPC Endpoint Policy.'
    ],
    evaluating: 'Domínio sólido de IAM Cross-Account e KMS Key Policies (core da AWS Security Specialty SCS-C03).',
    redFlags: [
      'Esquecer da permissão `kms:Decrypt` na KMS Key Policy do lado de destino.',
      'Sugerir liberar `Principal: "*"` no bucket para isolar o problema.'
    ]
  },
  {
    id: 'iq9', topic: 'Cloud/AWS',
    question: 'Um alerta do GuardDuty indica que as credenciais temporárias de uma IAM Role usada por um serviço de IA em EC2 foram usadas a partir de um IP externo suspeito. Qual sua resposta imediata?',
    seniorAnswer: [
      '1) Contenção de identidade: anexar política com Explicit Deny condicional em `aws:TokenIssueTime` para invalidar imediatamente todas as sessões STS emitidas antes do incidente.',
      '2) Contenção de rede sem destruir evidências: mover a EC2 para um Security Group de quarentena (sem ingress/egress), NÃO terminar a instância.',
      '3) Forense: tirar snapshot do EBS e capturar memória/logs CloudTrail e VPC Flow Logs para descobrir o vetor (ex.: SSRF + IMDSv1).',
      '4) Erradicação: forçar IMDSv2, corrigir a vulnerabilidade na aplicação e reconstruir a instância a partir de AMI limpa.'
    ],
    evaluating: 'Capacidade de conduzir Incident Response na AWS preservando evidências forenses e contendo sessões STS.',
    redFlags: [
      'Terminar a instância EC2 imediatamente (destrói evidências forenses voláteis e dificulta descobrir a causa raiz).',
      'Achar que basta apagar o usuário ou reiniciar a instância — tokens STS vazados continuam válidos até expirar se não houver Explicit Deny temporal.'
    ]
  },
  {
    id: 'iq10', topic: 'System Design',
    question: 'A diretoria reclama que seus controles de segurança no AI Gateway adicionaram 1.2s na latência p95 do chatbot. Como você reduz a latência sem abrir mão da segurança?',
    seniorAnswer: [
      'Separar controles determinísticos ultrarrápidos (<10ms: JWT/ACL, schema validation, allowlist de tools, regex de PII/segredos, budget em Redis) de classificadores semânticos pesados.',
      'Executar inspeção de entrada em paralelo (async) com a recuperação vetorial (RAG) em vez de serializar tudo.',
      'Substituir "LLM frontier como juiz" por modelos pequenos especializados (SLMs / classificadores locais) e aplicar abordagem baseada em risco: streaming com checagem leve para respostas informativas e bloqueio síncrono estrito antes de qualquer tool calling.'
    ],
    evaluating: 'Sensibilidade sênior a trade-offs de performance, custo e experiência de produto — diferença entre bloqueador e parceiro de engenharia.',
    redFlags: [
      'Postura inflexível ("segurança exige 1.2s a mais, o produto que aceite").',
      'Desligar controles síncronos em ações mutáveis e deixar só alerta assíncrono depois que o dano ocorreu.'
    ]
  },
  {
    id: 'iq11', topic: 'System Design',
    question: 'Engenheiros querem logar 100% dos prompts e respostas em produção no Datadog e no Data Lake para depurar alucinações. Como conciliar observabilidade com LGPD e segurança?',
    seniorAnswer: [
      'Proibir gravação de prompts/respostas brutos com PII em ferramentas gerais de observabilidade.',
      'Logar por padrão telemetria estruturada segura: `trace_id`, `tenant_id`, hashes de usuário/prompt, tokens, latência, modelo/fallback, tools acionadas e veredictos de guardrail.',
      'Quando amostragem de conteúdo for indispensável para qualidade, passar obrigatoriamente por redação de PII antes de gravar, isolar em storage criptografado com KMS, acesso break-glass auditado e TTL curto (ex.: 7–30 dias).'
    ],
    evaluating: 'Visão prática de observabilidade + privacidade por design em ambientes regulados (crédito/fintech/saúde).',
    redFlags: [
      'Liberar logs completos dizendo que "o Datadog é interno e só devs acessam" (ignora insider threat e princípio de minimização da LGPD).',
      'Proibir qualquer métrica de IA e deixar o time cego para detectar abusos e Denial of Wallet.'
    ]
  },
  {
    id: 'iq12', topic: 'System Design',
    question: 'Um time de ML quer baixar pesos de um modelo open-source em formato `.pt` (PyTorch) de um hub público para subir em produção nesta semana. Como você conduz a aprovação segura?',
    seniorAnswer: [
      'Bloquear o uso de `.pt`/`.bin`/`.pkl` em produção pelo risco de execução arbitrária de código na desserialização do `pickle`.',
      'Exigir formato `safetensors`, fixar versão por commit SHA específico, verificar hash SHA-256, escanear com ModelScan e proibir `trust_remote_code=True`.',
      'Espelhar o artefato aprovado em registry privado interno (S3/ECR), registrar no ML-BOM/AI-BOM (modelo, licença, origem) e rodar inferência em container non-root, read-only e sem egress externo.'
    ],
    evaluating: 'Domínio prático de AI Supply Chain (LLM03) e MLOps seguro sem travar a entrega de forma arbitrária.',
    redFlags: [
      'Aprovar porque o repositório tem milhares de estrelas/downloads.',
      'Apenas bloquear sem oferecer o caminho pavimentado seguro (`safetensors` + espelho interno).'
    ]
  }
];
