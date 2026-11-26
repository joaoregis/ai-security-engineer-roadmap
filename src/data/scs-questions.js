// Banco de questões de treino SCS-C03 — questões AUTORAIS no estilo de cenário da prova
// (não são questões reais do exame). Enunciado em inglês (idioma recomendado para a prova),
// explicação em português. Distribuição aproximada pelos pesos oficiais dos 6 domínios.
//
// Formato: { id, domain (1–6), question, options[], answer: [índices corretos], explanation }
// Mais de um índice em `answer` = questão "Choose two". Não renomeie ids: o histórico depende deles.

export const SCS_DOMAINS = {
  1: 'Detection',
  2: 'Incident Response',
  3: 'Infrastructure Security',
  4: 'Identity and Access Management',
  5: 'Data Protection',
  6: 'Security Foundations and Governance'
};

export const SCS_QUESTIONS = [
  /* ------------------------------------------------------------ Domínio 1 — Detection */
  {
    id: 'd1-01', domain: 1,
    question: "A company wants to detect cryptocurrency mining and communication with known command-and-control servers from its EC2 instances. The solution must have the LEAST operational overhead and must not require the company to enable or manage VPC Flow Logs or DNS query logging. Which solution meets these requirements?",
    options: ["Amazon Inspector with EC2 scanning enabled", "Amazon GuardDuty enabled in each Region", "AWS Config with the ec2-instance-managed-by-systems-manager rule", "Amazon Macie with automated sensitive data discovery"],
    answer: [1],
    explanation: "O GuardDuty consome CloudTrail, VPC Flow Logs e logs DNS por um fluxo próprio e independente: você não precisa habilitar esses logs. Ele detecta achados como CryptoCurrency:EC2/BitcoinTool e Backdoor:EC2/C&CActivity. Inspector procura CVEs/exposição de rede, Config avalia configuração e Macie é para dados sensíveis no S3."
  },
  {
    id: 'd1-02', domain: 1,
    question: "An auditor requires proof that CloudTrail log files delivered to Amazon S3 have not been modified or deleted after delivery. Which action should the security engineer take?",
    options: ["Enable S3 Versioning on the log bucket", "Enable SSE-KMS encryption on the trail", "Enable CloudTrail log file integrity validation and use the AWS CLI validate-logs command", "Enable S3 server access logging on the log bucket"],
    answer: [2],
    explanation: "Com log file integrity validation o CloudTrail entrega a cada hora digest files com os hashes SHA-256 dos logs, assinados digitalmente (SHA-256 com RSA). O comando aws cloudtrail validate-logs prova se algum log foi alterado, removido ou forjado. Versionamento e criptografia ajudam, mas não provam integridade."
  },
  {
    id: 'd1-03', domain: 1,
    question: "A security team must record every GetObject and PutObject call made against a bucket that stores payroll files. The existing trail logs only management events. What should the team do?",
    options: ["Enable S3 data events for that bucket in the CloudTrail trail", "Enable CloudTrail Insights on the trail", "Enable VPC Flow Logs for the VPC that accesses the bucket", "Create an AWS Config rule for the bucket"],
    answer: [0],
    explanation: "Operações em objetos (GetObject/PutObject) são data events e NÃO são registradas por padrão. Habilite data events, que podem ser filtrados por bucket/prefixo com advanced event selectors. Insights detecta volume anômalo de chamadas de management events."
  },
  {
    id: 'd1-04', domain: 1,
    question: "A company has 60 AWS accounts in AWS Organizations across three Regions. The security team wants a single place to view and prioritize findings from GuardDuty, Inspector, and Macie for all accounts and Regions. Which approach requires the LEAST effort?",
    options: ["Export findings from each service to Amazon S3 and query them with Athena", "Create EventBridge rules in each account that forward findings to an SNS topic", "Use Amazon Detective in the management account", "Designate a delegated administrator for AWS Security Hub, enable it organization-wide, and configure cross-Region aggregation"],
    answer: [3],
    explanation: "O Security Hub normaliza achados (formato ASFF), integra GuardDuty/Inspector/Macie nativamente, suporta delegated admin via Organizations (com auto-enable em contas novas) e agregação cross-Region numa Region de agregação. Detective é investigação, não painel central de achados."
  },
  {
    id: 'd1-05', domain: 1,
    question: "A company in Brazil must find S3 objects that contain CPF numbers (Brazilian individual taxpayer IDs) across hundreds of buckets and report which buckets hold them. Which solution is MOST appropriate?",
    options: ["Amazon GuardDuty S3 Protection", "Amazon Macie sensitive data discovery", "AWS Config rule s3-bucket-public-read-prohibited", "Amazon Inspector code scanning"],
    answer: [1],
    explanation: "O Macie descobre dados sensíveis no conteúdo dos objetos S3 com identificadores gerenciados (há identificadores para dados brasileiros como CPF e CNPJ) e custom data identifiers (regex + palavras-chave) para formatos próprios. GuardDuty S3 Protection detecta acesso suspeito, não conteúdo."
  },
  {
    id: 'd1-06', domain: 1,
    question: "A company requires that all EBS volumes be encrypted. Non-compliant volumes must be detected continuously and the owners notified automatically. Which solution meets these requirements with the LEAST custom code?",
    options: ["A Lambda function that runs daily and calls DescribeVolumes", "Amazon Inspector EBS scanning", "An AWS Config managed rule (encrypted-volumes) with automatic remediation that runs an SSM Automation document to publish to an SNS topic", "CloudTrail Insights on CreateVolume events"],
    answer: [2],
    explanation: "O Config avalia continuamente a configuração dos recursos (compliance/drift) e suporta remediação automática via SSM Automation (ex.: AWS-PublishSNSNotification). Para PREVENIR, combine com EBS encryption by default na conta/Region."
  },
  {
    id: 'd1-07', domain: 1,
    question: "VPC Flow Logs are delivered to Amazon S3 in Parquet format. The security team needs to run ad hoc SQL queries to find rejected traffic from a suspicious IP address without managing any infrastructure. Which service should they use?",
    options: ["Amazon Athena", "Amazon EMR", "Amazon Redshift provisioned cluster", "AWS Glue DataBrew"],
    answer: [0],
    explanation: "O Athena é serverless e consulta direto no S3 com SQL; paga por dados lidos (Parquet e partições reduzem custo). Serve para CloudTrail, Flow Logs, ALB logs. Vale conhecer também CloudWatch Logs Insights e Amazon Security Lake (formato OCSF)."
  },

  /* ------------------------------------------------------------ Domínio 2 — Incident Response */
  {
    id: 'd2-01', domain: 2,
    question: "GuardDuty reports that an EC2 instance in an Auto Scaling group is communicating with a known command-and-control server. The security team must contain the instance while preserving evidence for forensic analysis. Which TWO actions should be taken? (Choose two.)",
    options: ["Terminate the instance so it cannot spread malware", "Detach the instance from the Auto Scaling group and replace its security groups with an isolation security group that has no rules", "Stop the instance immediately to halt the malicious process", "Create snapshots of the attached EBS volumes", "Reboot the instance to clear the malware from memory"],
    answer: [1, 3],
    explanation: "Contenção sem destruir evidência: tire a instância do ASG (senão ele pode substituí-la/terminá-la) e do target group, isole com um SG sem regras (conexões já rastreadas podem persistir; uma NACL complementa), faça snapshots EBS e, se possível, capture memória ANTES de desligar. Terminar, parar ou reiniciar perde evidência volátil."
  },
  {
    id: 'd2-02', domain: 2,
    question: "An IAM user's access key was accidentally committed to a public GitHub repository. What should the security engineer do FIRST?",
    options: ["Enable MFA on the IAM user", "Rotate the user's console password", "Deactivate the exposed access key", "Open a support case with AWS"],
    answer: [2],
    explanation: "Primeiro corte o acesso: deixar a chave inativa é imediato e reversível. Depois investigue no CloudTrail o que foi feito com ela (inclusive recursos criados), emita uma nova chave se necessário e delete a exposta. MFA não bloqueia chamadas com access key, a menos que as políticas exijam aws:MultiFactorAuthPresent."
  },
  {
    id: 'd2-03', domain: 2,
    question: "Temporary credentials from an EC2 instance role were exfiltrated and are being used from an external IP address. The role is still needed by legitimate instances. How can the engineer invalidate the stolen credentials with the LEAST disruption?",
    options: ["Delete the IAM role and recreate it with the same name", "Use 'Revoke active sessions' on the role, which attaches a policy denying all actions for credentials issued before the current time", "Remove the instance profile from all instances", "Rotate the root user password"],
    answer: [1],
    explanation: "Credenciais STS não podem ser deletadas. O Revoke active sessions anexa uma política inline com Deny * quando aws:TokenIssueTime é anterior ao momento da revogação. Instâncias legítimas obtêm credenciais novas pelo IMDS e seguem funcionando. Complemente com IMDSv2 e o achado do GuardDuty de exfiltração de credenciais."
  },
  {
    id: 'd2-04', domain: 2,
    question: "A company wants high-severity GuardDuty findings for EC2 instances to automatically trigger isolation of the affected instance within seconds. Which architecture is MOST appropriate?",
    options: ["An Amazon EventBridge rule that matches GuardDuty findings and invokes a Step Functions workflow or Lambda function that isolates the instance", "A cron job that polls the GuardDuty API every hour", "An AWS Config remediation action triggered by GuardDuty", "A CloudWatch dashboard reviewed by the SOC team"],
    answer: [0],
    explanation: "O GuardDuty publica achados no EventBridge. Uma regra filtrando por severidade/tipo aciona Lambda ou Step Functions (playbook com etapas, aprovação humana opcional, snapshots, tags de quarentena). Polling é lento e o Config não é fonte de achados do GuardDuty."
  },
  {
    id: 'd2-05', domain: 2,
    question: "A forensic team in a separate AWS account needs a copy of an EBS volume from a compromised instance. The snapshot is encrypted with the AWS managed key aws/ebs. What must the engineer do?",
    options: ["Share the snapshot directly with the forensic account", "Make the snapshot public for a short time", "Copy the snapshot, re-encrypting it with a customer managed KMS key; allow the forensic account in that key's policy; and share the copy", "Disable encryption on the snapshot and share it"],
    answer: [2],
    explanation: "Snapshots criptografados com a chave gerenciada pela AWS (aws/ebs) não podem ser compartilhados, porque a key policy dela não pode ser editada. Copie re-criptografando com uma customer managed key, libere a conta forense na key policy e compartilhe. Nunca torne snapshots de incidente públicos."
  },
  {
    id: 'd2-06', domain: 2,
    question: "After a GuardDuty finding, an analyst needs to visualize the relationships between an IAM role, the IP addresses that used it, and the API calls made over the past weeks to determine the scope of the incident. Which service is designed for this?",
    options: ["AWS Trusted Advisor", "AWS Audit Manager", "Amazon Inspector", "Amazon Detective"],
    answer: [3],
    explanation: "O Detective constrói automaticamente um grafo de comportamento (CloudTrail, VPC Flow Logs, achados do GuardDuty, EKS audit logs) para investigar escopo e causa raiz, com pivô direto a partir do achado do GuardDuty."
  },

  /* ------------------------------------------------------------ Domínio 3 — Infrastructure Security */
  {
    id: 'd3-01', domain: 3,
    question: "EC2 instances in private subnets must upload data to a single S3 bucket. Traffic must not traverse the internet, and the instances must not be able to access any other bucket. Which solution meets these requirements MOST cost-effectively?",
    options: ["A NAT gateway and a bucket policy", "An S3 gateway VPC endpoint with an endpoint policy that allows only the specific bucket", "An S3 interface endpoint protected by a security group", "A Site-to-Site VPN connection to S3"],
    answer: [1],
    explanation: "O gateway endpoint para S3 é gratuito e mantém o tráfego na rede da AWS. A endpoint policy restringe quais buckets podem ser acessados por ele; no bucket, use aws:SourceVpce para aceitar só via endpoint. Interface endpoint também funciona, mas cobra por hora e por GB."
  },
  {
    id: 'd3-02', domain: 3,
    question: "A web application is receiving malicious traffic from a specific IP range. The team needs to explicitly block that range for all instances in a subnet. What should they use?",
    options: ["Add a deny rule to the instances' security group", "Remove the route to the internet gateway", "Add an inbound DENY rule to the subnet's network ACL with a rule number lower than the ALLOW rules", "Enable VPC Flow Logs"],
    answer: [2],
    explanation: "Security groups são stateful e só têm regras ALLOW. NACLs são stateless, avaliadas em ordem numérica e suportam DENY; use número menor que o da regra de allow. Lembre das portas efêmeras no outbound da NACL. Para L7 (ALB/CloudFront), AWS WAF com IP set também resolve."
  },
  {
    id: 'd3-03', domain: 3,
    question: "An Application Load Balancer exposes a public API that is targeted by SQL injection attempts and by bursts of requests from individual IP addresses. Which solution addresses BOTH issues?",
    options: ["AWS WAF web ACL associated with the ALB, using the AWS managed SQL database rule group and a rate-based rule", "AWS Shield Standard", "Network ACL deny rules", "Amazon GuardDuty"],
    answer: [0],
    explanation: "WAF (camada 7) associado ao ALB: managed rule groups (SQL database, Core rule set, Known bad inputs) + rate-based rule para limitar requisições por IP. Shield Standard cobre DDoS L3/L4 automaticamente, mas não SQL injection."
  },
  {
    id: 'd3-04', domain: 3,
    question: "Applications in a VPC with no internet access must call the AWS KMS and Amazon Bedrock APIs privately. Which solution should be used?",
    options: ["Gateway VPC endpoints for KMS and Bedrock", "A NAT gateway in a public subnet", "VPC peering with the AWS service VPC", "Interface VPC endpoints (AWS PrivateLink) for KMS and Bedrock with private DNS enabled"],
    answer: [3],
    explanation: "Gateway endpoints existem só para S3 e DynamoDB. Os demais serviços usam interface endpoints (PrivateLink, ENIs com IP privado). Com private DNS, o hostname padrão do serviço resolve para o endpoint. Restrinja com endpoint policy e security group."
  },
  {
    id: 'd3-05', domain: 3,
    question: "Administrators need shell access to EC2 instances in private subnets. Company policy forbids opening inbound port 22 and running bastion hosts, and all sessions must be logged. Which solution meets these requirements?",
    options: ["EC2 Instance Connect using public IP addresses", "A bastion host in a public subnet with MFA", "AWS Systems Manager Session Manager with session logging to Amazon S3 or CloudWatch Logs", "AWS Client VPN"],
    answer: [2],
    explanation: "O Session Manager usa o SSM Agent com conexão de saída (em VPC privada, via interface endpoints ssm, ssmmessages e ec2messages), sem portas inbound, com IAM para autorização e logging de sessão em S3/CloudWatch Logs criptografado com KMS."
  },
  {
    id: 'd3-06', domain: 3,
    question: "A company is concerned about large DDoS attacks against its CloudFront distributions and Route 53 hosted zones. It wants 24/7 access to the AWS Shield Response Team and protection against scaling charges caused by attacks. Which service meets these requirements?",
    options: ["AWS Shield Standard", "AWS Shield Advanced", "AWS WAF only", "Amazon GuardDuty"],
    answer: [1],
    explanation: "Shield Advanced adiciona acesso ao Shield Response Team (com Business ou Enterprise Support), proteção de custo (créditos por scaling causado por DDoS), detecção aprimorada e WAF incluso para os recursos protegidos. Shield Standard é gratuito e automático, sem esses extras."
  },
  {
    id: 'd3-07', domain: 3,
    question: "Malware on EC2 instances is exfiltrating data through DNS queries to attacker-controlled domains. The instances use the Amazon Route 53 Resolver for DNS. Which solution blocks queries to known malicious domains with the LEAST operational effort?",
    options: ["A security group outbound rule that blocks port 53", "A network ACL that denies UDP port 53", "Amazon Inspector network reachability findings", "Route 53 Resolver DNS Firewall with an AWS managed domain list and a BLOCK action"],
    answer: [3],
    explanation: "O DNS Firewall filtra as consultas que passam pelo Resolver da VPC usando domain lists (gerenciadas pela AWS ou próprias) com ações ALLOW/BLOCK/ALERT, e pode ser gerenciado centralmente pelo Firewall Manager. Bloquear a porta 53 quebraria toda a resolução de nomes."
  },

  /* ------------------------------------------------------------ Domínio 4 — IAM */
  {
    id: 'd4-01', domain: 4,
    question: "An IAM role has an identity-based policy that allows s3:* on all resources, and the account's SCPs allow all actions. The target bucket's policy contains an explicit Deny on s3:GetObject for that role. What happens when the role calls GetObject on the bucket?",
    options: ["Allowed, because the identity-based policy allows s3:*", "Allowed, because the SCP allows all actions", "Denied, because an explicit deny in any applicable policy overrides any allow", "Allowed, because same-account requests ignore bucket policies"],
    answer: [2],
    explanation: "Um Explicit Deny em QUALQUER política aplicável (SCP/RCP, resource policy, permissions boundary, session policy, identity policy) encerra a avaliação com negação. Allows só importam se nenhuma política negar explicitamente."
  },
  {
    id: 'd4-02', domain: 4,
    question: "A third-party monitoring vendor needs to assume a role in a company's account. The vendor uses the same AWS account to access many customers. How can the company protect itself against the confused deputy problem?",
    options: ["Require MFA in the role's trust policy", "Add a condition to the role's trust policy that requires a unique sts:ExternalId agreed with the vendor", "Create an IAM user with access keys for the vendor instead of a role", "Restrict the role with an aws:SourceIp condition"],
    answer: [1],
    explanation: "O ExternalId é um valor único por cliente que o vendor envia no AssumeRole; impede que outro cliente do vendor o induza a acessar a sua conta. Automação do vendor não consegue cumprir MFA, e access keys de longa duração são piores."
  },
  {
    id: 'd4-03', domain: 4,
    question: "A company wants to ensure that its S3 buckets and KMS keys in all accounts of its organization can never be accessed by principals outside the organization, even if a developer writes a permissive resource policy. Which solution enforces this centrally?",
    options: ["A service control policy (SCP) that denies S3 and KMS access to principals outside the organization", "IAM Access Analyzer with the organization as the zone of trust", "A resource control policy (RCP) that denies access when aws:PrincipalOrgID does not match the organization ID", "A permissions boundary on every developer role"],
    answer: [2],
    explanation: "SCPs limitam apenas principais DENTRO da organização, não afetam quem vem de fora. RCPs limitam o acesso aos RECURSOS das contas, inclusive por principais externos, e são o controle central de data perimeter (lembre de exceções como aws:PrincipalIsAWSService para serviços AWS). Access Analyzer detecta, mas não impede."
  },
  {
    id: 'd4-04', domain: 4,
    question: "Developers must be able to create IAM roles for their Lambda functions but must not be able to create roles with more permissions than an approved maximum. Which approach meets this requirement?",
    options: ["Attach the IAMFullAccess managed policy to the developers", "Create an SCP that denies iam:CreateRole", "Use IAM Access Analyzer policy generation", "Allow iam:CreateRole only when a specific permissions boundary is attached, using the iam:PermissionsBoundary condition key, and deny removing or changing the boundary"],
    answer: [3],
    explanation: "O permissions boundary define o MÁXIMO de permissões efetivas de uma role. Exigir o boundary via iam:PermissionsBoundary em CreateRole/PutRolePolicy (e negar DeleteRolePermissionsBoundary e alteração da política do boundary) delega a criação de roles sem escalonamento de privilégio."
  },
  {
    id: 'd4-05', domain: 4,
    question: "A role in Account A must read objects from a bucket in Account B. The objects are encrypted with SSE-S3. Which TWO configurations are required? (Choose two.)",
    options: ["An identity-based policy on the role in Account A that allows s3:GetObject on the bucket", "A bucket policy in Account B that allows the Account A role ARN to call s3:GetObject", "An SCP in Account B that allows Account A", "A VPC peering connection between the accounts", "S3 Block Public Access disabled on the bucket"],
    answer: [0, 1],
    explanation: "Acesso cross-account exige permissão dos DOIS lados: identity policy na origem + resource policy no destino (ou assumir uma role na conta B). Com SSE-KMS também seria preciso liberar a chave na key policy. Block Public Access não afeta acesso cross-account explícito."
  },
  {
    id: 'd4-06', domain: 4,
    question: "A company with 40 AWS accounts wants employees to sign in with their existing Microsoft Entra ID identities, receive role-based access to accounts, and be provisioned and deprovisioned automatically. Which solution is recommended?",
    options: ["IAM users in each account synchronized by a script", "Amazon Cognito user pools", "AWS IAM Identity Center with Entra ID as the external identity provider (SAML 2.0), SCIM provisioning, and permission sets", "A separate IAM SAML identity provider configured in every account"],
    answer: [2],
    explanation: "O IAM Identity Center centraliza o acesso workforce multi-conta: federação SAML com o IdP, SCIM para provisionar/desprovisionar, e permission sets que viram roles em cada conta. Cognito é para usuários de aplicações (CIAM)."
  },
  {
    id: 'd4-07', domain: 4,
    question: "Compliance requires that no resources be created outside us-east-1 and sa-east-1 in any member account, while global services such as IAM must keep working. What is the MOST effective control?",
    options: ["An SCP that denies actions when aws:RequestedRegion is not us-east-1 or sa-east-1, with exceptions for global services", "IAM policies in each account that deny other Regions", "AWS Config rules that delete resources created in other Regions", "Opting out of the other Regions in the management account only"],
    answer: [0],
    explanation: "SCP com Deny + StringNotEquals em aws:RequestedRegion e NotAction para serviços globais (IAM, Organizations, STS, Route 53, CloudFront, Support...) é preventivo e não pode ser removido por administradores das contas membro. Config é detectivo."
  },
  {
    id: 'd4-08', domain: 4,
    question: "A mobile app lets authenticated users upload photos directly to Amazon S3. Each user must be able to access only the objects under their own prefix. Which solution meets this requirement?",
    options: ["Embed an IAM user's access key in the app", "A bucket policy that allows s3:PutObject for all authenticated AWS users", "A public bucket with random object names", "An Amazon Cognito identity pool that issues temporary credentials for a role whose policy uses the ${cognito-identity.amazonaws.com:sub} variable in the resource ARN"],
    answer: [3],
    explanation: "O identity pool troca o token do usuário por credenciais STS temporárias; a policy variable com o identity ID restringe o acesso ao prefixo do próprio usuário. Nunca embuta access keys em apps; 'authenticated AWS users' significa qualquer conta AWS do mundo."
  },
  {
    id: 'd4-09', domain: 4,
    question: "The security team wants to identify S3 buckets, KMS keys, and IAM roles that are shared with principals outside the organization, and to find unused roles and permissions. Which service should they use?",
    options: ["IAM Access Analyzer with the organization as the zone of trust", "AWS Trusted Advisor", "AWS CloudTrail Lake", "Amazon Macie"],
    answer: [0],
    explanation: "O IAM Access Analyzer usa raciocínio automatizado sobre resource policies para achar acesso externo (zona de confiança = conta ou organização). Também tem o unused access analyzer e a validação/geração de políticas."
  },

  /* ------------------------------------------------------------ Domínio 5 — Data Protection */
  {
    id: 'd5-01', domain: 5,
    question: "An administrator attached an IAM policy that allows kms:Decrypt on a customer managed key to a role, but the role still receives AccessDenied. The key policy grants permissions only to the key administrator role. What is the cause?",
    options: ["AWS KMS requires MFA for Decrypt operations", "The key policy does not include the statement that lets the account (arn:aws:iam::<account-id>:root) use IAM policies to grant access to the key", "IAM policies can never grant AWS KMS permissions", "Automatic key rotation is disabled"],
    answer: [1],
    explanation: "No KMS a key policy é a fonte primária de autorização. IAM policies só têm efeito se a key policy delegar à conta (statement com o principal root da conta permitindo kms:*). Sem isso, só quem está na key policy (ou em grants) usa a chave."
  },
  {
    id: 'd5-02', domain: 5,
    question: "An application uses an Amazon RDS for PostgreSQL database. Security requires that the database password be rotated automatically every 30 days without application downtime and without writing custom rotation code. Which solution meets this requirement?",
    options: ["Store the password in AWS Secrets Manager and enable managed rotation", "Store the password in Systems Manager Parameter Store as a SecureString", "Store the password in an encrypted S3 object", "Store the password in a Lambda environment variable encrypted with KMS"],
    answer: [0],
    explanation: "O Secrets Manager tem rotação nativa para RDS/Aurora/Redshift/DocumentDB (managed rotation ou templates prontos de Lambda, incluindo a estratégia alternating users). Parameter Store SecureString não tem rotação nativa."
  },
  {
    id: 'd5-03', domain: 5,
    question: "A data lake bucket uses SSE-KMS. Millions of objects are written per day, and the company sees high AWS KMS request costs and occasional throttling. What should the engineer do with the LEAST effort?",
    options: ["Switch to client-side encryption", "Request a KMS quota increase only", "Enable S3 Bucket Keys on the bucket", "Create a separate KMS key for each prefix"],
    answer: [2],
    explanation: "S3 Bucket Keys geram uma chave de nível de bucket, de curta duração, derivada da KMS key, reduzindo as chamadas ao KMS em até 99%: menos custo e menos throttling, sem mudar a aplicação."
  },
  {
    id: 'd5-04', domain: 5,
    question: "Regulations require that financial records stored in Amazon S3 be retained for 7 years and that no user, including the root user, can delete or overwrite them during that period. Which configuration meets this requirement?",
    options: ["S3 Versioning with MFA Delete", "S3 Object Lock in governance mode", "A bucket policy that denies s3:DeleteObject", "S3 Object Lock in compliance mode with a 7-year retention period"],
    answer: [3],
    explanation: "Compliance mode: ninguém (nem o root) encurta a retenção ou apaga a versão protegida até expirar. Governance mode pode ser contornado por quem tem s3:BypassGovernanceRetention. Uma bucket policy pode ser alterada por um administrador."
  },
  {
    id: 'd5-05', domain: 5,
    question: "A legacy application performs cryptographic operations through the PKCS#11 API and requires single-tenant hardware security modules under the company's exclusive control. Which AWS service should be used?",
    options: ["AWS KMS with AWS managed keys", "AWS Secrets Manager", "AWS Certificate Manager", "AWS CloudHSM"],
    answer: [3],
    explanation: "O CloudHSM fornece HSMs dedicados (single-tenant) em cluster na sua VPC, com APIs padrão (PKCS#11, JCE, OpenSSL) e controle exclusivo das chaves. O KMS é um serviço gerenciado multi-tenant (também com HSMs validados FIPS), acessado pela API do KMS."
  },
  {
    id: 'd5-06', domain: 5,
    question: "A company must ensure that all requests to an S3 bucket use HTTPS. Which bucket policy statement achieves this?",
    options: ["Allow s3:* when aws:SecureTransport is true", "Deny s3:* for all principals when aws:SecureTransport is false", "Deny s3:* when aws:SourceIp is not in the corporate range", "Allow s3:GetObject only from CloudFront"],
    answer: [1],
    explanation: "O padrão é um Deny explícito com Condition Bool aws:SecureTransport = false. Um Allow condicionado não impede que outra política permita HTTP. Para exigir versão mínima de TLS, use a condição s3:TlsVersion."
  },
  {
    id: 'd5-07', domain: 5,
    question: "An application must encrypt 50 MB files with a KMS key. Calling kms:Encrypt directly on a file fails. Which approach should be used?",
    options: ["Split each file into 4 KB chunks and call Encrypt for every chunk", "Call GenerateDataKey, encrypt the file locally with the plaintext data key, discard the plaintext key, and store the encrypted data key with the file", "Request an increase of the KMS payload size quota", "Use an AWS managed key instead of a customer managed key"],
    answer: [1],
    explanation: "kms:Encrypt aceita no máximo 4 KB. Use envelope encryption: GenerateDataKey devolve a data key em texto claro e criptografada; criptografe localmente (ex.: AES-GCM) e guarde só a versão criptografada. Para ler, kms:Decrypt da data key. O AWS Encryption SDK automatiza isso."
  },

  /* ------------------------------------------------------------ Domínio 6 — Security Foundations and Governance */
  {
    id: 'd6-01', domain: 6,
    question: "A company is starting a multi-account environment and wants a preconfigured landing zone with a Log Archive account, an Audit account, preventive and detective controls, and an account factory. Which service provides this with the LEAST effort?",
    options: ["AWS Organizations alone", "AWS Control Tower", "AWS Service Catalog", "AWS CloudFormation StackSets"],
    answer: [1],
    explanation: "O Control Tower orquestra Organizations, IAM Identity Center, CloudTrail organizacional, Config e controles (preventivos via SCP, detectivos via Config, proativos via CloudFormation Hooks), com Account Factory. Organizations sozinho exige montar tudo manualmente."
  },
  {
    id: 'd6-02', domain: 6,
    question: "The security team must guarantee that CloudTrail logging from all member accounts is centralized and cannot be disabled by member account administrators. Which TWO actions meet this requirement? (Choose two.)",
    options: ["Create an organization trail that delivers logs to an S3 bucket in a dedicated Log Archive account", "Create individual trails in each member account managed by the account administrators", "Enable CloudTrail Insights", "Apply an SCP that denies cloudtrail:StopLogging, cloudtrail:DeleteTrail, and cloudtrail:UpdateTrail", "Give member accounts write access to the Log Archive bucket policy"],
    answer: [0, 3],
    explanation: "O organization trail é criado no management account (ou delegated admin) e as contas membro não conseguem alterá-lo nem excluí-lo. O SCP adiciona defesa em profundidade contra a desativação de trails. Proteja o bucket na conta Log Archive com política restritiva e Object Lock."
  },
  {
    id: 'd6-03', domain: 6,
    question: "An external auditor requests AWS's own SOC 2 Type II and PCI DSS attestation reports. Where can the company obtain them?",
    options: ["AWS Audit Manager", "AWS Trusted Advisor", "AWS Artifact", "AWS Security Hub"],
    answer: [2],
    explanation: "O Artifact é o portal self-service dos relatórios de compliance DA AWS (SOC, PCI, ISO) e de acordos (ex.: BAA). O Audit Manager coleta evidências do SEU ambiente para os SEUS controles."
  },
  {
    id: 'd6-04', domain: 6,
    question: "A company wants a standard set of AWS WAF rules applied to every Application Load Balancer and CloudFront distribution in all accounts of its organization, including accounts created in the future. Which service should be used?",
    options: ["AWS Config conformance packs", "AWS Shield Standard", "AWS Network Firewall", "AWS Firewall Manager"],
    answer: [3],
    explanation: "O Firewall Manager aplica e mantém políticas de WAF, Shield Advanced, security groups, Network Firewall e DNS Firewall em toda a organização, inclusive em contas e recursos novos. Pré-requisitos: Organizations, conta administradora do Firewall Manager e AWS Config habilitado."
  },
  {
    id: 'd6-05', domain: 6,
    question: "Before a PCI DSS audit, the compliance team wants to continuously and automatically collect evidence from AWS services and map it to the framework's controls. Which service should they use?",
    options: ["AWS Audit Manager", "AWS Artifact", "Amazon Inspector", "AWS Control Tower"],
    answer: [0],
    explanation: "O Audit Manager tem frameworks prontos (PCI DSS, HIPAA, SOC 2, CIS...) e coleta evidências automaticamente de Config, CloudTrail, Security Hub e chamadas de API, montando relatórios para a auditoria."
  },
  {
    id: 'd6-06', domain: 6,
    question: "The security team wants to manage GuardDuty for all accounts without using the organization's management account for day-to-day operations, and new accounts must be covered automatically. What should they do?",
    options: ["Enable GuardDuty manually in each account and send invitations", "Run GuardDuty only in the management account", "Designate the Security Tooling account as the GuardDuty delegated administrator and enable auto-enable for new member accounts", "Use a Lambda function to enable GuardDuty when an account is created"],
    answer: [2],
    explanation: "Boa prática: minimizar o uso do management account e operar os serviços de segurança a partir de uma conta Security Tooling como delegated administrator, com auto-enable para contas novas (configurado por Region)."
  },
  {
    id: 'd6-07', domain: 6,
    question: "Every EC2 instance launched in the organization must have a CostCenter tag at creation time, and untagged launches must fail. Which solution enforces this preventively?",
    options: ["The AWS Config managed rule required-tags", "Cost allocation tags in AWS Billing", "An SCP that denies ec2:RunInstances on instance resources when aws:RequestTag/CostCenter is null", "AWS Resource Groups"],
    answer: [2],
    explanation: "Um SCP com Condition Null aws:RequestTag/CostCenter = true bloqueia a criação sem a tag (preventivo). A regra required-tags do Config apenas detecta depois. Tag policies padronizam os valores/capitalização das tags."
  }
];
