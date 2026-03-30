# T92 — Asset-First Production Pipeline: Operational Rules

## 🎯 Diagnosis: The "UI-First" Trap
Tradicionalmente, muitos projetos começam pela "casca" (menus, botões, indicadores) antes do "mundo". Isso gera jogos que parecem dashboards e falham em engajar visualmente nos primeiros 10 segundos. O Hub agora decreta o fim das "Fake Games" para títulos Flagship.

---

## 🏗️ 1. Asset-First Vertical Slice Doctrine (O Novo Mínimo)
Nenhum novo projeto será considerado para a trilha Flagship se o seu primeiro vertical slice não contiver:
- **Mundo Visível**: Um tabuleiro, mapa ou cenário funcional (não cinza).
- **Lista de Assets Aprovada**: Planejamento visual antes do código.
- **Fun-Factor 20s**: A mecânica principal deve ser divertida e tátil em 20 segundos.
- **3-5 Screenshot States**: O slice deve gerar stills convincentes de marketing imediatamente.
- **Baseline FX**: Ao menos um efeito de "juice" (shockwave, pulse, glitch) funcional.
- **Mobile Readability**: Playable em viewport móvel desde o dia 1.

---

## 📦 2. Genre Production Kits (Kits de Partida)

### RTS-lite / Territorial Strategy
- **Base**: Tabuleiro `mapView` com camadas de assets (SVG/Images).
- **HUD**: Floating units e mini-dashboard táctil.
- **Motion**: Linhas de conexão e animações de unidades em marcha.

### City Sim / Public Services
- **Base**: Superfície de mapa com `clip-paths` orgânicos de distritos.
- **HUD**: Barra de ferramentas de intervenção e overlays de crise.
- **Motion**: Pulsações de vida (trânsito, luzes) e crescimento visual de assets.

### Platformer / Action 2D
- **Base**: Parallax background (3 camadas min.) e physics playground.
- **HUD**: Minimalista (Saúde/Energia) integrado ao cenário.
- **Motion**: Animações de personagem suaves e partículas de impacto.

### Physics / Destruction Arcade
- **Base**: Materiais destrutíveis e camadas de detritos.
- **HUD**: Contadores de impacto e bônus de combo visuais.
- **Motion**: Física de queda e desaceleração dramática (Slow-mo triggers).

---

## 🚫 3. "No More Fake Game" Guardrails (Proibições)
Estão banidos do status de **Flagship / Public Ready** projetos que sejam:
- Baseados majoritariamente em pilhas de **Cards**.
- Controlados apenas por **Sliders** e KPIs textuais.
- Centralizados em **Formulários** ou menus de decisão estáticos.
- Desprovidos de **Reatividade Visual** de mundo-estado.

---

## 🗺️ 4. Roadmap Reprioritization (Novo Ranking de Produção)

| Jogo | Status Atual | Próximo Passo Asset-First | Rank Prioridade |
| :--- | :--- | :--- | :--- |
| **Bairro Resiste** | FLAGSHIP | Manter juice e expandir unidades. | 🟢 ALTA |
| **Cidade Real** | FLAGSHIP | Adicionar assets de crescimento urbano. | 🟢 ALTA |
| **Mutirão Saneamento** | BETA (Card-heavy) | Refatorar para Mapa Visual de Obras. | 🟡 MÉDIA |
| **Assembleia Territorial** | LAB (Decision) | Migrar para Visual Council Room. | 🔴 BAIXA |

---

## 🚪 5. Public Promotion Gate (Critérios de Subida)
Para subir de categoria, o jogo deve passar no audit de interface:
1. **Flagship**: 100% Asset-first + Spectacle pass completo.
2. **Public Ready**: 100% Asset-first + Feedback tátil básico.
3. **Lab/Experimental**: Pode ser UI-first/Card-heavy para testes de lógica.
