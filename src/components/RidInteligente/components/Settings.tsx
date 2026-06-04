import React, { useState } from 'react';
import { Download, Upload, Trash2, ShieldCheck, Database, Award, FileImage, Key, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import { RidEntry, AppSettings } from '../types';
import { storage } from '../lib/storage';
import { encryption } from '../lib/encryption';
import { toast } from 'react-hot-toast';
import { ConfirmationModal } from './ConfirmationModal';

interface SettingsProps {
  onImport: (history: RidEntry[]) => void;
  entriesCount: number;
  onSettingsUpdate: (settings: AppSettings) => void;
  onClearAll: () => void;
  settings: AppSettings;
}

export function Settings({ onImport, entriesCount, onSettingsUpdate, onClearAll, settings: initialSettings }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    return initialSettings.geminiApiKey ? encryption.decrypt(initialSettings.geminiApiKey) : '';
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingImportFiles, setPendingImportFiles] = useState<RidEntry[] | null>(null);

  const handleExport = async () => {
    const history = await storage.getHistory();
    if (history.length === 0) {
      toast.error('Nenhum dado para exportar.');
      return;
    }
    
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-rid-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result as string);
        if (Array.isArray(imported)) {
          setPendingImportFiles(imported);
        }
      } catch (err) {
        toast.error('Falha ao importar arquivo. Formato inválido.');
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (pendingImportFiles) {
      onImport(pendingImportFiles);
      setPendingImportFiles(null);
    }
  };

  const handleInputChange = (field: keyof AppSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Visual delay to show "Encrypting" feedback
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const updatedSettings = {
        ...settings,
        geminiApiKey: apiKeyInput ? encryption.encrypt(apiKeyInput) : undefined
      };
      await storage.saveSettings(updatedSettings);
      onSettingsUpdate(updatedSettings);
      toast.success('Configurações salvas e protegidas!');
    } catch (err) {
      toast.error('Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png') {
        toast.error('Por favor, envie um arquivo PNG.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('professionalSignature', reader.result as string);
        toast.success('Assinatura carregada');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-32">
      {/* PROFESSIONAL PROFILE */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
          <Award size={16} className="text-blue-600" /> Perfil Profissional
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nome Completo</label>
            <input 
              type="text"
              value={settings.professionalName || ''}
              onChange={(e) => handleInputChange('professionalName', e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Ex: Dr. Fulano de Tal"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">CRP do Profissional</label>
            <input 
              type="text"
              value={settings.professionalCRP || ''}
              onChange={(e) => handleInputChange('professionalCRP', e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Ex: CRP 06/12345"
            />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Assinatura Digital (PNG)</label>
            <div className="flex items-center gap-4">
               <label className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 cursor-pointer transition-all">
                  <FileImage size={14} />
                  {settings.professionalSignature ? 'Alterar Assinatura' : 'Upload Assinatura'}
                  <input type="file" className="hidden" accept="image/png" onChange={handleSignatureUpload} />
               </label>
               {settings.professionalSignature && (
                 <div className="h-12 w-32 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center p-1">
                   <img src={settings.professionalSignature} alt="Assinatura" className="max-h-full max-w-full object-contain" />
                 </div>
               )}
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 space-y-1.5 pt-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Logotipo da Clínica (PNG)</label>
            <div className="flex items-center gap-4">
               <label className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 cursor-pointer transition-all">
                  <FileImage size={14} />
                  {settings.professionalLogo ? 'Alterar Logo' : 'Upload Logo'}
                  <input type="file" className="hidden" accept="image/png" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.type !== 'image/png') {
                        toast.error('Por favor, envie um arquivo PNG.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleInputChange('professionalLogo', reader.result as string);
                        toast.success('Logo carregado');
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
               </label>
               {settings.professionalLogo && (
                 <div className="h-12 w-32 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center p-1">
                   <img src={settings.professionalLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
                 </div>
               )}
            </div>
          </div>
        </div>
      </section>

      {/* API SECURITY */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
          <Key size={16} className="text-amber-500" /> Inteligência Computacional
        </h2>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center pr-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Chave API Gemini (Criptografia Absoluta)</label>
              <button 
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title={showApiKey ? "Esconder" : "Mostrar"}
              >
                {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="relative">
              <input 
                type={showApiKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500 transition-all pr-12"
                placeholder="Insira sua chave API do Google AI Studio"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                <ShieldCheck size={18} />
              </div>
            </div>
            <p className="text-[9px] text-slate-400 font-medium">Sua chave é cifrada dinamicamente (AES-256) antes de ser salva no IndexedDB privado. Você precisará dela para processar novos registros, mas ela nunca sairá do seu navegador.</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
          <Database size={16} className="text-slate-400" /> Gestão de Dados e LGPD
        </h2>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <div className="text-emerald-600 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Conformidade LGPD Ativa</h3>
              <p className="text-[11px] text-emerald-700/70 mt-1 leading-relaxed">
                Este software armazena dados sensíveis exclusivamente em seu ambiente local (IndexedDB). A exportação e exclusão total são direitos garantidos que você pode exercer abaixo.
              </p>
            </div>
          </div>

          <div className="pt-2">
             <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ações do Sistema</label>
                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-tighter">{entriesCount} registros ativos</span>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer shadow-lg shadow-slate-200"
                >
                  <Download size={16} />
                  Backup Total (.json)
                </button>
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 cursor-pointer transition-all">
                  <Upload size={16} />
                  Importar Backup
                  <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                </label>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                 <button 
                  onClick={onClearAll}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-rose-500 border border-rose-100 bg-rose-50/30 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-rose-50 transition-all cursor-pointer"
                >
                  <Trash2 size={16} />
                  Limpar Todos os Dados do Sistema
                </button>
                <p className="text-[9px] text-slate-400 text-center mt-2 font-medium">Ação irreversível de acordo com o Art. 18 da LGPD (Direito à Exclusão).</p>
              </div>
          </div>
        </div>
      </section>

      {/* SAVE BUTTON BAR */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-50">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl shadow-2xl shadow-blue-200 font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border border-blue-500 disabled:bg-blue-400"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {isSaving ? 'Criptografando e Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <ConfirmationModal 
        isOpen={!!pendingImportFiles}
        onClose={() => setPendingImportFiles(null)}
        onConfirm={confirmImport}
        title="Importar Backup"
        message="Isso irá mesclar os registros do arquivo de backup ao seu histórico atual. Esta ação pode gerar registros duplicados se os mesmos IDs já existirem. Deseja continuar?"
        confirmLabel="Importar Agora"
        variant="info"
      />

      <div className="text-center pt-8 pb-12">
        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] opacity-50">RID Digital • Proteção de Dados Integrada • 2024</p>
      </div>
    </div>
  );
}
