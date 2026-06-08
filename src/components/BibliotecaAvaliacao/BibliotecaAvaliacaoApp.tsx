import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import NetflixHero from "./components/NetflixHero";
import ToolGrid from "./components/ToolGrid";
import QuickAccess from "./components/QuickAccess";
import AssessmentWizard from "./components/AssessmentWizard";
import HistoryPanel from "./components/HistoryPanel";
import { Tool, Report, PatientInfo } from "./types";
import { INITIAL_TOOLS } from "./data";
import { FileDown, Sparkles, BookOpen, Clock, Activity, MessageSquare, History } from "lucide-react";
import { db } from "../../lib/db";
import { psicometrikDbWrapper } from "./lib/psicometrikDbWrapper";

interface BibliotecaAvaliacaoAppProps {
  activePatientId?: string;
  lockPatient?: boolean;
  userId?: string;
}

export default function App({ activePatientId, lockPatient, userId }: BibliotecaAvaliacaoAppProps) {
  // Navigation: 'catalog' | 'history'
  const [currentTab, setCurrentTab] = useState<'catalog' | 'history'>('catalog');

  interface WindowState {
    id: string;
    tool: Tool;
    isMinimized: boolean;
    isMaximized: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
  }

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [activePatient, setActivePatient] = useState<PatientInfo | null>(null);

  // Load all patients on mount
  useEffect(() => {
    db.pacientes.toArray().then(all => {
      setPatients(all);
    }).catch(err => {
      console.error("Erro ao listar pacientes:", err);
    });
  }, []);

  // Update selectedPatientId when activePatientId changes from props
  useEffect(() => {
    if (activePatientId) {
      setSelectedPatientId(String(activePatientId));
    }
  }, [activePatientId]);

  // Load patient details & history when selectedPatientId changes
  useEffect(() => {
    if (selectedPatientId) {
      db.pacientes.get(selectedPatientId).then(p => {
        if (p) {
          let age = 30;
          if (p.nascimento) {
            age = new Date().getFullYear() - new Date(p.nascimento).getFullYear();
          }
          setActivePatient({
            name: p.nome,
            age: age,
            gender: "Masculino", // Default
            clinicalContext: p.historicoHtml ? p.historicoHtml.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : "" // strip HTML tags & entities
          });
        }
      }).catch(err => {
        console.error("Erro ao carregar paciente para BibliotecaAvaliacao:", err);
      });

      // Load database history instead of LocalStorage
      psicometrikDbWrapper.getHistory(selectedPatientId).then(loadedReports => {
        setReports(loadedReports);
      }).catch(err => {
        console.error("Erro ao carregar histórico do banco:", err);
      });
    } else {
      setActivePatient(null);
      setReports([]);
    }
  }, [selectedPatientId]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Tools masterlist
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);

  // Saved reports history database
  const [reports, setReports] = useState<Report[]>([]);

  // Bookmark pinned tools for quick access
  const [pinnedToolIds, setPinnedToolIds] = useState<string[]>([]);

  // Windows State
  const [openWindows, setOpenWindows] = useState<WindowState[]>([]);
  // Store the active window ID for highlighting in taskbar
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  // Load pinned tools from LocalStorage on mount
  useEffect(() => {
    try {
      const storedPins = localStorage.getItem("psicometrik_pinned_tools");
      if (storedPins) {
        setPinnedToolIds(JSON.parse(storedPins));
      }
    } catch (err) {
      console.error("Erro ao carregar atalhos favoritos:", err);
    }
  }, []);

  const handleTogglePin = (id: string) => {
    setPinnedToolIds(prev => {
      const updated = prev.includes(id) 
        ? prev.filter(toolId => toolId !== id) 
        : [...prev, id];
      try {
        localStorage.setItem("psicometrik_pinned_tools", JSON.stringify(updated));
      } catch (err) {
        console.error("Erro ao salvar favoritos no LocalStorage:", err);
      }
      return updated;
    });
  };

  // Add report to dossier
  const handleSaveReport = async (report: Report) => {
    if (!selectedPatientId) return;
    try {
      const updated = await psicometrikDbWrapper.saveEntry(report, selectedPatientId, userId);
      setReports(updated);
    } catch (err) {
      console.error("Erro ao salvar relatório no banco:", err);
    }
  };

  // Delete report
  const handleDeleteReport = async (id: string) => {
    if (!selectedPatientId) return;
    try {
      const updated = await psicometrikDbWrapper.deleteEntry(id, selectedPatientId, userId);
      setReports(updated);
    } catch (err) {
      console.error("Erro ao deletar relatório:", err);
    }
  };

  // Edit or update existing report (therapist reviews)
  const handleUpdateReport = async (updatedReport: Report) => {
    if (!selectedPatientId) return;
    try {
      const updated = await psicometrikDbWrapper.saveEntry(updatedReport, selectedPatientId, userId);
      setReports(updated);
    } catch (err) {
      console.error("Erro ao atualizar relatório:", err);
    }
  };

  // Import full database
  const handleImportReports = async (imported: Report[]) => {
    if (!selectedPatientId) return;
    try {
      let current = [...reports];
      for (const r of imported) {
        current = await psicometrikDbWrapper.saveEntry(r, selectedPatientId, userId);
      }
      setReports(current);
    } catch (err) {
      console.error("Erro ao importar relatórios:", err);
    }
  };

  const handleSelectTool = (tool: Tool | null) => {
    if (!tool) return;
    
    // Check if tool is already open
    const existing = openWindows.find(w => w.tool.id === tool.id);
    if (existing) {
      // If minimized, restore it
      setOpenWindows(prev => prev.map(w => w.id === existing.id ? { ...w, isMinimized: false } : w));
      handleFocusWindow(existing.id);
      return;
    }

    // Stagger new window positioning
    const offset = openWindows.length * 25;
    const initialWidth = Math.min(window.innerWidth - 40, 850);
    const initialHeight = Math.min(window.innerHeight - 100, 600);
    const initialX = Math.max(20, (window.innerWidth - initialWidth) / 2 + offset % 150);
    const initialY = Math.max(60, (window.innerHeight - initialHeight) / 2 - 20 + (offset * 1.2) % 100);

    const highestZ = openWindows.reduce((max, w) => Math.max(max, w.zIndex), 10);

    const newWindow: WindowState = {
      id: `${tool.id}_${Date.now()}`,
      tool,
      isMinimized: false,
      isMaximized: false,
      x: initialX,
      y: initialY,
      width: initialWidth,
      height: initialHeight,
      zIndex: highestZ + 1
    };

    setOpenWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
  };

  const handleFocusWindow = (id: string) => {
    const highestZ = openWindows.reduce((max, w) => Math.max(max, w.zIndex), 10);
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: highestZ + 1 } : w));
    setActiveWindowId(id);
  };

  const handleCloseWindow = (id: string) => {
    setOpenWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const handleToggleMinimize = (id: string) => {
    setOpenWindows(prev => prev.map(w => {
      if (w.id === id) {
        const isMin = !w.isMinimized;
        return { ...w, isMinimized: isMin };
      }
      return w;
    }));
    // Toggle active ID focus
    const target = openWindows.find(w => w.id === id);
    if (target) {
      if (target.isMinimized) {
        // Restoring, so focus
        handleFocusWindow(id);
      } else {
        // Minimizing, so blur
        if (activeWindowId === id) {
          // Find next top window
          const others = openWindows.filter(w => w.id !== id && !w.isMinimized);
          if (others.length > 0) {
            const nextTop = others.reduce((top, w) => w.zIndex > top.zIndex ? w : top, others[0]);
            setActiveWindowId(nextTop.id);
          } else {
            setActiveWindowId(null);
          }
        }
      }
    }
  };

  const handleToggleMaximize = (id: string) => {
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const handleUpdatePosition = (id: string, x: number, y: number) => {
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const handleUpdateSize = (id: string, width: number, height: number, x?: number, y?: number) => {
    setOpenWindows(prev => prev.map(w => w.id === id ? { 
      ...w, 
      width, 
      height,
      x: x !== undefined ? x : w.x,
      y: y !== undefined ? y : w.y
    } : w));
  };

  const handleCascadeWindows = () => {
    setOpenWindows(prev => prev.map((win, idx) => {
      const offset = idx * 30;
      const initialWidth = Math.min(window.innerWidth - 45, 850);
      const initialHeight = Math.min(window.innerHeight - 110, 600);
      const initialX = Math.max(20, (window.innerWidth - initialWidth) / 4 + offset % 150);
      const initialY = Math.max(65, (window.innerHeight - initialHeight) / 4 + offset % 100);
      return {
        ...win,
        isMinimized: false,
        isMaximized: false,
        x: initialX,
        y: initialY,
        zIndex: 20 + idx
      };
    }));
  };

  const handleMinimizeAll = () => {
    const hasUnminimized = openWindows.some(w => !w.isMinimized);
    setOpenWindows(prev => prev.map(w => ({ ...w, isMinimized: hasUnminimized })));
  };

  // Start IDAI Quick simulation from the Hero Banner play trigger
  const handleStartIdaiSim = () => {
    const idaiTool = tools.find(t => t.id === "idai");
    if (idaiTool) {
      handleSelectTool(idaiTool);
    }
  };

  return (
    <div className="absolute inset-0 overflow-y-auto bg-[#0c0d10] text-[#f3f4f6]" id="app-root-view">
      
      {/* Header bar */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        savedReportsCount={reports.length}
        patients={patients}
        selectedPatientId={selectedPatientId}
        setSelectedPatientId={setSelectedPatientId}
        lockPatient={lockPatient}
      />

      {/* RENDER ACTIVE TAB VIEW */}
      {currentTab === 'catalog' && (
        !selectedPatientId ? (
          <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center text-center opacity-70 p-12 bg-[#0c0d10] text-[#f3f4f6]">
            <BookOpen size={48} className="text-[#00A3FF] mb-4 animate-pulse" />
            <h3 className="text-sm font-black uppercase tracking-widest text-[#f3f4f6]">Nenhum Paciente Selecionado</h3>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mt-2 max-w-sm leading-relaxed">
              Por favor, selecione um paciente no menu suspenso superior para visualizar o catálogo de testes e iniciar as avaliações.
            </p>
          </div>
        ) : (
          <main className="animate-fadeIn">
            {/* Billboard movie cover standard Netflix */}
            <NetflixHero />

            {/* Quick Access Icon Shortcut Menu */}
            <QuickAccess 
              tools={tools}
              pinnedToolIds={pinnedToolIds}
              onSelectTool={handleSelectTool}
              onTogglePin={handleTogglePin}
            />

            {/* Catalog grid rows */}
            <ToolGrid 
              tools={tools}
              onSelectTool={handleSelectTool}
              searchQuery={searchQuery}
              pinnedToolIds={pinnedToolIds}
              onTogglePin={handleTogglePin}
            />
          </main>
        )
      )}

      {currentTab === 'history' && (
        !selectedPatientId ? (
          <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center text-center opacity-70 p-12 bg-[#0c0d10] text-[#f3f4f6]">
            <History size={48} className="text-[#00A3FF] mb-4 animate-pulse" />
            <h3 className="text-sm font-black uppercase tracking-widest text-[#f3f4f6]">Nenhum Paciente Selecionado</h3>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mt-2 max-w-sm leading-relaxed">
              Por favor, selecione um paciente no menu suspenso superior para visualizar seu histórico de laudos psicométricos.
            </p>
          </div>
        ) : (
          <main className="py-8 animate-fadeIn">
            <HistoryPanel 
              reports={reports}
              onDeleteReport={handleDeleteReport}
              onUpdateReport={handleUpdateReport}
              onImportReports={handleImportReports}
            />
          </main>
        )
      )}

      {/* WINDOWED INSTRUMENT WORKFLOWS (WINDOWS WORKSPACE) */}
      {openWindows.map(win => (
        <AssessmentWizard
          key={win.id}
          windowId={win.id}
          tool={win.tool}
          prefilledPatient={activePatient}
          isMinimized={win.isMinimized}
          isMaximized={win.isMaximized}
          x={win.x}
          y={win.y}
          width={win.width}
          height={win.height}
          zIndex={win.zIndex}
          onFocus={() => handleFocusWindow(win.id)}
          onClose={() => handleCloseWindow(win.id)}
          onMinimize={() => handleToggleMinimize(win.id)}
          onMaximize={() => handleToggleMaximize(win.id)}
          onUpdatePosition={(x, y) => handleUpdatePosition(win.id, x, y)}
          onUpdateSize={(w, h, x, y) => handleUpdateSize(win.id, w, h, x, y)}
          onSaveReport={handleSaveReport}
        />
      ))}

      {/* BARRA DE TAREFAS (TASKBAR) */}
      {openWindows.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 h-14 bg-gray-950/80 backdrop-blur-md border-t border-gray-900/80 z-50 flex items-center justify-between px-6 select-none no-print">
          <div className="flex items-center gap-3">
            {/* Windows Symbol or Brand badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-[#00A3FF] font-black font-mono shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#00A3FF] animate-pulse"></span>
              PSICOMETRIK WORKSPACE
            </div>
            
            <div className="w-px h-6 bg-gray-850 mx-1" />
            
            {/* App taskbar tabs */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-[65vw] scrollbar-none">
              {openWindows.map(win => {
                const isActive = activeWindowId === win.id;
                return (
                  <button
                    key={win.id}
                    onClick={() => handleToggleMinimize(win.id)}
                    className={`flex items-center gap-2.5 px-4 h-10 rounded-lg text-xs font-medium border transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#00A3FF]/10 text-[#00A3FF] border-[#00A3FF]/40 shadow-lg' 
                        : 'bg-gray-900/40 text-gray-400 border-gray-800/60 hover:bg-gray-800/40 hover:text-gray-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${win.isMinimized ? 'bg-gray-600' : 'bg-emerald-500 animate-pulse'}`} />
                    <span className="max-w-[120px] truncate">{win.tool.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick layout controls */}
            <button
              onClick={handleCascadeWindows}
              className="px-3 py-1.5 rounded-lg bg-gray-900/60 border border-gray-800 text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
              title="Organizar todas as janelas em cascata"
            >
              Cascata
            </button>
            <button
              onClick={handleMinimizeAll}
              className="px-3 py-1.5 rounded-lg bg-gray-900/60 border border-gray-800 text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
              title="Minimizar todas as janelas"
            >
              Minimizar Todas
            </button>
            <div className="w-px h-6 bg-gray-850" />
            {/* Clock/Status details */}
            <div className="text-right font-mono text-[10px] text-gray-500">
              <div className="font-bold text-gray-400">{new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</div>
              <div>{new Date().toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' })}</div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-footer */}
      <footer className={`bg-gray-950/40 text-center py-6 text-xs text-gray-600 border-t border-gray-950/60 font-mono no-print ${openWindows.length > 0 ? 'pb-24' : ''}`}>
        <div className="max-w-xl mx-auto px-4 space-y-1">
          <div>PsicoMetrik • Plataforma Digital de Instrumentabilidade Neuroclínica</div>
        </div>
      </footer>

    </div>
  );
}
