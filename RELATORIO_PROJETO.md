# RELATÓRIO TÉCNICO DO PROJETO
## Dashboard de Acidentes de Trabalho — Brasil 2024

---

**Projeto**: Dashboard EPI — Inteligência em Segurança do Trabalho  
**Autor**: Michael  
**Data**: Fevereiro de 2026  
**Versão**: 1.0  

---

## SUMÁRIO

1. [Resumo Executivo](#1-resumo-executivo)
2. [Contexto e Motivação](#2-contexto-e-motivação)
3. [Fonte dos Dados](#3-fonte-dos-dados)
4. [Pipeline ETL](#4-pipeline-etl)
5. [Arquitetura do Sistema](#5-arquitetura-do-sistema)
6. [Stack Tecnológica](#6-stack-tecnológica)
7. [Análise Exploratória dos Dados](#7-análise-exploratória-dos-dados)
8. [Resultados e Insights](#8-resultados-e-insights)
9. [Funcionalidades do Dashboard](#9-funcionalidades-do-dashboard)
10. [Estrutura do Projeto](#10-estrutura-do-projeto)
11. [Conclusões e Recomendações](#11-conclusões-e-recomendações)
12. [Próximos Passos](#12-próximos-passos)

---

## 1. RESUMO EXECUTIVO

Este relatório documenta o desenvolvimento de um **dashboard interativo** para análise de **372.327 acidentes de trabalho** ocorridos no Brasil durante o ano de 2024. O projeto compreende duas frentes técnicas:

- **Pipeline ETL em Python/Pandas**: Processamento de um CSV bruto de ~50MB, aplicando limpeza, normalização, classificação em macro-setores, inferência de EPIs faltantes e agregação em 45 arquivos JSON otimizados (~200KB total).

- **Frontend em React**: Dashboard responsivo com 10+ componentes de visualização, incluindo mapa coroplético do Brasil, diagrama corporal interativo em SVG, gráficos temporais e filtro dinâmico por macro-setor.

### Principais Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| Registros processados | 372.327 |
| Estados cobertos | 27 UFs |
| Setores CNAE mapeados | 370+ |
| Partes do corpo normalizadas | 61 regras |
| Arquivos JSON gerados | 45 |
| Componentes React | 11 |
| Redução de payload | ~50MB → ~200KB (99.6%) |

---

## 2. CONTEXTO E MOTIVAÇÃO

### 2.1 O Problema

Segundo a Organização Internacional do Trabalho (OIT), os acidentes de trabalho custam ao Brasil aproximadamente **R$ 100 bilhões por ano**. Uma parcela significativa desses acidentes poderia ser evitada com o uso adequado de Equipamentos de Proteção Individual (EPIs).

### 2.2 A Pergunta de Negócio

> *"Como identificar quais EPIs estão sendo negligenciados em diferentes setores industriais, e como priorizar investimentos em sistemas de monitoramento?"*

### 2.3 Objetivos do Projeto

1. **Transformar dados públicos em conhecimento visual** — Converter 372 mil registros em gráficos interativos e acionáveis
2. **Inferir EPIs faltantes** — Deduzir, com base na parte do corpo atingida, qual EPI potencialmente estava ausente no momento do acidente
3. **Segmentar por macro-setor** — Permitir análise focada em Indústria & Construção, Logística & Transporte e Saúde
4. **Fundamentar investimento em IA** — Gerar evidências para justificar a implantação de sistemas de visão computacional (YOLO) para monitoramento de EPIs em tempo real

---

## 3. FONTE DOS DADOS

### 3.1 Origem

| Atributo | Detalhe |
|----------|---------|
| **Fonte oficial** | Ministério do Trabalho e Emprego (MTE) |
| **Sistema** | CAT — Comunicação de Acidente de Trabalho |
| **Portal** | Dados Abertos do Governo Federal |
| **Período** | Janeiro a Dezembro de 2024 |
| **Formato original** | CSV (~50MB) |
| **Total de registros brutos** | ~373.340 |
| **Registros válidos (pós-limpeza)** | 372.327 |

### 3.2 Variáveis Utilizadas

As principais variáveis extraídas do dataset CAT incluem:

| Variável | Descrição | Uso no Projeto |
|----------|-----------|----------------|
| `Data do Acidente` | Data de ocorrência | Série temporal mensal |
| `UF do Acidente` | Unidade Federativa | Mapa coroplético |
| `CNAE` | Classificação de Atividade Econômica | Setorização e ranking |
| `Parte do Corpo Atingida` | Região anatômica lesionada | Inferência de EPI + diagrama corporal |
| `Natureza da Lesão` | Tipo de lesão sofrida | Gráfico de lesões |
| `Sexo` | Gênero do trabalhador | Análise demográfica |
| `Idade` | Idade do trabalhador | Distribuição etária |

### 3.3 Tratamentos de Qualidade

| Tratamento | Descrição |
|------------|-----------|
| Remoção de UFs inválidas | Exclusão de registros com UF = "Zerado" |
| Filtro de gênero | Manutenção apenas de Masculino/Feminino |
| Normalização de nomes | 61 regras para corrigir truncamentos em partes do corpo |
| Mapeamento CNAE | 370+ descrições de setores econômicos |
| Classificação macro-setor | Agrupamento por faixa de CNAE |
| Inferência de EPI | Regra baseada na parte do corpo |

---

## 4. PIPELINE ETL

### 4.1 Visão Geral

O pipeline de dados foi implementado em Python com Pandas, no script `scripts/agregar_dados.py` (450+ linhas). Ele executa as seguintes etapas:

```
CSV Bruto (~50MB, 373k linhas)
        │
        ▼
  ┌─────────────────┐
  │  1. LEITURA      │  Pandas read_csv com encoding UTF-8
  │  2. LIMPEZA      │  Remoção de UFs inválidas, filtro de gênero
  │  3. NORMALIZAÇÃO │  61 regras de nome de partes do corpo
  │  4. MAPEAMENTO   │  370+ descrições CNAE
  │  5. CLASSIFICAÇÃO│  Macro-setores por faixa CNAE
  │  6. INFERÊNCIA   │  EPI faltante por parte do corpo
  │  7. AGREGAÇÃO    │  11 JSONs × 4 setores + 1 metadata
  └─────────────────┘
        │
        ▼
  45 arquivos JSON (~200KB total)
```

### 4.2 Classificação de Macro-Setores

A classificação é feita pelo **prefixo de 2 dígitos do código CNAE**, seguindo a estrutura oficial da CNAE 2.0:

| Macro-Setor | Prefixos CNAE | Seção CNAE | Registros | % do Total |
|-------------|---------------|------------|-----------|------------|
| **Indústria & Construção** | 10–33, 41–43 | C (Transformação) + F (Construção) | **144.560** | **38,8%** |
| **Saúde** | 86–88 | Q (Saúde e Serviços Sociais) | **55.504** | **14,9%** |
| **Logística & Transporte** | 49–53 | H (Transporte e Armazenagem) | **22.169** | **6,0%** |
| **Outros** | Demais | Comércio, Governo, Educação, etc. | **150.094** | **40,3%** |

### 4.3 Inferência de EPI Faltante

A lógica de inferência utiliza a **parte do corpo atingida** para deduzir qual EPI potencialmente estava ausente:

| Partes do Corpo (keywords) | EPI Inferido |
|----------------------------|--------------|
| `cabeça, crânio, face, orelha, pescoço` | **Capacete** |
| `olho` | **Óculos de Proteção** |
| `mão, dedo, punho` | **Luvas** |
| `braço, ombro, cotovelo` | **Luvas** |
| `pé, artelho, tornozelo` | **Calçado de Segurança** |
| `perna, joelho, coxa` | **Calçado de Segurança** |
| `tórax, dorso, costa, abdômen` | **Colete/Avental** |
| *(sem correspondência)* | **Outros / Não Mapeado** |

### 4.4 Normalização de Nomenclatura

O CSV original contém nomes truncados para partes do corpo. Foram criadas **61 regras de normalização**, por exemplo:

| Nome Original (truncado) | Nome Normalizado |
|--------------------------|------------------|
| `Mao (Exceto Punho ou` | Mão (exceto punho ou dedos) |
| `Perna (Entre O Torno` | Perna (entre tornozelo e joelho) |
| `Pe (Exceto Artelhos)` | Pé (exceto artelhos) |
| `Tornozelo (Inclusive` | Tornozelo (inclusive tendão de Aquiles) |

### 4.5 Agregações Geradas

Para cada macro-setor (todos, indústria, logística, saúde), são geradas **11 agregações**:

| # | Agregação | Arquivo JSON | Conteúdo |
|---|-----------|-------------|----------|
| 1 | Métricas gerais | `metricas{sufixo}.json` | Total de acidentes, estados, idade média, % masculino, top EPI |
| 2 | Série temporal | `por_mes{sufixo}.json` | Acidentes por mês (12 pontos) |
| 3 | Distribuição por UF | `por_uf{sufixo}.json` | 27 estados com totais |
| 4 | EPIs inferidos | `por_epi{sufixo}.json` | 6 categorias com cores e percentuais |
| 5 | Partes do corpo | `por_corpo{sufixo}.json` | Ranking com nomes normalizados e região |
| 6 | Regiões do corpo | `por_regiao_corpo{sufixo}.json` | Agrupamento anatômico (mão, pé, cabeça) |
| 7 | Gênero | `por_sexo{sufixo}.json` | Masculino × Feminino |
| 8 | Faixa etária | `por_idade{sufixo}.json` | 7 faixas de <18 a 65+ |
| 9 | Tipo de lesão | `por_lesao{sufixo}.json` | Top 10 naturezas de lesão |
| 10 | Setores CNAE | `por_cnae{sufixo}.json` | Top 15 setores econômicos |
| 11 | Cruzamento EPI × Setor | `cruzamento_epi_setor{sufixo}.json` | Top 5 CNAEs com breakdown de EPIs |

**Total**: 11 arquivos × 4 variantes + 1 metadata = **45 arquivos JSON**

### 4.6 Otimização de Payload

| Métrica | Antes (CSV) | Depois (JSONs) | Redução |
|---------|-------------|----------------|---------|
| Tamanho total | ~50 MB | ~200 KB | **99,6%** |
| Registros | 372.327 linhas | Dados pré-agregados | N/A |
| Tempo de carregamento | Inviável no browser | < 1 segundo | ∞ |

---

## 5. ARQUITETURA DO SISTEMA

### 5.1 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE DADOS                              │
│                                                                     │
│  ┌──────────────┐         ┌──────────────┐        ┌──────────────┐  │
│  │  CSV Bruto   │         │   Python +   │        │  45 JSONs    │  │
│  │  Ministério  │  ────►  │   Pandas     │  ────► │  Otimizados  │  │
│  │  do Trabalho │         │   (ETL)      │        │  (~200KB)    │  │
│  └──────────────┘         └──────────────┘        └──────┬───────┘  │
│                                                          │          │
└──────────────────────────────────────────────────────────┼──────────┘
                                                           │
                                                    fetch /data/*.json
                                                           │
┌──────────────────────────────────────────────────────────┼──────────┐
│                      CAMADA FRONTEND                      │          │
│                                                           ▼          │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                        App.jsx                                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │ │
│  │  │ SectorFilter │  │   useState   │  │    useEffect         │  │ │
│  │  │ (macro-setor)│  │ (state mgmt) │  │ (data loading)       │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │ │
│  └────────────────────────────────┬────────────────────────────────┘ │
│                                   │                                  │
│         ┌─────────────────────────┼─────────────────────────┐       │
│         │                         │                         │       │
│         ▼                         ▼                         ▼       │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐    │
│  │ MetricCards  │   │  TimelineChart   │   │    MapaBrasil    │    │
│  │ (KPIs)       │   │  (Recharts)      │   │ (react-simple-  │    │
│  │              │   │                  │   │   maps + d3)     │    │
│  └──────────────┘   └──────────────────┘   └──────────────────┘    │
│                                                                     │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐    │
│  │  EPIChart    │   │   BodyDiagram   │   │  SectorChart     │    │
│  │ (pizza/bar)  │   │ (SVG interativo) │   │  (bar chart)     │    │
│  └──────────────┘   └──────────────────┘   └──────────────────┘    │
│                                                                     │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐    │
│  │ LesionChart  │   │ Demographics    │   │    Footer        │    │
│  │ (bar chart)  │   │ Charts (age+sex) │   │                  │    │
│  └──────────────┘   └──────────────────┘   └──────────────────┘    │
│                                                                     │
│              Tailwind CSS + Framer Motion + Lucide Icons            │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Fluxo de Dados no Frontend

1. **Inicialização**: `App.jsx` carrega com `selectedSector = 'industria'`
2. **useEffect**: Detecta mudança de setor e calcula o sufixo (`_industria`, `_logistica`, `_saude`, ou vazio)
3. **Promise.all**: Carrega os 11 JSONs correspondentes em paralelo via `fetch()`
4. **State update**: Dados são armazenados em 11 states React
5. **Render**: Cada componente recebe seus dados via props e renderiza a visualização

---

## 6. STACK TECNOLÓGICA

### 6.1 Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 18.2 | Biblioteca de UI — componentização com hooks |
| **Vite** | 5.0 | Build tool — HMR instantâneo, bundle otimizado |
| **Tailwind CSS** | 3.4 | Framework CSS utility-first com tema customizado |
| **Recharts** | 2.10 | Gráficos declarativos (AreaChart, BarChart, PieChart) |
| **React Simple Maps** | 3.0 | Mapa coroplético do Brasil com GeoJSON |
| **D3 Scale** | 4.0 | Escala de cores para o mapa |
| **Framer Motion** | 10.18 | Animações de entrada e transições fluidas |
| **Lucide React** | 0.303 | Biblioteca de ícones SVG modernos |

### 6.2 Pipeline de Dados

| Tecnologia | Propósito |
|------------|-----------|
| **Python 3.11+** | Linguagem do script ETL |
| **Pandas 2.0** | Manipulação e agregação de DataFrames |
| **JSON** | Formato de saída otimizado para web |

### 6.3 DevOps / Infraestrutura

| Ferramenta | Propósito |
|------------|-----------|
| **Git** | Versionamento de código |
| **GitHub** | Repositório remoto |
| **npm** | Gerenciador de pacotes Node.js |
| **PostCSS** | Processamento de CSS (Tailwind) |
| **Autoprefixer** | Compatibilidade cross-browser |

---

## 7. ANÁLISE EXPLORATÓRIA DOS DADOS

### 7.1 Métricas Gerais

| Indicador | Valor |
|-----------|-------|
| Total de acidentes registrados | **372.327** |
| UFs com registros | **27** (todos os estados) |
| Idade média dos acidentados | **36,8 anos** |
| Percentual masculino | **66,1%** |
| Percentual feminino | **33,8%** |
| EPI mais negligenciado | **Luvas** |

### 7.2 Distribuição Temporal (2024)

| Mês | Acidentes | Observação |
|-----|-----------|------------|
| Janeiro | 41.211 | Linha de base |
| Fevereiro | 40.034 | Estável |
| Março | 41.493 | Estável |
| Abril | 49.847 | Início de alta |
| **Maio** | **77.050** | **Pico do ano** |
| Junho | 37.899 | Retorno à normalidade |
| Julho | 44.211 | Ligeira alta |
| Agosto | 20.233 | Queda acentuada |
| Setembro | 2.856 | Provável defasagem de dados* |
| Outubro | 5.785 | Provável defasagem de dados* |
| Novembro | 5.740 | Provável defasagem de dados* |
| Dezembro | 5.968 | Provável defasagem de dados* |

> *\*Os meses de Set–Dez apresentam queda abrupta, o que indica provável atraso no registro/publicação das CATs pelo MTE.*

### 7.3 Distribuição Geográfica — Top 10 Estados

| # | Estado | Sigla | Acidentes | % do Total |
|---|--------|-------|-----------|------------|
| 1 | São Paulo | SP | **131.464** | 35,3% |
| 2 | Minas Gerais | MG | 37.653 | 10,1% |
| 3 | Paraná | PR | 32.133 | 8,6% |
| 4 | Rio Grande do Sul | RS | 32.125 | 8,6% |
| 5 | Santa Catarina | SC | 28.787 | 7,7% |
| 6 | Rio de Janeiro | RJ | ~20.000 | ~5,4% |
| 7 | Goiás | GO | ~13.000 | ~3,5% |
| 8 | Bahia | BA | ~10.000 | ~2,7% |
| 9 | Pernambuco | PE | ~8.000 | ~2,1% |
| 10 | Mato Grosso do Sul | MS | ~7.000 | ~1,9% |

**Observação**: A concentração no eixo Sul-Sudeste (SP, MG, PR, RS, SC) representa **70,3%** de todos os acidentes, correlacionando-se diretamente com a concentração industrial do país.

### 7.4 Distribuição por Gênero

| Gênero | Total | Percentual |
|--------|-------|------------|
| **Masculino** | 245.987 | **66,2%** |
| **Feminino** | 125.640 | **33,8%** |

**Por macro-setor**:
- **Indústria & Construção**: 84,7% masculino (predomínio de atividades braçais)
- **Logística & Transporte**: 87,7% masculino (motoristas, carregadores)
- **Saúde**: 18,1% masculino / **81,9% feminino** (predominância de enfermeiras e técnicas)

### 7.5 Distribuição por Faixa Etária

| Faixa | Total | % |
|-------|-------|---|
| < 18 anos | 842 | 0,2% |
| 18-24 anos | 62.665 | 16,8% |
| **25-34 anos** | **112.189** | **30,1%** |
| **35-44 anos** | **97.618** | **26,2%** |
| 45-54 anos | 66.551 | 17,9% |
| 55-64 anos | 28.766 | 7,7% |
| 65+ anos | 3.694 | 1,0% |

**Insight**: A faixa de **25 a 44 anos** concentra **56,3%** dos acidentes — exatamente a faixa de maior produtividade da força de trabalho.

### 7.6 Distribuição por EPI Inferido

| EPI | Total | % | Cor |
|-----|-------|---|-----|
| **Luvas** | 186.611 | **50,1%** | Amarelo |
| **Calçado de Segurança** | 77.208 | **20,7%** | Azul |
| Outros / Não Mapeado | 56.390 | 15,1% | Cinza |
| **Capacete** | 25.505 | **6,9%** | Vermelho |
| **Óculos de Proteção** | 15.053 | **4,0%** | Verde |
| **Colete/Avental** | 11.560 | **3,1%** | Roxo |

### 7.7 Top 10 Naturezas de Lesão

| # | Tipo de Lesão | Total | % |
|---|---------------|-------|---|
| 1 | **Corte, Laceração, Ferimento** | **82.305** | **22,1%** |
| 2 | Lesão Imediata | 54.380 | 14,6% |
| 3 | Fratura | 47.922 | 12,9% |
| 4 | Contusão, Esmagamento | 39.234 | 10,5% |
| 5 | Distensão, Torção | 29.328 | 7,9% |
| 6 | Escoriação, Abrasão | 28.260 | 7,6% |
| 7 | Outras Lesões | 27.644 | 7,4% |
| 8 | Luxação | 18.951 | 5,1% |
| 9 | Queimadura ou Escaldadura | 12.737 | 3,4% |
| 10 | Lesão Imediata (NIC) | 10.524 | 2,8% |

### 7.8 Top Partes do Corpo Atingidas

| # | Parte do Corpo | Região | Total | % |
|---|----------------|--------|-------|---|
| 1 | **Dedo** | Mão | **108.351** | **29,1%** |
| 2 | Mão (exceto punho ou dedos) | Mão | 33.260 | 8,9% |
| 3 | Pé (exceto artelhos) | Pé | 33.243 | 8,9% |
| 4 | Joelho | Perna | 16.280 | 4,4% |
| 5 | Olho (inclusive nervo óptico) | Cabeça | 15.053 | 4,0% |

**Insight crítico**: **Dedos e mãos somam 38,0%** de todos os acidentes — quase 4 em cada 10 acidentes poderiam ser mitigados com luvas adequadas.

### 7.9 Top Setores Econômicos (CNAE)

#### Visão Global

| # | CNAE | Setor | Total | % |
|---|------|-------|-------|---|
| 1 | 8610 | **Hospitais** | **37.676** | 10,1% |
| 2 | 4711 | Supermercados e Hipermercados | 16.962 | 4,6% |
| 3 | 4930 | Transporte de Carga | 11.141 | 3,0% |
| 4 | 8411 | Administração Pública | 9.721 | 2,6% |
| 5 | 1012 | Abate de Suínos/Aves | 9.296 | 2,5% |

#### Foco: Indústria & Construção

| # | CNAE | Setor | Total | % do Setor |
|---|------|-------|-------|------------|
| 1 | 1012 | **Abate de Suínos/Aves** | **9.296** | **6,4%** |
| 2 | 4120 | Construção de Edifícios | 7.397 | 5,1% |
| 3 | 1011 | Abate de Bovinos | 5.589 | 3,9% |
| 4 | 1071 | Fabricação de Açúcar | 3.794 | 2,6% |
| 5 | 2229 | Fabricação de Artefatos de Plástico | 2.971 | 2,1% |

**Insight**: A indústria alimentícia (abatedouros de suínos, aves e bovinos) lidera os acidentes no setor industrial, caracterizada pelo uso intensivo de facas, maquinário de corte e ambientes úmidos/escorregadios.

---

## 8. RESULTADOS E INSIGHTS

### 8.1 Achados Principais

| # | Descoberta | Evidência | Implicação |
|---|-----------|-----------|------------|
| 1 | **Luvas são o EPI mais negligenciado** | 50,1% dos acidentes envolvem mãos/dedos | Prioridade máxima para detecção visual |
| 2 | **Concentração no Sul-Sudeste** | SP + MG + PR + RS + SC = 70,3% | Foco geográfico para programas de prevenção |
| 3 | **Indústria alimentícia lidera** | Abatedouros = top 3 na indústria | Ambiente de alto risco (facas + máquinas) |
| 4 | **Força de trabalho ativa é a mais vulnerável** | 25-44 anos = 56,3% dos acidentes | Impacto econômico na faixa produtiva |
| 5 | **Gênero varia por setor** | Indústria: 85% homens / Saúde: 82% mulheres | Necessidade de programas diferenciados |
| 6 | **Cortes são a lesão dominante** | 22,1% — corte, laceração, ferimento | Correlação direta com falta de luvas |
| 7 | **Maio foi o mês pico** | 77.050 acidentes (2× a média) | Investigar sazonalidade |

### 8.2 Métricas Comparativas por Macro-Setor

| Indicador | Indústria | Logística | Saúde | Geral |
|-----------|-----------|-----------|-------|-------|
| **Total de acidentes** | 144.560 | 22.169 | 55.504 | 372.327 |
| **Idade média** | 35,9 | 39,7 | 37,7 | 36,8 |
| **% Masculino** | 84,7% | 87,7% | 18,1% | 66,1% |
| **Top EPI** | Luvas | Luvas | Luvas | Luvas |
| **% Luvas** | 53,8% | — | — | 50,1% |

### 8.3 Correlações Identificadas

1. **Parte do corpo × Tipo de lesão**: Dedos/mãos + Corte = principal combinação → **Luvas de corte**
2. **Setor × Parte do corpo**: Abatedouros + Dedos = maquinário de corte → **Luvas de malha de aço**
3. **Gênero × Setor**: Saúde predominantemente feminina → EPIs diferentes (máscaras, luvas descartáveis)
4. **Idade × Risco**: Faixa 25-34 anos concentra o pico → **Falta de experiência combinada com confiança excessiva**

---

## 9. FUNCIONALIDADES DO DASHBOARD

### 9.1 Componentes Visuais

| Componente | Tipo de Gráfico | Dados Utilizados | Interatividade |
|-----------|-----------------|------------------|----------------|
| **MetricCards** | Cards numéricos | Métricas gerais | Animação de entrada |
| **TimelineChart** | AreaChart (Recharts) | Série temporal mensal | Tooltip no hover |
| **MapaBrasil** | Choropleth Map | Acidentes por UF | Tooltip com dados do estado |
| **EPIChart** | PieChart + BarChart | EPIs inferidos | Tooltip com percentuais |
| **BodyDiagram** | SVG customizado | Regiões do corpo | Heatmap + hover |
| **SectorChart** | BarChart horizontal | Top CNAEs | Tooltip com detalhes |
| **LesionChart** | BarChart | Tipos de lesão | Tooltip |
| **DemographicsCharts** | PieChart + BarChart | Sexo + Idade | Tooltip |
| **SectorFilter** | Botões interativos | Macro-setores | Troca dinâmica de dados |

### 9.2 Filtro de Macro-Setor

O diferencial do dashboard é o **filtro de macro-setor**, que recarrega todos os 11 JSONs dinamicamente:

| Botão | Ícone | Acidentes | Destaque |
|-------|-------|-----------|----------|
| **Indústria & Construção** | 🏭 Factory | 144.560 | Badge "YOLO" + anel destacado |
| **Logística & Transporte** | 🚛 Truck | 22.169 | — |
| **Saúde** | 🩺 Stethoscope | 55.504 | Nota sobre EPIs diferenciados |
| **Todos os Setores** | 📊 LayoutGrid | 372.327 | — |

### 9.3 Seções do Dashboard

1. **Header** — Navegação fixa com links âncora para cada seção
2. **Filtro de Setor** — Seleção do macro-setor com descrição contextual
3. **Visão Geral** — Cards de KPIs + gráfico temporal
4. **Análise Geográfica** — Mapa coroplético do Brasil
5. **Análise de EPIs** — Gráficos de EPI inferido + diagrama corporal (grid 2 colunas)
6. **Setores e Lesões** — Rankings por CNAE e tipo de lesão (grid 2 colunas)
7. **Perfil Demográfico** — Distribuição por sexo e faixa etária
8. **CTA Visão Computacional** — Seção argumentativa sobre sistema YOLO

---

## 10. ESTRUTURA DO PROJETO

```
dashboard-epi/
│
├── 📂 public/
│   └── 📂 data/                           # 45 arquivos JSON agregados
│       ├── metricas.json                  # KPIs globais
│       ├── metricas_industria.json        # KPIs filtrados — Indústria
│       ├── metricas_logistica.json        # KPIs filtrados — Logística
│       ├── metricas_saude.json            # KPIs filtrados — Saúde
│       ├── por_mes{sufixo}.json           # Série temporal (×4)
│       ├── por_uf{sufixo}.json            # Por estado (×4)
│       ├── por_epi{sufixo}.json           # EPIs inferidos (×4)
│       ├── por_corpo{sufixo}.json         # Partes do corpo (×4)
│       ├── por_regiao_corpo{sufixo}.json  # Regiões anatômicas (×4)
│       ├── por_sexo{sufixo}.json          # Gênero (×4)
│       ├── por_idade{sufixo}.json         # Faixas etárias (×4)
│       ├── por_lesao{sufixo}.json         # Tipos de lesão (×4)
│       ├── por_cnae{sufixo}.json          # Setores CNAE (×4)
│       ├── cruzamento_epi_setor{sufixo}.json  # EPI × Setor (×4)
│       └── setores_metadata.json          # Metadados dos macro-setores
│
├── 📂 scripts/
│   └── 🐍 agregar_dados.py               # Pipeline ETL (450+ linhas)
│
├── 📂 src/
│   ├── 📂 components/                    # 11 componentes React
│   │   ├── Header.jsx                    # Navegação fixa
│   │   ├── SectorFilter.jsx              # Filtro de macro-setor com badge YOLO
│   │   ├── MetricCards.jsx               # Cards animados de KPIs
│   │   ├── TimelineChart.jsx             # Gráfico de área temporal
│   │   ├── MapaBrasil.jsx                # Mapa coroplético com d3-scale
│   │   ├── EPIChart.jsx                  # Pizza + barras de EPIs
│   │   ├── BodyDiagram.jsx               # SVG interativo do corpo humano
│   │   ├── SectorChart.jsx               # Barras horizontais de setores
│   │   ├── LesionChart.jsx               # Tipos de lesões
│   │   ├── DemographicsCharts.jsx        # Sexo + idade
│   │   └── Footer.jsx                    # Rodapé
│   │
│   ├── App.jsx                           # Componente raiz — estado e data loading
│   ├── main.jsx                          # Entry point React
│   └── index.css                         # Tailwind + animações customizadas
│
├── tailwind.config.js                    # Tema customizado com paleta de cores
├── vite.config.js                        # Configuração Vite
├── postcss.config.js                     # PostCSS + Autoprefixer
├── package.json                          # Dependências e scripts npm
├── index.html                            # HTML base
├── README.md                             # Documentação do projeto
└── RELATORIO_PROJETO.md                  # Este relatório
```

---

## 11. CONCLUSÕES E RECOMENDAÇÕES

### 11.1 Conclusões

1. **Mãos e dedos são o principal alvo**: Com 38% dos acidentes atingindo mãos/dedos, luvas adequadas são a intervenção de maior impacto potencial. Em um cenário ideal onde todos os trabalhadores usassem luvas apropriadas, até **141.611 acidentes** poderiam ser evitados ou mitigados por ano.

2. **A indústria alimentícia é o setor mais crítico**: Abatedouros de suínos, aves e bovinos concentram os primeiros lugares em acidentes industriais, com ambiente que combina facas, maquinário pesado e superfícies úmidas/escorregadias.

3. **O perfil de risco varia drasticamente por setor**: Enquanto a Indústria e Logística são predominantemente masculinas (85%+), a Saúde é 82% feminina — exigindo programas de prevenção e EPIs diferenciados.

4. **A faixa etária mais produtiva é a mais atingida**: Trabalhadores entre 25-44 anos representam 56,3% dos acidentes, impactando diretamente a capacidade produtiva do país.

5. **São Paulo concentra mais de 1/3 dos acidentes**: Com 131.464 registros (35,3%), refletindo a escala industrial do estado mais industrializado do país.

### 11.2 Recomendações de Negócio

#### Curto Prazo
- **Implementar sistema YOLO de detecção de EPIs** com foco em luvas, capacetes e calçados de segurança
- **Priorizar abatedouros e construção civil** como ambientes piloto
- **Campanha de conscientização** direcionada à faixa 25-44 anos

#### Médio Prazo
- **Expandir o monitoramento para saúde**: Adaptar o modelo para detectar máscaras e luvas descartáveis em hospitais
- **Dashboard em tempo real**: Integrar com sistemas de câmera para alertas instantâneos
- **API REST**: Disponibilizar os dados para outros sistemas corporativos

#### Longo Prazo
- **Modelo preditivo**: Usar os dados históricos para predizer setores e períodos de maior risco
- **Integração com eSocial**: Automatizar o preenchimento de CATs com dados de câmeras
- **Benchmark setorial**: Comparar taxas de acidentes entre empresas do mesmo CNAE

---

## 12. PRÓXIMOS PASSOS

| Prioridade | Item | Status |
|------------|------|--------|
| 🔴 Alta | Integração com modelo YOLO para detecção de EPIs em vídeo | Planejado |
| 🔴 Alta | Deploy na Vercel com domínio customizado | Planejado |
| 🟡 Média | API REST para consumo dos dados por terceiros | Planejado |
| 🟡 Média | Exportação de relatórios em PDF | Planejado |
| 🟢 Baixa | Dashboard em tempo real com streaming | Futuro |
| 🟢 Baixa | Versão mobile responsiva aprimorada | Futuro |
| 🟢 Baixa | Testes unitários e E2E (Jest + Cypress) | Futuro |

---

## COMPETÊNCIAS DEMONSTRADAS

| Área | Habilidades Aplicadas |
|------|----------------------|
| **Data Engineering** | Pipeline ETL com Python/Pandas, transformação de 373k registros, otimização de payload (99,6% de redução), normalização de dados, classificação por regras de negócio |
| **Frontend Development** | React 18 com hooks, componentização modular (11 componentes), state management, carregamento dinâmico de dados, CSS responsivo |
| **Data Visualization** | Recharts (6 tipos de gráfico), mapa geográfico com d3-scale, SVG interativo customizado |
| **Product Thinking** | Definição de problema de negócio, persona de usuário, hipótese testável, métricas de impacto |
| **Clean Code** | Estrutura de pastas organizada, nomenclatura consistente, documentação completa |
| **DevOps** | Git/GitHub, Vite build system, gerenciamento de dependências npm |

---

*Dados reais do Ministério do Trabalho e Emprego — Portal de Dados Abertos do Governo Federal*

*Relatório gerado em Fevereiro de 2026*
