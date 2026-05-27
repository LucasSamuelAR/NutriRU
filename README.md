# NutriRU

Plataforma Web App (PWA) de gestão integrada para Restaurantes Universitários, desenvolvida para o Hackathon do Programa **Do Piauí para o Mundo 2026** — Faculdade PIT.

## 📱 Sobre o Projeto e Estratégia de MVP

O NutriRU conecta estudantes e gestores do RU em um mesmo fluxo de informação, transformando registros simples do cotidiano em dados úteis para decisões estratégicas de gestão.

**O Problema:** O RU opera às cegas, sem dados confiáveis em tempo real. A gestão enfrenta dificuldades para prever a quantidade exata de refeições a produzir, não recebe feedback sistemático sobre a qualidade dos cardápios e carece de um histórico organizado de sobras limpas e descarte (resto-ingesta). Isso gera desperdício de recursos públicos e insatisfação dos alunos.

**A Solução (MVP):** Uma plataforma centralizada que coleta informações essenciais antes, durante e depois do serviço de alimentação:
1. **Antes:** Intenção de consumo dos estudantes (reduzindo a margem de erro na produção).
2. **Durante:** Avaliação rápida da refeição por quem consome.
3. **Depois:** Registro de produção e pesagem de sobras/descarte para geração de indicadores de eficiência (KPIs).

> 💡 **Decisão de Arquitetura (Do Mobile Nativo ao PWA):** > Inicialmente o projeto foi idealizado em React Native. Contudo, focando na **agilidade de validação do MVP** e na **experiência do usuário (UX)**, optamos por desenvolver uma aplicação **React + Vite transformada em PWA (Progressive Web App)**. 
> 
> Descobrimos que exigir que o estudante baixe um aplicativo de 50MB na loja de aplicativos cria uma barreira de engajamento catastrófica. Com o PWA, o aluno apenas escaneia um **QR Code** impresso no balcão do RU, a aplicação abre instantaneamente no navegador do celular com peso quase zero, oferecendo a experiência fluida de um app nativo e permitindo a instalação direta na tela inicial sem passar pela Play Store/App Store.

## 👥 Equipe

- Erick Gabriel Lima Viana
- Lucas Samuel Alves Ribeiro
- Pedro Malcon Cabral Silva
- Vinicius Fernandes Vieira

**Orientador:** Osvaldo José Mesquita Neto

## 🛠️ Tecnologias

- **React 18** + **Vite** — Ecossistema SPA rápido e moderno para o frontend.
- **Vite PWA Plugin** — Transformação da aplicação web em Progressive Web App (Service Workers, Manifest, suporte offline).
- **Tailwind CSS v4** — Estilização performática e responsiva mobile-first.
- **React Router DOM** — Gerenciamento de rotas e navegação interna.
- **Lucide React** — Biblioteca de ícones limpos e minimalistas.
- **Supabase** — Backend-as-a-Service (BaaS) provendo banco de dados relacional PostgreSQL, Autenticação JWT e segurança a nível de linha (RLS).

## 🚀 Funcionalidades do MVP

**Visão do Estudante:**
- Consulta ao cardápio do dia com marcadores de informações nutricionais e alérgenos.
- Confirmação de intenção de consumo (almoço ou jantar) com trava de horário limite para apoiar o planejamento da cozinha.
- Avaliação ágil da refeição por critérios operacionais críticos: **Sabor**, **Temperatura**, **Tamanho da Porção (Saciedade)** e **Satisfação Geral**.

**Visão do Gestor:**
- Painel de Controle (Dashboard) em tempo real com o totalizador de intenções de consumo e recomendação automatizada de produção.
- CRUD e gerenciamento de cardápios por dia e turno (Status: Rascunho / Publicado).
- Registro de fechamento de produção: input de dados de refeições previstas, servidas, sobras limpas (balcão) e descarte (resto-ingesta).
- Relatórios gerenciais e históricos de desperdício e satisfação por período.

## 📂 Arquitetura da Solução

O projeto segue uma arquitetura limpa e modular baseada em componentes reutilizáveis e separação de responsabilidades (View, Services e State), garantindo escalabilidade.

```text
src/
├── components/     # Componentes globais reutilizáveis (Botões, Cards, Inputs)
├── contexts/       # Contextos do React para Gerenciamento de Estado (Ex: AuthContext)
├── layouts/        # Estruturas de layout de página (Sidebar do Gestor, Container do Aluno)
├── pages/          # Telas e visões completas da aplicação (Login, Dashboard, FormAvaliacao)
├── services/       # Camada de Integração e APIs externas (Clientes e consultas do Supabase)
├── utils/          # Funções utilitárias, formatadores de data e validadores
├── App.jsx         # Configuração de rotas e providers globais
└── main.jsx        # Ponto de entrada da aplicação e registro do Service Worker do PWA