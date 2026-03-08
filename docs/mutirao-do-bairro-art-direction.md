# Mutirao do Bairro - Art Direction (T36C Premium)

Status: **producao visual premium integrada**
Referencia de consistencia: Tarifa Zero RJ premium
Direcao: identidade propria com parentesco de universo
Atualizacao: T36C elevou assets de P0 para premium com coesao visual consolidada

## Fantasia visual

Territorio vivo em reparo:
- ruas, equipamentos comunitarios e pontos de encontro;
- sinais de desgaste versus sinais de reconstrucao coletiva;
- clima de urgencia organizada, nao caos cinematografico.

## Contraste com Tarifa Zero RJ

Tarifa Zero RJ:
- corredor vertical, movimento continuo, foco em deslocamento.

Mutirao do Bairro:
- mapa zonal com hotspots, foco em estado territorial e montagem coletiva.

## Paleta

Base territorial:
- `#0F1E2B` fundo estrutural
- `#1E3A4C` azul petroleo de bairro
- `#2F5D50` verde infraestrutura

Coletivo (positivo):
- `#7FD36E` apoio comunitario
- `#C9F27B` pico de mutirao

Risco/pressao:
- `#F18F4E` alerta de sobrecarga
- `#D74B4B` colapso/sabotagem

Acento campanha:
- `#F9CF4A` assinatura de campanha
- `#123D59` azul institucional da linha arcade

## Shape language

- hotspots: octogonos arredondados (legiveis e clicaveis);
- suporte coletivo: circulos com halo macio;
- ameacas: losangos angulosos com pulsacao curta;
- estruturas reparadas: blocos modulares encaixados.

Principio:
- formas positivas mais arredondadas;
- formas de risco mais tensas e pontiagudas.

## Personagens e objetos

Player role:
- AF como coordenador visual em mini retrato no HUD e final card.

Unidades de bairro:
- brigada voluntaria;
- equipe tecnica popular;
- rede de cuidado.

Objetos de mundo:
- caixa de ferramentas, gerador solidario, ponto de agua, rota comunitaria.

## Identidade do territorio

Cenografia:
- quarteirao com 5 zonas fixas;
- texturas leves de asfalto, muro, piso e placa de bairro;
- marcadores de fluxo comunitario (setas, faixas, pontos de encontro).

Regra de leitura:
- hotspot ativo sempre mais luminoso que o fundo;
- hotspot em colapso usa contraste maximo.

## HUD

Topo:
- tempo, estabilidade, confianca.

Centro:
- mapa com hotspots e severidade.

Base:
- botoes de acao grandes (touch-first) com cor por funcao.

Mutirao:
- medidor dedicado com glow progressivo;
- estado `pronto` com pulso visual controlado.

## Feedback visual principal

- reparar: preenchimento progressivo da zona + flare verde curto;
- defender: escudo leve + queda imediata do risco;
- mobilizar: trilha de conexao entre zonas;
- mutirao ativo: wash coletivo breve + boost de legibilidade.

## Tela final

Composicao:
- headline de resultado territorial;
- cards de hotspots salvos/em risco;
- score e eficiencia coletiva;
- CTA campanha e QR.

Integracao:
- tema planejado do `FinalShareCard`: `mutirao-bairro-premium`;
- estilo alinhado ao universo existente, sem copiar frame do Tarifa Zero.

## Como a campanha aparece

- linguagem de organizacao popular no feedback e no final;
- marca da campanha discreta, persistente e clara;
- CTA ligado a acao real de territorio.

## Pipeline e fallback visual

- asset-first com fallback canvas para todos os elementos criticos;
- nomenclatura de arquivo por categoria/função/estado;
- prioridade para legibilidade em tela pequena.

## Diretriz de motion

- animacoes curtas (180-320ms);
- sem ruido excessivo;
- efeitos funcionais ligados a estado de jogo.

## Baseline visual planejada

Quando runtime existir no T36B:
- run desktop/mobile;
- final desktop/mobile;
- snapshots em `reports/validation/baselines/` seguindo padrao T35F.

---

## Assets Premium - Especificacoes T36C

### 1. Background do Bairro (`bg/bg-bairro-premium-v1.svg`)

**Dimensoes**: 640x960 (mobile-first portrait)

**Camadas**:
- Camada base: gradiente estrutural (`#0F1E2B` → `#1E3A4C`)
- Camada urbana: silhuetas de edificios baixos com varanda/laje (`#123D59` 15% opacity)
- Camada de piso: quadricula leve de ruas/calcadas (`#2F5D50` 8% opacity)
- Pontos de encontro: 3-5 circulos de comunidade (`#7FD36E` 25% opacity)
- Caminhos comunitarios: paths curvos conectando zonas (`#C9F27B` 12% opacity, stroke 3px)

**Regras**:
- Background nao compete com hotspots (contraste controlado)
- Espacos visuais reservados para as 3 posicoes de hotspot (topo, centro, base)
- Iluminacao sutil sugerindo final de tarde (campanha de territorio em movimento)

### 2. Player Coordenador (`player/player-coordenador-premium-v1.svg`)

**Dimensoes**: 80x100 (sprite de personagem)

**Design**:
- Silhueta humana reconhecivel com prancheta/radio/megafone pequenos
- Paleta: roupa em `#2F5D50` e `#7FD36E`, acessorio em `#F9CF4A` (marca campanha)
- Expressao: determinada e ativa (nao heroica, mas competente)
- Footprint: base circular leve para leitura de posicao

**Estados** (futuro):
- ativo (padrao)
- comunicando (quando aciona mobilizar)
- defendendo (quando aciona defender)

### 3. Hotspot Premium (`entities/entity-hotspot-premium-v1.svg`)

**Dimensoes**: 120x145 (card compacto de hotspot)

**Estrutura**:
- Frame octogonal com borda dupla (externa `#123D59`, interna dinamica por estado)
- Icone central por tipo:
  - Agua: gota estilizada (`#5BA3D0`)
  - Energia: raio/lampada (`#F9CF4A`)
  - Mobilidade: setas circulares (`#7FD36E`)
- Barra de integrity inferior (preenchimento `#7FD36E`)
- Barra de danger superior (preenchimento `#F18F4E` → `#D74B4B`)
- Estado selected: glow suave `#C9F27B`
- Estado critical (integrity < 20): pulso vermelho 600ms

### 4. Acoes - Icones Premium (`ui/ui-action-*-v2.svg`)

**Dimensoes**: 64x64 cada

**ui-action-reparar-v2.svg**:
- Chave inglesa + engrenagem modular
- Cores: `#7FD36E` principal, `#C9F27B` acento
- Shape: circular com borda de ferramenta (acao construtiva)

**ui-action-defender-v2.svg**:
- Escudo comunitario com tres pontos de apoio
- Cores: `#5BA3D0` principal, `#123D59` estrutura
- Shape: octogonal defensivo (protecao coletiva)

**ui-action-mobilizar-v2.svg**:
- Rede de nos interconectados (5-6 pontos)
- Cores: `#7FD36E` nos, `#C9F27B` conexoes
- Shape: organico-reticular (montagem coletiva)

**ui-action-mutirao-v2.svg** (special):
- Circuito coletivo com energia pulsante
- Cores: `#F9CF4A` core, `#C9F27B` halo
- Shape: estrela-cooperativa (pico de forca coletiva)

### 5. HUD - Barra de Pressao (`ui/ui-hud-pressure-bar-v2.svg`)

**Dimensoes**: 280x48

**Estrutura**:
- Container: rounded rect com borda `#123D59`
- Preenchimento progressivo:
  - 0-40%: `#7FD36E` (estavel)
  - 41-70%: `#F9CF4A` (tensao crescente)
  - 71-85%: `#F18F4E` (alerta)
  - 86-100%: `#D74B4B` (colapso iminente)
- Marcadores visuais nos thresholds 55%, 70%, 85%
- Icone de warning quando > 85%

### 6. HUD - Medidor de Mutirao (`ui/ui-hud-mutirao-charge-v2.svg`)

**Dimensoes**: 220x42

**Estados**:
- Carregando (0-99%): preenchimento `#7FD36E` → `#C9F27B`
- Pronto (100%): glow pulsante `#F9CF4A` 800ms loop
- Ativo (janela): barra completa com flash `#C9F27B`

**Icone**: raios coletivos convergindo (simbolo de forca organizada)

### 7. Eventos Especiais - Overlays (`ui/ui-event-*-v2.svg`)

**Dimensoes**: 320x100 cada (banner de evento)

**ui-event-chuva-forte-v2.svg**:
- Gotas estilizadas + nuvem
- Paleta: `#5BA3D0` com `#F18F4E` (perigo hidrico)

**ui-event-boato-panico-v2.svg**:
- Ondas de rumor + sinais de alerta
- Paleta: `#F18F4E` com `#D74B4B` (desestabilizacao social)

**ui-event-onda-solidaria-v2.svg**:
- Maos conectadas + fluxo positivo
- Paleta: `#7FD36E` com `#C9F27B` (apoio coletivo)

**ui-event-tranco-sabotagem-v2.svg**:
- Raio + estrutura danificada
- Paleta: `#D74B4B` com `#F18F4E` (ataque infraestrutura)

---

## Hierarquia Visual Premium

**Camada 1 - Background**: territorios e conexoes (sutis)
**Camada 2 - Hotspots**: cards e estados (foco principal)
**Camada 3 - Player**: coordenador (secundario)
**Camada 4 - HUD**: metricas e acoes (sempre legivel)
**Camada 5 - Overlays**: eventos e warnings (temporarios, alta prioridade)

**Regra de contraste**:
- Elementos criticos sempre > 4.5:1 contra fundo
- Estados de risco usam saturacao + contraste maximo
- Texto de feedback sempre com shadow ou outline leve

---

## Motion e Feedback Premium

**Transicoes de fase**:
- Badge de fase (arranque/pressao/virada/fechamento) com slide-in 240ms
- Overlay semi-transparente `#0F1E2B` 60% por 1.2s

**Acoes aplicadas**:
- Flash curto no hotspot afetado (180ms)
- Numero flutuante +score (`#C9F27B`, fade-up 600ms)
- Barra atualizada com easing ease-out 300ms

**Colapso iminente** (pressure > 85%):
- Pulso vermelho no HUD 600ms loop
- Borda dos hotspots criticos pulsa `#D74B4B`
- Warning icon shake leve 400ms

**Mutirao ativo**:
- Screen wash `#C9F27B` 15% opacity por 400ms
- Icones de acao com glow temporario
- SFX sugerido: coro coletivo leve (se audio no futuro)

---
