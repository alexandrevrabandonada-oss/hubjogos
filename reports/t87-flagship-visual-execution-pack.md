# Relatório T87 — Flagship Visual Execution Pack

## 1. Diagnóstico de Gap (Doutrina vs Execução)
Embora a doutrina de **Visual-First** tenha sido estabelecida, os atuais carros-chefe ainda carregam vestígios de protótipos funcionais:
- **Bairro Resiste**: Possui excelente feedback, mas a arte do tabuleiro ainda é um SVG estático que não reflete o "caos" ou a "vida" de forma dinâmica (ex: falta de fumaça, luzes de emergência ou tráfego).
- **Cidade Real**: Permanece visualmente ancorado em cartões de interface. O jogador não "vê" a cidade como um mapa ou território vivo, mas como uma coleção de indicadores glassmórficos.

Este pack define os alvos necessários para remover o "vibe de protótipo" e alcançar o status de **FLAGSHIP**.

---

## 2. Bairro Resiste: Flagship Execution Pack

### Alvos de Arte e Cenário
- [ ] **Tabuleiro Dinâmico**: O SVG base deve ter camadas de "Estado de Crise" (ex: overlay de fumaça em setores críticos, luzes de viaturas pulsando).
- [ ] **Hotspots Vivos**: Adicionar micro-animações nas entidades (ex: água vazando se a pressão estiver alta, luzes das casas piscando em Moradia).
- [ ] **Brigada Visual**: O ponto de comando central deve ter um asset que sugira uma "base de operações" real.

### Alvos de Espetáculo (Juice)
- [ ] **Pressure Spread FX**: Linhas de energia/tensão irradiando de setores críticos para setores vizinhos.
- [ ] **Collapsing Screen**: Quando a integridade cai abaixo de 20%, a tela deve ganhar uma vinheta de interferência analógica ou "rachaduras" visuais.
- [ ] **Dispatch Impact**: O pulso de despacho deve causar um pequeno "impacto" visual (esmagamento/esticamento) no hotspot ao chegar.

### Alvos de Gamefeel
- [ ] **Radio Chatter**: Feedback textual/auditivo narrativo (ex: "Setor Água pedindo reforço!", "Moradia estabilizada!").
- [ ] **Tension Audio**: O som ambiente deve subir de tom conforme a Fase 3 (Caos Total) se aproxima.

---

## 3. Cidade Real: Living City Execution Pack

### Alvos de Arte e Reatividade
- [ ] **City Map View**: Substituir o grid de cartões por uma representação de mapa (mesmo que estilizada/isométrica) onde os distritos se encaixam geograficamente.
- [ ] **City-State Reactivity**: 
    - **Prosperidade**: Distritos com saúde > 80% devem ganhar ícones de "luzes brilhantes" ou "árvores".
    - **Negligência**: Distritos críticos devem ganhar ícones de "protesto" ou "manchas de poluição".
- [ ] **Crisis Spectacle**: A crise não deve ser apenas um banner, mas uma "mancha" ou ícone enorme sobre o distrito afetado no mapa.

### Alvos de Feedback de Intervenção
- [ ] **Construction Surge**: Ao aplicar um projeto, uma onda de "construção" (ícones de ferramentas ou andaimes temporários) deve aparecer sobre os distritos beneficiados.
- [ ] **Public Mood**: Pequenos "emojis" subindo dos distritos após uma ação (😊 para melhoria, 😠 para decaimento).

---

## 4. Checklist de Assets (Produção Pronta)

| Jogo | Background | Entidades | FX / Juice | UI / HUD |
| :--- | :--- | :--- | :--- | :--- |
| **Bairro Resiste** | Mapa c/ Ruas e Nomes | Hotspots Cenográficos | Shake, Flash, Pulse | Bio-HUD, Timer Mono |
| **Cidade Real** | Mapa de 4 Distritos | Mini-Cidades reativas | Glow de Saúde, Shake | Painel de Comando |

---

## 5. Scene Targets (Os 5 Prints do Sucesso)
Para ser **Flagship**, o jogo deve garantir estes momentos visuais:
1. **First 10 Seconds**: O jogador deve ver um mundo vibrante e entender o que defender.
2. **Mid-Crisis**: O mapa deve mostrar claramente onde o conflito está acontecendo.
3. **Near-Collapse**: Tensão máxima visual (cores quentes, tremores, alertas).
4. **Successful Stabilization**: Alívio visual (cores frias/limpas, brilho de sucesso).
5. **Post-Result**: Um card final que mostre o "antes e depois" ou o estado final da cidade.

---

## 6. Gates de Promoção e Status

| Critério | Bairro Resiste | Cidade Real |
| :--- | :--- | :--- |
| **Mundo Visível?** | ✅ Sim | ⚠️ Parcial (Cards) |
| **Feedback Táctil?** | ✅ Alto | ⚠️ Médio |
| **Screenshot Power?** | ⬆️ Necessita Detalhes | ⬆️ Necessita Mapa Real |
| **Diversão < 20s?** | ✅ Sim | ✅ Sim |

### Status Truth Rules (Pós-T87):
- **Bairro Resiste**: **PUBLIC_READY_BETA** (Rumo a FLAGSHIP com upgrades de Juice/Arte Final).
- **Cidade Real**: **PUBLIC_READY_BETA** (Necessita de transição para "Map View" para ser FLAGSHIP_CANDIDATE).

---

**Recomendação de Próximo Passo**: Iniciar o ciclo de produção de **Juice Final** para Bairro Resiste e o protótipo de **Map View** para Cidade Real.
