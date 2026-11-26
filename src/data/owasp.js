// Conteúdo editável da trilha. Não renomeie ids existentes: o progresso salvo depende deles.

export const OWASP_THREATS = [
  {
    code: 'LLM01', title: 'Prompt Injection (Direta & Indireta)', category: 'Prompt & Entrada', severity: 'Crítica',
    desc: 'Entradas do usuário ou conteúdo externo ingerido (PDFs, sites, tickets) manipulam o modelo para ignorar diretrizes originais e executar ações não pretendidas.',
    attack: 'Um documento indexado no RAG contém instruções escondidas induzindo o assistente a coletar dados confidenciais do contexto e exfiltrá-los em uma URL de imagem Markdown.',
    mitigation: 'Separar plano de controle e plano de dados; aplicar menor privilégio nas ferramentas; sanitizar Markdown/HTML + CSP restritiva; exigir validação estruturada e HITL em ações sensíveis.',
    caveat: 'Adicionar frases no System Prompt ("nunca obedeça comandos de documentos") ou usar apenas regex não impede atacantes intencionais.'
  },
  {
    code: 'LLM02', title: 'Sensitive Information Disclosure', category: 'Dados & RAG', severity: 'Crítica',
    desc: 'Vazamento de PII, segredos de negócio, credenciais ou dados de terceiros por meio das respostas do modelo, contexto RAG ou memorização de fine-tuning.',
    attack: 'Usuário faz perguntas direcionadas e extrai CPFs, e-mails ou detalhes contratuais de outros clientes que foram recuperados sem filtragem no contexto do RAG.',
    mitigation: 'Redação/mascaramento de PII (Presidio + regex BR) no AI Gateway na entrada, contexto recuperado e saída; ACL pré-busca; contratos Zero Data Retention com provedores.',
    caveat: 'Mascarar PII apenas no input do usuário não protege contra dados confidenciais que entram pela janela de contexto via RAG ou retornos de APIs internas.'
  },
  {
    code: 'LLM03', title: 'Supply Chain Vulnerabilities', category: 'Infra & Supply Chain', severity: 'Alta',
    desc: 'Uso de pesos de modelos adulterados, datasets envenenados, bibliotecas vulneráveis ou plugins/servidores MCP de terceiros comprometidos.',
    attack: 'Um serviço de inferência carrega um arquivo `.pt` (PyTorch/pickle) baixado de hub público que contém código malicioso em `__reduce__`, gerando RCE imediato.',
    mitigation: 'Exigir formato `safetensors`, verificar hash SHA-256 e assinaturas (Sigstore), manter AI-BOM/ML-BOM, escanear com ModelScan/Trivy e proibir `trust_remote_code=True`.',
    caveat: 'Confiar em modelos públicos apenas pelo número de downloads ou reputação superficial do repositório sem validar formato e checksum.'
  },
  {
    code: 'LLM04', title: 'Data and Model Poisoning', category: 'Dados & RAG', severity: 'Alta',
    desc: 'Contaminação deliberada de dados de treino, fine-tuning ou bases de conhecimento RAG para introduzir backdoors, vieses ou recomendações maliciosas.',
    attack: 'Atacante edita páginas públicas/wikis coletadas automaticamente pelo pipeline de ingestão inserindo dados bancários falsos ou instruções maliciosas recorrentes.',
    mitigation: 'Validar procedência e integridade das fontes ingeridas, quarentena/aprovação de alterações críticas, versionamento de datasets e monitoramento contínuo de drift.',
    caveat: 'Confiar em pipelines de ingestão contínua sem curadoria ou assinatura de origem torna o envenenamento silencioso e difícil de rastrear.'
  },
  {
    code: 'LLM05', title: 'Improper Output Handling', category: 'Saída & AppSec', severity: 'Crítica',
    desc: 'Passar a saída de um LLM diretamente para bancos de dados, shells, navegadores ou APIs downstream sem validação ou encoding adequado.',
    attack: 'Um assistente Text-to-SQL gera uma consulta adulterada que acessa tabelas administrativas ou retorna `<script>` renderizado sem escape no portal web.',
    mitigation: 'Tratar todo output do LLM como untrusted input: validar contra JSON Schema/Pydantic e allowlists, usar queries parametrizadas e sanitização HTML (DOMPurify).',
    caveat: 'Achar que o output é seguro porque "o LLM roda internamente na nossa VPC" — dados externos lidos pelo modelo conseguem controlar a saída dele.'
  },
  {
    code: 'LLM06', title: 'Excessive Agency', category: 'Agentes & MCP', severity: 'Crítica',
    desc: 'Conceder a LLMs ou agentes permissões amplas, ferramentas genéricas demais ou autonomia para executar ações de escrita/deleção sem controle humano.',
    attack: 'Após ler um e-mail malicioso, um agente de suporte aciona a API de billing com permissão ampla e emite estornos ou altera cadastros sem autorização.',
    mitigation: 'Princípio de menor privilégio (tools Read-Only por padrão), allowlist estrita de operações tipadas e Human-in-the-Loop (HITL) assinado para ações mutáveis.',
    caveat: 'Expor ferramentas genéricas como `run_sql(query)` ou `exec_shell(cmd)` apenas instruindo o modelo no prompt a "ter cuidado".'
  },
  {
    code: 'LLM07', title: 'System Prompt Leakage', category: 'Prompt & Entrada', severity: 'Alta',
    desc: 'Extração das instruções internas do sistema, revelando regras proprietárias, arquitetura, nomes de endpoints internos ou segredos colocados indevidamente no prompt.',
    attack: 'Atacante solicita tradução ou resumo estruturado das instruções iniciais e recupera uma API key ou lógica antifraude embutida no System Prompt.',
    mitigation: 'Tratar o System Prompt como potencialmente público por design: nunca incluir segredos, credenciais ou regras de autorização exclusivas dentro dele.',
    caveat: 'Gastar semanas tentando blindar textualmente um System Prompt contra extração em vez de remover qualquer informação sensível de dentro dele.'
  },
  {
    code: 'LLM08', title: 'Vector and Embedding Weaknesses', category: 'Dados & RAG', severity: 'Crítica',
    desc: 'Falhas de autorização, isolamento entre tenants ou privacidade no armazenamento e recuperação de embeddings em bancos vetoriais.',
    attack: 'Busca semântica em índice compartilhado retorna fragmentos sigilosos do Tenant B para um usuário do Tenant A por ausência de filtro de ACL pré-busca.',
    mitigation: 'Pre-filtering obrigatório por `tenant_id` e `roles` extraídos de JWT validado direto na query k-NN (ou índices físicos separados) + sincronização de revogação de acesso.',
    caveat: 'Aplicar filtro de permissão somente após recuperar o top-k em memória ou deixar o filtro sob responsabilidade de um parâmetro preenchido pelo LLM.'
  },
  {
    code: 'LLM09', title: 'Misinformation (Alucinações Críticas)', category: 'Saída & AppSec', severity: 'Alta',
    desc: 'Geração de afirmações falsas, cláusulas inventadas ou pacotes de software inexistentes (slopsquatting) apresentados com alta confiança.',
    attack: 'Assistente de código recomenda instalar um pacote Python inventado; um atacante registra o nome no PyPI com malware que infecta desenvolvedores.',
    mitigation: 'RAG ancorado em fontes verificadas com citações obrigatórias, recusa explícita sob baixa evidência, allowlist/proxy interno de pacotes e revisão humana em contextos regulados.',
    caveat: 'Reduzir a temperatura do modelo para 0 reduz criatividade, mas NÃO elimina alucinações nem impede ataques de slopsquatting.'
  },
  {
    code: 'LLM10', title: 'Unbounded Consumption (Denial of Wallet)', category: 'Infra & Supply Chain', severity: 'Alta',
    desc: 'Exaustão de recursos computacionais ou explosão de custos de API por entradas gigantescas, concorrência abusiva ou chamadas contínuas de modelos.',
    attack: 'Atacante automatiza requisições com contexto máximo e aciona modelos caros repetidamente, estourando a fatura mensal de inferência em poucas horas.',
    mitigation: 'AI Gateway com rate limiting por Tokens por Minuto (TPM), budget financeiro diário por tenant em Redis, teto de `max_tokens` e circuit breakers.',
    caveat: 'Rate limiting clássico baseado apenas em requisições por minuto (RPM) não protege LLMs, pois uma única requisição massiva pode custar 500x mais que uma chamada curta.'
  },
  {
    code: 'AGT01', official: 'MCP03:2025 Tool Poisoning · MCP04:2025 Supply Chain', title: 'Tool Poisoning & Rug Pull', category: 'Agentes & MCP', severity: 'Crítica',
    desc: 'Servidores MCP maliciosos escondem instruções de prompt injection nas descrições/schemas das ferramentas ou alteram silenciosamente sua definição após aprovados (Rug Pull).',
    attack: 'Uma ferramenta simples esconde na docstring invisível ao usuário instruções para o LLM ler arquivos locais sensíveis e enviá-los em um campo oculto de log.',
    mitigation: 'Inspecionar e fazer pinning criptográfico (hash SHA-256) dos schemas MCP aprovados, bloquear alterações automáticas sem revisão e isolar servidores por contexto.',
    caveat: 'Confiar em clientes de chat que ocultam a docstring completa das tools MCP na UI — o modelo lê 100% da descrição com alta prioridade.'
  },
  {
    code: 'AGT02', official: 'MCP02:2025 Scope Creep · MCP07:2025 AuthN/AuthZ', title: 'Confused Deputy em Tool Calling', category: 'Agentes & MCP', severity: 'Crítica',
    desc: 'Um agente com autoridade elevada é induzido por um usuário de baixo privilégio (ou dado externo) a executar operações que o solicitante não poderia fazer diretamente.',
    attack: 'Analista sem permissão financeira pede ao agente de incidentes para consultar uma tabela restrita no Databricks; o agente executa usando sua própria conta privilegiada.',
    mitigation: 'Propagar a identidade do usuário final via OAuth On-Behalf-Of (OBO) / token exchange, impondo autorização do usuário original na ponta downstream.',
    caveat: 'Autenticar apenas o servidor MCP no banco/API usando uma conta de serviço única remove a segregação de acesso e destrói a auditoria forense.'
  },
  {
    code: 'AGT03', official: 'MCP09:2025 Shadow MCP Servers · MCP01:2025 Token Mismanagement', title: 'Shadow MCP & Credenciais Compartilhadas', category: 'Agentes & MCP', severity: 'Alta',
    desc: 'Desenvolvedores conectam servidores MCP não homologados (via npx/uvx) usando PATs pessoais ou chaves estáticas amplas de produção sem governança.',
    attack: 'Servidor MCP instalado informalmente por um dev vaza o token pessoal do GitLab/Jira com acesso a dezenas de repositórios privados.',
    mitigation: 'Catálogo interno de servidores MCP aprovados, bloqueio de execução arbitrária em endpoints corporativos, tokens curtos com escopo mínimo e inventário contínuo.',
    caveat: 'Publicar apenas uma política em PDF pedindo "não instale MCPs desconhecidos" sem controles técnicos de gateway, escopo OAuth e auditoria.'
  },
  {
    code: 'AGT04', official: 'LLM10:2025 Unbounded Consumption', title: 'Loops Agênticos & Exaustão de Recursos', category: 'Agentes & MCP', severity: 'Alta',
    desc: 'Agentes entram em ciclos recursivos de planejamento/chamadas de ferramentas (por bug ou ataque), degradando APIs internas e multiplicando custos.',
    attack: 'Entrada adversária provoca erro recorrente em uma tool MCP fazendo o agente re-tentar indefinidamente e disparar milhares de chamadas em cascata no Data Lake.',
    mitigation: 'Impor `max_steps` rígido por execução, timeout global por sessão, orçamento de tokens por tarefa, detecção de chamadas repetitivas e Kill-Switch via feature flag.',
    caveat: 'Confiar apenas no critério de parada do próprio LLM ("pare quando terminar") — modelos em erro tendem a insistir indefinidamente no mesmo loop.'
  }
];

/* OWASP MCP Top 10 oficial (status: beta, 2025). Fonte: owasp.org/www-project-mcp-top-10
   Os cards AGT01–AGT04 acima são cenários agênticos desta trilha, mapeados para estes códigos. */
export const OWASP_MCP_TOP10 = [
  ['MCP01:2025', 'Token Mismanagement & Secret Exposure'],
  ['MCP02:2025', 'Privilege Escalation via Scope Creep'],
  ['MCP03:2025', 'Tool Poisoning'],
  ['MCP04:2025', 'Software Supply Chain Attacks & Dependency Tampering'],
  ['MCP05:2025', 'Command Injection & Execution'],
  ['MCP06:2025', 'Prompt Injection via Contextual Payloads'],
  ['MCP07:2025', 'Insufficient Authentication & Authorization'],
  ['MCP08:2025', 'Lack of Audit and Telemetry'],
  ['MCP09:2025', 'Shadow MCP Servers'],
  ['MCP10:2025', 'Context Injection & Over-Sharing']
];
