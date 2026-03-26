# Relatório T81 — Public Catalog Truth Pass

## Diagnóstico
O Hub apresentava uma mistura indiscriminada de jogos "flagship" (arcades polidos) com protótipos em estágio inicial e quizzes rápidos. Isso diluía a percepção de qualidade do portal.

## Intervenções Realizadas

### 1. Modelo de Visibilidade (`PublicVisibility`)
Implementado campo obrigatório no catálogo para definir o destino de cada jogo:
- **flagship**: Jogos premium, alta fidelidade (Bairro Resiste, Tarifa Zero).
- **public_ready / beta**: Jogos funcionais prontos para descoberta.
- **secondary_quickplay**: Quizzes e narrativas curtas.
- **lab**: Protótipos, shells e ferramentas de mecânica bruta (Cidade Real).

### 2. Rebalanceamento da Homepage
- **Rail de Destaque**: Agora contém apenas `flagship`.
- **Nova Lane "Respostas Rápidas"**: Quizzes movidos para uma posição secundária, mantendo o foco do topo em experiências visuais.
- **Filtro de Verdade**: Jogos em estado `lab` ou `shell` foram removidos da home.

### 3. Implementação do Laboratório (`/lab`)
- Criada nova rota [Laboratório](file:///c:/Projetos/Hub%20Jogos%20Pr%C3%A9%20Camp/app/lab/page.tsx) para hospedar experimentos.
- Adicionada sinalização de "Ambiente de Testes" para proteger a marca do projeto.

### 4. Badges de Honestidade
O `GameCard` agora exibe etiquetas claras:
- **FLAGSHIP**: Qualidade máxima.
- **BETA**: Em validação.
- **LAB**: Protótipo/Experimento.
- **QUICK**: Formato rápido (Quiz).

## Conclusão
O Hub agora opera com um "Quality Gate" rigoroso. A vitrine pública reflete apenas o estado da arte do projeto, enquanto a inovação continua acontecendo no Laboratório sem comprometer a confiança do usuário final.
