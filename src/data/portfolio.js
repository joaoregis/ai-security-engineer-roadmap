// Conteúdo editável da trilha. Não renomeie ids existentes: o progresso salvo depende deles.

export const PORTFOLIO_PROJECTS = [
  {
    id: 'p1',
    title: '1. AI Gateway Resiliente & Seguro',
    stack: ['Python (FastAPI) ou Go', 'Redis', 'Microsoft Presidio', 'OpenTelemetry / JSON Logs', 'Docker'],
    overview: 'Proxy centralizado de inferência que unifica roteamento multi-modelo, fallback seguro (respeitando Zero Data Retention), redação automática de PII em trânsito e controle de orçamento de tokens por tenant.',
    controls: [
      'Redação determinística + NER de PII (CPF, e-mail, cartão) antes do envio ao LLM, no retorno e nos logs.',
      'Rate limiting por Tokens por Minuto (TPM) + budget diário financeiro em Redis contra Denial of Wallet (LLM10).',
      'Política de fallback segura que impede roteamento para modelos sem garantia de privacidade.',
      'Audit trail estruturado compatível com Datadog sem gravar payloads sensíveis em texto plano.'
    ],
    pitch: 'Conecte diretamente com sua experiência real em roteamento/fallback de LLMs e observabilidade: mostre como você evoluiu uma arquitetura de disponibilidade para uma camada corporativa de governança e compliance LGPD.',
    tasks: [
      { id: 'p1_t1', text: 'Criar proxy HTTP com roteamento multi-modelo e política de fallback condicional (flag zero_retention).' },
      { id: 'p1_t2', text: 'Integrar PII Scrubber (Microsoft Presidio + regex BR de CPF/CNPJ) cobrindo entrada, contexto e saída.' },
      { id: 'p1_t3', text: 'Implementar controle de budget de tokens por tenant em Redis retornando HTTP 429 antes da inferência.' },
      { id: 'p1_t4', text: 'Emitir logs estruturados JSON com métricas, flags de guardrail e hash do prompt (zero PII).' },
      { id: 'p1_t5', text: 'Escrever testes automatizados + README com Threat Model STRIDE e benchmark de latência do middleware.' }
    ]
  },
  {
    id: 'p2',
    title: '2. Servidor MCP Hardened com Autorização Granular',
    stack: ['Python ou TypeScript', 'MCP SDK', 'JWT / OAuth2 Scopes', 'Pydantic / Zod', 'Docker'],
    overview: 'Servidor MCP construído do zero seguindo princípio de menor privilégio, separando ferramentas Read-Only de ações de escrita protegidas por aprovação humana (HITL) e sanitizando retornos contra prompt injection indireta.',
    controls: [
      'Validação criptográfica de JWT com escopos granulares por ferramenta (ex.: mcp:logs:read).',
      'Allowlist estrita de tools e validação rígida de argumentos contra Path Traversal, SSRF e SQLi.',
      'Mecanismo de Human-in-the-Loop (HITL) exigindo token de aprovação assinado para ferramentas de escrita.',
      'Verificação de hash das descrições das tools (defesa contra Tool Poisoning / Rug Pull) e sanitização de saídas.'
    ],
    pitch: 'Destaque que você não apenas consome MCPs no dia a dia de observabilidade, mas sabe arquitetar e blindar servidores MCP corporativos mitigando Confused Deputy (MCP02) e Excessive Agency (LLM06).',
    tasks: [
      { id: 'p2_t1', text: 'Implementar servidor MCP expondo 2 tools Read-Only e 1 tool de escrita com dados sintéticos.' },
      { id: 'p2_t2', text: 'Criar middleware de autorização JWT verificando escopo específico por ferramenta (Default-Deny).' },
      { id: 'p2_t3', text: 'Adicionar fluxo HITL exigindo token assinado fora da banda para liberar a tool de escrita.' },
      { id: 'p2_t4', text: 'Implementar sanitização de output contra injeção indireta + script de pinning SHA-256 dos schemas.' },
      { id: 'p2_t5', text: 'Publicar suíte de testes demonstrando bloqueio de escalação de privilégio e argumentos maliciosos.' }
    ]
  },
  {
    id: 'p3',
    title: '3. Pipeline RAG Multi-Tenant Seguro + Suite de Testes Adversariais',
    stack: ['Python', 'OpenSearch ou pgvector', 'Promptfoo / Pytest', 'GitHub Actions', 'Docker Compose'],
    overview: 'Arquitetura RAG corporativa isolando estritamente múltiplos clientes na busca vetorial (ACL pré-busca) combinada a um pipeline de Red Teaming contínuo que bloqueia Pull Requests vulneráveis.',
    controls: [
      'Pre-filtering obrigatório por tenant_id e roles extraídos do JWT diretamente na query k-NN.',
      'Sanitização de documentos na ingestão e marcação clara de fronteira entre dados externos e instruções.',
      'Testes automatizados tentando vazamento cross-tenant (LLM08), extração de prompt (LLM07) e injeção (LLM01).',
      'Integração com GitHub Actions reprovando o PR se qualquer teste de isolamento ou guardrail falhar.'
    ],
    pitch: 'Demonstre domínio end-to-end de RAG seguro em produção e automação adversarial em CI/CD — exatamente a frente de AI Security que escala com a adoção de IA e não é comoditizada.',
    tasks: [
      { id: 'p3_t1', text: 'Subir OpenSearch ou PostgreSQL + pgvector via Docker Compose com corpus sintético de 2 tenants.' },
      { id: 'p3_t2', text: 'Implementar endpoint de busca k-NN com ACL pré-busca extraída exclusivamente de JWT validado.' },
      { id: 'p3_t3', text: 'Criar testes de regressão provando zero vazamento cross-tenant mesmo sob queries adversariais.' },
      { id: 'p3_t4', text: 'Configurar suíte adversarial automatizada (Promptfoo ou Pytest custom) para LLM01, LLM02 e LLM08.' },
      { id: 'p3_t5', text: 'Configurar workflow GitHub Actions executando a suíte de segurança e documentar relatório no README.' }
    ]
  }
];
