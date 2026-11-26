// Fase 4 — Cloud Security & AWS Certified Security – Specialty (SCS-C03).

export const FASE4 = [
  {
    id: 'm4_1', phase: 4, code: '4.1', hours: 14,
    title: 'IAM Avançado, Organizations & Lógica de Avaliação (SCS-C03)',
    goal: 'Ao final você lê qualquer política IAM e diz se uma chamada é permitida ou negada — inclusive entre contas, com SCP, RCP e permission boundary — e desenha um data perimeter.',
    onTheJob: 'IAM é o controle de acesso da nuvem inteira — e de toda plataforma de IA na AWS (Bedrock, SageMaker, S3 com o corpus do RAG). Tarefas reais: revisar uma role que um time pediu com "s3:*", investigar por que um acesso foi negado, escrever uma SCP que impede desligar o CloudTrail e garantir que o bucket de treinamento só seja acessível de dentro da organização. É também o maior domínio da prova (20%).',
    lesson: `### A prova em uma frase
A **SCS-C03** cobra seis domínios: Detecção (16%), Resposta a Incidentes (14%), Segurança de Infraestrutura (18%), **Identity and Access Management (20%)**, Proteção de Dados (18%) e Governança (14%). IAM aparece em quase todas as questões dos outros domínios também — por isso começamos por ele.

### IAM do zero: quem, o quê, onde, quando
Toda requisição à AWS é avaliada assim: um **principal** (quem) quer fazer uma **action** (o quê) num **resource** (onde), sob certas **conditions** (quando/como).

- **Principal**: usuário IAM, **role** (papel assumido temporariamente), usuário federado (que veio de um provedor de identidade) ou um serviço AWS.
- **Action**: ex.: \`s3:GetObject\`, \`kms:Decrypt\`, \`bedrock:InvokeModel\`.
- **Resource**: identificado por um **ARN**, ex.: \`arn:aws:s3:::meu-bucket/*\`.
- **Condition**: regras extras, ex.: só se vier de um VPC endpoint, só com MFA, só da minha organização.

Uma política é um JSON com uma lista de **statements**, cada um com \`Effect\` (Allow ou Deny), \`Action\`, \`Resource\` e opcionalmente \`Condition\` (e \`Principal\`, nas políticas anexadas a recursos).

### Os tipos de política (e quem cada um afeta)
- **Identity-based**: anexada a um usuário, grupo ou role. "O que **esta identidade** pode fazer."
- **Resource-based**: anexada ao recurso (bucket policy, key policy do KMS, trust policy de uma role). "Quem pode acessar **este recurso**." É a única que tem \`Principal\`.
- **Permissions boundary**: um **teto** para uma identidade. Não concede nada — só limita o máximo.
- **SCP (Service Control Policy)**: teto para **todas as identidades** de uma conta ou unidade organizacional, definido no AWS Organizations.
- **RCP (Resource Control Policy)**: teto para os **recursos** das contas da organização (para um conjunto de serviços, como S3, KMS, STS e Secrets Manager), também no Organizations.
- **Session policy**: teto passado no momento de assumir uma role.

> **Guarde isto:** SCP, RCP, permissions boundary e session policy **nunca concedem** permissão. Elas só **limitam**. Para algo ser permitido, alguém tem que dar um Allow (identity ou resource policy) **e** nenhum teto pode bloquear.

### A lógica de avaliação, passo a passo
1. Tudo começa **negado** (*implicit deny*).
2. Se **qualquer** política aplicável tem um **Deny explícito** que casa com a requisição → **negado**. Deny explícito sempre vence.
3. Se existe **RCP** ou **SCP** e ela **não permite** a ação → negado.
4. Se uma **resource-based policy** permite → em muitos casos na mesma conta já é suficiente (há exceções importantes: no KMS, por exemplo, a key policy é sempre obrigatória).
5. Se a **identity-based policy** não permite → negado.
6. Se há **permissions boundary** e ela não permite → negado.
7. Se há **session policy** e ela não permite → negado.
8. Passou por tudo → **permitido**.

Exemplo clássico de prova: uma role tem \`AdministratorAccess\`, mas a conta está numa OU com uma SCP que só permite serviços de uma lista. Ela tenta usar um serviço fora da lista → **negado**, porque a SCP é um teto.

### Entre contas (cross-account)
Quando o principal está na conta A e o recurso na conta B, **as duas contas precisam concordar**: a identity policy na conta A precisa permitir **e** a resource policy na conta B precisa permitir o principal da A. A alternativa comum é a A **assumir uma role** na B.

### Roles, STS e o confused deputy
Uma **role** tem duas políticas: a **trust policy** (quem pode assumi-la) e a **permissions policy** (o que ela pode fazer). Ao assumir a role via **STS (AssumeRole)**, recebe-se **credenciais temporárias**. Para terceiros (ex.: um fornecedor SaaS que acessa sua conta), use o **External ID** na trust policy: ele evita que outro cliente do mesmo fornecedor engane o fornecedor para acessar a **sua** conta — o *confused deputy* da AWS.

### Federação: sem usuários IAM de longa duração
- **Pessoas**: **IAM Identity Center** conectado ao provedor de identidade da empresa (login único, permissões por conjunto).
- **Workloads**: roles com credenciais temporárias — roles de instância EC2, roles para pods no EKS, e **OIDC** para sistemas externos (ex.: GitHub Actions assumindo uma role sem chave armazenada).

### Data perimeter (perímetro de dados)
Um conjunto de controles preventivos que garante três coisas: **só identidades confiáveis** acessam **só recursos confiáveis** a partir de **redes esperadas**. Ferramentas: SCPs, RCPs, resource policies e VPC endpoint policies, usando *condition keys* como \`aws:PrincipalOrgID\` (o principal é da minha organização?), \`aws:ResourceOrgID\` (o recurso é da minha organização?) e \`aws:SourceVpce\` (veio pelo meu VPC endpoint?).

### Ferramentas de apoio
- **IAM Access Analyzer**: aponta recursos compartilhados com fora da conta/organização, permissões não usadas e erros em políticas.
- **IAM Policy Simulator**: testa se uma ação seria permitida.
- **Last accessed information**: mostra quais permissões nunca foram usadas — base para reduzir privilégios.`,
    glossary: [
      ['Principal', 'Quem faz a requisição: usuário, role, federado ou serviço.'],
      ['ARN', 'Identificador único de um recurso AWS.'],
      ['Implicit × explicit deny', 'Negado por falta de Allow × negado por um Deny escrito (sempre vence).'],
      ['Identity × resource policy', 'Anexada à identidade × anexada ao recurso (tem Principal).'],
      ['Permissions boundary', 'Teto de permissões de uma identidade; não concede nada.'],
      ['SCP / RCP', 'Tetos do Organizations para identidades / para recursos das contas.'],
      ['Trust policy', 'Define quem pode assumir uma role.'],
      ['External ID', 'Valor na trust policy que evita confused deputy com terceiros.'],
      ['Data perimeter', 'Identidades confiáveis + recursos confiáveis + redes esperadas.'],
      ['aws:PrincipalOrgID', 'Condition key: o principal pertence à minha organização?']
    ],
    steps: [
      { kind: 'read', title: 'Exam guide oficial SCS-C03', url: 'https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03.html', minutes: 30, focus: 'Leia os 6 domínios e as "task statements". Marque nas anotações quais itens do Domínio 4 (IAM) você ainda não sabe explicar.' },
      { kind: 'read', title: 'IAM — Policy evaluation logic', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html', minutes: 60, focus: 'Estude o fluxograma de avaliação até conseguir redesenhá-lo de memória. Leia os exemplos com permissions boundary e session policy.' },
      { kind: 'read', title: 'IAM — Cross-account policy evaluation', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html', minutes: 30, focus: 'Confirme a regra "as duas contas precisam concordar" e veja as exceções.' },
      { kind: 'read', title: 'IAM — The confused deputy problem', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html', minutes: 20, focus: 'Entenda o External ID entre contas e as condition keys aws:SourceArn / aws:SourceAccount para serviços.' },
      { kind: 'read', title: 'IAM — Permissions boundaries', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html', minutes: 30, focus: 'Veja os diagramas de interseção e o caso de uso de delegar a criação de roles sem permitir escalar privilégio.' },
      { kind: 'read', title: 'Organizations — Service control policies (SCPs)', url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html', minutes: 30, focus: 'Atenção às pegadinhas: o que a SCP não afeta (conta de gerenciamento, service-linked roles) e allow list × deny list.' },
      { kind: 'read', title: 'Organizations — Resource control policies (RCPs)', url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_rcps.html', minutes: 20, focus: 'Compare com SCP: teto sobre recursos, não identidades. Veja quais serviços são suportados.' },
      { kind: 'read', title: 'Data Perimeters on AWS', url: 'https://aws.amazon.com/identity/data-perimeters-on-aws/', minutes: 40, focus: 'Entenda os três perímetros (identidade, recurso, rede) e quais condition keys implementam cada um.' },
      { kind: 'watch', title: 'Curso em vídeo — seções de IAM e Organizations (Cybr ou Stephane Maarek)', url: 'https://cybr.com/', minutes: 240, focus: 'Assista só as seções de IAM, STS, federação, Identity Center e Organizations. Alternativa paga e muito estruturada: o curso do Stephane Maarek na Udemy.' },
      { kind: 'read', title: 'AWS Skill Builder — Exam Prep SCS-C03', url: 'https://skillbuilder.aws/', minutes: 90, focus: 'Procure o plano de preparação oficial da SCS-C03 e faça as questões do domínio de IAM.' },
      { kind: 'do', title: 'Treinar no diagrama de avaliação IAM da aba AWS', tab: 'aws', minutes: 20, focus: 'Percorra o fluxo de avaliação da aba AWS explicando cada passo em voz alta.' },
      { kind: 'do', title: 'Simulado — só o Domínio 4 (IAM)', tab: 'quiz', minutes: 40, focus: 'No Simulado, filtre o Domínio 4 em modo Estudo. Leia todas as explicações, inclusive das que acertar.' }
    ],
    checkpoint: [
      { q: 'Uma role tem AdministratorAccess, mas uma ação é negada. Cite três causas possíveis.', a: 'Uma SCP (ou RCP) que não permite a ação; um permissions boundary que não inclui a ação; um Deny explícito em alguma política (inclusive na resource policy ou numa session policy restritiva).' },
      { q: 'O que precisa existir para um principal da conta A ler um bucket da conta B?', a: 'Allow na identity policy do principal na conta A e Allow na bucket policy da conta B para aquele principal (ou a A assumir uma role na B que tenha a permissão), sem Deny explícito nem tetos bloqueando.' },
      { q: 'Para que serve o External ID?', a: 'Evitar o confused deputy quando um terceiro assume roles em várias contas de clientes: a trust policy exige um ID único combinado com aquele cliente, então outro cliente não consegue induzir o terceiro a acessar a sua conta.' },
      { q: 'Como garantir que um bucket só seja acessado por identidades da sua organização?', a: 'Bucket policy (ou RCP) com Deny quando aws:PrincipalOrgID for diferente do ID da organização, com exceção para serviços AWS quando necessário (aws:PrincipalIsAWSService).' }
    ],
    concepts: [
      'Hierarquia de avaliação: Explicit Deny → Organizations RCP / SCP → Resource Policy → Identity Policy → Permission Boundary → Session Policy → Implicit Deny.',
      'Acesso Same-Account vs. Cross-Account (cross-account exige Allow na Identity Policy da conta origem E na Resource Policy da conta destino).',
      'Federação moderna (OIDC, IAM Identity Center, STS AssumeRole com ExternalId contra Confused Deputy) e Data Perimeters com Condition Keys.'
    ],
    exampleTitle: 'Policy JSON com Data Perimeter (aws:PrincipalOrgID e aws:SourceVpce)',
    exampleCode: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EnforceOrgAndPrivateVpcEndpoint",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::ai-rag-corpus-prod", "arn:aws:s3:::ai-rag-corpus-prod/*"],
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalOrgID": "o-corp123456",
          "aws:SourceVpce": "vpce-0a1b2c3d4e5f67890"
        },
        "Bool": { "aws:PrincipalIsAWSService": "false" }
      }
    }
  ]
}`,
    caveat: 'Pegadinha clássica da SCS-C03: mesmo que um usuário tenha AdministratorAccess na Identity Policy, um Permission Boundary ou uma SCP que não permita explicitamente aquela ação bloqueará a chamada (interseção de permissões).'
  },
  {
    id: 'm4_2', phase: 4, code: '4.2', hours: 14,
    title: 'Proteção de Dados, KMS & Segurança de Rede (SCS-C03)',
    goal: 'Ao final você explica envelope encryption passo a passo, sabe por que a key policy é o centro do KMS e desenha uma arquitetura em que prompts, documentos e chaves nunca passam pela internet pública.',
    onTheJob: 'Toda plataforma de IA guarda dados sensíveis: corpus do RAG, logs de conversa, modelos ajustados. Tarefas reais: definir quais buckets usam chave KMS gerenciada pelo cliente, revisar uma key policy que "ninguém consegue usar", e desenhar o acesso privado ao Bedrock via VPC endpoint para atender um cliente que exige que os dados não saiam pela internet.',
    lesson: `### Criptografia do zero
- **Em trânsito**: protege o dado enquanto viaja pela rede (TLS/HTTPS).
- **Em repouso**: protege o dado guardado em disco, banco ou bucket.
- **Simétrica**: a mesma chave cifra e decifra (rápida; ex.: AES-256). **Assimétrica**: um par de chaves pública/privada (usada para assinaturas e troca de chaves).

O difícil em criptografia quase nunca é o algoritmo — é **guardar e controlar o uso da chave**. É isso que o **AWS KMS** resolve.

### AWS KMS
O KMS guarda **KMS keys** (antes chamadas de CMKs) dentro de módulos de hardware de segurança (HSMs). O material da chave **não sai** do KMS em texto claro: você pede ao KMS para cifrar/decifrar, e ele decide se permite. Tipos:

- **AWS owned**: chaves da AWS, usadas por baixo dos panos; você não vê nem controla.
- **AWS managed**: criadas por um serviço na sua conta (\`aws/s3\`, \`aws/ebs\`); você vê, mas não controla a política.
- **Customer managed**: você cria e controla tudo — política, rotação, desativação. É a escolha para dados sensíveis e para compartilhar entre contas.

### Envelope encryption, passo a passo
Chamar o KMS para cifrar cada arquivo seria lento, e a operação \`Encrypt\` direta aceita poucos dados (até 4 KB). Por isso se usa **envelope encryption**:

1. A aplicação chama \`GenerateDataKey\` no KMS, indicando uma KMS key.
2. O KMS devolve **duas versões** de uma nova chave de dados (*data key*): em **texto claro** e **cifrada** pela KMS key.
3. A aplicação cifra o dado **localmente** com a data key em texto claro e **descarta** essa versão da memória.
4. Guarda o dado cifrado **junto com a data key cifrada** ("o envelope").
5. Para ler: manda a data key cifrada para o KMS (\`Decrypt\`), recebe a versão em texto claro e decifra o dado localmente.

Vantagens: desempenho (cifragem local), dados de qualquer tamanho e **controle centralizado** — quem não pode chamar \`Decrypt\` na KMS key não abre nenhum envelope. Serviços como S3 e EBS fazem isso automaticamente.

### Key policy: o coração do KMS
Toda KMS key tem uma **key policy** (resource-based), e **ela é obrigatória**: se a key policy não permitir, nem um administrador da conta consegue usar a chave. A key policy padrão contém um statement que dá acesso à **conta** (\`arn:aws:iam::CONTA:root\`) — o que **habilita** que políticas IAM da conta concedam acesso à chave. Se esse statement for removido, só os principais listados na key policy têm acesso. Outras peças:

- **Grants**: permissões temporárias e delegáveis, muito usadas por serviços AWS.
- **Cross-account**: a key policy precisa permitir a outra conta **e** a outra conta precisa conceder via IAM aos seus principais.
- **Rotação automática**: opcional para chaves simétricas customer managed (por padrão anual, com período configurável). Dados antigos continuam legíveis — o KMS guarda as versões anteriores do material. Chaves com material importado (BYOK) seguem regras próprias.
- **Exclusão**: agendada, com espera de 7 a 30 dias — porque apagar a chave torna os dados irrecuperáveis.

### S3: opções de criptografia
Desde 2023, todo objeto novo no S3 é cifrado por padrão com **SSE-S3**. Outras opções: **SSE-KMS** (usa uma KMS key — permite controlar quem decifra e auditar no CloudTrail), **DSSE-KMS** (duas camadas) e **SSE-C** (você fornece a chave a cada requisição). Para muitos objetos com SSE-KMS, o **S3 Bucket Key** reduz chamadas (e custo) ao KMS.

### Segredos
- **Secrets Manager**: feito para segredos (senhas de banco, chaves de API), com **rotação automática** integrada (via Lambda) e auditoria.
- **SSM Parameter Store**: configurações em geral, com parâmetros \`SecureString\` cifrados por KMS; sem a rotação gerenciada do Secrets Manager.

### Rede: o mínimo que você precisa saber
- **VPC**: sua rede privada na AWS, dividida em **subnets**. Uma subnet é "pública" se sua tabela de rotas aponta para um **Internet Gateway**; "privada" se não aponta. Máquinas em subnet privada saem para a internet por um **NAT Gateway** (se houver).
- **Security Group**: firewall **da instância/interface**, **stateful** (a resposta volta automaticamente), só regras de **Allow**.
- **Network ACL**: firewall **da subnet**, **stateless** (precisa liberar ida e volta), regras numeradas de **Allow e Deny** — útil para bloquear um IP explicitamente.

### VPC endpoints: falar com serviços AWS sem internet
- **Gateway endpoint**: só para **S3 e DynamoDB**, sem custo, entra como rota na tabela de rotas.
- **Interface endpoint (PrivateLink)**: uma interface de rede com IP privado na sua subnet, para a maioria dos serviços (Bedrock, KMS, Secrets Manager, STS…). Tem custo por hora e por dados.

Os dois aceitam **endpoint policies** (limitar o que passa por eles), e as bucket policies podem exigir \`aws:SourceVpce\` (só aceitar acesso vindo do seu endpoint). Resultado: uma aplicação de IA numa subnet privada, **sem rota para a internet**, acessa Bedrock, KMS e o corpus no S3 de forma totalmente privada.

### Borda
- **AWS WAF**: regras contra ataques web (injeção, bots, rate limit por IP) na frente do CloudFront, ALB ou API Gateway.
- **AWS Shield**: proteção contra DDoS (Standard automático; Advanced pago, com suporte especializado).
- **ACM**: certificados TLS gerenciados.`,
    glossary: [
      ['KMS key (CMK)', 'Chave mestra no KMS; o material nunca sai em texto claro.'],
      ['Customer managed key', 'KMS key que você cria e controla (política, rotação, exclusão).'],
      ['Envelope encryption', 'Cifrar dados com uma data key e cifrar a data key com a KMS key.'],
      ['GenerateDataKey', 'Chamada que devolve a data key em texto claro e cifrada.'],
      ['Key policy', 'Política obrigatória de cada KMS key; sem ela permitir, ninguém usa.'],
      ['Grant', 'Permissão delegável/temporária de uso de uma KMS key.'],
      ['SSE-S3 / SSE-KMS', 'Criptografia do S3 com chave gerenciada pelo S3 / com KMS key.'],
      ['Security Group × NACL', 'Stateful, só Allow, por interface × stateless, Allow/Deny, por subnet.'],
      ['Gateway × Interface endpoint', 'S3/DynamoDB grátis via rota × PrivateLink com IP privado, maioria dos serviços.'],
      ['aws:SourceVpce', 'Condition key: a requisição veio por este VPC endpoint?']
    ],
    steps: [
      { kind: 'read', title: 'AWS KMS — KMS keys (conceitos)', url: 'https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html', minutes: 45, focus: 'Diferencie AWS owned, AWS managed e customer managed. Procure a explicação de envelope encryption e data keys e compare com os 5 passos da aula.' },
      { kind: 'read', title: 'AWS KMS — Key policies', url: 'https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html', minutes: 45, focus: 'Leia a key policy padrão e o que acontece sem o statement da conta (root). É uma das pegadinhas mais cobradas.' },
      { kind: 'read', title: 'Secrets Manager — Rotate secrets', url: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html', minutes: 25, focus: 'Entenda as estratégias de rotação (usuário único × usuários alternados) e o papel da Lambda.' },
      { kind: 'read', title: 'What is AWS PrivateLink?', url: 'https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html', minutes: 30, focus: 'Entenda interface endpoints, DNS privado e endpoint policies.' },
      { kind: 'read', title: 'Gateway endpoints', url: 'https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html', minutes: 20, focus: 'Quais serviços suportam, como entram na tabela de rotas e por que não têm custo.' },
      { kind: 'read', title: 'Infrastructure security in Amazon VPC', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html', minutes: 25, focus: 'Comparação entre Security Groups e Network ACLs. Monte uma tabela com 4 diferenças.' },
      { kind: 'watch', title: 'Curso em vídeo — seções de KMS, S3, Secrets e VPC (Cybr ou Maarek)', url: 'https://cybr.com/', minutes: 240, focus: 'Assista só as seções de Proteção de Dados e Infraestrutura. Pause e desenhe o fluxo de envelope encryption e uma VPC com endpoints.' },
      { kind: 'lab', title: 'AWS Workshops (Builder Center) — KMS e segurança de rede', url: 'https://builder.aws.com/build/workshops', minutes: 120, focus: 'Busque por "KMS", "data protection" e "network security" e faça um workshop de cada tema numa conta de estudos (cuidado com custos e apague os recursos no final).' },
      { kind: 'read', title: 'SaveMyCert — lições dos domínios 3 e 5', url: 'https://www.savemycert.com/certifications/aws-security-specialty/', minutes: 60, focus: 'Use as lições como revisão rápida depois do curso, focando em Infraestrutura e Proteção de Dados.' },
      { kind: 'do', title: 'Simulado — Domínios 3 e 5', tab: 'quiz', minutes: 40, focus: 'Filtre os domínios 3 (Infraestrutura) e 5 (Proteção de Dados) em modo Estudo.' }
    ],
    checkpoint: [
      { q: 'Explique envelope encryption em cinco passos.', a: 'GenerateDataKey → recebe data key em texto claro e cifrada → cifra o dado localmente e descarta a versão em claro → guarda o dado cifrado com a data key cifrada → para ler, Decrypt da data key no KMS e decifra localmente.' },
      { q: 'Um administrador com AdministratorAccess não consegue usar uma KMS key. Por quê?', a: 'Porque a key policy não permite: ou não tem o statement que delega à conta (root) e habilita o IAM, ou não lista aquele principal. No KMS, a key policy é sempre obrigatória.' },
      { q: 'Security Group × Network ACL: qual usar para bloquear um IP específico?', a: 'Network ACL, porque aceita regras de Deny explícito e é stateless no nível da subnet. Security Groups só têm regras de Allow.' },
      { q: 'Como uma aplicação em subnet privada acessa o Bedrock e um bucket S3 sem internet?', a: 'Interface endpoint (PrivateLink) para o Bedrock (e KMS, Secrets Manager), gateway endpoint para o S3, sem rota para Internet Gateway, e bucket policy exigindo aws:SourceVpce.' }
    ],
    concepts: [
      'Envelope Encryption no AWS KMS (GenerateDataKey criptografa grandes volumes localmente; a KMS key protege a Data Key) e rotação automática vs. BYOK.',
      'KMS Key Policies vs. IAM Policies; Secrets Manager (rotação automática nativa) vs. SSM Parameter Store.',
      'Inferência e acesso a dados 100% privados sem sair à internet via VPC Endpoints: Gateway Endpoints (S3/DynamoDB) vs. Interface Endpoints/PrivateLink (Bedrock, KMS, Secrets Manager).',
      'Security Groups (stateful, apenas ALLOW) vs. NACLs (stateless, permite DENY explícito) e AWS WAF.'
    ],
    exampleTitle: 'Arquitetura Privada para Inferência & RAG (Sem Egress Público)',
    exampleCode: `[App / EKS Pod em Subnet Privada]
    |---> Gateway Endpoint (grátis) ---> [S3 Corpus + DynamoDB]
    |---> Interface Endpoint (PrivateLink) ---> [AWS Bedrock / KMS / Secrets Manager]
    x---> Internet Gateway BLOQUEADO (0.0.0.0/0 removido da Route Table)

# Resultado: prompts, documentos RAG e chaves nunca atravessam a internet pública.`,
    caveat: 'No AWS KMS, se a Key Policy não delegar explicitamente ao root da conta (arn:aws:iam::ACCOUNT:root), nem mesmo um administrador com AdministratorAccess via IAM consegue gerenciar ou usar aquela chave.'
  },
  {
    id: 'm4_3', phase: 4, code: '4.3', hours: 16,
    title: 'Detecção, Resposta a Incidentes & Governança (SCS-C03)',
    goal: 'Ao final você sabe qual serviço AWS detecta o quê, monta uma resposta automatizada a um achado do GuardDuty, executa um playbook de credencial vazada e de instância comprometida preservando evidências — e está pronto para os simulados finais.',
    onTheJob: 'Quando o alerta dispara às 3h da manhã ("credenciais da role do agente usadas de um IP desconhecido"), alguém precisa saber exatamente o que fazer: conter sem destruir evidências, revogar sessões, descobrir o que foi acessado no CloudTrail. Fora dos incidentes, o trabalho é garantir que os logs existem, que os alertas chegam a quem deve e que as contas novas já nascem com os controles certos.',
    lesson: `### Primeiro, os logs: sem eles não há investigação
- **CloudTrail**: registra as chamadas de API da conta ("quem fez o quê, quando, de onde"). **Management events** (criar/alterar recursos) são registrados por padrão; **data events** (ex.: \`s3:GetObject\`, invocações Lambda) precisam ser **habilitados** e têm custo. Boas práticas: uma **trail de organização** cobrindo todas as contas e regiões, enviando para um bucket numa **conta de log separada**, com **log file validation** ligado (arquivos de resumo com hash SHA-256 assinados, para provar que os logs não foram alterados).
- **VPC Flow Logs**: metadados do tráfego de rede (IPs, portas, aceito/rejeitado) — não o conteúdo.
- **Logs de serviço**: acesso ao S3, logs do ALB/CloudFront, DNS (Route 53 Resolver), CloudWatch Logs das aplicações.

### Quem detecta o quê
- **GuardDuty**: detecção de ameaças. Analisa CloudTrail, VPC Flow Logs e DNS (e, com planos adicionais, S3, EKS, malware, RDS, Lambda e runtime) e gera achados como "credencial usada de IP malicioso" ou "instância minerando criptomoeda".
- **Security Hub**: o painel central — agrega achados de vários serviços e verifica a conformidade das contas com padrões (CSPM), como o AWS Foundational Security Best Practices e o CIS.
- **AWS Config**: inventário e **histórico de configuração** de recursos, com **regras** que avaliam conformidade (ex.: "todo bucket deve bloquear acesso público") e podem disparar remediação.
- **Macie**: encontra **dados sensíveis** (PII, credenciais) em buckets S3.
- **Inspector**: **vulnerabilidades** de software em EC2, imagens de container (ECR) e Lambda.
- **Detective**: ajuda a **investigar**, montando um grafo de relacionamentos entre entidades a partir dos logs.
- **IAM Access Analyzer**: acesso externo e permissões não usadas.

Dica de prova: leia o verbo da questão. "Detectar ameaça" → GuardDuty. "Avaliar conformidade de configuração" → Config. "Encontrar PII no S3" → Macie. "Vulnerabilidades/CVEs" → Inspector. "Visão central de achados" → Security Hub. "Investigar a causa raiz" → Detective.

### Resposta automatizada
O padrão é: **achado → EventBridge → ação**. Uma regra do **EventBridge** filtra achados (ex.: GuardDuty com severidade alta de um certo tipo) e aciona uma **Lambda**, uma automação do **Systems Manager** ou um fluxo do **Step Functions** para conter: trocar o Security Group da instância, desativar uma chave de acesso, notificar o time.

### O ciclo de resposta a incidentes
Baseado no NIST (e no guia de IR da AWS): **preparação** → **detecção e análise** → **contenção, erradicação e recuperação** → **atividades pós-incidente** (lições aprendidas). Na nuvem, preparação significa: logs ligados, acessos de emergência prontos, uma **conta forense** separada e playbooks escritos antes do incidente.

### Playbook 1: credencial comprometida
1. **Conter**: para uma role, **revogar sessões ativas** — o console aplica uma política com Deny para tokens emitidos antes de agora (\`aws:TokenIssueTime\`). Para chaves de acesso de usuário IAM, **desativar** a chave (não apagar ainda: ela é evidência).
2. **Investigar**: no CloudTrail, o que essa credencial fez? Criou usuários, roles, chaves? Acessou quais buckets?
3. **Erradicar**: remover tudo que o atacante criou (persistência), trocar segredos expostos.
4. **Recuperar e aprender**: por que a credencial vazou? (chave em repositório, SSRF no IMDS…)

### Playbook 2: instância EC2 comprometida
1. **Não desligue nem termine** a instância de cara: a memória e o disco são evidências.
2. **Isole**: troque para um Security Group sem regras (atenção: conexões já rastreadas podem continuar ativas; por isso alguns playbooks também usam NACL) e remova a role da instância ou revogue suas sessões.
3. **Marque** com tags ("em investigação").
4. **Preserve**: snapshot dos volumes EBS e captura de memória, copiados para a **conta forense**.
5. **Analise** na conta forense, longe da produção.

### Governança em escala
- **Organizations** + **Control Tower**: contas novas nascem num *landing zone* com controles preventivos (SCPs) e detectivos (Config) já aplicados.
- **Config conformance packs** e **Audit Manager**: evidências para auditoria.
- **AWS Artifact**: relatórios de conformidade da própria AWS (ISO, SOC).

### Logística da prova
Agende em inglês. Se o inglês não é sua língua nativa, você pode solicitar a acomodação **ESL +30** (30 minutos a mais) **antes** de agendar. Meta segura: média **≥ 80%** em simulados de qualidade antes de marcar a data.`,
    glossary: [
      ['Management × data events', 'Chamadas de controle (padrão) × acesso a dados como s3:GetObject (opt-in, pago).'],
      ['Log file validation', 'Hashes assinados que provam que os logs do CloudTrail não foram alterados.'],
      ['Finding', 'Achado gerado por um serviço de detecção (GuardDuty, Inspector, Macie…).'],
      ['CSPM', 'Gestão de postura de segurança na nuvem: verificar configurações contra padrões.'],
      ['EventBridge rule', 'Filtro de eventos que aciona alvos (Lambda, SSM, Step Functions).'],
      ['Contenção', 'Limitar o estrago sem destruir evidências.'],
      ['Conta forense', 'Conta isolada para analisar cópias de evidências.'],
      ['Landing zone', 'Estrutura multi-conta com controles aplicados desde o início (Control Tower).'],
      ['ESL +30', 'Acomodação de 30 minutos extras para não nativos em inglês.']
    ],
    steps: [
      { kind: 'read', title: 'CloudTrail — Validating log file integrity', url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-intro.html', minutes: 20, focus: 'Entenda os digest files e como validar. Pegadinha comum: integridade de logs = log file validation.' },
      { kind: 'read', title: 'GuardDuty — Finding types', url: 'https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_finding-types-active.html', minutes: 40, focus: 'Aprenda a ler o formato ThreatPurpose:ResourceType/ThreatFamily. Leia os achados de IAM/credenciais e de EC2.' },
      { kind: 'read', title: 'GuardDuty — Processing findings with EventBridge', url: 'https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_findings_eventbridge.html', minutes: 30, focus: 'Veja o formato do evento e um exemplo de regra que filtra por severidade.' },
      { kind: 'read', title: 'AWS Security Incident Response Guide', url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-security-incident-response-guide/', minutes: 90, focus: 'Leia as fases (preparação, operações, pós-incidente) e as seções sobre contenção e forense. Compare com os dois playbooks da aula.' },
      { kind: 'read', title: 'IAM — Revoke role temporary credentials', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_revoke-sessions.html', minutes: 15, focus: 'Veja a política que o console aplica (aws:TokenIssueTime) e o que acontece com sessões novas.' },
      { kind: 'read', title: 'What is Amazon Macie?', url: 'https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html', minutes: 15, focus: 'Entenda o que o Macie descobre e como ele se integra ao Security Hub.' },
      { kind: 'lab', title: 'flaws.cloud', url: 'http://flaws.cloud/', minutes: 120, focus: 'Desafio do lado do atacante: buckets abertos, credenciais expostas, metadados. Para cada nível, anote o controle AWS que teria evitado.' },
      { kind: 'lab', title: 'flaws2.cloud (trilha Attacker e Defender)', url: 'http://flaws2.cloud/', minutes: 120, focus: 'Faça a trilha Defender: é investigação de incidente com CloudTrail — exatamente o Domínio 2.' },
      { kind: 'lab', title: 'Opcional — CloudGoat', url: 'https://github.com/RhinoSecurityLabs/cloudgoat', minutes: 120, optional: true, focus: 'Cenários vulneráveis criados na sua conta via Terraform. Cuidado com custos e destrua tudo ao terminar.' },
      { kind: 'watch', title: 'Curso em vídeo — seções de Logging, Detecção, IR e Governança', url: 'https://www.udemy.com/course/ultimate-aws-certified-security-specialty/', minutes: 240, cost: 'Baixo custo', focus: 'Stephane Maarek (Udemy) ou Cybr. Foque nos domínios 1, 2 e 6.' },
      { kind: 'lab', title: 'Tutorials Dojo — Practice Exams', url: 'https://portal.tutorialsdojo.com/courses/aws-certified-security-specialty-practice-exams-scs-c03/', minutes: 240, cost: 'Baixo custo', focus: 'Confira se a página diz SCS-C03 antes de comprar. Faça em modo revisão, lendo todas as explicações; meta ≥ 80%.' },
      { kind: 'do', title: 'Simulado completo em modo Prova', tab: 'quiz', minutes: 90, focus: 'Todas as questões, modo Prova com cronômetro. Registre o resultado no rastreador da aba AWS e refaça as erradas no dia seguinte.' }
    ],
    checkpoint: [
      { q: 'Qual serviço usar para: detectar ameaça, avaliar configuração, achar PII no S3, achar CVEs e investigar causa raiz?', a: 'GuardDuty; AWS Config (e Security Hub para padrões); Macie; Inspector; Detective.' },
      { q: 'Descreva a resposta a uma chave de acesso IAM vazada.', a: 'Desativar a chave (sem apagar), revogar sessões derivadas, investigar no CloudTrail tudo que ela fez, remover persistência criada pelo atacante, rotacionar segredos afetados e corrigir a causa do vazamento.' },
      { q: 'Por que não terminar imediatamente uma instância comprometida?', a: 'Porque memória e disco são evidências. O correto é isolar (SG restritivo, remover/revogar a role), marcar, fazer snapshot e captura de memória para uma conta forense e analisar lá.' },
      { q: 'Como provar numa auditoria que os logs do CloudTrail não foram alterados?', a: 'Com log file validation habilitado: os digest files com hashes SHA-256 assinados permitem validar a integridade dos arquivos de log, guardados num bucket de conta de log separada com acesso restrito.' }
    ],
    concepts: [
      'CloudTrail multi-region com Log File Validation (integridade SHA-256), GuardDuty, Security Hub, AWS Config, Macie (PII no S3) e Amazon Detective.',
      'Remediação automatizada (SOAR leve): Finding no GuardDuty → EventBridge → Lambda/Step Functions para isolar Security Group ou revogar sessões STS.',
      'Preservação forense em IR: isolar instância EC2 sem destruir e criar snapshot EBS em conta forense separada.',
      'Logística de prova: agendar em inglês após solicitar a acomodação gratuita ESL +30 Minutes.'
    ],
    exampleTitle: 'Revogação Imediata de Sessões STS Comprometidas (Explicit Deny Temporal)',
    exampleCode: `{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "RevokeAllOlderSessionsImmediately",
    "Effect": "Deny",
    "Action": "*",
    "Resource": "*",
    "Condition": {
      "DateLessThan": { "aws:TokenIssueTime": "2026-11-26T16:30:00Z" }
    }
  }]
}`,
    caveat: 'CloudTrail captura Management Events por padrão, mas Data Events (como s3:GetObject ou invocações Lambda) precisam ser habilitados explicitamente — atenção ao impacto financeiro em buckets de altíssimo volume e ao escopo exigido em auditorias.'
  }
];
