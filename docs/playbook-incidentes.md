# Playbook de Incidentes Temporais

Versao: Tijolo 20
Escopo: cockpit temporal, operacao diaria humana, resposta leve e auditavel.

## Como usar

1. Identifique o sintoma no `/estado` ou `npm run beta:ops`.
2. Execute as checagens rapidas na ordem.
3. Tome a acao imediata correspondente.
4. Registre follow-up em `ops_audit_log` (quando aplicavel) e no report operacional.

## Severidade rapida

- `🟢 INFO`: observar e continuar rotina.
- `🟡 WARNING`: agir no mesmo dia util, monitorar no proximo ciclo (6h).
- `🔴 CRITICO`: agir em 1-2h, confirmar recuperacao.

## 1) Staleness > 72h

Sintoma:
- `beta:staleness-check` com alerta critico.
- `/estado` mostra ultimo evento remoto muito antigo.

Hipotese provavel:
- Supabase indisponivel.
- Captura de eventos interrompida.
- Campanha pausada sem anotacao operacional.

Checagens rapidas:
- `npm run beta:ops` (conectividade e ultimo evento).
- `npm run beta:staleness-check`.
- Ultimos runs de `.github/workflows/ops-routine.yml`.

Acao imediata:
- Se Supabase offline: validar chaves/env e disponibilidade.
- Se Supabase online e sem evento: validar fluxo de evento em `/play/[slug]`.
- Rodar snapshot manual: `npm run beta:snapshot`.

Acao de follow-up:
- Registrar causa raiz e tempo de recuperacao.
- Confirmar queda dos alertas no proximo ciclo de 6h.

## 2) /estado "morto" ou sem evento recente

Sintoma:
- `/estado` carrega sem erro, mas sem evento novo por muito tempo.

Hipotese provavel:
- Janela selecionada curta com amostra baixa.
- Fonte remota desatualizada.
- Evento nao sendo enviado em algum engine.

Checagens rapidas:
- Trocar janela: `24h -> 7d -> 30d`.
- Conferir amostra e warning de baixa amostra.
- Rodar `npm run beta:ops` e comparar ultimo evento remoto.

Acao imediata:
- Se for apenas baixa amostra: monitorar (nao escalar).
- Se evento remoto parado com trafego esperado: abrir investigacao tecnica.

Acao de follow-up:
- Documentar janela usada para a decisao.
- Se recorrente, adicionar teste de regressao de tracking.

## 3) Experimento ativo sem trafego

Sintoma:
- `/estado` e `beta:ops` listam experimento ativo sem trafego.

Hipotese provavel:
- Flag ativa sem superficie recebendo visitas.
- Override de env forçando estado incorreto.
- Chave de experimento sem instrumentacao no fluxo atual.

Checagens rapidas:
- Conferir `EXPERIMENTS_OVERRIDE` e status no registry.
- Verificar `experiment_performance` no snapshot/export.
- Validar se a superficie do experimento esta em rota ativa.

Acao imediata:
- Se nao era para estar ativo: desativar ou remover override.
- Se era para estar ativo: validar instrumentacao e pontos de entrada.

Acao de follow-up:
- Registrar decisao (manter ativo, pausar ou corrigir tracking).
- Revalidar em 24h.

## 4) Feedback prioritario parado

Sintoma:
- `beta:ops` mostra pendencias prioritarias > 0.
- Alertas operacionais apontam backlog prioritario.

Hipotese provavel:
- Triagem nao executada no ciclo.
- Token de operacao nao configurado em quem esta triando.

Checagens rapidas:
- Abrir `/estado/feedback`.
- Conferir token de operacao e atualizacao de status.
- Verificar `ops_audit_log` para acoes recentes de triagem.

Acao imediata:
- Triar prioritarios para `reviewed` quando apropriado.
- Registrar justificativa se item permanecer prioritario.

Acao de follow-up:
- Ajustar ritmo de triagem diaria.
- Revisar limite de carga de pendencias.

## 5) Divergencia forte entre 24h e 7d

Sintoma:
- Comparacao leve em `/estado` mostra delta abrupto (trafego, share/reentry, top CTA).

Hipotese provavel:
- Pico pontual recente.
- Mudanca de origem de trafego.
- Amostra curta insuficiente na janela de 24h.

Checagens rapidas:
- Conferir amostra em ambas as janelas.
- Conferir top origens e eventos por tipo.
- Verificar deploy/mudanca recente no periodo.

Acao imediata:
- Com amostra baixa: monitorar, sem acao estrutural.
- Com amostra suficiente e queda real: priorizar investigacao de funil.

Acao de follow-up:
- Registrar se foi ruido ou tendencia.
- Reavaliar em 24h e em 7d.

## 6) CTA com exposicao e clique muito baixo

Sintoma:
- Placement com alta exposicao e clique irrelevante.

Hipotese provavel:
- Copy/posicionamento fraco.
- CTA em superficie errada para aquele publico.

Checagens rapidas:
- Conferir CTR por placement em `/estado`.
- Conferir top CTAs e categoria/tracking id.
- Comparar 24h vs 7d para descartar ruido.

Acao imediata:
- Ajustar copy/ordem de CTA com mudanca pequena e reversivel.
- Evitar troca ampla sem amostra minima.

Acao de follow-up:
- Recoletar por 7d antes de decisao permanente.

## Quando agir vs quando monitorar

Agir agora:
- Staleness critico (>72h).
- Supabase online com evento parado sem explicacao.
- Prioritarios acumulando sem triagem.

Apenas monitorar:
- Divergencia com amostra baixa.
- Experimento recem-ativado sem volume inicial.
- Oscilacao de 24h sem repeticao em 7d.

## Comandos uteis

```bash
npm run beta:ops
npm run beta:staleness-check
npm run beta:snapshot
npm run ops:check-alerts
npm run beta:export
```
