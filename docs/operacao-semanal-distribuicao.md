# Operação Semanal de Distribuição - Quick Games

## Objetivo

Executar distribuição disciplinada dos quick games por território, série e canal, coletando amostra mínima comparável para permitir decisão honesta sobre formato médio.

---

## Princípios Operacionais

1. **Priorizar coleta antes de escala:** atingir meta mínima em todos os quicks antes de empurrar só um
2. **Distribuir de forma balanceada:** alternar entre jogos para evitar viés de novidade
3. **Manter rastreabilidade:** usar sempre links com UTMs corretos
4. **Checar progresso regularmente:** monitorar `/estado` e `beta:distribution-report`
5. **Não concluir cedo demais:** esperar meta mínima (80 sessões/território, 60 sessões/quick na janela 7d)

---

## Estrutura Temporal

### Ciclo de 14 dias

**Semana 1:** Território estado-rj + Série solucoes-coletivas  
**Semana 2:** Território volta-redonda + Série trabalho-sobrevivencia

**Objetivo:** Ao final de 14 dias, ter amostra mínima comparável por quick/série/território.

---

## Semana 1: Estado do RJ

### Objetivo
- Consolidar amostra do território estado-rj
- Priorizar série-solucoes-coletivas
- Atingir 80+ sessões no território

### Quick Games e Ordem

1. **Cidade em Comum** (dias 1-2)
   - Jogo central da série-solucoes-coletivas
   - Meta: 30 sessões
   - Canais: Instagram + WhatsApp

2. **Custo de Viver** (dias 3-4)
   - Série trabalho-sobrevivencia, contexto RJ
   - Meta: 25 sessões
   - Canais: TikTok + WhatsApp

3. **Quem Paga a Conta** (dias 5-7)
   - Série solucoes-coletivas, orçamento estadual
   - Meta: 25 sessões
   - Canais: Instagram + WhatsApp

### Rotina Diária

**Segunda-feira (Dia 1):**
- [ ] Abrir pacote `territorio-estado-rj.md`
- [ ] Copiar link de Cidade em Comum para Instagram
- [ ] Postar story + post no Instagram
- [ ] Enviar em 3-5 grupos de WhatsApp
- [ ] Checar `/estado` no fim do dia

**Terça-feira (Dia 2):**
- [ ] Reforçar Cidade em Comum
- [ ] Postar TikTok sobre o jogo
- [ ] Enviar em listas de transmissão WhatsApp
- [ ] Responder engajamento

**Quarta-feira (Dia 3):**
- [ ] **Checkpoint:** rodar `npm run beta:distribution-report`
- [ ] Verificar se Cidade em Comum atingiu 50% da meta (15 sessões)
- [ ] Alternar para Custo de Viver
- [ ] Postar em Instagram + TikTok
- [ ] Enviar em grupos WhatsApp

**Quinta-feira (Dia 4):**
- [ ] Reforçar Custo de Viver
- [ ] Engajar em comentários/mensagens

**Sexta-feira (Dia 5):**
- [ ] Alternar para Quem Paga a Conta
- [ ] Postar em Instagram
- [ ] Enviar em grupos WhatsApp

**Sábado/Domingo (Dias 6-7):**
- [ ] Reforçar Quem Paga a Conta
- [ ] Usar WhatsApp status
- [ ] **Checkpoint final:** rodar `npm run beta:distribution-report`
- [ ] Avaliar se estado-rj atingiu meta (80+ sessões)

### Decisão no Fim da Semana 1

**Se meta atingida (80+ sessões):**
- Avançar para Semana 2 (volta-redonda)

**Se meta não atingida (< 80 sessões):**
- Repetir distribuição estado-rj por mais 3-4 dias
- Identificar jogo com menor amostra
- Reforçar distribuição do jogo mais fraco

---

## Semana 2: Volta Redonda

### Objetivo
- Consolidar amostra do território volta-redonda
- Priorizar série-trabalho-sobrevivencia
- Atingir 80+ sessões no território
- **Permitir comparação:** volta-redonda vs. estado-rj

### Quick Games e Ordem

1. **Custo de Viver** (dias 1-2)
   - Tema central para Volta Redonda
   - Meta: 30 sessões
   - Canais: Instagram + WhatsApp (grupos locais)

2. **Quem Paga a Conta** (dias 3-4)
   - Orçamento municipal, contexto local
   - Meta: 25 sessões
   - Canais: TikTok + WhatsApp

3. **Cidade em Comum** (dias 5-7)
   - Soluções coletivas para cidade industrial
   - Meta: 25 sessões
   - Canais: Instagram + WhatsApp

### Rotina Diária

**Segunda-feira (Dia 1):**
- [ ] Abrir pacote `territorio-volta-redonda.md`
- [ ] Copiar link de Custo de Viver para Instagram
- [ ] Postar com geotag de Volta Redonda
- [ ] Enviar em grupos locais de WhatsApp
- [ ] Checar `/estado` no fim do dia

**Terça-feira (Dia 2):**
- [ ] Reforçar Custo de Viver
- [ ] Enviar em listas locais WhatsApp

**Quarta-feira (Dia 3):**
- [ ] **Checkpoint:** rodar `npm run beta:distribution-report`
- [ ] Comparar volta-redonda vs. estado-rj
- [ ] Alternar para Quem Paga a Conta
- [ ] Postar em Instagram + TikTok

**Quinta-feira (Dia 4):**
- [ ] Reforçar Quem Paga a Conta
- [ ] Engajar em comentários

**Sexta-feira (Dia 5):**
- [ ] Alternar para Cidade em Comum
- [ ] Postar em Instagram
- [ ] Enviar em grupos locais

**Sábado/Domingo (Dias 6-7):**
- [ ] Reforçar Cidade em Comum
- [ ] **Checkpoint final:** rodar `npm run beta:distribution-report`
- [ ] Avaliar se volta-redonda atingiu meta (80+ sessões)
- [ ] **DECISÃO CRÍTICA:** checar se ambos os territórios têm amostra mínima

### Decisão no Fim da Semana 2

**Se ambos territórios atingiram meta:**
- ✅ Amostra mínima consolidada
- ✅ Comparação território viável
- ✅ Pronto para Tijolo 29 (decisão sobre formato médio)

**Se apenas um território atingiu meta:**
- Reforçar distribuição no território mais fraco por 3-4 dias
- Balancear exposição entre territórios

**Se nenhum território atingiu meta:**
- Estender distribuição por mais 1 semana
- Ajustar estratégia de canais
- Identificar bloqueios (amostra insuficiente de share, replay, etc.)

---

## Experimento QR A/B

### Durante Toda a Operação

O experimento QR A/B continua rodando em paralelo.

**Objetivo:**
- Balancear exposição entre `with-qr` e `without-qr`
- Meta: 60 sessões por variante, 20 QR views, 8 QR clicks

**Ação:**
- Distribuir de forma natural (não forçar QR)
- Checar progresso em `/estado` semanalmente
- Se desequilíbrio > 20%, ajustar distribuição

**Checagem:**
- Semana 1: verificar delta de sessões entre variantes
- Semana 2: avaliar se QR views/clicks estão crescendo

---

## Checklist de Execução

### Início de Cada Semana
- [ ] Identificar território e série foco
- [ ] Abrir pacote de território correspondente
- [ ] Listar grupos/canais prioritários
- [ ] Preparar textos contextualizados

### Meio da Semana (Dia 3)
- [ ] Rodar `npm run beta:distribution-report`
- [ ] Checar `/estado` para progresso
- [ ] Ajustar distribuição se necessário
- [ ] Identificar jogo com menor amostra

### Fim da Semana (Dia 7)
- [ ] Rodar `npm run beta:distribution-report`
- [ ] Avaliar se meta foi atingida (80+ sessões)
- [ ] Comparar séries (solucoes-coletivas vs. trabalho-sobrevivencia)
- [ ] Comparar territórios (estado-rj vs. volta-redonda)
- [ ] **DECIDIR:** continuar ou avançar para próxima fase

---

## Critérios de Não-Concluir Cedo

❌ **NÃO avançar para Tijolo 29 se:**
- Algum território está abaixo de 80 sessões (janela 7d)
- Algum quick está abaixo de 60 sessões (janela 7d)
- Alguma série está abaixo de 100 sessões (janela 7d)
- Experimento QR não tem 60+ sessões por variante
- Dados mostram spike ou queda anormal (staleness)

✅ **Pronto para Tijolo 29 se:**
- Todos os territórios prioritários com 80+ sessões
- Todos os quicks com 60+ sessões
- Séries com 100+ sessões
- QR A/B com amostra mínima (60/variante)
- Comparação território/série honesta e confiável

---

## Ferramentas de Acompanhamento

### Comandos

```bash
# Gerar links de campanha
npm run campaign:links

# Verificar progresso de coleta
npm run beta:distribution-report

# Snapshot completo
npm run beta:snapshot -- --format=md

# Brief semanal
npm run campaign:brief
```

### Dashboard

- **`/estado`:** painel visual de progresso
- **Reports de distribuição:** `reports/distribution/`
- **Pacotes prontos:** `reports/distribution/packages/`

---

## Adaptação e Flexibilidade

### Se um jogo não está grudando:
- Distribuir por mais 2-3 dias
- Testar canais diferentes
- Ajustar mensagem/contexto territorial
- Avaliar se é problema de produto ou distribuição

### Se um território é muito responsivo:
- Manter distribuição equilibrada (não empurrar só um território)
- Usar território forte para testar variações
- Balancear com território mais fraco

### Se um canal não está convertendo:
- Alternar para canais secundários
- Ajustar formato de conteúdo
- Testar horários diferentes

---

## Próximo Passo: Tijolo 29

**Quando atingir meta mínima:**
- Consolidar leitura de grude por série/território
- Identificar série líder (provisoriamente: serie-solucoes-coletivas)
- Transformar série líder em blueprint de formato médio
- Tensionar território líder com criativo dedicado
- Preparar operação de investimento em formato médio

**Recomendação explícita:**
Não criar formato médio até ter amostra mínima comparável. Evitar decisão baseada em intuição ou urgência política.
