import React from "react";
import { Search, History, Users, SlidersHorizontal, Sparkles } from "lucide-react";

interface HeaderProps {
  currentTab: 'catalog' | 'history';
  setCurrentTab: (tab: 'catalog' | 'history') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  savedReportsCount: number;
  patients: any[];
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  lockPatient: boolean;
}

export default function Header({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  savedReportsCount,
  patients,
  selectedPatientId,
  setSelectedPatientId,
  lockPatient
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur border-b border-gray-900 px-4 md:px-10 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand logo & name */}
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => setCurrentTab('catalog')}
        id="header-brand-container"
      >
        <div className="w-10 h-10 rounded bg-[#00A3FF] flex items-center justify-center text-white font-extrabold text-2xl tracking-tighter shadow-lg shadow-[#00A3FF]/20 group-hover:bg-[#008fe0] transition-all">
          Ψ
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-extrabold text-[#00A3FF] tracking-tighter uppercase font-display select-none">
            Psico<span className="text-white">Metrik</span>
          </span>
          <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
            Clínica e Neurociência
          </span>
        </div>
      </div>

      {/* Main Netflix styled navigation links */}
      <nav className="flex items-center gap-6 text-sm" id="header-navigation">
        <button
          onClick={() => setCurrentTab('catalog')}
          className={`font-semibold pb-1 border-b-2 transition-all ${
            currentTab === 'catalog' 
              ? 'text-white border-[#00A3FF]' 
              : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
          id="nav-catalogo-btn"
        >
          Navegar Catálogo
        </button>

        <button
          onClick={() => setCurrentTab('history')}
          className={`flex items-center gap-2 font-semibold pb-1 border-b-2 transition-all ${
            currentTab === 'history' 
              ? 'text-white border-[#00A3FF]' 
              : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
          id="nav-historico-btn"
        >
          <History className="w-4 h-4 text-[#00A3FF]" />
          Histórico de Laudos
          {savedReportsCount > 0 && (
            <span className="bg-[#00A3FF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {savedReportsCount}
            </span>
          )}
        </button>
      </nav>

      {/* Patient Selector */}
      <div className="flex items-center gap-2" id="header-patient-selector">
        <Users size={14} className="text-gray-400" />
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          disabled={lockPatient}
          className="bg-gray-900 border border-gray-800 text-xs text-white rounded-md px-3 py-1.5 focus:outline-none focus:border-[#00A3FF] max-w-[200px] truncate disabled:opacity-50 cursor-pointer"
        >
          <option value="">-- Selecionar Paciente --</option>
          {(patients || []).map(p => (
            <option key={p.id} value={p.id} className="bg-[#141414]">
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Search and Filters, visible in catalog mode */}
      <div className="flex items-center gap-3 w-full md:w-auto" id="header-controls">
        {currentTab === 'catalog' && (
          <>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar ferramenta ou habilidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141414] border border-gray-800 text-xs rounded-md py-1.5 pl-10 pr-4 focus:outline-none focus:border-[#00A3FF] transition-all"
                id="search-input"
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
