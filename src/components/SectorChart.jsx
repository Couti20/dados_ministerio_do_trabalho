import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function SectorChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass rounded-xl p-6 h-96 flex items-center justify-center">
        <p className="text-slate-400">Carregando dados de setores...</p>
      </div>
    )
  }

  const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899']

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="glass rounded-lg p-3 border border-slate-600 max-w-xs">
          <p className="text-warning-500 font-medium text-sm mb-1">CNAE: {item.cnae}</p>
          <p className="text-white font-bold">{item.descricao}</p>
          <p className="text-slate-300 mt-1">
            {item.total.toLocaleString('pt-BR')} acidentes ({item.percentual}%)
          </p>
        </div>
      )
    }
    return null
  }

  // Preparar dados para o gráfico (limitar descrição)
  const chartData = data.map(item => ({
    ...item,
    shortDesc: item.descricao.length > 20 ? item.descricao.substring(0, 20) + '...' : item.descricao
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Top 10 Setores (CNAE)</h3>
        <p className="text-slate-400 text-sm">Indústrias com maior número de acidentes</p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
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
            dataKey="shortDesc"
            width={150}
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
              <Cell 
                key={`cell-${index}`} 
                fill={index < 3 ? '#ef4444' : index < 6 ? '#f59e0b' : '#3b82f6'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Mini cards dos top 3 */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {data.slice(0, 3).map((item, index) => (
          <div key={item.cnae} className={`p-3 rounded-lg text-center ${
            index === 0 ? 'bg-danger-500/20 border border-danger-500/30' :
            index === 1 ? 'bg-warning-500/20 border border-warning-500/30' :
            'bg-yellow-500/20 border border-yellow-500/30'
          }`}>
            <p className="text-white text-lg font-bold">{index + 1}º</p>
            <p className="text-slate-300 text-xs truncate">{item.descricao}</p>
            <p className={`text-sm font-semibold ${
              index === 0 ? 'text-danger-500' : index === 1 ? 'text-warning-500' : 'text-yellow-500'
            }`}>
              {item.total.toLocaleString('pt-BR')}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
