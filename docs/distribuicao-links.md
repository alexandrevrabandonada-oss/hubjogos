# Distribuição de Links de Campanha

## Objetivo

Facilitar a distribuição organizada dos quick games por canal, território e série, com links rastreáveis para medir eficácia da distribuição.

## Sistema de Links

Todos os links de campanha incluem:

- **UTM Source**: canal de origem (instagram, whatsapp, tiktok, etc.)
- **UTM Medium**: tipo de mídia (social, messaging, organic, etc.)
- **UTM Campaign**: nome da campanha (pre-campanha-alexandre-fonseca)
- **UTM Content**: conteúdo específico (nome do jogo, home, explorar)
- **Parâmetros de contexto**: territorio, serie, jogo

## Canais Prioritários

1. **Instagram** (utm_source=instagram, utm_medium=social)
2. **WhatsApp** (utm_source=whatsapp, utm_medium=messaging)
3. **TikTok** (utm_source=tiktok, utm_medium=social)

## Canais Secundários

4. **Bio/Link Hub** (utm_source=bio, utm_medium=bio-link)
5. **Direto/Site** (utm_source=direto, utm_medium=organic)
6. **Telegram** (utm_source=telegram, utm_medium=messaging)
7. **Twitter** (utm_source=twitter, utm_medium=social)
8. **Facebook** (utm_source=facebook, utm_medium=social)
9. **YouTube** (utm_source=youtube, utm_medium=video)

## Territórios Prioritários

1. **estado-rj** (semana 1, foco principal)
2. **volta-redonda** (semana 2, comparação local)

## Séries Prioritárias

1. **serie-solucoes-coletivas** (semana 1)
2. **serie-trabalho-sobrevivencia** (semana 2)

## Quick Games

1. **cidade-em-comum** (quiz sobre bens comuns)
2. **custo-de-viver** (quiz sobre custo de vida)
3. **quem-paga-a-conta** (quiz sobre orçamento público)

## Estrutura de Pacotes

### Por Território

Pacotes contêm links para:
- Home
- Explorar
- Cada quick game

Nos canais prioritários (Instagram, WhatsApp, TikTok).

### Por Canal

Pacotes contêm links para:
- Home
- Explorar
- Cada quick game

Com opções de território quando aplicável.

### Por Série

Pacotes contêm links para:
- Cada quick game da série

Nos canais prioritários.

## Geração de Links

### Comando

```bash
npm run campaign:links
```

Gera arquivo markdown em `reports/distribution/links/campaign-links-YYYY-MM-DDTHH-MM-SS.md`.

### Formato JSON

```bash
npm run campaign:links -- --format=json
```

Gera arquivo JSON para integração programática.

## Uso Operacional

### Semana 1: Estado do RJ + Série Soluções Coletivas

1. Abrir pacote `territorio-estado-rj.md`
2. Copiar links específicos para posts
3. Distribuir nos 3 canais prioritários (Instagram, WhatsApp, TikTok)
4. Começar com `cidade-em-comum`
5. Alternar com `custo-de-viver` e `quem-paga-a-conta` ao longo da semana
6. Monitorar progresso em `/estado`

### Semana 2: Volta Redonda + Série Trabalho-Sobrevivência

1. Abrir pacote `territorio-volta-redonda.md`
2. Distribuir `custo-de-viver` e `quem-paga-a-conta`
3. Balancear exposição entre territórios
4. Checar progresso de coleta no `/estado`

## Integração com Rastreamento

Todos os links gerados são automaticamente rastreados via:

- **Supabase Events**: captura source, medium, campaign
- **Métricas Quick**: agregação por jogo/série/território
- **Status de Coleta**: acompanhamento de metas

## Exemplo de Link

```
https://hub-jogos-pre-campanha.vercel.app/play/cidade-em-comum?utm_source=instagram&utm_medium=social&utm_campaign=pre-campanha-alexandre-fonseca&utm_content=cidade-em-comum&territorio=estado-rj&serie=serie-solucoes-coletivas&jogo=cidade-em-comum
```

Componentes:
- **Jogo**: cidade-em-comum
- **Canal**: Instagram (source=instagram, medium=social)
- **Campanha**: pre-campanha-alexandre-fonseca
- **Território**: estado-rj
- **Série**: serie-solucoes-coletivas

## Próximos Passos

Ver `docs/operacao-semanal-distribuicao.md` para instruções operacionais completas.
