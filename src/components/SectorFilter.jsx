import { motion } from 'framer-motion'
import { Factory, Building2, Stethoscope, Truck, LayoutGrid } from 'lucide-react'

const MACRO_SETORES = [
  {
    id: 'industria',
    label: 'Indústria & Construção',
    icon: Factory,
    color: 'warning',
    description: 'Onde EPIs visuais (capacete, colete, bota) são essenciais',
    cnaes: [4120, 4321, 4399, 4329, 1011, 1012, 2599, 2511, 4292, 4313],
    destaque: true
  },
  {
    id: 'logistica',
    label: 'Logística & Transporte',
    icon: Truck,
    color: 'primary',
    description: 'Armazéns, entregas e movimentação de cargas',
    cnaes: [4930, 4921, 5212, 5211, 4911, 5231],
    destaque: false
  },
  {
    id: 'saude',
    label: 'Saúde',
    icon: Stethoscope,
    color: 'success',
    description: 'Hospitais e clínicas - EPIs diferentes (máscaras, luvas)',
    cnaes: [8610, 8630, 8640, 8650, 8660, 8690],
    destaque: false
  },
  {
    id: 'todos',
    label: 'Todos os Setores',
    icon: LayoutGrid,
    color: 'slate',
    description: 'Visão completa de todos os setores econômicos',
    cnaes: [],
    destaque: false
  }
]

export default function SectorFilter({ selectedSector, onSectorChange }) {
  const colorClasses = {
    warning: 'bg-warning-500/20 border-warning-500 text-warning-500',
    primary: 'bg-primary-500/20 border-primary-500 text-primary-500',
    success: 'bg-success-500/20 border-success-500 text-success-500',
    slate: 'bg-slate-500/20 border-slate-500 text-slate-400'
  }

  const selectedData = MACRO_SETORES.find(s => s.id === selectedSector)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4 mb-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span className="text-warning-500">🎯</span>
            Foco da Análise
          </h3>
          <p className="text-slate-400 text-sm">
            {selectedData?.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {MACRO_SETORES.map((setor) => {
            const isSelected = selectedSector === setor.id
            const Icon = setor.icon
            
            return (
              <motion.button
                key={setor.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSectorChange(setor.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
                  ${isSelected 
                    ? colorClasses[setor.color]
                    : 'border-slate-600 text-slate-400 hover:border-slate-500'
                  }
                  ${setor.destaque && !isSelected ? 'ring-1 ring-warning-500/30' : ''}
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{setor.label}</span>
                {setor.destaque && (
                  <span className="text-xs bg-warning-500 text-black px-1.5 py-0.5 rounded font-bold">
                    YOLO
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {selectedSector === 'industria' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-warning-500/10 border border-warning-500/30 rounded-lg"
        >
          <p className="text-warning-400 text-sm">
            <strong>💡 Por que este foco?</strong> Construção Civil e Indústria são os setores 
            onde a <strong>detecção visual de EPIs</strong> (capacete, colete, bota) tem maior 
            impacto. É aqui que o modelo YOLO pode prevenir a maioria dos acidentes graves.
          </p>
        </motion.div>
      )}

      {selectedSector === 'saude' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-slate-700/50 border border-slate-600 rounded-lg"
        >
          <p className="text-slate-300 text-sm">
            <strong>⚠️ Nota:</strong> O setor de Saúde tem alto volume de acidentes, mas os EPIs 
            são diferentes (máscaras, luvas descartáveis). A detecção por câmera é menos efetiva 
            neste contexto.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

export { MACRO_SETORES }
