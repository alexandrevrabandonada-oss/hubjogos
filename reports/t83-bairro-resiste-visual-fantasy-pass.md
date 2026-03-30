# Relatório T83 — Bairro Resiste Visual Fantasy Pass

## 1. Diagnóstico da Fraqueza Graybox
O Bairro Resiste sofria de uma estética de "protótipo técnico" que minava a ambição do Hub:
- **Tabuleiro**: Um retângulo escuro sem textura ou identidade geográfica.
- **Hotspots**: Círculos coloridos genéricos com selos de texto.
- **Player**: Um quadrado azul (`Player Brigada`) sem peso visual.
- **Feedback**: Falta de conexão entre o comando do jogador (clique) e o impacto no território.

## 2. Decisões de Redesign e Implementação

### Fantasia Territorial (Map Board)
Substituímos o fundo plano por um mapa vetorial completo (`bg-bairro-base-v1.svg`):
- **Distritos**: Norte, Sul, Leste e Centro agora possuem marcações e cores de base (Glow).
- **Malha Urbana**: Inclusão de quadras citadinas, avenidas principais e linhas de controle tático.
- **Look 'Mission Control'**: Adicionamos scanlines de CRT e um grid tático minimalista via CSS.

### Identidade de Hotspots (Urban Systems)
Cada hotspot agora é um ícone estilizado que representa um sistema urbano real:
- **Água**: Reservatório e torre metálica com paleta cyan.
- **Moradia**: Silhueta de blocos habitacionais com telhados e chaminés ocre/terracota.
- **Mobilidade**: Combo ônibus + corredor de asfalto em azul-cobalto.
- **Saúde**: Posto comunitário com cruz brilhante e silhueta de ambulância em verde-saúde.
- **Geometria**: Mudamos de anéis circulares para nós retangulares de cantos arredondados, seguindo o art direction original.

### Brigada e Gamefeel
- **Player Indicator**: O indicador de base agora é um escudo hexagonal com o ícone da brigada (punho de solidariedade), pulsando em verde neon.
- **Linha de Despacho**: Ao clicar, uma linha de energia dinâmica "dispara" da base até o ponto de crise, criando uma linha de ação clara.
- **Flash de Impacto**: Efeito de brilho e escala acentuado ao estabilizar um setor.
- **Fases de Crise**: Introdução de banners de transição (`FASE 2: ACELERAÇÃO`, `FASE 3: CAOS TOTAL`) para aumentar a tensão.

## 3. Melhorias de Interface (HUD & UX)
- **Hierarquia Premium**: Containers em Glassmorphism com bordas de luz tática.
- **Display de Tempo**: Relógio em formato `M:SS` com tipografia mono-espaçada tabular.
- **Outcome Detalhado**: O card de resultado agora exibe o total de ações e o setor específico que causou o colapso.

## 4. Revisão dos Primeiros 10 Segundos
- **Urgência Imediata**: O setor de **Moradia** agora inicia com **38% de pressão**, garantindo que o jogador tenha que agir imediatamente no primeiro ciclo.
- **Explicação Visual**: O feature grid na introdução prepara o jogador para a escala de 3 fases do jogo.

## 5. Recomendação de Status
- **Status Atual**: **FLAGSHIP**
- **Justificativa**: O jogo agora "se vende sozinho" visualmente. A barreira estética de protótipo foi rompida, e a experiência tátil (clique/feedback) é digna de um jogo arcade público.

---
**Status Final**: CONCLUÍDO
**Arquivos Criados/Modificados**:
- `BairroResisteArcadeGame.tsx` & `.module.css` (Lógica e Estética)
- `bg-bairro-base-v1.svg` (Mapa)
- `entity-hotspot-*.svg` (4 Assets de Sistema)
- `player-brigada-base-v1.svg` (Base)
