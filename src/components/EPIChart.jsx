import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export default function EPIChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass rounded-xl p-6 h-96 flex items-center justify-center">
        <p className="text-slate-400">Carregando dados de EPIs...</p>
      </div>
    )
  }

  // Filtrar "Outros" para destacar EPIs específicos
  const dataFiltrada = data.filter(d => d.epi !== 'Outros / Nao Mapeado')
  const outros = data.find(d => d.epi === 'Outros / Nao Mapeado')

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#6366f1']

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="glass rounded-lg p-3 border border-slate-600">
          <p className="text-white font-medium">{item.epi}</p>
          <p className="text-warning-500 font-bold">
            {item.total.toLocaleString('pt-BR')} casos
          </p>
          <p className="text-slate-400 text-sm">{item.percentual}% do total</p>
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, epi }) => {
    if (percent < 0.05) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">EPIs Potencialmente Ausentes</h3>
        <p className="text-slate-400 text-sm">Inferência baseada no tipo de lesão e parte atingida</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gráfico de Pizza */}
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={dataFiltrada}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={40}
              fill="#8884d8"
              dataKey="total"
              animationDuration={1500}
            >
              {dataFiltrada.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.cor || COLORS[index % COLORS.length]} 
                  stroke="#1e293b"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Lista detalhada */}
        <div className="space-y-3">
          {dataFiltrada.map((item, index) => (
            <motion.div
              key={item.epi}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.cor || COLORS[index % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{item.epi}</p>
                <div className="h-1.5 bg-slate-700 rounded-full mt-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentual}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.cor || COLORS[index % COLORS.length] }}
                  />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white font-semibold text-sm">
                  {item.total.toLocaleString('pt-BR')}
                </p>
                <p className="text-slate-500 text-xs">{item.percentual}%</p>
              </div>
            </motion.div>
          ))}
          
          {outros && (
            <div className="pt-3 border-t border-slate-700">
              <p className="text-slate-400 text-sm">
                <span className="text-slate-500">Outros/Não mapeados:</span>{' '}
                <span className="text-white">{outros.total.toLocaleString('pt-BR')}</span>
                <span className="text-slate-500"> ({outros.percentual}%)</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
