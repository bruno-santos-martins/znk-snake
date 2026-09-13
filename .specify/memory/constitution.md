<!--
Sync Impact Report
- Version change: 1.0.0 -> 2.0.0
- Modified principles:
	- VI. Estado Persistente do Tabuleiro -> VI. Estado Persistente do Tabuleiro e Vitoria Oficial do Ciclo
- Added sections:
	- None
- Removed sections:
	- None
- Follow-up TODOs:
	- None
-->

# ZNK Snake Multiplayer Constitution

## Core Principles

### I. Clean Architecture (NON-NEGOTIABLE)
Toda logica de negocio DEVE estar isolada em `services/`, nunca em controllers,
handlers de socket ou componentes React. Controllers e socket handlers apenas
orquestram: recebem entrada, chamam services e formatam saida. Models
representam apenas dados e validacoes simples, sem logica de fluxo. Nenhuma
camada pode pular etapas (ex: componente React nao pode falar diretamente com o
socket sem passar por um service/hook dedicado).

**Rationale**: O jogo tem estado compartilhado complexo (tabuleiro persistente,
multiplas cobrinhas, colisoes em tempo real). Sem separacao estrita, a logica
de jogo vira spaghetti acoplado ao transporte (Socket.IO) e a UI, dificultando
testes e manutencao.

### II. Servidor Autoritativo
O servidor Node.js e a UNICA fonte de verdade do estado do jogo (posicoes,
colisoes, pontuacao, ranking). O cliente React NUNCA calcula regras de jogo
(colisao, crescimento, morte): ele apenas envia inputs e renderiza o estado
recebido via `game:state`.

**Rationale**: Multiplayer em tempo real exige consistencia entre todos os
jogadores. Logica no cliente gera divergencia de estado e abre brecha para
trapaca.

### III. Componentizacao e Reuso (Frontend)
Componentes visuais (`Board`, `SnakeSegment`, `FoodDot`, etc.) DEVEM ser
"burros": recebem props, nao possuem estado de negocio e nao conhecem
Socket.IO. Toda logica de conexao e estado global vive em
`services/socketClient.ts`, `hooks/` e `contexts/GameContext`. Nenhum
componente pode importar `socket.io-client` diretamente.

**Rationale**: Garante reuso, testabilidade isolada e evita acoplamento entre
UI e transporte de dados.

### IV. Tipagem Estrita (TypeScript Everywhere)
Todo o codigo (client e server) DEVE ser TypeScript com `strict: true`. Tipos
de estado do jogo (`Snake`, `Player`, `Food`, `Board`) DEVEM ser
compartilhados/consistentes entre client e server via um contrato de tipos
unico (`types/game.types.ts` ou pacote compartilhado).

**Rationale**: Evita divergencia de shape de dados entre frontend e backend em
um sistema real-time onde bugs de tipo geram falhas silenciosas de
sincronizacao.

### V. Execucao Unica e Sem Friccao
O projeto DEVE subir por completo (client + server) com um unico comando
`yarn dev` a partir da raiz do monorepo (Yarn Workspaces). Nenhuma spec ou
plano pode introduzir passos manuais adicionais de setup para rodar localmente.

**Rationale**: Requisito explicito do dono do produto: velocidade de iteracao e
simplicidade de execucao sao prioridade.

### VI. Estado Persistente do Tabuleiro e Vitoria Oficial do Ciclo
O mapa compartilhado NUNCA reseta por entrada, saida, morte ou vitoria isolada
de um jogador. O reset do ciclo SO pode ocorrer quando existir EXATAMENTE uma
cobrinha viva e o numero de celulas livres estiver entre 6 e 10 (inclusive).
Ao atingir 10 ou menos celulas livres, o spawn automatico de comida DEVE ser
interrompido ate a decisao de vitoria do ciclo. Qualquer feature nova DEVE
respeitar essa invariante central de game design.

**Rationale**: E a mecanica definidora do jogo (diferente de Snake
tradicional). A vitoria exige dominancia real por eliminacao dos adversarios,
evitando resultados ambiguos por tamanho isolado.

### VII. Identidade Visual Unica por Jogador
Cada jogador ativo simultaneamente DEVE receber uma cor exclusiva (sem
repeticao entre jogadores ativos no mesmo momento), exibida antes de entrar no
jogo (preview) e durante toda a partida (HUD + cobrinha).

**Rationale**: Requisito de UX explicito para diferenciacao intuitiva entre
jogadores em um tabuleiro compartilhado e populoso.

## Padrões Técnicos Adicionais

- **Stack fixa**: React + TypeScript (Vite) no client; Node.js + Express +
	Socket.IO + TypeScript no server. Mudanca de stack exige emenda formal a
	esta constituicao.
- **Grid e Timing padrao**: grid 21x21, tick de game loop 150ms, spawn de
	comida a cada 300ms como baseline. Specs podem propor ajuste, mas devem
	justificar e atualizar `game.md`.
- **Contrato de eventos Socket.IO**: qualquer novo evento deve ser documentado
	no `game.md` e seguir o padrao `namespace:action` (ex: `player:join`,
	`game:reset`).
- **Nomenclatura**: codigo em ingles (variaveis, funcoes, arquivos);
	comunicacao com o usuario (specs, docs, comentarios de produto) pode ser em
	portugues.
- **Sem estado de negocio fora de services**: nem em hooks React, nem em socket
	handlers; hooks apenas conectam UI a services/contexts.

## Fluxo de Desenvolvimento

- Toda nova feature nasce como spec (`/specify`) referenciando o `game.md` como
	fonte de verdade de game design.
- Planos tecnicos (`/plan`) devem explicitar em qual camada
	(controller/service/model no server; component/hook/service no client) cada
	mudanca sera implementada.
- Nenhuma tarefa (`/tasks`) pode misturar logica de jogo com logica de
	transporte (socket) ou apresentacao (React) no mesmo arquivo.
- Mudancas que quebrem qualquer Principio Core (I-VII) exigem emenda explicita
	a esta constituicao antes de serem aceitas.

## Governance

Esta constituicao tem precedencia sobre qualquer pratica ad-hoc de codigo.
Emendas exigem: (1) descricao da mudanca e motivo, (2) impacto nos principios
existentes, (3) atualizacao de versao abaixo. Todo PR ou tarefa gerada pelo
Spec-Kit DEVE ser verificavel contra estes principios antes de merge.

Politica de versionamento: MAJOR para mudancas incompativeis nos principios ou
governanca, MINOR para novos principios/secoes ou ampliacoes materiais, PATCH
para clarificacoes editoriais sem mudanca normativa.

Revisao de conformidade: toda revisao tecnica DEVE validar aderencia explicita
aos Principios Core, aos Padroes Tecnicos Adicionais e ao Fluxo de
Desenvolvimento.

Procedimento de emenda: propostas DEVEM documentar contexto, impacto e plano de
migracao quando aplicavel; a emenda so entra em vigor apos atualizacao desta
constituicao e registro de nova versao.

**Version**: 2.0.0 | **Ratified**: 2026-09-13 | **Last Amended**: 2026-09-13
