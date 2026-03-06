# Identidade Visual - Hub de Jogos da Pré-Campanha de Alexandre Fonseca para Deputado

## Direção (Tijolo 03)

Correção estratégica da linguagem visual:

- Base escura com leitura de asfalto/concreto
- Acento principal em amarelo de sinalização
- Off-white para texto forte e foco de leitura
- Vermelho apenas para tensão/alerta
- Sem eixo rosa/ciano
- Sem gradiente “tech startup”
- Sem estética neon/gaming retrô

Referência: universo urbano contemporâneo, não dashboard SaaS.

## Paleta semântica atual

| Token | Valor | Uso |
|---|---|---|
| bg | #11100e | Fundo principal |
| surface | #1b1916 | Superfícies padrão |
| surface-2 | #26221d | Camada elevada / blocos internos |
| text | #f2ede4 | Texto principal |
| text-muted | #b5ad9e | Texto de apoio |
| accent | #d6ac00 | Ação principal |
| accent-strong | #f0c419 | Hover/destaque |
| danger | #a6472d | Tensão e risco |
| border | #3a342b | Contorno e separação |
| success | #738f3d | Estado positivo |

## Tipografia e ritmo

- Fonte base: Inter
- Fonte mono: JetBrains Mono
- Hierarquia: títulos compactos, corpo com legibilidade em mobile
- Escala: clamp para H1/H2/H3 em styles/globals.css

## Textura e materialidade

- Ruído leve de superfície aplicado no body (noise overlay)
- Bordas opacas e sombras densas curtas
- Contraste alto sem brilho neon

## Componentes-base consolidados

Implementados em components/ui:

- Button
- Card
- Section
- PageHero
- StatusBadge
- MetaChip
- EmptyState
- CTACluster
- ShellContainer

Princípio: todo novo módulo deve compor com esses blocos antes de criar variações ad hoc.

## Regras de uso cromático

1. Accent é reservado para ação e foco narrativo.
2. Danger só quando há tensão real (perda, risco, conflito).
3. Text-muted nunca em conteúdo crítico.
4. Evitar múltiplos acentos concorrendo no mesmo bloco.

## Estados de interação

- Hover: mudança de borda/contraste, movimento discreto
- Focus: outline em accent-strong
- Disabled: redução de opacidade + bloqueio de interação

## Resultado da refatoração

- Todas as páginas principais migradas para mesma família visual
- Header, cards e hero unificados
- Dramaturgia visual reforçada (pauta → conflito → ação)

## Limites atuais

- Ícones e imagens finais ainda são provisórios
- Sistema de ícones dedicado entra no próximo ciclo
- Motion avançado e microanimações ainda mínimas

Última atualização: 2026-03-06
