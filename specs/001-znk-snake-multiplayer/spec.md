# Feature Specification: ZNK Snake Multiplayer

**Feature Branch**: `001-znk-snake-multiplayer`

**Created**: 2026-09-13

**Status**: Implemented

**Input**: User description: "Especificacao funcional completa do MVP do jogo ZNK Snake Multiplayer com tabuleiro compartilhado persistente, entrada sem espera, regra critica de vitoria por eliminacao e 6 a 10 celulas livres, e rank de mestres persistente durante a execucao."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar e Jogar Imediatamente (Priority: P1)

Como jogador, quero informar meu nome, ver a cor exclusiva em preview e entrar instantaneamente no tabuleiro compartilhado para comecar a jogar sem espera.

**Why this priority**: Sem entrada imediata e sem preview de identidade visual, o valor principal de multiplayer simultaneo e acessivel nao e entregue.

**Independent Test**: Pode ser testada isoladamente ao validar que o jogador informa nome, recebe preview com cor e controles, confirma e entra no tabuleiro imediatamente com cobrinha pequena em celula livre.

**Acceptance Scenarios**:

1. **Given** um jogador acessa a tela inicial, **When** informa nome valido, **Then** o sistema mostra preview com cor exclusiva, previa da cobrinha e instrucoes de controle.
2. **Given** um jogador confirma entrada, **When** existe espaco livre para spawn, **Then** ele entra imediatamente no tabuleiro compartilhado sem fila de espera, priorizando posicao central e area livre ao redor da cobrinha.
3. **Given** um jogador confirma entrada, **When** nao existe espaco livre suficiente para spawn, **Then** o sistema libera espaco removendo primeiro pontos de comida mais antigos e realiza a entrada imediatamente.

---

### User Story 2 - Sobreviver, Eliminar e Crescer (Priority: P2)

Como jogador em partida, quero mover minha cobrinha, coletar pontos e me beneficiar de eliminacoes para crescer e disputar dominancia no tabuleiro.

**Why this priority**: A dinamica de risco, recompensa e crescimento e o nucleo da experiencia competitiva.

**Independent Test**: Pode ser testada isoladamente ao validar movimento, crescimento por coleta, regras de colisao e conversao completa do corpo da cobrinha morta em pontos coletaveis.

**Acceptance Scenarios**:

1. **Given** um jogador ativo, **When** usa comandos direcionais, **Then** sua cobrinha se move no tabuleiro e os demais jogadores veem a atualizacao em tempo real.
2. **Given** um jogador coleta ponto, **When** a coleta e processada, **Then** sua cobrinha cresce e sua pontuacao aumenta.
3. **Given** ocorre colisao com parede, corpo proprio ou corpo de outra cobrinha, **When** a colisao e validada, **Then** o jogador morre instantaneamente e todo o corpo da cobrinha vira pontos coletaveis.
4. **Given** uma cobrinha morre, **When** os pontos de seu corpo ficam no mapa, **Then** qualquer jogador pode coletar esses pontos para crescer e pontuar.
5. **Given** ocorre colisao simultanea cabeca-com-cabeca, **When** ambas ocupam a mesma celula no mesmo instante, **Then** ambas as cobrinhas morrem e seus corpos viram pontos.

---

### User Story 3 - Fechar Ciclo e Registrar Mestre (Priority: P3)

Como jogador, quero que o ciclo so termine quando houver dominancia real no tabuleiro para que o titulo de Mestre reflita superioridade clara na rodada.

**Why this priority**: A regra critica de vitoria define a identidade do produto e evita vitorias ambiguas por tamanho isolado.

**Independent Test**: Pode ser testada isoladamente ao reproduzir o estado de fim de ciclo e validar simultaneamente as tres condicoes de vitoria, registro no ranking e reinicio do tabuleiro.

**Acceptance Scenarios**:

1. **Given** resta apenas uma cobrinha viva, **When** restam entre 6 e 10 celulas livres no tabuleiro, **Then** o sistema declara essa cobrinha como vencedora do ciclo.
2. **Given** restam 10 ou menos celulas livres, **When** a condicao e atingida, **Then** o sistema interrompe surgimento automatico de novos pontos ate a decisao de vitoria.
3. **Given** um ponto de origem normal e coletado, **When** ocorre a coleta, **Then** o proximo ponto de origem normal so pode surgir apos 20 segundos e apenas se nao houver outro ponto de origem normal ativo no tabuleiro.
3. **Given** as condicoes de vitoria sao atendidas simultaneamente, **When** o vencedor e confirmado, **Then** o sistema destaca a vitoria, registra nome/cor/tamanho/pontuacao/eliminacoes no Rank de Mestres e inicia novo ciclo com tabuleiro limpo.

---

### Edge Cases

- Se um jogador se desconectar abruptamente com cobrinha viva, sua cobrinha morre instantaneamente, vira pontos coletaveis e sua cor e liberada.
- Se dois jogadores tentarem ocupar a mesma celula com colisao cabeca-com-cabeca no mesmo instante, ambos morrem.
- Se o tabuleiro estiver ocupado a ponto de impedir spawn imediato, a entrada ou retorno acontece sem espera por meio da remocao dos pontos de comida mais antigos.
- Se o tabuleiro tiver entre 6 e 10 celulas livres, mas ainda houver mais de uma cobrinha viva, o ciclo nao termina.
- Se restarem menos de 6 celulas livres sem cumprimento completo da regra de vitoria, o sistema continua a rodada ate atingir novamente estado valido de decisao conforme regras do produto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que o jogador informe nome antes de entrar no tabuleiro.
- **FR-002**: O sistema MUST atribuir uma cor exclusiva para cada jogador ativo simultaneamente.
- **FR-003**: O sistema MUST exibir, antes da entrada, preview com cor atribuida, previa visual da cobrinha e controles de movimento.
- **FR-004**: O sistema MUST inserir o jogador imediatamente no tabuleiro apos confirmacao, sem fila de espera em qualquer circunstancia.
- **FR-005**: O sistema MUST spawnar cobrinha inicial pequena em celula livre durante entrada ou retorno.
- **FR-005A**: O spawn de entrada/retorno MUST priorizar posicoes proximas ao centro do tabuleiro.
- **FR-005B**: O spawn de entrada/retorno MUST preferir area segura com uma celula de respiro ao redor da cobrinha, sem parede e sem ocupacao de outros elementos; quando indisponivel, MUST escolher o melhor candidato restante sem bloquear entrada imediata.
- **FR-006**: Se nao houver espaco livre suficiente para spawn, o sistema MUST remover primeiro pontos de comida mais antigos ate viabilizar spawn, sem remover segmentos de cobrinhas vivas.
- **FR-007**: O sistema MUST permitir controle de movimento com quatro direcoes.
- **FR-008**: O sistema MUST gerar pontos coletaveis em intervalos regulares durante a rodada, exceto quando a regra de interrupcao de spawn estiver ativa.
- **FR-008A**: O sistema MUST manter no maximo um ponto de origem normal ativo por vez no tabuleiro.
- **FR-008B**: Apos coleta de um ponto de origem normal, o sistema MUST aguardar 20 segundos antes de permitir o proximo spawn de ponto de origem normal.
- **FR-009**: O sistema MUST aumentar tamanho e pontuacao da cobrinha ao coletar um ponto.
- **FR-010**: O sistema MUST aplicar morte instantanea ao jogador que colidir com parede, corpo proprio ou corpo de outra cobrinha.
- **FR-011**: Em colisao cabeca-com-cabeca no mesmo instante, o sistema MUST eliminar todas as cobrinhas envolvidas.
- **FR-012**: Toda morte MUST converter integralmente o corpo da cobrinha em pontos coletaveis no tabuleiro.
- **FR-013**: Pontos oriundos de cobrinha eliminada MUST permanecer no tabuleiro ate coleta por qualquer jogador.
- **FR-014**: O jogador eliminado MUST permanecer na sessao e poder retornar imediatamente no mesmo tabuleiro com nova cor exclusiva.
- **FR-015**: O tabuleiro compartilhado MUST NOT reiniciar por entrada, saida, morte ou retorno individual.
- **FR-016**: O sistema MUST interromper surgimento automatico de novos pontos quando restarem 10 ou menos celulas livres no tabuleiro.
- **FR-017**: O sistema MUST declarar vencedor do ciclo somente quando as tres condicoes ocorrerem simultaneamente: cobrinha do candidato viva, ausencia de outras cobrinhas vivas e restante entre 6 e 10 celulas livres.
- **FR-018**: Ao confirmar vencedor, o sistema MUST exibir destaque de vitoria ao jogador vencedor.
- **FR-019**: Ao confirmar vencedor, o sistema MUST registrar no Rank de Mestres: nome, cor, tamanho final, pontuacao e quantidade de eliminacoes.
- **FR-020**: O Rank de Mestres MUST permanecer disponivel durante toda a execucao do jogo e MUST NOT ser limpo no reset de ciclo.
- **FR-021**: Apos confirmacao de vitoria, o sistema MUST limpar tabuleiro e iniciar novo ciclo com novas condicoes de rodada.
- **FR-022**: O sistema MUST refletir em tempo real para todos os jogadores conectados as mudancas de movimento, crescimento, morte, entrada, retorno e vitoria.
- **FR-023**: O tabuleiro MUST manter area fixa de exibicao de 800x600 para padrao visual consistente.

### Key Entities *(include if feature involves data)*

- **Player**: Jogador participante identificado por nome, com estado atual na rodada, cor ativa e metricas de desempenho.
- **Snake**: Entidade jogavel de um jogador, contendo posicoes ocupadas, direcao atual, tamanho e estado de vida.
- **Collectible Point**: Item coletavel no tabuleiro, com origem (geracao da rodada ou conversao de morte) e ordem temporal para remocao por antiguidade.
- **Board State**: Estado compartilhado da rodada, incluindo celulas livres/ocupadas, pontos ativos, cobrinhas ativas e condicoes de encerramento.
- **Victory Evaluation**: Registro temporario das condicoes simultaneas de vitoria do ciclo para decisao de encerramento.
- **Master Rank Entry**: Registro persistente durante a execucao com nome, cor, tamanho final, pontuacao e eliminacoes do vencedor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pelo menos 95% dos jogadores novos completam fluxo de entrada (nome, preview, confirmacao e spawn) em ate 10 segundos.
- **SC-002**: Em sessao com no minimo 10 jogadores simultaneos, 100% dos jogadores ativos mantem cores exclusivas sem duplicacao no mesmo instante.
- **SC-003**: Em 100% dos casos observados sem espaco livre inicial para spawn, o jogador entra ou retorna sem fila de espera.
- **SC-004**: Em 100% das mortes validadas, o corpo completo da cobrinha eliminada vira pontos coletaveis e permanece disponivel ate coleta.
- **SC-005**: Em 100% dos ciclos encerrados, a vitoria ocorre apenas quando ha um unico sobrevivente e restam entre 6 e 10 celulas livres.
- **SC-006**: Em 100% das rodadas em que o tabuleiro atinge 10 ou menos celulas livres, o surgimento de novos pontos e interrompido ate decisao do ciclo.
- **SC-007**: Em 100% dos encerramentos de ciclo, o Rank de Mestres recebe registro completo (nome, cor, tamanho final, pontuacao, eliminacoes) e permanece acessivel apos o reset do tabuleiro.
- **SC-008**: Em sessoes com multiplos jogadores, 95% das atualizacoes de estado da rodada sao percebidas pelos demais participantes em ate 1 segundo.
- **SC-009**: Em 100% das entradas/retornos em mapas com area central disponivel, o spawn ocorre em posicao proxima ao centro e sem obstaculos imediatos na vizinhanca de uma celula.
- **SC-010**: Em 100% das coletas de ponto de origem normal, nenhum novo ponto de origem normal surge antes de 20 segundos.

## Assumptions

- O MVP opera com um unico tabuleiro compartilhado por todos os jogadores conectados.
- A entrada sem espera tem prioridade de produto sobre preservacao absoluta de pontos de comida antigos.
- A avaliacao de vitoria considera apenas cobrinhas vivas no instante da verificacao.
- O ranking de mestres persiste durante a execucao ativa do jogo, mas nao exige persistencia entre reinicializacoes.
- A regra constitucional atual sobre reset por ocupacao total devera ser emendada para alinhar esta especificacao antes da implementacao.
