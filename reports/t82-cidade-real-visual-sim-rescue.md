# Relatório T82 — Cidade Real Visual Sim Rescue

## 1. Diagnóstico do Protótipo (LAB)
O protótipo anterior de "Cidade Real" sofria de:
- **Abstração Excessiva**: O jogador interagia apenas com sliders de 0-100 por categoria.
- **Invisibilidade do Mundo**: Não havia representação de território, apenas labels e ícones.
- **Feedback Passivo**: As consequências eram lidas apenas em textos de alerta ou no resultado final.
- **Falta de Verbos de Jogo**: A única ação era "alocar orçamento", o que parecia uma planilha, não um simulador de cidade.

## 2. Redesign: Simulação Centrada no Território
A versão resgatada abandona os sliders em favor de um tabuleiro tático.

### Nova Fantasia do Jogador
O jogador agora atua como um articulador urbano que precisa escolher **Projetos Táticos** para responder a **Crises Distritais**, equilibrando a saúde de diferentes zonas da cidade sob escassez de recursos.

### Loop de Gameplay
1. **Revelação da Crise**: Uma sobreposição visual indica qual distrito ou setor está sob pressão (ex: Crise Sanitária na Vila Popular).
2. **Seleção de Projetos**: O jogador escolhe entre cartas de projetos (ex: UPA 24h, Tarifa Zero) com custos e impactos territoriais específicos.
3. **Simulação e Reação**: Os indicadores de "Integridade Distrital" reagem visualmente com barras de progresso animadas e mudanças de cor.
4. **Resolução**: O resultado final é calculado com base na "Dignidade Urbana" (saúde média dos distritos).

## 3. Modelo de Distritos
- **Vila Popular**: Foco em saneamento e saúde básica.
- **Centro Histórico**: Foco em habitação social e manutenção.
- **Polo Industrial**: Foco em transporte e logística.
- **Residencial Nobre**: Foco em serviços e zeladoria.

## 4. Critérios de Re-entrada (Gate de Qualidade)
Cidade Real foi movido de volta para os trilhos públicos (`public_ready_beta`) por atender aos seguintes critérios:
- [x] **Visibilidade do Estado do Mundo**: Tabuleiro de distritos legível.
- [x] **Loop de Simulação Real**: Ciclo de Crise -> Ação -> Consequência.
- [x] **Verbos Claros**: Escolher Projetos vs. Mover Sliders.
- [x] **Baseline de Diversão**: Feedback tátil e visual a cada turno.

## 5. Riscos e Recomendações
- **Mobile**: O tabuleiro atual escala bem, mas testes adicionais em telas < 360px são recomendados para garantir que as cartas de projeto fiquem acessíveis.
- **Próximos Passos**: Adicionar eventos aleatórios de "Vida Urbana" para aumentar a replayability.

---
**Resultado**: CIDADE REAL RESGATADA. Pronto para reintrodução beta no portal.
