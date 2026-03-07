# Avatar Oficial - Alexandre Fonseca

## Objetivo do avatar

O avatar oficial de Alexandre Fonseca é o personagem principal recorrente do Hub de Jogos da Pré-Campanha.

Papel do avatar:
- Representar visualmente Alexandre Fonseca em linguagem de jogo estilizada
- Funcionar como âncora visual para toda a linha de jogos
- Carregar identidade eleitoral em linguagem acessível, não institucional
- Suportar crescimento de formatos simples até RPG/plataforma/tycoon
- Ser reconhecível e memorável para compartilhamento

## Por que ele existe no produto

Razões estratégicas:
1. Todo jogo precisa terminar com card compartilhável que leva marca pessoal de Alexandre
2. Formatos futuros (RPG político, plataforma territorial, tycoon de políticas públicas) precisam de protagonista consistente
3. Compartilhamento funciona melhor com elemento humano/personagem do que com logotipo abstrato
4. Avatar permite presença de campanha sem transformar jogo em panfleto duro

## Traços principais a preservar

Base de referência: fotografia fornecida de Alexandre Fonseca.

Elementos visuais a manter reconhecíveis:
- Formato do rosto
- Expressão firme mas acessível
- Traços faciais distintivos
- Postura de engajamento

## Regras de estilização

Linguagem visual:
- 2D estilizado, não realismo fotográfico
- Inspiração: portrait de personagem de jogo político/narrativo, não caricatura
- Tom: sério mas acessível, engajado mas não agressivo
- Compatível com estética já estabelecida no hub (VR Abandonada, etc.)

Aplicação técnica:
- Formato base: SVG editável quando possível
- Derivações: PNG para uso direto em cards/share
- Paleta: usar cores da campanha definidas em design tokens

Expressões permitidas:
- Neutra/firme (padrão)
- Determinada
- Reflexiva
- Acessível/positiva

Expressões a evitar:
- Sorrisos exagerados/artificiais
- Cara de meme/zoeira
- Seriedade excessiva/autoritária
- Caricatura ofensiva

## Variações permitidas

Tamanhos/crops:
- **Busto completo**: uso em hero sections, capa de jogo
- **Portrait**: uso em card final, share pages
- **Head icon**: uso em tokens, chips, menu
- **Sprite base**: futuro uso em jogo de plataforma/RPG

Contextos:
- Background neutro (padrão)
- Background de cidade/território (para jogos territoriais)
- Background de conflito político (para jogos de orçamento/denúncia)

## Usos permitidos

Onde o avatar deve aparecer:
- Card final universal de todo jogo
- Share pages
- Home/Explorar quando fizer sentido
- Outcome pages
- Intro de jogos quando couber
- Futuros sprites de gameplay

Onde o avatar NÃO deve aparecer:
- Como logotipo institucional fora de contexto de jogo
- Em contextos que descaracterizem a campanha
- Em peças que não estejam ligadas ao hub

## O que evitar

Erros comuns a não cometer:
- Usar foto crua como solução final
- Criar múltiplas versões inconsistentes
- Aplicar em contextos que virem meme negativo
- Esquecer de testar legibilidade mobile
- Criar versão tão estilizada que perde reconhecimento

## Atualização V2 (Tijolo 23)

Referências recebidas e incorporadas:
- Retrato sorrindo em fundo limpo
- Referências com e sem óculos
- Referências de corpo inteiro
- Referência em frente à CSN
- Referência com camiseta VR Abandonada

Consolidação facial e estilização aplicada:
- Barba cheia como traço principal de reconhecimento
- Cabelo escuro curto com volume superior
- Sobrancelhas definidas e olhos escuros
- Estrutura de rosto alongado e maxilar marcado
- Óculos como variante opcional (não padrão)

Decisões de design V2:
- Expressões oficiais: `neutral`, `smile`, `determined`
- Óculos: contrato `auto | on | off` no `CampaignAvatar`
- `fullBody` adicionado no contrato para evolução futura sem quebra
- Avatar continua em linguagem de personagem/jogo (não foto aplicada)

Assets V2 criados:
- `public/campaign/avatar/v2/portrait-neutral.svg`
- `public/campaign/avatar/v2/portrait-smile.svg`
- `public/campaign/avatar/v2/portrait-determined.svg`
- `public/campaign/avatar/v2/portrait-glasses.svg`

Plano para full-body:
- V2 atual foca busto para share/outcomes
- Próxima etapa (Tijolo 24+) cria variação full-body com poses de campanha
- Manter a mesma anatomia facial para continuidade visual

## Limitações técnicas atuais

Versão atual (Tijolo 24):
- V2 já é reconhecível e operacional, mas ainda passível de refinamento artístico profissional
- Sem sprites animados
- Full-body preparado no contrato, mas ainda não desenhado

Próximos passos:
- Refinar traços com ilustrador e criar kit de poses
- Gerar variações por contexto territorial (VR, RJ, série)
- Criar sprite sheets quando formatos maiores forem implementados

## Referências visuais

Inspiração de linguagem (não de identidade):
- Portrait de personagens de jogos políticos narrativos
- Ilustração editorial política mas em tom de jogo
- Visual novels com personagens realistas mas estilizados

Anti-referências (evitar):
- Caricatura política tradicional
- Foto com filtro aplicado
- Avatar corporativo genérico

## Governança do asset

Responsável pela manutenção: principal product engineer do hub

Processo de atualização:
1. Mudanças no avatar oficial devem preservar reconhecibilidade
2. Novas variações devem seguir as regras deste documento
3. Substituição de asset base deve manter estrutura do componente `CampaignAvatar`
4. Qualquer uso fora do hub deve ser aprovado

Versionamento:
- V1 (Tijolo 22): placeholder técnico/estilizado
- V2 (Tijolo 23): conjunto de expressões reconhecível + variante com óculos
- V2.1 (Tijolo 24): uso experimental consolidado com card final A/B (com/sem QR)
- V3+ (Tijolo 25+): full-body, animações leves e sprites de gameplay

Última atualização: Tijolo 24 (2026-03-06)
