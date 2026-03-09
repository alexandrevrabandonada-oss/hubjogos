# Bairro Resiste - Art Direction (T51)

## Direcao visual

"Bairro em estado de alerta, comunidade em estado de resposta".

O visual precisa passar urgencia territorial com calor humano: crise visivel, mas com sinais fortes de cuidado comunitario e reorganizacao coletiva.

## Contraste visual com outros arcades

- vs `tarifa-zero-corredor`: menos fluxo de pista e mais mapa de quarteirao com pontos vitais.
- vs `mutirao-do-bairro`: foco mais dramatico em crise e contenção de colapso em cadeia.
- vs `cooperativa-na-pressao`: menos ambiente interno de trabalho, mais rua/equipamento publico/territorio vivo.

## Principios visuais

- legibilidade imediata: hotspot critico identificado em <1s.
- territorialidade concreta: rua, viela, posto, ponto, caixa d'agua, moradia.
- anti-militarizacao: sem estetica de "combate" ou armamento; foco em defesa civil comunitaria.
- leitura mobile-first: HUD e alertas legiveis em viewport estreito.

## Paleta P0 oficial

- `--bairro-bg-deep: #0f2230` (base noturna urbana)
- `--bairro-bg-mid: #1f3a4a` (estrutura/quadras)
- `--bairro-risk-high: #f45f5f` (risco critico)
- `--bairro-risk-mid: #ff9a4a` (risco moderado)
- `--bairro-solidarity: #7ce0ae` (cuidado/rede)
- `--bairro-water: #4bb0ff` (agua/servico essencial)
- `--bairro-campaign: #f9cf4a` (presenca de campanha)
- `--bairro-neutral-ui: #d7e2ea` (texto e molduras)

## Shape language

- hotspots: blocos retangulares com cantos levemente arredondados e icone fixo por servico.
- ameaca ativa: wedge/chevron de direcao + borda pulsante.
- coletividade: halos verdes em ondas curtas e conectores entre hotspots.
- colapso iminente: overlay quente em duas camadas (vermelho + laranja) com label curta.

## Linguagem do territorio

Elementos de cena P0:
- quadras com textura simples de laje e asfalto;
- elementos de servico publico (caixa d'agua, abrigo de onibus, posto, conjunto habitacional);
- sinalizacao de rua e marcos de bairro;
- trilhas de brigada em linhas curtas para mostrar deslocamento.

## HUD minima obrigatoria

- barra principal: `integridade_bairro`;
- barra secundaria: `rede_solidaria`;
- medidor: `pressao_externa`;
- carga especial: `carga_mutirao`;
- fase atual (arranque, pressao, cerco, limite);
- alerta dominante unico (evitar spam de warnings).

## Hotspots e areas

- `agua`: codigo de cor azul tecnico (`--bairro-water`) com icone de caixa d'agua.
- `moradia`: ocre/terracota com icone de casa em bloco.
- `mobilidade`: azul-cinza com icone de corredor/ponto.
- `saude`: verde claro com icone de posto comunitario.

Cada hotspot deve ter 3 estados visuais claros:
- estavel
- tensionado
- critico

## Ameacas (visual)

- corte de fornecimento: queda de brilho e glitches leves no hotspot.
- despejo relampago: pulso vermelho abrupto em moradia.
- operacao violenta: varredura diagonal de risco no mapa.
- sabotagem de servico: dreno visual da barra de rede.
- desinformacao territorial: ruido sobre icones de acao.
- virada comunitaria: flash verde curto + conectores de rede ativos.

## Presenca da campanha no jogo

- assinatura discreta no HUD e tela final;
- framing textual curto no outcome (defesa do comum / organizacao popular);
- CTA pos-run contextual para campanha territorial.

Nao permitido:
- slogan longo ocupando area de jogo;
- linguagem panfletaria durante fase de acao;
- avatar como heroi individual dominante da cena.

## Motion e feedback

- pulse de acao: 600-800ms no hotspot alvo;
- alerta critico: ritmo maximo de 2 pulsos/s;
- evento de crise: banner curto no topo com entrada lateral;
- virada comunitaria: transicao verde de alivio por 400-500ms.

## Escopo P0 deste ciclo (sem runtime novo)

- guias visuais e tokens definidos;
- naming e estrutura de assets P0 definidos;
- sem animacao pesada, sem particulas caras, sem audio premium.

## Dependencias para premium pass futuro (bloqueado)

- sprites dedicados por hotspot em mais de 1 variante;
- camadas regionais de background por territorio;
- ambientacao de audio local;
- pacote de FX adicionais de crise/virada.
