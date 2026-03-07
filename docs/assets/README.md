# Assets da Campanha

## Estrutura de diretórios

```
public/
  campaign/
    avatar/
      base.svg          # Avatar base SVG editável
      portrait.png      # Portrait derivado para cards
      icon.png          # Ícone pequeno para tokens
      busto.png         # Busto completo para hero sections
      
    share/
      frame-base.svg    # Moldura padrão de share card
      background.svg    # Background neutro
      
    brand/
      logo.svg          # Logo do hub (se necessário)
```

## Convenções de nomenclatura

Padrão:
- Lowercase com hífens
- Sem espaços
- Extensão explícita

Exemplos:
- `avatar-base.svg`
- `portrait-neutral.png`
- `icon-determined.png`

## Formatos e uso

### SVG
Uso: assets editáveis, base para derivações
Onde: avatar base, molduras, fundos

### PNG
Uso: assets prontos para uso direto
Onde: cards, share pages, outcomes

### Resolução

Target:
- Cards de compartilhamento: 1200x630 (Facebook/Twitter)
- Avatar portrait: 400x400
- Avatar icon: 64x64

Mobile-first:
- Testar legibilidade em telas pequenas
- Garantir contraste suficiente

## Pipeline de asset

Fluxo atual (Tijolo 22):
1. Asset base criado como placeholder técnico SVG
2. Componente `CampaignAvatar` consome o asset
3. Sistema `FinalShareCard` usa avatar para composição de card final

Fluxo futuro:
1. Designer/ilustrador refina asset seguindo `docs/avatar-oficial-alexandre-fonseca.md`
2. Asset refinado substitui placeholder mantendo mesma estrutura
3. Componentes continuam funcionando sem mudança de código

## Qualidade e validação

Checklist de novo asset:
- [ ] Legível em mobile (mínimo 320px de largura)
- [ ] Contraste suficiente com background
- [ ] Reconhecível em tamanho pequeno (64x64)
- [ ] Consistente com identidade visual do hub
- [ ] Arquivo otimizado (SVG limpo, PNG comprimido)
- [ ] Testado em card de compartilhamento real

## Governança

Adição de novo asset:
1. Seguir convenções deste documento
2. Documentar uso no README
3. Testar em componentes antes de commit

Remoção de asset:
1. Verificar uso em componentes
2. Atualizar componentes antes de remover
3. Documentar remoção

Última atualização: Tijolo 22 (2026-03-06)
