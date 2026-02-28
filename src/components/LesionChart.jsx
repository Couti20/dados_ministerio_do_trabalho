import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function LesionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass rounded-xl p-6 h-96 flex items-center justify-center">
        <p className="text-slate-400">Carregando dados de lesões...</p>
      </div>
    )
  }

  // Cores baseadas na gravidade implícita
  const getColor = (lesao) => {
    const grave = ['fratura', 'amputacao', 'esmagament', 'perda']
    const moderada = ['corte', 'laceracao', 'luxacao', 'queimadura']
    const leve = ['contusao', 'distensao', 'torcao']
    
    const lesaoLower = lesao.toLowerCase()
    if (grave.some(g => lesaoLower.includes(g))) return '#ef4444'
    if (moderada.some(m => lesaoLower.includes(m))) return '#f59e0b'
    if (leve.some(l => lesaoLower.includes(l))) return '#fcd34d'
    return '#3b82f6'
  }

  // Ícones para cada tipo de lesão
  const getIcon = (lesao) => {
    const lesaoLower = lesao.toLowerCase()
    if (lesaoLower.includes('fratura')) return '🦴'
    if (lesaoLower.includes('corte') || lesaoLower.includes('lacera')) return '🩸'
    if (lesaoLower.includes('contusao') || lesaoLower.includes('esmagament')) return '💢'
    if (lesaoLower.includes('queimadura')) return '🔥'
    if (lesaoLower.includes('luxacao')) return '🔄'
    if (lesaoLower.includes('distensao') || lesaoLower.includes('torcao')) return '💪'
    return '⚠️'
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="glass rounded-lg p-3 border border-slate-600">
          <p className="text-white font-medium">{item.lesao}</p>
          <p className="text-warning-500 font-bold mt-1">
            {item.total.toLocaleString('pt-BR')} casos
          </p>
          <p className="text-slate-400 text-sm">{item.percentual}% do total</p>
        </div>
      )
    }
    return null
  }

  // Preparar dados
  const chartData = data.map(item => ({
    ...item,
    shortLesao: item.lesao.length > 18 ? item.lesao.substring(0, 18) + '...' : item.lesao,
    icon: getIcon(item.lesao)
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Tipos de Lesões</h3>
        <p className="text-slate-400 text-sm">Natureza das lesões mais frequentes</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <YAxis 
            type="category"
            dataKey="shortLesao"
            width={140}
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar 
            dataKey="total" 
            radius={[0, 4, 4, 0]}
            animationDuration={1500}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.lesao)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Lista com ícones */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.slice(0, 6).map((item, index) => (
          <motion.div
            key={item.lesao}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30"
          >
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{item.lesao}</p>
              <p className="text-slate-400 text-xs">{item.percentual}%</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legenda de gravidade */}
      <div className="mt-4 flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-danger-500"></div>
          <span className="text-slate-400">Grave</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-warning-500"></div>
          <span className="text-slate-400">Moderada</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-300"></div>
          <span className="text-slate-400">Leve</span>
        </div>
      </div>
    </motion.div>
  )
}
