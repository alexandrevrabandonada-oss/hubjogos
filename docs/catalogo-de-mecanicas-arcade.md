# Catálogo de Mecânicas Arcade

Este documento lista e organiza os loops de gameplay extraídos dos jogos da Linha Arcade do Hub. O objetivo é tratar as mecânicas como funções isoláveis, permitindo rápida prototipagem de novos temas políticos sobre bases técnicas já consolidadas pela fábrica.

## 1. Lane Runner (Corrida Coletiva com Desvios)

- **Aparece em:** `tarifa-zero-corredor`
- **Tipo de Loop:** Endless runner progressivo, baseado em evasão de perigos e coleta de recursos para sustentação estrutural.
- **Tipo de Input:** Swipes/Setas horizontais (Left, Right) para troca instantânea de lane. Input de salto opcional ou engajamento de mutirão (cooldown).
- **Medidores Relacionados:**
  - `Progresso/Distância`: Misto com apoio popular colecionado.
  - `Pressão do Sistema`: Limite temporal ou "parede" de fail state (ex: catracas que encostam).
- **Fail State:** Atingir obstáculos intransponíveis (catraca) sem escudos (mutirão), ou zerar a barra de resistência.
- **Força Política:** Altíssima para pautas de percurso (mobilidade, rotina de trabalhador), progressão por uma rua hostil que deve ser rearticulada pelo movimento social.
- **Reaproveitabilidade:** Alta. O loop de spawn de obstáculos, controle de velocidade progressiva e inputs responsivos pode ser usado para *qualquer jogo de navegação urbana*.
- **Risco Técnico:** Baixo. Já maduro com `ArcadeCanvasRuntime` iterado.

## 2. Hotspot Pressure (Gestão de Crise em Pontos Diversos)

- **Aparece em:** `mutirao-do-bairro`
- **Tipo de Loop:** "Whack-a-mole" estratégico com degradação temporal. Vários pontos da tela/mapa entram em estados críticos (ex: alagamento, falta de luz) e exigem alocação de recursos antes de colapsarem.
- **Tipo de Input:** Clicks/Taps diretos sobre as células do mapa. Click & Hold para reparo progressivo.
- **Medidores Relacionados:**
  - `Painéis de Risco (Hotspots)`: Indicadores de emergência independentes.
  - `Energia Popular / Barra Coletiva`: Recurso base gasto no reparo; regenerado por ações de base.
  - `Estado de Colapso Global`: Soma das negligências dos hotspots.
- **Fail State:** Número limite de hotspots estoura, ou barra de colapso global atinge 100%.
- **Força Política:** Excelente para defesa territorial, orçamento apertado e resistência contra o abandono estatal. Mostra a contradição da falta de braços e do sacrifício comunitário.
- **Reaproveitabilidade:** Média-alta. Requer abstração do grid e de eventos de spawn/despawn de perigo. Ideal para simuladores isométricos curtos.
- **Risco Técnico:** Médio. Requer uma state machine rigorosa para garantir que os ticks de degradação não quebrem o framerate no canvas mobile superior a 15 minios.

## 3. Coordenada Produtiva (Chão de Fábrica sob Pressão)

- **Aparece em:** `cooperativa-na-pressao`
- **Tipo de Loop:** Gestão rítmica de pipelines (Overcooked-like ou minigames industriais). O jogador recebe inputs complexos (matéria-prima) e precisa processar corretamente nas bancadas certas distribuindo esforço de trabalho.
- **Tipo de Input:** Drag-and-drop de trabalhadores/tarefas ou "Click to Select, Click to Assign".
- **Medidores Relacionados:**
  - `Fila de Pedidos / Pressão Métrica`: Contagem regressiva para cada unidade de produção.
  - `Qualidade de Vida / Stress da Célula`: Indicador de exaustão se trabalhados em overdrive contínuo.
- **Fail State:** Perder contratos suficientes ou zerar a sobrevida da cooperativa até a insolvência (stress máximo sem descanso).
- **Força Política:** Ideal para pautas de classe trabalhadora, autogestão cooperativa e alternativas ao sistema de patrão/empregado revelando a opressão métrica versus o cuidado da gestão partilhada.
- **Reaproveitabilidade:** Média. Mais preso e acoplado ao tema industrial de fábrica.
- **Risco Técnico:** Médio. A movimentação UI de drag-n-drop no DOM (fora do canvas renderizado) ou render complexo 2D exige muito teste em touchscreens menores.

## 4. Conexão em Malha (Defesa de Rotas em Rede)

- **Aparece em:** `passe-livre-nacional` (Espinha dorsal abstrata)
- **Tipo de Loop:** Puzzle de alocação de malha viária ou conexão de pontos fixos para sustentar fluxo de passe livre e "blindar" greves em pontos nevrálgicos.
- **Tipo de Input:** Path drawing ou conexão sequencial de nós (Line draw).
- **Medidores Relacionados:**
  - `Força do Piquete / Nó`: Resistência de cada parada.
  - `Cobertura Territorial`: Porcentagem conectada do mapa.
- **Fail State:** Rotas privatizadas isolando o centro.
- **Força Política:** Demonstração visual de estratégia sindical e de solidariedade.

---
**Nota Editorial (T53):** Qualquer novo arcade deverá priorizar composições a partir dessas mecânicas validadas em vez de prototipar do zero, utilizando os Módulos Compartilhados na Matriz de Reutilização.
