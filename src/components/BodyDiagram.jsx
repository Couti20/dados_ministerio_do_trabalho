import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

export default function BodyDiagram({ data, detalhes }) {
  const [hoveredRegion, setHoveredRegion] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)

  // Calcular intensidade de cor baseada nos dados
  const maxValue = useMemo(() => {
    if (!data) return 1
    return Math.max(...data.map(d => d.total))
  }, [data])

  const getRegionData = (regiao) => {
    if (!data) return null
    return data.find(d => d.regiao === regiao)
  }

  const getColor = (regiao) => {
    const regionData = getRegionData(regiao)
    if (!regionData) return '#334155'
    
    const intensity = regionData.total / maxValue
    if (intensity > 0.7) return '#ef4444' // Vermelho - Alto risco
    if (intensity > 0.4) return '#f59e0b' // Laranja - Médio risco
    if (intensity > 0.2) return '#fcd34d' // Amarelo - Baixo risco
    return '#22c55e' // Verde - Muito baixo
  }

  const regions = {
    cabeca: { cx: 100, cy: 35, r: 25, label: 'Cabeça' },
    torax: { cx: 100, cy: 100, width: 50, height: 60, label: 'Tórax' },
    braco_esq: { cx: 50, cy: 95, width: 15, height: 55, label: 'Braço' },
    braco_dir: { cx: 135, cy: 95, width: 15, height: 55, label: 'Braço' },
    mao_esq: { cx: 42, cy: 160, r: 12, label: 'Mão' },
    mao_dir: { cx: 158, cy: 160, r: 12, label: 'Mão' },
    perna_esq: { cx: 82, cy: 200, width: 18, height: 70, label: 'Perna' },
    perna_dir: { cx: 102, cy: 200, width: 18, height: 70, label: 'Perna' },
    pe_esq: { cx: 78, cy: 280, width: 20, height: 15, label: 'Pé' },
    pe_dir: { cx: 106, cy: 280, width: 20, height: 15, label: 'Pé' },
  }

  // Detalhes filtrados para a região selecionada
  const detalhesRegiao = useMemo(() => {
    if (!selectedRegion || !detalhes) return []
    return detalhes
      .filter(d => d.regiao === selectedRegion)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [selectedRegion, detalhes])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Partes do Corpo Atingidas</h3>
        <p className="text-slate-400 text-sm">Clique em uma região para ver detalhes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SVG do Corpo Humano */}
        <div className="flex justify-center">
          <svg viewBox="0 0 200 310" className="w-48 h-auto">
            {/* Definições de gradientes */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Cabeça */}
            <circle
              cx={regions.cabeca.cx}
              cy={regions.cabeca.cy}
              r={regions.cabeca.r}
              fill={getColor('cabeca')}
              stroke={hoveredRegion === 'cabeca' || selectedRegion === 'cabeca' ? '#fff' : '#1e293b'}
              strokeWidth={hoveredRegion === 'cabeca' || selectedRegion === 'cabeca' ? 3 : 1}
              className="cursor-pointer transition-all duration-300"
              filter={hoveredRegion === 'cabeca' ? 'url(#glow)' : ''}
              onMouseEnter={() => setHoveredRegion('cabeca')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion('cabeca')}
            />

            {/* Pescoço */}
            <rect x="92" y="58" width="16" height="15" fill={getColor('cabeca')} rx="3" />

            {/* Tórax */}
            <rect
              x={regions.torax.cx - regions.torax.width/2}
              y={regions.torax.cy - regions.torax.height/2}
              width={regions.torax.width}
              height={regions.torax.height}
              fill={getColor('torax')}
              stroke={hoveredRegion === 'torax' || selectedRegion === 'torax' ? '#fff' : '#1e293b'}
              strokeWidth={hoveredRegion === 'torax' || selectedRegion === 'torax' ? 3 : 1}
              rx="8"
              className="cursor-pointer transition-all duration-300"
              filter={hoveredRegion === 'torax' ? 'url(#glow)' : ''}
              onMouseEnter={() => setHoveredRegion('torax')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion('torax')}
            />

            {/* Braço Esquerdo */}
            <rect
              x={regions.braco_esq.cx - regions.braco_esq.width/2}
              y={regions.braco_esq.cy - regions.braco_esq.height/2}
              width={regions.braco_esq.width}
              height={regions.braco_esq.height}
              fill={getColor('braco')}
              stroke={hoveredRegion === 'braco' || selectedRegion === 'braco' ? '#fff' : '#1e293b'}
              strokeWidth={hoveredRegion === 'braco' || selectedRegion === 'braco' ? 3 : 1}
              rx="5"
              className="cursor-pointer transition-all duration-300"
              filter={hoveredRegion === 'braco' ? 'url(#glow)' : ''}
              onMouseEnter={() => setHoveredRegion('braco')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion('braco')}
            />

            {/* Braço Direito */}
            <rect
              x={regions.braco_dir.cx - regions.braco_dir.width/2}
              y={regions.braco_dir.cy - regions.braco_dir.height/2}
              width={regions.braco_dir.width}
              height={regions.braco_dir.height}
              fill={getColor('braco')}
              stroke={hoveredRegion === 'braco' || selectedRegion === 'braco' ? '#fff' : '#1e293b'}
              strokeWidth={hoveredRegion === 'braco' || selectedRegion === 'braco' ? 3 : 1}
              rx="5"
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion('braco')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion('braco')}
            />

            {/* Mão Esquerda */}
            <circle
              cx={regions.mao_esq.cx}
              cy={regions.mao_esq.cy}
              r={regions.mao_esq.r}
              fill={getColor('mao')}
              stroke={hoveredRegion === 'mao' || selectedRegion === 'mao' ? '#fff' : '#1e293b'}
              strokeWidth={hoveredRegion === 'mao' || selectedRegion === 'mao' ? 3 : 1}
              className="cursor-pointer transition-all duration-300"
              filter={hoveredRegion === 'mao' ? 'url(#glow)' : ''}
              onMouseEnter={() => setHoveredRegion('mao')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion('mao')}
            />

            {/* Mão Direita */}
            <circle
              cx={regions.mao_dir.cx}
              cy={regions.mao_dir.cy}
              r={regions.mao_dir.r}
              fill={getColor('mao')}
              stroke={hoveredRegion === 'mao' || selectedRegion === 'mao' ? '#fff' : '#1e293b'}
              strokeWidth={hoveredRegion === 'mao' || selectedRegion === 'mao' ? 3 : 1}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion('mao')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion('mao')}
            />

            {/* Quadril */}
            <rect x="75" y="130" width="50" height="25" fill={getColor('torax')} rx="5" />

            {/* Perna Esquerda */}
            <rect
              x={regions.perna_esq.cx - regions.perna_esq.width/2}
              y={regions.perna_esq.cy - regions.perna_esq.height/2}
              width={regions.perna_esq.width}
              height={regions.perna_esq.height}
              fill={getColor('perna')}
              stroke={hoveredRegion === 'perna' || selectedRegion === 'perna' ? '#fff' : '#1e293b'}
              strokeWidth={hoveredRegion === 'perna' || selectedRegion === 'perna' ? 3 : 1}
              rx="5"
              className="cursor-pointer transition-all duration-300"
              filter={hoveredRegion === 'perna' ? 'url(#glow)' : ''}
              onMouseEnter={() => setHoveredRegion('perna')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion('perna')}
            />

            {/* Perna Direita */}
            <rect
              x={regions.perna_dir.cx - regions.perna_dir.width/2}
              y={regions.perna_dir.cy - regions.perna_dir.height/2}
              width={regions.perna_dir.width}
              height={regions.perna_dir.height}
              fill={getColor('perna')}
              stroke={hoveredRegion === 'perna' || selectedRegion === 'perna' ? '#fff' : '#1e293b'}
              strokeWidth={hoveredRegion === 'perna' || selectedRegion === 'perna' ? 3 : 1}
              rx="5"
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion('perna')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion('perna')}
            />

            {/* Pé Esquerdo */}
            <ellipse
              cx={regions.pe_esq.cx}
              cy={regions.pe_esq.cy}
              rx={regions.pe_esq.width/2}
              ry={regions.pe_esq.height/2}
              fill={getColor('pe')}
              stroke={hoveredRegion === 'pe' || selectedRegion === 'pe' ? '#fff' : '#1e293b'}
              strokeWidth={hoveredRegion === 'pe' || selectedRegion === 'pe' ? 3 : 1}
              className="cursor-pointer transition-all duration-300"
              filter={hoveredRegion === 'pe' ? 'url(#glow)' : ''}
              onMouseEnter={() => setHoveredRegion('pe')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion('pe')}
            />

            {/* Pé Direito */}
            <ellipse
              cx={regions.pe_dir.cx}
              cy={regions.pe_dir.cy}
              rx={regions.pe_dir.width/2}
              ry={regions.pe_dir.height/2}
              fill={getColor('pe')}
              stroke={hoveredRegion === 'pe' || selectedRegion === 'pe' ? '#fff' : '#1e293b'}
              strokeWidth={hoveredRegion === 'pe' || selectedRegion === 'pe' ? 3 : 1}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredRegion('pe')}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => setSelectedRegion('pe')}
            />
          </svg>
        </div>

        {/* Painel de Informações */}
        <div>
          {/* Legenda */}
          <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400 text-xs mb-2">Nível de Risco:</p>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                <span className="text-xs text-slate-300">Alto</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                <span className="text-xs text-slate-300">Médio</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#fcd34d]"></div>
                <span className="text-xs text-slate-300">Baixo</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
                <span className="text-xs text-slate-300">Muito Baixo</span>
              </div>
            </div>
          </div>

          {/* Resumo por Região */}
          <div className="space-y-2">
            <p className="text-slate-400 text-sm font-medium mb-2">Resumo por Região:</p>
            {data?.sort((a, b) => b.total - a.total).map((item, index) => (
              <motion.div
                key={item.regiao}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all
                  ${selectedRegion === item.regiao ? 'bg-slate-700' : 'hover:bg-slate-800/50'}`}
                onClick={() => setSelectedRegion(item.regiao)}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getColor(item.regiao) }}
                  />
                  <span className="text-white text-sm capitalize">{item.regiao}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-semibold text-sm">
                    {item.total.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-slate-500 text-xs ml-1">({item.percentual}%)</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detalhes da região selecionada */}
          {selectedRegion && detalhesRegiao.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 bg-slate-800/50 rounded-lg"
            >
              <p className="text-warning-500 text-sm font-medium mb-2 capitalize">
                Detalhes: {selectedRegion}
              </p>
              {detalhesRegiao.map((item, i) => (
                <div key={i} className="flex justify-between text-xs py-1">
                  <span className="text-slate-300">{item.parte}</span>
                  <span className="text-white">{item.total.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
