# Bairro Resiste - Relatório de Readiness (T53)

Este documento consolida o estado de prontidão (readiness) do jogo `bairro-resiste` para sair de "Pré-Produção Forte" para "Implementação Ativa", garantindo que ele não suba por impulso sem ter base técnica e capacidade alocada.

## 1. O que já está pronto (Aprovado)
- **Concept & Gameplay Loop**: Definidos. Jogo de "Hotspot Pressure" focado em manutenção de bairro e reparo coletivo.
- **Systems Design**: Balanceamento inicial rascunhado (fases, triggers, fail states).
- **Art Direction**: Guias visuais e paleta estabelecidos.
- **Vertical Slice Contract**: Escopo estrito desenhado para o primeiro build jogável de 90s.
- **Asset Pack Inicial**: Imagens e placeholders mapeados no manifesto de pré-produção.

## 2. O que ainda falta (Bloqueios de Pré-Produção)
- **Shared Modules Instanciados**: O T53 mapeou os candidatos (ex: `useArcadeSession()`, `EventSpawner`), mas eles ainda precisam ser programados fisicamente *antes* ou *junto* com a primeira sprint do jogo.
- **Asset Pipeline P0 Completo**: Os assets visuais P0 (HUD, Hotspots, Map Base) precisam estar obrigatoriamente linkados no repositório final antes do primeiro commit de lógica.

## 3. Bloqueio de Slot / Capacidade (Governança)
- **Status T50/T52 da Cooperativa**: A `cooperativa-na-pressao` consumiu a janela de observação prévia.
- **Decisão T53**: O slot atual de capacidade de desenvolvimento da fábrica *NÃO* permite a abertura de código do `bairro-resiste` neste exato momento, visando não asfixiar a equipe nem o QA do Hub.

## 4. O que entra no T54 (Se a subida for autorizada)
- Implementação do `ArcadeCanvasRuntime` adaptado para o grid isométrico/top-down do bairro.
- Implementação dos 4 Hotspots e Ações (`defender`, `reparar`, `cuidar`, `mobilizar`).
- Ligações com Telemetria Padrão do Hub e `FinalShareCard`.

## 5. O que fica explicitamente FORA (Feature Creep)
- Meta-progressão entre sessões (upgrades persistentes).
- Mapas gerados proceduralmente.
- Multi-player em tempo real.

**Veredito T53:** `bairro-resiste` está em estado **`preproduction-strong`**. Está apto a iniciar código assim que as regras de subida (`docs/regra-de-subida-de-jogos.md`) liberarem o slot de implementação.
