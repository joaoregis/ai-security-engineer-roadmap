// Conteúdo da trilha. Os módulos ficam em data/modules/faseN.js (um arquivo por fase).
// Não renomeie ids existentes: o progresso salvo depende deles.
import { FASE1 } from './modules/fase1.js';
import { FASE2 } from './modules/fase2.js';
import { FASE3 } from './modules/fase3.js';
import { FASE4 } from './modules/fase4.js';
import { FASE5 } from './modules/fase5.js';

// As horas de cada fase devem somar as horas dos módulos dela.
export const PHASES = [
  { id: 1, title: 'Fase 1: Fundamentos de AI Security & OWASP LLM Top 10', hours: 22, subtitle: 'Vocabulário de segurança do zero, como aplicações com LLM funcionam, mentalidade determinística e os 10 riscos críticos de LLMs.' },
  { id: 2, title: 'Fase 2: Segurança de IA Agêntica, MCP & Pipelines RAG', hours: 24, subtitle: 'Isolamento multi-tenant em bancos vetoriais, hardening de MCP Servers e AI Gateways.' },
  { id: 3, title: 'Fase 3: AppSec & API Security Sênior', hours: 20, subtitle: 'OWASP API Top 10, AuthN/AuthZ, Threat Modeling STRIDE ágil e laboratórios ofensivos.' },
  { id: 4, title: 'Fase 4: Cloud Security & AWS Certified Security – Specialty (SCS-C03)', hours: 44, subtitle: 'IAM avançado, KMS, redes privadas PrivateLink, detecção, IR e calibragem para a prova.' },
  { id: 5, title: 'Fase 5: Portfólio Sênior & Preparação para Entrevistas', hours: 16, subtitle: '3 projetos defensivos publicáveis no GitHub e simulação de System Design de Segurança.' }
];

export const MODULES = [...FASE1, ...FASE2, ...FASE3, ...FASE4, ...FASE5];

// "O trabalho": o que um AI Security Engineer faz no dia a dia (topo da aba Trilha).
export const ROLE = {
  summary: 'AI Security Engineer é o engenheiro de segurança especializado em sistemas que usam IA. O trabalho é garantir que produtos com LLM, RAG e agentes sejam seguros por design — misturando AppSec, segurança de nuvem e um entendimento profundo de como modelos de linguagem funcionam e falham.',
  duties: [
    ['Design review & threat modeling', 'Um time quer lançar um assistente que lê e-mails de clientes. Você conduz uma sessão de 45 minutos, desenha o fluxo, aponta as trust boundaries e define os controles obrigatórios antes do lançamento.', 'm3_2'],
    ['Construir controles', 'Implementar ou especificar o AI Gateway, o mascaramento de dados pessoais, o filtro de permissão do RAG, o sandbox das ferramentas do agente — controles determinísticos em código.', 'm2_3'],
    ['Red teaming & avaliação', 'Testar features antes do lançamento (prompt injection, vazamento entre clientes, agência excessiva) e manter testes adversariais automatizados no CI.', 'm1_2'],
    ['Segurança da plataforma na nuvem', 'IAM das roles que chamam o Bedrock, KMS para o corpus e os logs, VPC endpoints para tráfego privado, data perimeters.', 'm4_1'],
    ['Detecção & resposta', 'Alertas de abuso (pico de custo, exfiltração, uso anômalo de credenciais de agentes) e playbooks de incidente que envolvem IA.', 'm4_3'],
    ['Governança & enablement', 'Política de uso de IA, aprovação de servidores MCP e fornecedores, guias e treinamento para desenvolvedores, conversa com jurídico/GRC sobre LGPD.', 'm2_2']
  ],
  week: [
    ['Segunda', 'Triagem: alertas da semana, achados de pentest e pedidos de revisão abertos pelos times.'],
    ['Terça', 'Threat modeling de um RFC novo (ex.: agente que consulta o data lake) e escrita dos controles P0.'],
    ['Quarta', 'Mão no código: PR no gateway adicionando limite de tokens por tenant, com teste provando o bloqueio.'],
    ['Quinta', 'Teste adversarial de uma feature antes do lançamento e revisão de um servidor MCP pedido por um time.'],
    ['Sexta', 'Enablement: guia interno de "como usar RAG com segurança", reunião com GRC sobre retenção de logs.']
  ],
  peers: 'Você conversa com desenvolvedores e tech leads (design e código), ML/AI engineers (modelos, RAG, avaliações), SOC/SecOps (alertas e incidentes), cloud/plataforma (IAM, rede), GRC e jurídico (LGPD, políticas) e produto (riscos aceitos e prazos).',
  pillars: [
    ['OWASP', 'O catálogo de conhecimento: a língua comum para falar de riscos (LLM Top 10, API Top 10, Agentic, MCP, ASVS, Cheat Sheets).'],
    ['AWS SCS-C03', 'O laudo técnico: prova formal de que você domina segurança de nuvem, onde as plataformas de IA rodam.'],
    ['Portfólio', 'A evidência prática: controles construídos e testados, publicados no GitHub.'],
    ['Entrevistas', 'A narrativa: contar sua história e raciocinar em voz alta como alguém da área.']
  ],
  phrases: [
    'Qual é o blast radius se o modelo for completamente enganado?',
    'Isso é um controle determinístico ou só detecção?',
    'Em nome de qual principal essa tool executa?',
    'Onde está a trust boundary desse fluxo?',
    'Isso é P0 para o lançamento ou vai para o backlog como risco aceito?',
    'Como vamos provar que o controle funciona — tem teste?'
  ]
};
