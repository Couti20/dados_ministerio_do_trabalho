import { motion } from 'framer-motion'
import { AlertTriangle, MapPin, Users, TrendingUp, Shield } from 'lucide-react'

export default function MetricCards({ metricas, sector }) {
  if (!metricas) return null

  const isMaioriaMasculina = (metricas.percentualMasculino || 0) >= 50
  const generoLabel = isMaioriaMasculina ? 'Sexo Masculino' : 'Sexo Feminino'
  const generoValor = isMaioriaMasculina 
    ? metricas.percentualMasculino 
    : (100 - (metricas.percentualMasculino || 0)).toFixed(1)

  const cards = [
    {
      title: 'Total de Acidentes',
      value: metricas.totalAcidentes?.toLocaleString('pt-BR') || '0',
      subtitle: 'Acidentes típicos em 2024',
      icon: AlertTriangle,
      color: 'danger',
      trend: null
    },
    {
      title: 'Estados Afetados',
      value: metricas.totalEstados || '0',
      subtitle: 'Unidades federativas',
      icon: MapPin,
      color: 'primary',
      trend: null
    },
    {
      title: 'Idade Média',
      value: `${metricas.idadeMedia || 0} anos`,
      subtitle: 'Faixa etária das vítimas',
      icon: Users,
      color: 'warning',
      trend: null
    },
    {
      title: generoLabel,
      value: `${generoValor}%`,
      subtitle: 'Predominância de gênero',
      icon: TrendingUp,
      color: 'success',
      trend: null
    },
    {
      title: 'EPI Mais Faltante',
      value: metricas.topEPI || 'N/A',
      subtitle: 'Equipamento mais ausente',
      icon: Shield,
      color: 'warning',
      trend: null
    }
  ]

  const colorClasses = {
    danger: 'from-danger-500 to-danger-700 glow-danger',
    primary: 'from-primary-500 to-primary-700 glow-primary',
    warning: 'from-warning-500 to-warning-600 glow-warning',
    success: 'from-success-500 to-success-600'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="glass rounded-xl p-5 card-hover"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[card.color]} 
              flex items-center justify-center`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">{card.title}</h3>
          <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
          <p className="text-slate-500 text-xs">{card.subtitle}</p>
        </motion.div>
      ))}
    </div>
  )
}
