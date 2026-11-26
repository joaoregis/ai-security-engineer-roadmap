// Conteúdo editável da trilha. Não renomeie ids existentes: o progresso salvo depende deles.

export const AWS_DOMAINS = [
  {
    id: 'd1', code: 'Domínio 1', name: 'Detection (Detecção & Monitoramento)', weight: '16%',
    services: ['CloudTrail', 'GuardDuty', 'Security Hub', 'AWS Config', 'VPC Flow Logs', 'Amazon Macie', 'Inspector'],
    tasks: [
      { id: 'd1_t1', text: 'Dominar CloudTrail (Multi-Region, Log File Validation, Management vs. Data Events).' },
      { id: 'd1_t2', text: 'Diferenciar GuardDuty (ameaças), Config (drift/compliance), Macie (PII no S3) e Inspector (CVEs).' },
      { id: 'd1_t3', text: 'Configurar agregação multi-conta no Security Hub (padrão ASFF) e análise com Athena.' }
    ]
  },
  {
    id: 'd2', code: 'Domínio 2', name: 'Incident Response (Resposta a Incidentes)', weight: '14%',
    services: ['EventBridge', 'Lambda', 'Step Functions', 'SSM', 'Amazon Detective', 'EBS Snapshots'],
    tasks: [
      { id: 'd2_t1', text: 'Aplicar playbook forense de EC2 comprometida (isolar SG + snapshot EBS sem terminar instância).' },
      { id: 'd2_t2', text: 'Automatizar contenção (SOAR leve): GuardDuty → EventBridge → Lambda/Step Functions.' },
      { id: 'd2_t3', text: 'Revogar sessões STS ativas com Explicit Deny baseado em aws:TokenIssueTime.' }
    ]
  },
  {
    id: 'd3', code: 'Domínio 3', name: 'Infrastructure Security (Redes & Computação)', weight: '18%',
    services: ['VPC Endpoints (PrivateLink)', 'Security Groups', 'NACLs', 'AWS WAF', 'Shield Advanced', 'Network Firewall'],
    tasks: [
      { id: 'd3_t1', text: 'Dominar Gateway Endpoints (S3/DynamoDB) vs. Interface Endpoints / PrivateLink (Bedrock/KMS).' },
      { id: 'd3_t2', text: 'Diferenciar Security Groups (stateful, só ALLOW) vs. NACLs (stateless, permite DENY de IP).' },
      { id: 'd3_t3', text: 'Arquitetar proteção de borda com AWS WAF (L7), Shield Advanced (DDoS L3/L4) e DNS Firewall.' }
    ]
  },
  {
    id: 'd4', code: 'Domínio 4', name: 'Identity and Access Management (IAM)', weight: '20%',
    services: ['IAM Policies', 'Permission Boundaries', 'Organizations SCP/RCP', 'IAM Identity Center', 'STS', 'Access Analyzer'],
    tasks: [
      { id: 'd4_t1', text: 'Memorizar a ordem exata de avaliação IAM (Explicit Deny, SCP, Resource, Boundary, Session, Identity).' },
      { id: 'd4_t2', text: 'Resolver cenários Cross-Account (permissão nos dois lados) e ExternalId contra Confused Deputy.' },
      { id: 'd4_t3', text: 'Usar Condition Keys de Data Perimeter (aws:PrincipalOrgID, aws:SourceVpce, aws:RequestedRegion).' }
    ]
  },
  {
    id: 'd5', code: 'Domínio 5', name: 'Data Protection (Criptografia & Segredos)', weight: '18%',
    services: ['AWS KMS', 'CloudHSM', 'Secrets Manager', 'SSM Parameter Store', 'ACM', 'S3 Object Lock'],
    tasks: [
      { id: 'd5_t1', text: 'Entender KMS Key Policy vs. IAM Policy, Grants, Envelope Encryption e rotação automática vs. BYOK.' },
      { id: 'd5_t2', text: 'Escolher corretamente entre Secrets Manager (rotação nativa), Parameter Store e CloudHSM (FIPS L3).' },
      { id: 'd5_t3', text: 'Aplicar criptografia em trânsito (TLS/ACM) e repouso (SSE-KMS, S3 Bucket Keys, Object Lock WORM).' }
    ]
  },
  {
    id: 'd6', code: 'Domínio 6', name: 'Security Foundations & Governance', weight: '14%',
    services: ['AWS Organizations', 'Control Tower', 'Firewall Manager', 'AWS Artifact', 'Audit Manager', 'RAM'],
    tasks: [
      { id: 'd6_t1', text: 'Estruturar contas segregadas (Management, Log Archive, Security Tooling / Delegated Admin).' },
      { id: 'd6_t2', text: 'Usar AWS Firewall Manager para governança central de WAF/SGs/Network Firewall na organização.' },
      { id: 'd6_t3', text: 'Diferenciar AWS Artifact (relatórios de compliance AWS) vs. Audit Manager e Trusted Advisor.' }
    ]
  }
];

export const IAM_EVAL_STEPS = [
  { num: '1', label: 'Explicit Deny (em qualquer política)', result: 'DENY IMEDIATO', tone: 'red', note: 'Vence qualquer Allow em qualquer nível.' },
  { num: '2', label: 'Organizations SCP / RCP', result: 'Deve permitir (teto da conta)', tone: 'amber', note: 'Nunca concede permissão sozinha; não afeta Management Account.' },
  { num: '3', label: 'Resource-Based Policy (S3, KMS, SQS)', result: 'Same-Account pode liberar; Cross-Account obrigatório', tone: 'sky', note: 'KMS exige delegação na Key Policy para aceitar IAM Policies.' },
  { num: '4', label: 'IAM Permission Boundary', result: 'Interseção obrigatória (se anexada)', tone: 'amber', note: 'Define o máximo permitido para aquela role/usuário.' },
  { num: '5', label: 'Session Policy (STS AssumeRole)', result: 'Interseção obrigatória (se passada)', tone: 'sky', note: 'Restringe temporariamente o escopo de uma sessão STS.' },
  { num: '6', label: 'Identity-Based Policy (User/Role)', result: 'ALLOW se não barrado acima', tone: 'emerald', note: 'Permissões anexadas diretamente à identidade ou grupo.' },
  { num: '7', label: 'Fallback Padrão', result: 'IMPLICIT DENY', tone: 'red', note: 'Sem Allow explícito válido em todas as camadas exigidas, acesso negado.' }
];
