import { motion } from 'framer-motion'
import { Github, Linkedin, Database, Code2, BarChart3 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="glass border-t border-slate-700/50 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sobre o Projeto */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-warning-500" />
              Sobre o Projeto
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dashboard de análise de acidentes de trabalho no Brasil, 
              construído para demonstrar competências em Engenharia de Dados, 
              Data Visualization e desenvolvimento Full Stack com React.
            </p>
          </div>

          {/* Stack Tecnológico */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-warning-500" />
              Stack Tecnológico
            </h4>
            <div className="flex flex-wrap gap-2">
              {['React', 'Vite', 'Tailwind CSS', 'Recharts', 'Framer Motion', 'Python', 'Pandas'].map(tech => (
                <span 
                  key={tech}
                  className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Fonte dos Dados */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-warning-500" />
              Fonte dos Dados
            </h4>
            <p className="text-slate-400 text-sm mb-2">
              Base CAT (Comunicação de Acidente de Trabalho)
            </p>
            <a 
              href="https://dados.gov.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-400 text-sm underline"
            >
              Portal de Dados Abertos do Governo Federal
            </a>
            <p className="text-slate-500 text-xs mt-2">
              Período: Janeiro a Dezembro de 2024
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/50 my-6"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-sm">
            © 2024 Dashboard EPI - Projeto de Portfólio
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              href="#"
              className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center 
                text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
            >
              <Github className="w-5 h-5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              href="#"
              className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center 
                text-slate-400 hover:text-white hover:bg-blue-600 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </motion.a>
          </div>
        </div>

        {/* Tech badges */}
        <div className="flex justify-center mt-6 gap-2 opacity-50">
          <img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React" />
          <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite" />
          <img src="https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind" />
          <img src="https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white" alt="Python" />
        </div>
      </div>
    </footer>
  )
}
