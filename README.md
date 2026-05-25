# NutriRU

Plataforma web de gestão integrada para Restaurantes Universitários, desenvolvida para o Hackathon do Programa **Do Piauí para o Mundo 2026** — Faculdade PIT.

## Sobre o projeto

O NutriRU conecta estudantes e gestores do RU em um mesmo fluxo de informação, transformando registros simples do cotidiano em dados úteis para decisões de gestão.

**Problema:** O RU opera sem dados confiáveis. A gestão não sabe quantas refeições vai precisar produzir, não recebe feedback real sobre a qualidade dos cardápios e não tem histórico organizado de sobras e descarte.

**Solução:** Coleta de informações antes, durante e depois do serviço de alimentação — intenção de consumo, avaliações e registro de produção — gerando indicadores que apoiam decisões mais precisas.

## Equipe

- Erick Gabriel Lima Viana
- Lucas Samuel Alves Ribeiro
- Pedro Malcon Cabral Silva
- Vinicius Fernandes Vieira

**Orientador:** Osvaldo José Mesquita Neto

## Tecnologias

- **React** + **Vite** — frontend
- **Tailwind CSS v4** — estilização
- **Lucide React** — ícones
- **React Router DOM** — navegação
- **Supabase** — banco de dados PostgreSQL + autenticação

## Funcionalidades

**Estudante:**
- Ver cardápio do dia com informações nutricionais
- Confirmar intenção de consumo (almoço ou jantar) com prazo limite
- Avaliar refeição por critério (sabor, temperatura, aparência, satisfação)

**Gestor:**
- Painel com total de intenções em tempo real e recomendação de produção
- CRUD de cardápios por dia e turno com status publicado/rascunho
- Registro de produção: previsto, servido, sobras e descarte
- Relatório histórico por semana ou mês com avaliações por refeição

## Como executar

**Pré-requisitos:** Node.js 18+

```bash
# Clonar o repositório
git clone https://github.com/SEU_USUARIO/nutriru.git

# Entrar na pasta
cd nutriru

# Instalar dependências
npm install

# Rodar o projeto
npm run dev
```

Acesse `http://localhost:5173` no navegador.

##  Arquitetura

**Tabelas do banco:**
- `usuarios` — perfil estudante ou gestor
- `cardapios` — pratos por dia e turno
- `intencoes` — confirmações de presença
- `avaliacoes` — notas por critério
- `producao` — previsto, servido, sobras e descarte

## Hipóteses validadas pelo MVP

- **H1** — Intenção de consumo reduz diferença entre refeições planejadas e servidas
- **H2** — Registro sistemático de sobras e descarte permite identificar padrões
- **H3** — Avaliações simples permitem melhoria contínua dos cardápios