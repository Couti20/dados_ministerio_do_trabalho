import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { AlertTriangle, Scale, Shield, TrendingUp } from 'lucide-react'

const CORES_GRAVIDADE = {
  'Leve': '#f59e0b',
  'Média': '#f97316',
  'Grave': '#ef4444',
  'Outros': '#6b7280'
}

const formatarMoeda = (valor) => {
  if (valor >= 1e9) return `R$ ${(valor / 1e9).toFixed(2).replace('.', ',')} bi`
  if (valor >= 1e6) return `R$ ${(valor / 1e6).toFixed(1).replace('.', ',')} mi`
  if (valor >= 1e3) return `R$ ${(valor / 1e3).toFixed(1).replace('.', ',')} mil`
  return `R$ ${valor.toLocaleString('pt-BR')}`
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="glass rounded-lg p-4 border border-slate-600">
        <p className="text-white font-bold text-sm mb-2">{d.gravidade}</p>
        <p className="text-slate-300 text-xs mb-1">{d.descricao}</p>
        <div className="space-y-1 mt-2">
          <p className="text-yellow-400 text-xs">
            ⚖️ Multas NR-28: {formatarMoeda(d.totalMultas)}
          </p>
          <p className="text-red-400 text-xs">
            🏛️ Indenizações CLT: {formatarMoeda(d.totalIndenizacoes)}
          </p>
          <p className="text-white text-xs font-bold">
            💰 Total: {formatarMoeda(d.custoTotal)}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {d.totalAcidentes.toLocaleString('pt-BR')} acidentes ({d.percentual}%)
          </p>
        </div>
      </div>
    )
  }
  return null
}

export default function FinancialImpact({ data }) {
  if (!data) return null

  const chartData = data.classificacaoGravidade.map(item => ({
    gravidade: item.gravidade,
    descricao: item.descricao,
    totalAcidentes: item.totalAcidentes,
    percentual: item.percentual,
    totalMultas: item.totalAcidentes * item.multaMedia,
    totalIndenizacoes: item.totalAcidentes * item.indenizacaoMedia,
    custoTotal: item.totalAcidentes * (item.multaMedia + item.indenizacaoMedia),
    cor: CORES_GRAVIDADE[item.gravidade]
  }))

  return (
    <div className="space-y-6">
      {/* Cards de indicadores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.indicadores.map((ind, i) => (
          <motion.div
            key={ind.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-4 border border-slate-700/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{ind.icone}</span>
              <span className="text-xs text-slate-400 leading-tight">{ind.label}</span>
            </div>
            <p className="text-xl lg:text-2xl font-bold" style={{ color: ind.cor }}>
              {ind.valor}
            </p>
            <p className="text-xs text-slate-500 mt-1">{ind.descricao}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras por gravidade */}
        <div className="glass rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <AlertTriangle size={20} className="text-warning-500" />
            Custo por Gravidade da Lesão
          </h3>
          <p className="text-xs text-slate-400 mb-4">Multas + indenizações estimadas (R$)</p>
          
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                type="number" 
                tickFormatter={(v) => formatarMoeda(v)}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#475569' }}
              />
              <YAxis 
                dataKey="gravidade" 
                type="category" 
                tick={{ fill: '#e2e8f0', fontSize: 13 }}
                width={60}
                axisLine={{ stroke: '#475569' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="custoTotal" radius={[0, 6, 6, 0]} barSize={36}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela de fundamentação legal */}
        <div className="glass rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <Scale size={20} className="text-blue-400" />
            Fundamentação Legal
          </h3>
          <p className="text-xs text-slate-400 mb-4">Base legal das estimativas financeiras</p>
          
          <div className="space-y-4">
            {/* NR-28 */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-500">Multas — NR-28</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A <strong className="text-white">Norma Regulamentadora 28</strong> (Fiscalização e Penalidades) 
                estabelece multas por infração trabalhista. A falta de EPI é classificada como 
                <strong className="text-yellow-400"> infração grau 4</strong> (mais grave). 
                Para empresas de médio porte, a multa base gira entre R$ 2.500 e R$ 4.000 por auto de infração.
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Valor médio utilizado: <strong className="text-yellow-400">R$ 3.000,00</strong> por ocorrência
              </p>
            </div>

            {/* CLT Art. 223-G */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Scale size={16} className="text-red-400" />
                <span className="text-sm font-semibold text-red-400">Indenizações — CLT Art. 223-G</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A <strong className="text-white">Reforma Trabalhista de 2017</strong> definiu tetos de indenização 
                por dano moral baseados no salário. Para <strong className="text-slate-200">ofensa leve</strong> (corte): até 3× salário (~R$ 5 mil); 
                <strong className="text-slate-200"> ofensa média</strong> (fratura): até 5× (~R$ 15 mil); 
                <strong className="text-slate-200"> ofensa grave</strong> (esmagamento): até 20× (~R$ 60 mil).
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Salário-base médio do setor industrial: <strong className="text-red-400">~R$ 2.500,00</strong>
              </p>
            </div>

            {/* Nota */}
            <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-500/20">
              <p className="text-xs text-blue-300 flex items-start gap-2">
                <TrendingUp size={14} className="mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Nota metodológica:</strong> Estimativas paramétricas baseadas em modelagem de risco 
                  atuarial. Valores reais podem variar conforme porte da empresa, reincidência e decisão judicial.
                  Dados exclusivos para <strong>Indústria & Construção</strong> (144.560 acidentes).
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
