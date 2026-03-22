# Regras de Subida de Jogos (Readiness)

Para o Hub de Jogos da Pré-Campanha funcionar como um Game Studio profissional com ritmo sustentável, a transição de um jogo do status de `Pré-Produção Forte` para a `Implementação Ativa (Active Build)` deve obedecer um *Go-Live Gate* sistêmico objetivo. Um jogo **NÃO PODE** ser implementado por impulso.

## GO-LIVE GATE: Critérios de Aprovação

Para que o primeiro commit de código de um novo jogo seja autorizado na `main`, as 5 condições abaixo devem ser atestadas como verdadeiras:

### 1. Slot de Capacidade de Engenharia Livre
A fábrica de jogos permite no máximo **1 (um)** Arcade em `active-build` ou `validating` forte ativo ao mesmo tempo para não faturar a infraestrutura e a cadência de testes.
*Ação:* Verificar se os últimos tijolos declararam fechamento do jogo anterior.

### 2. Documentação de Concept e Design Completa
A pasta de docs do jogo deve conter:
- [ ] Concept Document (Qual a dor e mecânica política?)
- [ ] Systems Design (Variáveis, loops, medidores, timers)
- [ ] Art Direction (Paletas, guias visuais e moodboards)
- [ ] **Mapeamento de Mecânicas**: O design deve obrigatoriamente referenciar mecânicas readaptáveis da `matriz-reutilizacao-arcade.md`, justificando caso opte por mecânica totalmente zero.

### 3. Vertical Slice Contract Assinado
Um documento listando estritamente:
- Escopo inicial inegociável (o que *entra* e o que *fica de fora* explicitamente).
- Limites de duração de gameplay e quantidades exatas de eventos.

### 4. Asset Pipeline e Manifesto P0 Entregues
Nenhum código front-end complexo deve começar sem que:
- O checklist de ingestão de assets (imagens, sons base) críticos do Vertical Slice Contract já esteja com paths definidos no projeto (mesmo usando caixas coloridas/placeholders intencionais temporários).

### 5. Risco Técnico Avaliado
O Editorial de Portfólio deve mapear o risco técnico do jogo:
- *O jogo testa um limite de canvas? Um sistema de arrasto não mapeado? Acessibilidade falha em telas menores?*
- O diagnóstico (mesmo que especulativo) precisa estar escrito.

---
**Nota Editorial (T53):** Qualquer solicitação para "abrir a implementação do jogo X" deve ser respondida com a avaliação formal deste checklist. Se reprovado, o status do jogo se mantém em `preproduction-strong` ou `cold-backlog`.

## Go/No-Go Estrutural (Atualização T54)
Para um jogo receber seu **Primeiro Commit Estrutural (Boilerplate + Logica Base)**, ele precisa:
1. Passar em todos os gates da Fase 2 (Contrato, Assets P0, Capacidade).
2. Utilizar obrigatoriamente os **Shared Modules** se encaixarem no design (ex: `ArcadeHUDContainer`, `ArcadeProgressBar`, `useArcadeTimer`).
3. O PR estrutural **não deve conter** artefato final ou assets que não estejam no manifest.
