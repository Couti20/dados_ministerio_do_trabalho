import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { scaleQuantile } from 'd3-scale'

// TopoJSON do Brasil
const BRAZIL_TOPO_URL = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson'

export default function MapaBrasil({ data }) {
  const [tooltipContent, setTooltipContent] = useState('')
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [hoveredState, setHoveredState] = useState(null)

  // Criar mapa de dados por sigla
  const dataMap = useMemo(() => {
    const map = {}
    data.forEach(item => {
      map[item.sigla] = item
    })
    return map
  }, [data])

  // Escala de cores
  const colorScale = useMemo(() => {
    const values = data.map(d => d.total).sort((a, b) => a - b)
    return scaleQuantile()
      .domain(values)
      .range([
        '#fef3c7', // Muito baixo
        '#fcd34d', // Baixo
        '#f59e0b', // Médio
        '#d97706', // Alto
        '#b45309', // Muito alto
        '#92400e', // Extremo
      ])
  }, [data])

  const getStateColor = (sigla) => {
    const stateData = dataMap[sigla]
    if (!stateData) return '#334155'
    return colorScale(stateData.total)
  }

  const handleMouseEnter = (geo, evt) => {
    const sigla = geo.properties.sigla
    const stateData = dataMap[sigla]
    
    if (stateData) {
      setTooltipContent(`${stateData.UF}: ${stateData.total.toLocaleString('pt-BR')} acidentes`)
      setHoveredState(sigla)
    }
  }

  const handleMouseLeave = () => {
    setTooltipContent('')
    setHoveredState(null)
  }

  // Top 5 estados para o ranking
  const topEstados = useMemo(() => {
    return [...data].sort((a, b) => b.total - a.total).slice(0, 5)
  }, [data])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Mapa */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="lg:col-span-2 glass rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Mapa de Acidentes por Estado</h3>
        
        <div className="relative">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 650,
              center: [-54, -15]
            }}
            style={{ width: '100%', height: 'auto' }}
          >
            <Geographies geography={BRAZIL_TOPO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const sigla = geo.properties.sigla
                  const isHovered = hoveredState === sigla
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getStateColor(sigla)}
                      stroke="#1e293b"
                      strokeWidth={isHovered ? 2 : 0.5}
                      style={{
                        default: {
                          outline: 'none',
                          transition: 'all 0.3s ease',
                        },
                        hover: {
                          fill: '#ef4444',
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        pressed: {
                          outline: 'none',
                        },
                      }}
                      onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                      onMouseLeave={handleMouseLeave}
                    />
                  )
                })
              }
            </Geographies>
          </ComposableMap>

          {/* Tooltip */}
          {tooltipContent && (
            <div className="absolute top-4 left-4 glass rounded-lg px-4 py-2 pointer-events-none">
              <p className="text-white font-medium">{tooltipContent}</p>
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-slate-400 text-sm">Menos</span>
          <div className="flex">
            {['#fef3c7', '#fcd34d', '#f59e0b', '#d97706', '#b45309', '#92400e'].map((color, i) => (
              <div key={i} className="w-8 h-4" style={{ backgroundColor: color }}></div>
            ))}
          </div>
          <span className="text-slate-400 text-sm">Mais</span>
        </div>
      </motion.div>

      {/* Ranking */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Top 5 Estados</h3>
        
        <div className="space-y-4">
          {topEstados.map((estado, index) => (
            <div key={estado.sigla} className="relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${index === 0 ? 'bg-danger-500 text-white' : 
                      index === 1 ? 'bg-warning-500 text-white' : 
                      index === 2 ? 'bg-yellow-600 text-white' : 
                      'bg-slate-600 text-slate-300'}`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-white font-medium">{estado.sigla}</span>
                </div>
                <span className="text-slate-300 font-semibold">
                  {estado.total.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(estado.total / topEstados[0].total) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-full rounded-full ${
                    index === 0 ? 'bg-danger-500' : 
                    index === 1 ? 'bg-warning-500' : 
                    index === 2 ? 'bg-yellow-500' : 
                    'bg-slate-500'
                  }`}
                />
              </div>
              <p className="text-slate-500 text-xs mt-1">{estado.UF}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
