import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import SectorFilter from './components/SectorFilter'
import MetricCards from './components/MetricCards'
import TimelineChart from './components/TimelineChart'
import MapaBrasil from './components/MapaBrasil'
import EPIChart from './components/EPIChart'
import BodyDiagram from './components/BodyDiagram'
import DemographicsCharts from './components/DemographicsCharts'
import SectorChart from './components/SectorChart'
import LesionChart from './components/LesionChart'
import Footer from './components/Footer'

function App() {
  const [data, setData] = useState({
    metricas: null,
    porMes: [],
    porUf: [],
    porEpi: [],
    porCorpo: [],
    porRegiao: [],
    porSexo: [],
    porIdade: [],
    porLesao: [],
    porCnae: [],
    cruzamento: []
  })
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')
  const [selectedSector, setSelectedSector] = useState('industria') // Começa focado em Indústria!

  // Mapeamento de sufixos por setor
  const getSuffix = (sector) => {
    const suffixes = {
      'todos': '',
      'industria': '_industria',
      'logistica': '_logistica',
      'saude': '_saude'
    }
    return suffixes[sector] || ''
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const suffix = getSuffix(selectedSector)
        
        const files = [
          `metricas${suffix}`, 
          `por_mes${suffix}`, 
          `por_uf${suffix}`, 
          `por_epi${suffix}`, 
          `por_corpo${suffix}`, 
          `por_regiao_corpo${suffix}`, 
          `por_sexo${suffix}`, 
          `por_idade${suffix}`, 
          `por_lesao${suffix}`, 
          `por_cnae${suffix}`, 
          `cruzamento_epi_setor${suffix}`
        ]
        
        const results = await Promise.all(
          files.map(f => fetch(`/data/${f}.json`).then(r => r.json()))
        )
        
        setData({
          metricas: results[0],
          porMes: results[1],
          porUf: results[2],
          porEpi: results[3],
          porCorpo: results[4],
          porRegiao: results[5],
          porSexo: results[6],
          porIdade: results[7],
          porLesao: results[8],
          porCnae: results[9],
          cruzamento: results[10]
        })
        setLoading(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setLoading(false)
      }
    }
    
    loadData()
  }, [selectedSector]) // Recarrega quando o setor muda!

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-warning-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Carregando dados de acidentes...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Filtro de Macro-Setor */}
        <SectorFilter 
          selectedSector={selectedSector} 
          onSectorChange={setSelectedSector} 
        />

        {/* Seção 1: Visão Geral */}
        <motion.section 
          id="overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionTitle 
            title="Visão Geral" 
            subtitle={selectedSector === 'industria' 
              ? "Acidentes em Indústria & Construção - Foco para detecção de EPIs" 
              : "Panorama dos acidentes de trabalho no Brasil - 2024"}
            icon="📊"
          />
          <MetricCards metricas={data.metricas} sector={selectedSector} />
          <div className="mt-8">
            <TimelineChart data={data.porMes} />
          </div>
        </motion.section>

        {/* Seção 2: Análise Geográfica */}
        <motion.section 
          id="geographic"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SectionTitle 
            title="Análise Geográfica" 
            subtitle="Distribuição de acidentes por estado brasileiro"
            icon="🗺️"
          />
          <MapaBrasil data={data.porUf} />
        </motion.section>

        {/* Seção 3: EPIs e Causas */}
        <motion.section 
          id="epi"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SectionTitle 
            title="Análise de EPIs" 
            subtitle="Inferência de equipamentos de proteção faltantes"
            icon="🦺"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EPIChart data={data.porEpi} />
            <BodyDiagram data={data.porRegiao} detalhes={data.porCorpo} />
          </div>
        </motion.section>

        {/* Seção 4: Setores e Lesões */}
        <motion.section 
          id="sectors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SectionTitle 
            title="Setores e Lesões" 
            subtitle="Indústrias mais afetadas e tipos de lesões"
            icon="🏭"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectorChart data={data.porCnae} />
            <LesionChart data={data.porLesao} />
          </div>
        </motion.section>

        {/* Seção 5: Demografia */}
        <motion.section 
          id="demographics"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <SectionTitle 
            title="Perfil Demográfico" 
            subtitle="Distribuição por sexo e faixa etária"
            icon="👥"
          />
          <DemographicsCharts sexoData={data.porSexo} idadeData={data.porIdade} />
        </motion.section>

        {/* Call to Action - Visão Computacional */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass rounded-2xl p-8 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <span className="text-5xl mb-4 block">🤖</span>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-warning-500 to-danger-500 bg-clip-text text-transparent">
              A Solução: Visão Computacional
            </h2>
            <p className="text-slate-300 text-lg mb-6">
              Com base nesses dados, fica evidente que a fiscalização humana não consegue prevenir 
              a maioria dos acidentes. A implementação de um sistema de <strong className="text-warning-500">detecção 
              de EPIs em tempo real</strong> utilizando modelos YOLO pode identificar automaticamente 
              trabalhadores sem equipamentos de proteção antes que acidentes ocorram.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="glass rounded-lg px-6 py-3">
                <span className="text-2xl font-bold text-warning-500">{data.metricas?.totalAcidentes?.toLocaleString('pt-BR')}</span>
                <p className="text-slate-400 text-sm">Acidentes que poderiam ser prevenidos</p>
              </div>
              <div className="glass rounded-lg px-6 py-3">
                <span className="text-2xl font-bold text-danger-500">~70%</span>
                <p className="text-slate-400 text-sm">Relacionados à falta de EPI</p>
              </div>
              <div className="glass rounded-lg px-6 py-3">
                <span className="text-2xl font-bold text-success-500">YOLO v8</span>
                <p className="text-slate-400 text-sm">Detecção em tempo real</p>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  )
}

function SectionTitle({ title, subtitle, icon }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <p className="text-slate-400 ml-12">{subtitle}</p>
    </div>
  )
}

export default App
