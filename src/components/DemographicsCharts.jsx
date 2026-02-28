import { motion } from 'framer-motion'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

export default function DemographicsCharts({ sexoData, idadeData }) {
  const COLORS_SEXO = ['#3b82f6', '#ec4899']
  const COLORS_IDADE = ['#22c55e', '#84cc16', '#eab308', '#f59e0b', '#ef4444', '#dc2626', '#7f1d1d']

  const CustomTooltipSexo = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="glass rounded-lg p-3 border border-slate-600">
          <p className="text-white font-medium">{item.sexo}</p>
          <p className="text-warning-500 font-bold">
            {item.total.toLocaleString('pt-BR')} acidentes
          </p>
          <p className="text-slate-400 text-sm">{item.percentual}%</p>
        </div>
      )
    }
    return null
  }

  const CustomTooltipIdade = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="glass rounded-lg p-3 border border-slate-600">
          <p className="text-white font-medium">Faixa: {item.faixa}</p>
          <p className="text-warning-500 font-bold">
            {item.total.toLocaleString('pt-BR')} acidentes
          </p>
          <p className="text-slate-400 text-sm">{item.percentual}%</p>
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico por Sexo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6"
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Distribuição por Sexo</h3>
          <p className="text-slate-400 text-sm">Gênero das vítimas de acidentes</p>
        </div>

        <div className="flex items-center">
          <ResponsiveContainer width="50%" height={200}>
            <PieChart>
              <Pie
                data={sexoData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="total"
                animationDuration={1500}
              >
                {sexoData?.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.sexo === 'Masculino' ? COLORS_SEXO[0] : COLORS_SEXO[1]}
                    stroke="#1e293b"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipSexo />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 space-y-4">
            {sexoData?.map((item, index) => (
              <motion.div
                key={item.sexo}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-center gap-3"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl
                  ${item.sexo === 'Masculino' ? 'bg-blue-500/20' : 'bg-pink-500/20'}`}
                >
                  {item.sexo === 'Masculino' ? '👨' : '👩'}
                </div>
                <div>
                  <p className="text-white font-medium">{item.sexo}</p>
                  <p className="text-slate-400 text-sm">
                    {item.total.toLocaleString('pt-BR')} <span className="text-slate-500">({item.percentual}%)</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Insight */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-sm">
            <strong>💡 Insight:</strong> A predominância masculina reflete a maior presença 
            de homens em setores de risco como construção civil e indústria.
          </p>
        </div>
      </motion.div>

      {/* Gráfico por Faixa Etária */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6"
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Distribuição por Idade</h3>
          <p className="text-slate-400 text-sm">Faixa etária das vítimas</p>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={idadeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="faixa" 
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis 
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltipIdade />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar 
              dataKey="total" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
              {idadeData?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS_IDADE[index % COLORS_IDADE.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {idadeData && idadeData.length > 0 && (
            <>
              <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                <p className="text-warning-500 font-bold text-lg">
                  {idadeData.reduce((max, item) => item.total > max.total ? item : max, idadeData[0])?.faixa}
                </p>
                <p className="text-slate-400 text-xs">Faixa mais afetada</p>
              </div>
              <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                <p className="text-success-500 font-bold text-lg">
                  {idadeData[0]?.faixa}
                </p>
                <p className="text-slate-400 text-xs">Mais jovens</p>
              </div>
              <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                <p className="text-danger-500 font-bold text-lg">
                  {idadeData[idadeData.length - 1]?.faixa}
                </p>
                <p className="text-slate-400 text-xs">Mais velhos</p>
              </div>
            </>
          )}
        </div>

        {/* Insight */}
        <div className="mt-4 p-3 bg-warning-500/10 border border-warning-500/20 rounded-lg">
          <p className="text-warning-400 text-sm">
            <strong>💡 Insight:</strong> Trabalhadores entre 25-44 anos representam a maior
            parcela, coincidindo com o período de maior atividade profissional.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
