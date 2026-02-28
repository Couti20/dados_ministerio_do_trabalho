import { motion } from 'framer-motion'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

export default function TimelineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass rounded-xl p-6 h-80 flex items-center justify-center">
        <p className="text-slate-400">Carregando dados temporais...</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg p-3 border border-slate-600">
          <p className="text-white font-medium">{payload[0]?.payload?.mesNome} 2024</p>
          <p className="text-warning-500 text-lg font-bold">
            {payload[0]?.value?.toLocaleString('pt-BR')} acidentes
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Evolução Mensal</h3>
          <p className="text-slate-400 text-sm">Acidentes de trabalho ao longo de 2024</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning-500"></div>
          <span className="text-slate-400 text-sm">Acidentes</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAcidentes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="mesNome" 
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis 
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#f59e0b" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorAcidentes)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
