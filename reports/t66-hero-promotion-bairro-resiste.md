# T66 - Hero Promotion Test (Bairro Resiste)

**Status**: Experimento Ativo  
**Veredito**: Promoção controlada (Rollout 100% para Bairro Resiste)  
**Data**: 22 de Março de 2026

## 1. O que foi mudado
- **Feature Flag**: Criado o experimento `hub-hero-variant` em `lib/experiments/registry.ts`.
- **Conteúdo Hero**: Implementada variante para `bairro-resiste` com copy focado em missão territorial e gestão de crise.
- **Trust Signals**: Adicionada linha de micro-sinais sob o hero para elevar a confiança do usuário (Missão curta, Validado, Prioridades reais).
- **Fallback**: O código mantém `tarifa-zero-rj` como variante de controle 100% funcional e reversível.

## 2. Onde a Flag vive
A configuração de peso e ativação do Hero está em:
`c:\Projetos\Hub Jogos Pré Camp\lib\experiments\registry.ts`

```typescript
  'hub-hero-variant': {
    variants: [
      { key: 'tarifa-zero-rj', weight: 0 },
      { key: 'bairro-resiste', weight: 100 },
    ],
  }
```

## 3. Analytics e Telemetria
Implementados novos eventos para rastrear o funil de entrada:
- `hero_impression`: Captura qual variante o usuário viu ao entrar no Hub.
- `hero_primary_cta_click`: Clique no botão principal (converte para o arcade).
- `hero_secondary_cta_click`: Clique no botão secundário (converte para o quick).

**Metadados inclusos**: `hero_variant`, `game_slug`, `source_surface = "hub_hero"`.

## 4. Responsividade e Performance
- O novo layout foi verificado para mobile portrait, tablet e desktop.
- CTAs empilham corretamente em telas pequenas.
- Trust signals mantêm espaçamento rítmico.

## 5. Riscos e Follow-up
- **Risco**: Tráfego frio vindo do Hero pode apresentar taxa de conclusão menor que a amostra técnica do T65.
- **Ação**: Monitorar o dashboard `/estado` nos próximos 7 dias para comparar o desempenho real da variante `bairro-resiste`.

---
*Relatório de Implementação T66 - Portfólio Hub Jogos*
