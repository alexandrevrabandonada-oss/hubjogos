# Game Feel e Diversao

## Objetivo

Garantir que o hub seja divertido primeiro: inicio rapido, decisao clara e vontade de jogar de novo.

## Principios

- Tempo para primeira acao curto (alvo: menos de 15s apos intro).
- Feedback legivel a cada decisao.
- Resultado com convite explicito para replay e comparacao de rota.
- Linguagem politica sem tom de sermo ou panfleto.

## Padroes aplicados

1. Intro curta por engine
- Bloco de "Comeco rapido" em `EngineIntro`.
- CTA principal de entrada simplificado para `Jogar agora`.

2. Outcome com loop de replay
- Bloco de convite para testar outra estrategia.
- Botao principal de reinicio renomeado para `Jogar de novo`.
- Instrumentacao de intencao de replay e retorno ao hub.

3. Reentrada no share
- CTA principal focada em nova rodada.
- CTA secundaria focada em comparacao com outro jogo.
- Medicao de `share_page_play_click` para conversao share -> play.

4. Assinatura de campanha discreta
- Componente reutilizavel `CampaignMark`.
- Presenca leve em header e superfices de descoberta.

## Sinais para acompanhar em /estado

- `first_interaction_time`
- `replay_click`
- `outcome_replay_intent`
- `share_page_play_click`
- `campaign_mark_click`
- `return_to_hub_after_outcome`

## Limites deste ciclo

- Sem nova engine.
- Sem auth obrigatoria.
- Sem CMS/admin.
- Sem aumento de escopo operacional fora do cockpit atual.
