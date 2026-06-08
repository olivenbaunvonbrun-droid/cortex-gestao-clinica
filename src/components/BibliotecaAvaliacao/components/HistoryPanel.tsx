import React, { useState } from "react";
import { Report } from "../types";
import { renderMarkdown } from "../utils/markdown";
import { 
  Trash2, Edit3, Save, Download, Upload, Search, Calendar, 
  User, Sparkles, FileText, Printer, CheckCircle, ChevronRight, X 
} from "lucide-react";

interface HistoryPanelProps {
  reports: Report[];
  onDeleteReport: (id: string) => void;
  onUpdateReport: (report: Report) => void;
  onImportReports: (imported: Report[]) => void;
}

export default function HistoryPanel({
  reports,
  onDeleteReport,
  onUpdateReport,
  onImportReports
}: HistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  
  // Edit mode inside details
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editPatientName, setEditPatientName] = useState("");
  const [editPatientAge, setEditPatientAge] = useState(30);
  const [editNotesText, setEditNotesText] = useState("");

  const filteredReports = reports.filter(r => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      r.patientName.toLowerCase().includes(q) ||
      r.toolTitle.toLowerCase().includes(q) ||
      r.calculatedScores.classification.toLowerCase().includes(q)
    );
  });

  const handleOpenDetails = (report: Report) => {
    setActiveReport(report);
    setEditPatientName(report.patientName);
    setEditPatientAge(report.patientAge);
    setEditNotesText(report.aiReportText || "");
    setIsEditingNotes(false);
  };

  const handleSaveChanges = () => {
    if (!activeReport) return;
    const updated: Report = {
      ...activeReport,
      patientName: editPatientName,
      patientAge: editPatientAge,
      aiReportText: editNotesText
    };
    onUpdateReport(updated);
    setActiveReport(updated);
    setIsEditingNotes(false);
  };

  // Export full history database to JSON file
  const handleExportDatabase = () => {
    const dataStr = JSON.stringify(reports, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_laudos_psicometrik_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import previously saved history JSON database
  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            // Basic validation
            onImportReports(parsed);
            alert("Base de dados importada com sucesso!");
          } else {
            alert("Formato inválido. O arquivo deve conter uma lista JSON de laudos.");
          }
        } catch (err) {
          alert("Erro ao ler o arquivo JSON.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Download stand-alone report from history card
  const handleDownloadReportHtml = (report: Report) => {
    const htmlStyles = `
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #fafafa; }
      .header-box { background: linear-gradient(135deg, #111827, #1f2937); color: white; padding: 25px; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .header-box h1 { margin: 0 0 10px 0; font-size: 24px; color: #00A3FF; }
      .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; font-size: 14px; border-top: 1px solid #374151; padding-top: 15px; }
      .score-badge { display: inline-block; background-color: #00A3FF15; border: 1.5px solid #00A3FF; color: #00A3FF; padding: 6px 12px; border-radius: 6px; font-weight: bold; margin: 15px 0; }
      .subscale-card { background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-top: 15px; }
      .subscale-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
      .ai-report { background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px; margin-top: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
      h2 { color: #111827; border-left: 4px solid #00A3FF; padding-left: 10px; margin-top: 30px; margin-bottom: 15px; font-size: 19px; }
      h3 { color: #00A3FF; font-size: 16px; margin-top: 20px;}
      p, li { color: #4b5563; font-size: 14.5px; }
      blockquote { border-left: 4px solid #4b5563; background: #f9fafb; padding: 10px 15px; margin: 15px 0; font-style: italic; color: #4b5563; }
      hr { border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0; }
      @media print { body { padding: 0; background: white; } .header-box { box-shadow: none; border: 1px solid #ddd; } }
    `;

    const reportContentString = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Laudo Clínico AI - ${report.patientName}</title>
        <style>${htmlStyles}</style>
      </head>
      <body>
        <div class="header-box">
          <h1>LAUDO NEUROCLÍNICO & PSICOMÉTRICO HISTÓRICO</h1>
          <div>Emissão inteligente assistida por Inteligência Artificial (Modelo Gemini)</div>
          <div class="meta-grid">
            <div><strong>Paciente:</strong> ${report.patientName}</div>
            <div><strong>Idade/Gênero:</strong> ${report.patientAge} anos | ${report.patientGender}</div>
            <div><strong>Instumento:</strong> ${report.toolTitle}</div>
            <div><strong>Data:</strong> ${report.evaluationDate}</div>
          </div>
        </div>

        <h2>Resultados dos Cálculos Automatizados</h2>
        <div class="score-badge">Classificação Clínica: ${report.calculatedScores.classification} | Score Total: ${report.calculatedScores.score}</div>
        
        <div class="subscale-card">
          <h4>Detalhamento das Subescalas</h4>
          ${Object.entries(report.calculatedScores.subscales || {}).map(([key, val]) => `
            <div class="subscale-item">
              <span>${key}</span>
              <strong>${val}</strong>
            </div>
          `).join("")}
        </div>

        <hr />

        <div class="ai-report">
          <h2>Análise Técnica de Alta Inteligência Analítica (CBT G4 & Neurociência)</h2>
          <div style="font-size: 14px; opacity: 0.8; margin-bottom: 20px;"><em>Este relatório foi gerado por IA calibrada com as orientações de Terapia Cognitivo-Comportamental de Quarta Geração e Neurociência Clínica.</em></div>
          ${report.aiReportText ? report.aiReportText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>").replace(/## (.*)/g, "<h2>$1</h2>").replace(/### (.*)/g, "<h3>$1</h3>") : "<p>Laudo IA não anexado.</p>"}
        </div>
        
        <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af;">
          Plataforma PsicoMetrik • Registro Digital Seguro
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportContentString], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laudo_historico_${report.patientName.toLowerCase().replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 px-4 md:px-16 pb-20" id="history-panel-viewport">
      
      {/* Management bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-950 p-4 rounded-xl border border-gray-900" id="mgmt-bar">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-lg font-bold text-white font-display">Dossiê e Prontuários Salvos</h2>
          <p className="text-xs text-gray-500">Histórico criptográfico local de laudos, dados clínicos e pontuações psicométricas.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center">
          {/* SEARCH FIELD */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por paciente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 text-xs text-gray-200 pl-9 pr-4 py-2 rounded border border-gray-800 focus:outline-none focus:border-[#00A3FF] transition-colors"
              id="history-search"
            />
          </div>

          {/* EXPORT DATABASE TO JSON LINK */}
          <button
            onClick={handleExportDatabase}
            disabled={reports.length === 0}
            className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-gray-300 border border-gray-800 px-3 py-2 rounded text-xs transition-colors flex items-center gap-1.5 font-mono"
            id="export-db-btn"
          >
            <Download className="w-3.5 h-3.5 text-gray-400" />
            Exportar Tudo
          </button>

          {/* IMPORT JSON LINK */}
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportDatabase}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              id="import-db-hidden-input"
            />
            <button
              className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 px-3 py-2 rounded text-xs transition-colors flex items-center gap-1.5 font-mono"
              id="import-db-trigger"
            >
              <Upload className="w-3.5 h-3.5 text-gray-400" />
              Importar JSON
            </button>
          </div>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-gray-950/40 border border-gray-900 rounded-xl p-16 text-center space-y-4">
          <div className="w-12 h-12 bg-[#00A3FF]/10 border border-[#00A3FF]/20 rounded-full flex items-center justify-center mx-auto text-[#00A3FF]">
            <FileText className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Nenhum laudo emitido ainda</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Selecione uma ferramenta ativa no catálogo, simule as coletas do paciente, gere o laudo neuroclínico IA e salve-o para figurar nesta aba.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT: LIST OF DOSSIERS (Netflix style) */}
          <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredReports.map(report => {
              const isActive = activeReport?.id === report.id;

              return (
                <div
                  key={report.id}
                  onClick={() => handleOpenDetails(report)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isActive 
                      ? "bg-[#00A3FF]/10 border-[#00A3FF] shadow-md shadow-[#00A3FF]/5 text-white" 
                      : "bg-[#111217]/80 border-gray-900 text-gray-300 hover:border-gray-800 hover:bg-[#111217]"
                  }`}
                  id={`history-item-row-${report.id}`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-bold font-display text-sm truncate max-w-[170px]">
                        {report.patientName}
                      </div>
                      <span className="text-[9px] text-gray-500 font-mono shrink-0 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {report.evaluationDate}
                      </span>
                    </div>

                    <div className="text-xs text-[#00A3FF] font-mono truncate">
                      {report.toolTitle}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-1.5 border-t border-gray-950/60">
                      <span>Resultado: <strong>{report.calculatedScores.score} pt</strong></span>
                      <span className="truncate max-w-[130px] font-bold">{report.calculatedScores.classification}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: EXPANDED DETAILED REPORT BODY */}
          <div className="lg:col-span-2 bg-[#111217] rounded-xl border border-gray-900 overflow-hidden min-h-[450px] flex flex-col justify-between">
            {activeReport ? (
              <div className="flex-1 flex flex-col h-full justify-between">
                
                {/* Upper bar inside viewer card */}
                <div className="bg-gray-950/80 border-b border-gray-900 p-4 flex items-center justify-between no-print">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-mono font-bold uppercase block">Prontuário Médico Digitalizado</span>
                    <h3 className="text-sm font-bold text-white">{activeReport.patientName}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingNotes ? (
                      <>
                        <button
                          onClick={handleSaveChanges}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 text-xs rounded transition-colors flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Salvar Edições
                        </button>
                        <button
                          onClick={() => setIsEditingNotes(false)}
                          className="text-gray-400 hover:text-white px-2.5 py-1 text-xs rounded"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditingNotes(true)}
                          className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Editar
                        </button>
                        
                        <button
                          onClick={() => handleDownloadReportHtml(activeReport)}
                          className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"
                          title="Fazer download deste laudo como arquivo HTML isolado"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Baixar HTML
                        </button>

                        <button
                          onClick={() => {
                            if (confirm("Tem certeza que deseja apagar permanentemente este prontuário?")) {
                              onDeleteReport(activeReport.id);
                              setActiveReport(null);
                            }
                          }}
                          className="bg-gray-900 hover:bg-red-950 hover:text-red-400 text-gray-500 border border-gray-800 px-2.5 py-1.5 rounded text-xs transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* EDIT FORM MODE OR RENDER BODY */}
                <div className="p-6 overflow-y-auto max-h-[500px] flex-1">
                  {isEditingNotes ? (
                    <div className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-gray-400 font-bold uppercase font-mono">Nome do Paciente</label>
                        <input
                          type="text"
                          value={editPatientName}
                          onChange={(e) => setEditPatientName(e.target.value)}
                          className="w-full bg-gray-950 text-sm text-gray-200 px-3 py-2 rounded border border-gray-900 focus:outline-none focus:border-[#00A3FF]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-gray-400 font-bold uppercase font-mono">Idade (Anos)</label>
                        <input
                          type="number"
                          value={editPatientAge}
                          onChange={(e) => setEditPatientAge(parseInt(e.target.value) || 0)}
                          className="w-full bg-gray-950 text-sm text-gray-200 px-3 py-2 rounded border border-gray-900 focus:outline-none focus:border-[#00A3FF]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-gray-400 font-bold uppercase font-mono">Corpo do Relatório de Análise (Markdown)</label>
                        <textarea
                          rows={12}
                          value={editNotesText}
                          onChange={(e) => setEditNotesText(e.target.value)}
                          className="w-full bg-gray-950 text-xs font-mono text-gray-200 px-3 py-2 rounded border border-gray-900 focus:outline-none focus:border-[#00A3FF] resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white text-gray-900 p-8 rounded-lg border border-gray-200 print-card prose prose-sm max-w-none text-left">
                      {/* Printable header info */}
                      <div className="border-b border-gray-300 pb-3 mb-4 flex justify-between items-end">
                        <div>
                          <h4 className="text-md font-bold text-[#00A3FF] uppercase tracking-tight">Laudo Psicológico Clínico</h4>
                          <span className="text-[10px] text-gray-500 font-mono block">Data de Emissão original: {activeReport.evaluationDate}</span>
                        </div>
                        <div className="text-right text-[10px] text-gray-500 font-mono">
                          REGISTRO: #{activeReport.id}
                        </div>
                      </div>

                      {/* Diagnostic badges */}
                      <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4 text-xs flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <strong className="block text-gray-900">Paciente: {activeReport.patientName} ({activeReport.patientAge} anos)</strong>
                          <span className="text-gray-500 block text-[10px]">Gênero: {activeReport.patientGender} • Instrumento: {activeReport.toolTitle}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#00A3FF] font-bold block">{activeReport.calculatedScores.score} pt</span>
                          <span className="text-gray-500 font-mono text-[10px] block">{activeReport.calculatedScores.classification}</span>
                        </div>
                      </div>

                      {/* Display subscales */}
                      <div className="border border-gray-200 bg-gray-50/50 rounded p-2 text-[11px] mb-6 font-mono space-y-1">
                        <div className="font-bold border-b border-gray-200 pb-1 mb-1 text-gray-700 font-sans uppercase text-[9px] tracking-wide">Métricas Secundárias:</div>
                        {Object.entries(activeReport.calculatedScores.subscales || {}).map(([key, val]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span>{key}:</span>
                            <span className="font-bold text-gray-800">{val}</span>
                          </div>
                        ))}
                      </div>

                      {/* Markdown body render */}
                      <div className="text-sm text-gray-800 leading-relaxed font-sans mt-4">
                        {activeReport.aiReportText ? renderMarkdown(activeReport.aiReportText) : <span className="text-gray-400 italic">Nenhum laudo IA gerado para este prontuário.</span>}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-gray-500 space-y-2">
                <FileText className="w-10 h-10 text-gray-700 animate-pulse" />
                <div className="text-sm font-semibold">Nenhum laudo expandido</div>
                <p className="text-xs text-gray-600 max-w-xs">Selecione um dossiê do paciente na barra lateral esquerda para revisar, editar ou exportar em HTML/PDF.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
