# Relatório T84 — Bairro Resiste Production Art Pass

## 1. Diagnóstico do "Feel" Sintético (Pós-T83)
Embora o T83 tenha melhorado a legibilidade, o jogo ainda passava uma sensação de "pele sobre código":
- **Vazio Central**: O tabuleiro parecia deserto entre os pontos de interesse.
- **Hotspots Isolados**: Pareciam ícones flutuantes, sem conexão com o solo urbano.
- **Feedback Estático**: A falta de áudio e de reações físicas (shake) tornava a crise menos "urgente".

## 2. Upgrades de Arte de Produção (World Building)

### Tabuleiro como Lugar Real
Fizemos um pass de densidade no `bg-bairro-base-v1.svg`:
- **Nomenclatura**: Ruas e avenidas agora têm nomes ("Rua do Mutirão", "Av. Resistência").
- **Infraestrutura**: Linhas de energia pontilhadas e postes conectam visualmente os hotspots à base da Brigada.
- **Distritos**: Rótulos de "Zona Norte", "Zona Sul", etc., dão escala geográfica ao conflito.

### Hotspots como Mini-Cenários
Cada hotspot foi expandido para ser um "micro-local" no bairro:
- **Água**: Adição de tubulações de solo, caixa de válvulas e vazamento sutil.
- **Moradia**: Varal de roupas, pátio comunitário e silhuetas de janelas iluminadas.
- **Mobilidade**: Pintura de asfalto "BUS", semáforo ativo e corredor de trânsito denso.
- **Saúde**: Baia de ambulância, sinalização médica externa e fachada clínica limpa.

## 3. Spectacle & Arcade Juice (O "Pulo do Gato")
O jogo agora reage fisicamente ao jogador e à crise:
- **Screen Shake**: O tabuleiro inteiro vibra e sofre solavancos durante momentos de pressão crítica ou dano à integridade.
- **Dispatch Pulse**: A linha de despacho agora possui uma "cabeça de projétil" que viaja da base até o hotspot, dando peso ao comando.
- **Borda de Tensão**: Ao cair abaixo de 35% de integridade, uma borda vermelha pulsante (Tension Border) envolve o jogo.

## 4. Integração de Áudio (Gamefeel 2.0)
Implementamos o `ArcadeAudioController` (Web Audio API):
- **Despacho**: Som de movimento de alta frequência.
- **Sucesso**: Som de "Power-up" ao estabilizar um setor.
- **Alerta**: Sons de colisão leve sincronizados com o Screen Shake.
- **Outcome**: Fanfarras de vitória ou colapso.

## 5. Mobile Readiness & Screenshot Power
- **Mobile**: Testado em viewport 390x844. A densidade visual não comprometeu a jogabilidade; pelo contrário, aumentou a imersão.
- **Screenshot-Worthiness**: O jogo agora gera capturas de tela que comunicam "intensidade" e "qualidade premium" instantaneamente.

## 6. Recomendação de Status
- **Status Recomendado**: **PUBLIC_READY_BETA**
- **Justificativa**: O Bairro Resiste atingiu o patamar de "flagship showcase". Não é mais apenas um protótipo funcional, mas um produto visualmente convincente que representa a linha Arcade do Hub com Spectacle e Storytelling Ambiental.

---
**Status Final**: CONCLUÍDO
**Arquivos Modificados**:
- `BairroResisteArcadeGame.tsx` & `.module.css`
- `bg-bairro-base-v1.svg`
- `entity-hotspot-*.svg`
