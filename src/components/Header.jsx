import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Shield, BarChart3, Map, Users, Factory, Activity } from 'lucide-react'

export default function Header({ activeSection, setActiveSection }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'geographic', label: 'Geográfico', icon: Map },
    { id: 'epi', label: 'EPIs', icon: Shield },
    { id: 'sectors', label: 'Setores', icon: Factory },
    { id: 'demographics', label: 'Demografia', icon: Users },
  ]

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
    }
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warning-500 to-danger-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Dashboard EPI</h1>
              <p className="text-xs text-slate-400">Segurança do Trabalho</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'bg-warning-500/20 text-warning-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-slate-700/50"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'bg-warning-500/20 text-warning-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </motion.nav>
        )}
      </div>
    </header>
  )
}
