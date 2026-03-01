# 🦺 Dashboard de Acidentes de Trabalho - Brasil 2024

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-2.0-150458?style=for-the-badge&logo=pandas&logoColor=white)

### 📊 Dashboard interativo para análise de **372.327 acidentes de trabalho** no Brasil

**Transformando dados públicos em insights acionáveis para segurança do trabalho**

[🚀 Demo Online](https://dados-ministerio-do-trabalho-r4psnh60s.vercel.app/) · [📊 Dados Utilizados](#-fonte-dos-dados) · [🛠️ Como Rodar](#-instalação)

</div>

---

## 🎯 O Problema de Negócio

> **"Como identificar quais EPIs estão sendo negligenciados em diferentes setores industriais?"**

Os acidentes de trabalho custam ao Brasil **R$ 100 bilhões por ano** (estimativa OIT). A maioria poderia ser evitada com o uso adequado de **Equipamentos de Proteção Individual (EPIs)**.

### 💡 A Solução

Este dashboard analisa dados reais do **Ministério do Trabalho** para:

1. **Inferir EPIs Faltantes** — Baseado na parte do corpo atingida, deduzimos qual equipamento estava ausente
2. **Identificar Setores Críticos** — Quais indústrias têm mais acidentes evitáveis
3. **Fundamentar Investimento em IA** — Justificar sistemas de visão computacional (YOLO) para monitoramento de EPIs

---

## ✨ Funcionalidades

<table>
<tr>
<td width="50%">

### 📈 Análise Temporal
Evolução mensal dos acidentes ao longo de 2024, permitindo identificar sazonalidades e tendências.

### 🗺️ Mapa Coroplético
Distribuição geográfica por estado brasileiro com escala de cores e tooltips interativos.

### 🦺 Inferência de EPIs
Algoritmo que deduz o EPI potencialmente ausente baseado na anatomia da lesão.

### 🦴 Diagrama Corporal
SVG interativo do corpo humano com heatmap das regiões mais atingidas.

</td>
<td width="50%">

### 🏭 Filtro de Macro-Setor
Alterne entre:
- **Indústria & Construção** (foco YOLO)
- **Logística & Transporte**
- **Saúde**
- **Todos os Setores**

### 📊 Top Setores CNAE
Ranking dos setores econômicos com mais acidentes, incluindo +400 descrições mapeadas.

### 👥 Análise Demográfica
Distribuição por faixa etária e gênero dos trabalhadores atingidos.

### 🩹 Tipos de Lesões
Natureza das lesões mais comuns por setor.

</td>
</tr>
</table>

---

## 🧠 Lógica de Inferência de EPI

O **diferencial técnico** deste projeto é a inferência de EPIs baseada em regras de negócio:

```python
def inferir_epi(parte_corpo):
    if parte in ['dedo', 'mão', 'punho', 'braço']:
        return '🧤 Luvas'
    elif parte in ['cabeça', 'crânio', 'face']:
        return '🪖 Capacete'
    elif parte == 'olho':
        return '🥽 Óculos de Proteção'
    elif parte in ['pé', 'tornozelo', 'perna']:
        return '👢 Calçado de Segurança'
    elif parte in ['tórax', 'dorso', 'abdômen']:
        return '🦺 Colete/Avental'
```

### Resultados da Inferência

| EPI Inferido | % dos Acidentes | Insight |
|--------------|-----------------|---------|
| 🧤 **Luvas** | 50.1% | Dedos e mãos são os mais atingidos |
| 👢 **Calçado** | 20.7% | Pés e pernas em segundo lugar |
| 🪖 **Capacete** | 6.9% | Lesões de cabeça são graves |
| 🥽 **Óculos** | 4.0% | Proteção ocular subestimada |
| 🦺 **Colete** | 3.1% | Lesões no tronco |

---

## 🛠️ Stack Tecnológica

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 18.2 | Biblioteca UI com hooks |
| Vite | 5.4 | Build tool ultrarrápido |
| Tailwind CSS | 3.4 | Estilização utility-first |
| Recharts | 2.10 | Gráficos declarativos |
| React Simple Maps | 3.0 | Mapa coroplético do Brasil |
| Framer Motion | 10.18 | Animações fluidas |
| Lucide React | 0.294 | Ícones modernos |

### ETL / Pipeline de Dados
| Tecnologia | Propósito |
|------------|-----------|
| Python 3.11+ | Processamento de dados |
| Pandas 2.0 | Agregações e transformações |
| JSON | Formato otimizado para web |

### Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         PIPELINE ETL                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│   │   CSV Bruto  │      │   Pandas     │      │    JSONs     │ │
│   │   ~50MB      │ ───► │   ETL Script │ ───► │   ~200KB     │ │
│   │   373k rows  │      │              │      │   Otimizados │ │
│   └──────────────┘      └──────────────┘      └──────────────┘ │
│                                │                               │
│                                ▼                               │
│                    ┌────────────────────┐                      │
│                    │ - Classificação    │                      │
│                    │   de Macro-Setor   │                      │
│                    │ - Inferência EPI   │                      │
│                    │ - Normalização     │                      │
│                    │   de Nomenclatura  │                      │
│                    └────────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND REACT                             │
├─────────────────────────────────────────────────────────────────┤
│   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│   │ Cards  │  │Timeline│  │  Mapa  │  │  EPI   │  │  Body  │   │
│   │Metrics │  │ Chart  │  │ Brasil │  │ Chart  │  │Diagram │   │
│   └────────┘  └────────┘  └────────┘  └────────┘  └────────┘   │
│                                                                 │
│   ┌────────┐  ┌────────┐  ┌────────┐  ┌─────────────────────┐  │
│   │Sector  │  │Lesion  │  │ Demo   │  │  Sector Filter      │  │
│   │ Chart  │  │ Chart  │  │ Charts │  │  (Indústria/Saúde)  │  │
│   └────────┘  └────────┘  └────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
dashboard-epi/
│
├── 📂 public/
│   └── 📂 data/                      # 45 arquivos JSON agregados
│       ├── metricas.json             # KPIs gerais
│       ├── metricas_industria.json   # KPIs filtrados por setor
│       ├── por_mes.json              # Série temporal
│       ├── por_uf.json               # Dados geográficos
│       ├── por_epi.json              # EPIs inferidos
│       ├── por_corpo.json            # Partes do corpo
│       └── ...
│
├── 📂 scripts/
│   └── 🐍 agregar_dados.py           # Pipeline ETL (450+ linhas)
│
├── 📂 src/
│   ├── 📂 components/
│   │   ├── Header.jsx                # Navegação fixa
│   │   ├── SectorFilter.jsx          # Filtro de macro-setor
│   │   ├── MetricCards.jsx           # Cards de KPIs
│   │   ├── TimelineChart.jsx         # Gráfico temporal
│   │   ├── MapaBrasil.jsx            # Mapa coroplético
│   │   ├── EPIChart.jsx              # Gráfico de EPIs
│   │   ├── BodyDiagram.jsx           # SVG interativo
│   │   ├── SectorChart.jsx           # Top setores
│   │   ├── LesionChart.jsx           # Tipos de lesões
│   │   ├── DemographicsCharts.jsx    # Idade e sexo
│   │   └── Footer.jsx
│   │
│   ├── App.jsx                       # Componente raiz
│   ├── main.jsx                      # Entry point
│   └── index.css                     # Tailwind + custom
│
├── tailwind.config.js                # Tema customizado
├── vite.config.js
├── package.json
└── README.md
```

---

## 🚀 Instalação

### Pré-requisitos
- **Node.js** 18+
- **npm** ou **yarn**
- **Python 3.11+** (apenas para regenerar dados)

### Quick Start

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/dashboard-epi-acidentes.git
cd dashboard-epi-acidentes

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Acesse no navegador
# → http://localhost:3000
```

### (Opcional) Regenerar os Dados

```bash
# Se você tem o CSV original do Ministério do Trabalho:

# 1. Ative o ambiente Python
python -m venv .venv
.venv\Scripts\activate   # Windows
source .venv/bin/activate # Linux/Mac

# 2. Instale o Pandas
pip install pandas

# 3. Execute o script ETL
python scripts/agregar_dados.py
```

---

## 📊 Fonte dos Dados

| Atributo | Valor |
|----------|-------|
| **Fonte** | Ministério do Trabalho e Emprego (MTE) |
| **Sistema** | CAT - Comunicação de Acidente de Trabalho |
| **Portal** | Dados Abertos do Governo Federal |
| **Período** | Janeiro a Dezembro de 2024 |
| **Registros** | 372.327 acidentes típicos válidos |
| **Cobertura** | 27 Unidades Federativas |
| **Setores** | 400+ CNAEs mapeados |

### Tratamentos Aplicados

✅ Remoção de UFs inválidas ("Zerado")  
✅ Filtro de gênero (Masculino/Feminino)  
✅ Inferência de EPI por parte do corpo  
✅ Classificação em macro-setores (Indústria, Logística, Saúde)  
✅ Normalização de nomes truncados (CNAE e partes do corpo)  

---

## 📈 Principais Insights

### 🔍 Descobertas

| Insight | Dado | Implicação |
|---------|------|------------|
| **Dedos são alvo #1** | 29.1% dos acidentes | Priorizar detecção de luvas |
| **SP lidera acidentes** | Maior volume absoluto | Escala industrial do estado |
| **Indústria alimentícia** | Abatedouros no topo | Ambiente com facas e máquinas |
| **Faixa 25-44 anos** | Maior risco | Força de trabalho ativa |
| **66% masculino** | Predominância | Setores tradicionais |

### 💼 Recomendações de Negócio

1. **Sistema YOLO para EPIs** — Focar em detecção de luvas, capacetes e calçados
2. **Setor prioritário** — Indústria de alimentos e construção civil
3. **Campanhas de conscientização** — Trabalhadores 25-44 anos

---

## 🔮 Roadmap

- [ ] 🤖 Integração com modelo YOLO para detecção de EPIs em vídeo
- [ ] 📡 API REST para consumo dos dados
- [ ] 📄 Exportação de relatórios em PDF
- [ ] 🔴 Dashboard em tempo real com streaming
- [ ] 📱 Versão mobile responsiva aprimorada
- [ ] 🧪 Testes unitários e E2E

---

## 💼 Skills Demonstradas

Este projeto demonstra competências em:

| Área | Habilidades |
|------|-------------|
| **Data Engineering** | ETL com Python/Pandas, transformação de dados, otimização de payload |
| **Frontend Development** | React 18, hooks, componentização, state management |
| **Data Visualization** | Recharts, mapas geográficos, SVG interativo |
| **Product Thinking** | Definição de persona, hipótese de negócio, métricas de impacto |
| **Clean Code** | Estrutura de pastas, nomenclatura, documentação |

---

<div"center">

*Dados reais do Ministério do Trabalho e Emprego*

</div>


