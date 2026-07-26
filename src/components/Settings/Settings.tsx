import React, { useState, useEffect } from 'react';
import { Palette, Download, Upload, Trash2, Shield, Save, Type, Image as ImageIcon, History, Key, Lock, AlertCircle, Info, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { db, logAction, type ActionLog } from '../../lib/db';
import { cn } from '../../lib/utils';
import { encryptData, decryptData } from '../../lib/crypto';
import ConfirmModal from '../ui/ConfirmModal';
import useConfirm from '../../hooks/useConfirm';
import { syncService } from '../../lib/syncService';
import { auth } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre (AC)' },
  { value: 'AL', label: 'Alagoas (AL)' },
  { value: 'AP', label: 'Amapá (AP)' },
  { value: 'AM', label: 'Amazonas (AM)' },
  { value: 'BA', label: 'Bahia (BA)' },
  { value: 'CE', label: 'Ceará (CE)' },
  { value: 'DF', label: 'Distrito Federal (DF)' },
  { value: 'ES', label: 'Espírito Santo (ES)' },
  { value: 'GO', label: 'Goiás (GO)' },
  { value: 'MA', label: 'Maranhão (MA)' },
  { value: 'MT', label: 'Mato Grosso (MT)' },
  { value: 'MS', label: 'Mato Grosso do Sul (MS)' },
  { value: 'MG', label: 'Minas Gerais (MG)' },
  { value: 'PA', label: 'Pará (PA)' },
  { value: 'PB', label: 'Paraíba (PB)' },
  { value: 'PR', label: 'Paraná (PR)' },
  { value: 'PE', label: 'Pernambuco (PE)' },
  { value: 'PI', label: 'Piauí (PI)' },
  { value: 'RJ', label: 'Rio de Janeiro (RJ)' },
  { value: 'RN', label: 'Rio Grande do Norte (RN)' },
  { value: 'RS', label: 'Rio Grande do Sul (RS)' },
  { value: 'RO', label: 'Rondônia (RO)' },
  { value: 'RR', label: 'Roraima (RR)' },
  { value: 'SC', label: 'Santa Catarina (SC)' },
  { value: 'SP', label: 'São Paulo (SP)' },
  { value: 'SE', label: 'Sergipe (SE)' },
  { value: 'TO', label: 'Tocantins (TO)' },
];

interface SettingsProps {
  onUpdateSettings: (newSettings: { appTitle?: string, appLogo?: string }) => void;
}

export default function Settings({ onUpdateSettings }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'identity' | 'hours' | 'comm' | 'security' | 'audit'>('identity');
  const [appTitle, setAppTitle] = useState("Sistema de Gestão para Psicólogos");
  const [psychCrp, setPsychCrp] = useState("");
  const [appLogo, setAppLogo] = useState("");
  const [psychSignature, setPsychSignature] = useState("");
  const [abordagens, setAbordagens] = useState<string[]>(['TCC', 'Psicanálise', 'Humanismo', 'Junguiana', 'Focal', 'Fenomenologia']);
  const [newAbordagem, setNewAbordagem] = useState("");
  const [appointmentMessageTemplate, setAppointmentMessageTemplate] = useState("Olá {paciente}, confirmo seu agendamento para o dia {data} às {hora}. Local: {consultorio}");
  const [sessionDuration, setSessionDuration] = useState(50);
  const [geminiKey, setGeminiKey] = useState("");
  const [layoutScale, setLayoutScale] = useState<'small' | 'medium' | 'large'>('large');
  const [ufState, setUfState] = useState("SP");
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [cryptoStatus, setCryptoStatus] = useState('');
  
  // Work schedule states
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [lunchStart, setLunchStart] = useState('12:00');
  const [lunchEnd, setLunchEnd] = useState('13:00');
  const [hasLunchBreak, setHasLunchBreak] = useState(true);
  
  const { isOpen, confirm, close, handleConfirm, options } = useConfirm();
  const [showSavedModal, setShowSavedModal] = useState(false);

  const handleScaleChange = (scale: 'small' | 'medium' | 'large') => {
    setLayoutScale(scale);
    document.documentElement.classList.remove('layout-scale-small', 'layout-scale-medium', 'layout-scale-large');
    document.documentElement.classList.add(`layout-scale-${scale}`);
  };

  useEffect(() => {
    return () => {
      db.settings.get('layoutScale').then(item => {
        const scale = item?.value || 'large';
        document.documentElement.classList.remove('layout-scale-small', 'layout-scale-medium', 'layout-scale-large');
        document.documentElement.classList.add(`layout-scale-${scale}`);
      }).catch(() => {});
    };
  }, []);

  useEffect(() => {
    loadSettings();
    loadLogs();
  }, []);

  const loadSettings = async () => {
    const items = await db.settings.toArray();
    items.forEach(item => {
      if (item.key === 'appTitle') setAppTitle(item.value);
      if (item.key === 'psychCrp') setPsychCrp(item.value);
      if (item.key === 'appLogo') setAppLogo(item.value);
      if (item.key === 'psychSignature') setPsychSignature(item.value);
      if (item.key === 'appointmentMessageTemplate') setAppointmentMessageTemplate(item.value);
      if (item.key === 'sessionDuration') setSessionDuration(item.value);
      if (item.key === 'abordagens' && Array.isArray(item.value)) setAbordagens(item.value);
      if (item.key === 'workDays' && Array.isArray(item.value)) setWorkDays(item.value);
      if (item.key === 'workStart') setWorkStart(item.value);
      if (item.key === 'workEnd') setWorkEnd(item.value);
      if (item.key === 'lunchStart') setLunchStart(item.value);
      if (item.key === 'lunchEnd') setLunchEnd(item.value);
      if (item.key === 'hasLunchBreak') setHasLunchBreak(item.value);
      if (item.key === 'layoutScale') setLayoutScale(item.value);
      if (item.key === 'ufState') setUfState(item.value);
      if (item.key === 'gemini_api_key') {
        const decrypted = decryptData(item.value);
        setGeminiKey(decrypted);
      }
    });
  };

  const loadLogs = async () => {
    const logs = await db.actionLog.orderBy('id').reverse().limit(50).toArray();
    setActionLogs(logs);
  };

  const handleSaveSettings = async () => {
    setCryptoStatus('Auditando e Criptografando Dados...');
    try {
      await db.transaction('rw', db.settings, async () => {
        await db.settings.put({ key: 'appTitle', value: appTitle });
        await db.settings.put({ key: 'psychCrp', value: psychCrp });
        await db.settings.put({ key: 'appLogo', value: appLogo });
        await db.settings.put({ key: 'psychSignature', value: psychSignature });
        await db.settings.put({ key: 'appointmentMessageTemplate', value: appointmentMessageTemplate });
        await db.settings.put({ key: 'sessionDuration', value: sessionDuration });
        await db.settings.put({ key: 'abordagens', value: abordagens });
        await db.settings.put({ key: 'workDays', value: workDays });
        await db.settings.put({ key: 'workStart', value: workStart });
        await db.settings.put({ key: 'workEnd', value: workEnd });
        await db.settings.put({ key: 'lunchStart', value: lunchStart });
        await db.settings.put({ key: 'lunchEnd', value: lunchEnd });
        await db.settings.put({ key: 'hasLunchBreak', value: hasLunchBreak });
        await db.settings.put({ key: 'layoutScale', value: layoutScale });
        await db.settings.put({ key: 'ufState', value: ufState });
        
        if (geminiKey) {
          const encrypted = encryptData(geminiKey);
          await db.settings.put({ key: 'gemini_api_key', value: encrypted });
        } else {
          await db.settings.delete('gemini_api_key');
        }
      });

      onUpdateSettings({ appTitle, appLogo, layoutScale });

      // Sync all clinic-wide settings to cloud immediately (gemini key excluded - device-specific)
      const firebaseUid = auth.currentUser?.uid;
      if (firebaseUid) {
        const settingsToSync = [
          { key: 'appTitle', value: appTitle },
          { key: 'psychCrp', value: psychCrp },
          { key: 'appLogo', value: appLogo },
          { key: 'psychSignature', value: psychSignature },
          { key: 'appointmentMessageTemplate', value: appointmentMessageTemplate },
          { key: 'sessionDuration', value: sessionDuration },
          { key: 'abordagens', value: abordagens },
          { key: 'workDays', value: workDays },
          { key: 'workStart', value: workStart },
          { key: 'workEnd', value: workEnd },
          { key: 'lunchStart', value: lunchStart },
          { key: 'lunchEnd', value: lunchEnd },
          { key: 'hasLunchBreak', value: hasLunchBreak },
          { key: 'layoutScale', value: layoutScale },
          { key: 'ufState', value: ufState },
        ];
        await Promise.all(
          settingsToSync.map(s => syncService.saveToCloud(firebaseUid, 'settings', s))
        );
      }

      setSaveStatus('Configurações salvas e protegidas!');
      toast.success('Configurações salvas com sucesso!');
      setShowSavedModal(true);
      setTimeout(() => setSaveStatus(''), 3000);
      
      const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
      logAction(currentUser, 'Atualizou configurações e chaves de segurança');
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar as configurações. Verifique o banco de dados.");
    } finally {
      setCryptoStatus('');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("Imagem muito grande (máx 2MB)");
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) return alert("Assinatura muito grande (máx 1MB)");
      const reader = new FileReader();
      reader.onloadend = () => {
        setPsychSignature(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportData = async () => {
    const data: any = {};
    data.pacientes = await db.pacientes.toArray();
    data.agendamentos = await db.agendamentos.toArray();
    data.prontuarios = await db.prontuarios.toArray();
    data.transacoes = await db.transacoes.toArray();
    data.settings = await db.settings.toArray();
    data.anexos = await db.anexos.toArray();
    data.meta = {
      version: "9.5",
      exportDate: new Date().toISOString(),
      app: "PSI.CORE"
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PSI_CORE_EXPORT_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
    logAction(currentUser, 'Exportou backup completo do sistema');
  };

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        confirm({
          title: 'Restaurar Sistema',
          message: 'Esta ação irá sobrescrever todos os dados atuais permanentemente. Deseja continuar?',
          confirmLabel: 'Restaurar Agora',
          variant: 'danger',
          onConfirm: async () => {
            await db.transaction('rw', [db.pacientes, db.agendamentos, db.prontuarios, db.transacoes, db.settings, db.anexos], async () => {
              if (data.pacientes) { await db.pacientes.clear(); await db.pacientes.bulkPut(data.pacientes); }
              if (data.agendamentos) { await db.agendamentos.clear(); await db.agendamentos.bulkPut(data.agendamentos); }
              if (data.prontuarios) { await db.prontuarios.clear(); await db.prontuarios.bulkPut(data.prontuarios); }
              if (data.transacoes) { await db.transacoes.clear(); await db.transacoes.bulkPut(data.transacoes); }
              if (data.settings) { await db.settings.clear(); await db.settings.bulkPut(data.settings); }
              if (data.anexos) { await db.anexos.clear(); await db.anexos.bulkPut(data.anexos); }
            });
            window.location.reload();
          }
        });
      } catch (error) {
        alert("Erro crítico na importação. Arquivo corrompido.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetSystem = () => {
    confirm({
      title: 'Limpeza Total (LGPD)',
      message: 'Esta ação apagará TODOS os dados, pacientes, históricos e configurações. É irreversível. Você tem um backup?',
      confirmLabel: 'Apagar Absolutamente Tudo',
      variant: 'danger',
      onConfirm: async () => {
        await db.transaction('rw', [db.pacientes, db.agendamentos, db.prontuarios, db.transacoes, db.settings, db.anexos, db.actionLog], async () => {
          await db.pacientes.clear();
          await db.agendamentos.clear();
          await db.prontuarios.clear();
          await db.transacoes.clear();
          await db.settings.clear();
          await db.anexos.clear();
          await db.actionLog.clear();
        });
        localStorage.removeItem('psiCurrentUsername_v9');
        localStorage.removeItem('psiIsLoggedIn_v9');
        window.location.reload();
      }
    });
  };

  const clearLogs = () => {
    confirm({
      title: 'Limpar Auditoria',
      message: 'Remover todo o histórico de logs de ação? Isso ajuda na organização, mas remove o rastro de alterações.',
      confirmLabel: 'Limpar Logs',
      onConfirm: async () => {
        await db.actionLog.clear();
        loadLogs();
      }
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-subtle pb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-text-main tracking-tight">Preferências do Sistema</h2>
          <p className="text-text-dim text-sm font-medium mt-1">Personalize sua experiência clínica e garanta a integridade dos seus dados.</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {cryptoStatus && (
            <div className="text-[9px] font-black uppercase tracking-widest text-primary animate-pulse">{cryptoStatus}</div>
          )}
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2.5 px-8 py-3.5 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase tracking-[0.1em] text-xs rounded-2xl transition-all shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <Save size={16} />
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'identity', label: 'Identidade & Perfil', icon: Palette },
            { id: 'hours', label: 'Carga Horária & Agenda', icon: Clock },
            { id: 'comm', label: 'Comunicação', icon: MessageCircle },
            { id: 'security', label: 'Dados & Segurança', icon: Lock },
            { id: 'audit', label: 'Logs de Auditoria', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                activeTab === tab.id
                  ? "bg-primary text-bg-deep border-primary shadow-lg shadow-primary/20"
                  : "bg-bg-card text-text-dim border-border-subtle hover:border-primary/30"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}

          <div className="pt-8 px-4">
             <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <Shield size={24} className="text-primary mb-4" />
                <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest mb-2">Padrão LGPD Ativo</h4>
                <p className="text-[9px] text-text-dim leading-relaxed uppercase tracking-widest opacity-60">Sua privacidade e segurança de dados são nossa prioridade.</p>
             </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-9">
          {activeTab === 'identity' && (
            <section className="bg-bg-card border border-border-subtle rounded-[3rem] p-10 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full pointer-events-none" />
              
              <h3 className="text-[11px] font-black text-text-main uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                <Palette size={16} className="text-primary" /> Identidade Visual do Consultório
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Type size={14} className="text-primary/40" /> Designação Oficial
                    </label>
                    <input
                      type="text"
                      value={appTitle}
                      onChange={(e) => setAppTitle(e.target.value)}
                      className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-bold transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Shield size={14} className="text-primary/40" /> Registro Profissional (CRP)
                    </label>
                    <input
                      type="text"
                      value={psychCrp}
                      onChange={(e) => setPsychCrp(e.target.value)}
                      placeholder="Ex: 06/123456"
                      className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-bold transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Palette size={14} className="text-primary/40" /> Tamanho da Fonte e Layout
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'small', label: 'Pequeno' },
                        { val: 'medium', label: 'Médio' },
                        { val: 'large', label: 'Grande (Padrão)' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleScaleChange(item.val as any)}
                          className={cn(
                            "py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-center border transition-all cursor-pointer",
                            layoutScale === item.val
                              ? "bg-primary text-bg-deep border-primary"
                              : "bg-bg-sidebar/60 border-border-subtle text-text-dim hover:border-primary/20 hover:text-text-main"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Palette size={14} className="text-primary/40" /> Estado de Atuação (UF para Feriados)
                    </label>
                    <select
                      value={ufState}
                      onChange={(e) => setUfState(e.target.value)}
                      className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-bold text-text-main transition-all cursor-pointer"
                    >
                      {BRAZILIAN_STATES.map(st => (
                        <option key={`sett-st-${st.value}`} value={st.value}>{st.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Save size={14} className="text-primary/40" /> Assinatura do Psicólogo (Imprimir PNG)
                    </label>
                    <div className="flex items-center gap-8">
                      <div className="w-full h-32 bg-bg-sidebar border-2 border-dashed border-border-subtle rounded-3xl flex items-center justify-center overflow-hidden shadow-inner group relative">
                        {psychSignature ? (
                          <>
                            <img src={psychSignature} alt="Assinatura" className="w-full h-full object-contain p-4" />
                            <div className="absolute inset-0 bg-bg-deep/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-primary text-[10px] font-black uppercase tracking-widest">
                               Substituir Assinatura
                            </div>
                          </>
                        ) : (
                          <div className="text-[10px] font-black text-text-dim/20 uppercase tracking-widest">Upload de Assinatura</div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/png" onChange={handleSignatureUpload} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <ImageIcon size={14} className="text-primary/40" /> Logotipo Institucional
                    </label>
                    <div className="bg-bg-sidebar border-2 border-dashed border-border-subtle rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative min-h-[160px] group overflow-hidden">
                      {appLogo ? (
                        <div className="relative z-10 w-full flex flex-col items-center">
                          <img src={appLogo} alt="Logo" className="h-24 w-auto object-contain mb-6" />
                          <button onClick={() => setAppLogo('')} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline">Remover Logotipo</button>
                        </div>
                      ) : (
                        <div className="text-center">
                           <ImageIcon size={48} className="text-text-dim/10 mx-auto mb-4" />
                           <p className="text-[10px] font-black text-text-dim/30 uppercase tracking-widest">Arraste seu Logo aqui</p>
                        </div>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Especialidades Atendidas</label>
                    <div className="flex flex-wrap gap-2">
                       {abordagens.map((a, i) => (
                         <div key={`abordagem-sett-${i}`} className="flex items-center gap-2 px-3 py-2 bg-bg-sidebar rounded-xl border border-border-subtle text-[9px] font-black uppercase tracking-widest text-text-main group hover:border-primary/20 transition-all">
                           {a}
                           <button onClick={() => setAbordagens(prev => prev.filter((_, idx) => idx !== i))} className="text-text-dim hover:text-red-500"><Trash2 size={12} /></button>
                         </div>
                       ))}
                    </div>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={newAbordagem} 
                         onChange={(e) => setNewAbordagem(e.target.value)} 
                         placeholder="Nova categoria..."
                         className="flex-grow px-4 py-2 bg-bg-sidebar border border-border-subtle rounded-xl text-xs font-bold focus:border-primary/40 outline-none"
                       />
                       <button 
                        onClick={() => {
                          if (newAbordagem.trim()) {
                            setAbordagens(prev => [...prev, newAbordagem.trim()]);
                            setNewAbordagem("");
                          }
                        }}
                        className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-bg-deep transition-all"
                       >
                         Add
                       </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-10 py-4 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center gap-3"
                >
                  <Save size={18} /> Sincronizar Identidade
                </button>
              </div>
            </section>
          )}

          {activeTab === 'hours' && (
            <section className="bg-bg-card border border-border-subtle rounded-[3rem] p-10 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full pointer-events-none" />
              
              <h3 className="text-[11px] font-black text-text-main uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                <Clock size={16} className="text-primary" /> Parametrização de Carga Horária
              </h3>

              <div className="space-y-8">
                {/* Dias de Trabalho */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Dias de Trabalho na Semana</label>
                  <p className="text-[9px] font-black text-text-dim/40 uppercase tracking-widest block mb-1">Selecione em quais dias você realiza atendimentos clínicos</p>
                  <div className="grid grid-cols-7 gap-2">
                    {[
                      { val: 0, label: 'Dom', fullName: 'Domingo' },
                      { val: 1, label: 'Seg', fullName: 'Segunda' },
                      { val: 2, label: 'Ter', fullName: 'Terça' },
                      { val: 3, label: 'Qua', fullName: 'Quarta' },
                      { val: 4, label: 'Qui', fullName: 'Quinta' },
                      { val: 5, label: 'Sex', fullName: 'Sexta' },
                      { val: 6, label: 'Sáb', fullName: 'Sábado' },
                    ].map(day => {
                      const isActive = workDays.includes(day.val);
                      return (
                        <button
                          key={day.val}
                          type="button"
                          onClick={() => {
                            setWorkDays(prev => 
                              prev.includes(day.val) ? prev.filter(d => d !== day.val) : [...prev, day.val].sort()
                            );
                          }}
                          className={cn(
                            "py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border text-center font-display",
                            isActive
                              ? "bg-primary text-bg-deep border-primary shadow-lg shadow-primary/10"
                              : "bg-bg-sidebar/50 border-border-subtle text-text-dim hover:border-primary/20 hover:text-text-main"
                          )}
                          title={day.fullName}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Horários de Expediente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Início do Expediente</label>
                    <select
                      value={workStart}
                      onChange={(e) => setWorkStart(e.target.value)}
                      className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:border-primary/50 text-sm font-bold text-text-main transition-all"
                    >
                      {Array.from({ length: 24 }).map((_, i) => {
                        const hStr = String(i).padStart(2, '0') + ':00';
                        return <option key={`start-${hStr}`} value={hStr}>{hStr}</option>;
                      })}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Fim do Expediente</label>
                    <select
                      value={workEnd}
                      onChange={(e) => setWorkEnd(e.target.value)}
                      className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:border-primary/50 text-sm font-bold text-text-main transition-all"
                    >
                      {Array.from({ length: 24 }).map((_, i) => {
                        const hStr = String(i).padStart(2, '0') + ':00';
                        return <option key={`end-${hStr}`} value={hStr}>{hStr}</option>;
                      })}
                    </select>
                  </div>
                </div>

                {/* Intervalo de Almoço */}
                <div className="bg-bg-sidebar/50 p-8 rounded-3xl border border-border-subtle space-y-6 pt-6">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                    <div>
                      <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest">Intervalo de Almoço</h4>
                      <p className="text-[9px] font-black text-text-dim/40 uppercase tracking-widest mt-0.5">Define um horário bloqueado no qual você não realiza atendimentos</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hasLunchBreak} 
                        onChange={(e) => setHasLunchBreak(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-bg-deep peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-dim after:border-border-subtle after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/90 peer-checked:after:bg-bg-deep" />
                    </label>
                  </div>

                  {hasLunchBreak && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Início do Intervalo</label>
                        <select
                          value={lunchStart}
                          onChange={(e) => setLunchStart(e.target.value)}
                          className="w-full px-5 py-3.5 bg-bg-card border border-border-subtle rounded-xl outline-none focus:border-primary/50 text-xs font-bold text-text-main"
                        >
                          {Array.from({ length: 24 }).map((_, i) => {
                            const hStr = String(i).padStart(2, '0') + ':00';
                            return <option key={`lstart-${hStr}`} value={hStr}>{hStr}</option>;
                          })}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Fim do Intervalo</label>
                        <select
                          value={lunchEnd}
                          onChange={(e) => setLunchEnd(e.target.value)}
                          className="w-full px-5 py-3.5 bg-bg-card border border-border-subtle rounded-xl outline-none focus:border-primary/50 text-xs font-bold text-text-main"
                        >
                          {Array.from({ length: 24 }).map((_, i) => {
                            const hStr = String(i).padStart(2, '0') + ':00';
                            return <option key={`lend-${hStr}`} value={hStr}>{hStr}</option>;
                          })}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    className="px-10 py-4 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-primary/25 transition-all flex items-center gap-3"
                  >
                    <Save size={18} /> Salvar Grade de Carga Horária
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'comm' && (
            <section className="bg-bg-card border border-border-subtle rounded-[3rem] p-10 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full pointer-events-none" />
               
               <h3 className="text-[11px] font-black text-text-main uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                <MessageCircle size={16} className="text-primary" /> Comunicação com Pacientes
              </h3>

              <div className="space-y-8">
                <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-start gap-6">
                   <div className="p-4 bg-bg-deep rounded-2xl text-primary"><Info size={24} /></div>
                   <div>
                      <h4 className="text-[11px] font-black text-text-main uppercase tracking-widest mb-2">Configuração de Tags Dinâmicas</h4>
                      <p className="text-[10px] text-text-dim leading-relaxed uppercase tracking-widest font-medium opacity-60">
                        Os comprovantes de agendamento usam templates inteligentes. <br />
                        Utilize: <span className="text-primary">{'{paciente}, {data}, {hora}, {consultorio}'}</span> para injeção automática de dados.
                      </p>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Modelo para Confirmação de Sessão (WhatsApp/Email)</label>
                   <textarea
                    value={appointmentMessageTemplate}
                    onChange={(e) => setAppointmentMessageTemplate(e.target.value)}
                    rows={6}
                    className="w-full px-8 py-6 bg-bg-sidebar border border-border-subtle rounded-[2rem] outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-medium transition-all resize-none leading-relaxed"
                   />
                </div>

                <div className="flex justify-end">
                   <button
                    onClick={handleSaveSettings}
                    className="px-10 py-4 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl transition-all"
                  >
                    Salvar Templates
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <section className="bg-bg-card border border-border-subtle rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                 <h3 className="text-[11px] font-black text-text-main uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                  <Lock size={16} className="text-primary" /> Prontuário Inteligente & Segurança
                </h3>

                <div className="space-y-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Duração Padrão das Consultas (Minutos)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={sessionDuration}
                          onChange={(e) => setSessionDuration(Number(e.target.value))}
                          min={1}
                          max={180}
                          className="w-full px-8 py-5 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-bold transition-all"
                        />
                      </div>
                      <p className="text-[9px] font-black text-text-dim/40 uppercase tracking-widest px-2">Define o limite do contador visual de tempo nas sessões clínicas.</p>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Integração Gemini AI (API KEY)</label>
                      <div className="relative">
                        <input
                          type="password"
                          value={geminiKey}
                          onChange={(e) => setGeminiKey(e.target.value)}
                          placeholder="••••••••••••••••••••••••••••••••••••••"
                          className="w-full px-8 py-5 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-mono tracking-[0.4em] transition-all"
                        />
                        <Key className="absolute right-8 top-1/2 -translate-y-1/2 text-primary/20" size={20} />
                      </div>
                      <p className="text-[9px] font-black text-text-dim/40 uppercase tracking-widest px-2">Sua chave é armazenada de forma criptografada localmente.</p>
                   </div>

                   <div className="flex justify-end pt-4 border-t border-border-subtle">
                      <button
                        onClick={handleSaveSettings}
                        className="px-10 py-4 bg-bg-sidebar border border-border-subtle hover:border-primary/50 text-text-main font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all"
                      >
                        Validar e Proteger Chaves
                      </button>
                   </div>
                </div>
              </section>

              <section className="bg-bg-card border border-border-subtle rounded-[3rem] p-10 shadow-2xl">
                 <h3 className="text-[11px] font-black text-text-main uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                  <Download size={16} className="text-primary" /> Backup & Disponibilidade LGPD
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-bg-sidebar rounded-[2rem] border border-border-subtle group hover:border-primary/20 transition-all flex flex-col items-center text-center">
                    <Download size={32} className="text-primary mb-4" />
                    <h4 className="text-[11px] font-black text-text-main uppercase tracking-widest mb-2">Exportação de Segurança</h4>
                    <p className="text-[9px] text-text-dim leading-relaxed uppercase tracking-widest opacity-60 mb-6">Gera um arquivo JSON completo com pacientes, agendamentos e prontuários.</p>
                    <button onClick={exportData} className="w-full py-4 bg-bg-deep border border-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all">Baixar Agora</button>
                  </div>

                  <div className="p-8 bg-bg-sidebar rounded-[2rem] border border-border-subtle group hover:border-primary/20 transition-all flex flex-col items-center text-center">
                    <Upload size={32} className="text-primary mb-4" />
                    <h4 className="text-[11px] font-black text-text-main uppercase tracking-widest mb-2">Restauração de Dados</h4>
                    <p className="text-[9px] text-text-dim leading-relaxed uppercase tracking-widest opacity-60 mb-6">Substitui o estado atual do sistema por um arquivo de backup anterior.</p>
                    <label className="w-full py-4 bg-bg-deep border border-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all text-center cursor-pointer">
                      Selecionar Arquivo
                      <input type="file" className="hidden" accept=".json" onChange={importData} />
                    </label>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleResetSystem}
                    className="w-full py-5 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                  >
                    <Trash2 size={16} /> Limpeza Total do Ambiente (LGPD)
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'audit' && (
            <section className="bg-bg-card border border-border-subtle rounded-[3rem] p-10 shadow-2xl h-full flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-tl-[8rem] -mr-32 -mb-32 pointer-events-none" />
               
               <div className="flex items-center justify-between mb-12 relative z-10">
                  <h3 className="text-[11px] font-black text-text-main uppercase tracking-[0.3em] flex items-center gap-3">
                    <History size={16} className="text-primary" /> Registro Geral de Operações
                  </h3>
                  <button onClick={clearLogs} className="p-3 bg-bg-sidebar border border-border-subtle rounded-xl text-text-dim hover:text-red-500 transition-all">
                    <Trash2 size={18} />
                  </button>
               </div>
               
               <div className="flex-grow space-y-4 pr-2 relative z-10 overflow-y-auto scroller-hide max-h-[500px]">
                  {actionLogs.map((log) => (
                    <div key={`log-sett-${log.id}`} className="p-6 bg-bg-sidebar/40 border border-border-subtle rounded-[1.5rem] group hover:bg-bg-sidebar/80 transition-all border-l-4 border-l-primary/20">
                       <div className="flex justify-between items-center mb-3">
                         <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{log.user}</span>
                         <span className="text-[9px] font-black text-text-dim/40 tabular-nums uppercase">{log.timestamp}</span>
                       </div>
                       <p className="text-sm font-bold text-text-main/70 leading-relaxed">{log.action}</p>
                    </div>
                  ))}
                  {actionLogs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-10">
                       <History size={64} className="mb-6" />
                       <p className="text-[10px] font-black uppercase tracking-[0.4em]">Nenhum registro de auditoria encontrado</p>
                    </div>
                  )}
               </div>
            </section>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isOpen}
        title={options?.title || ''}
        message={options?.message || ''}
        confirmLabel={options?.confirmLabel}
        variant={options?.variant}
        onConfirm={handleConfirm}
        onCancel={close}
      />

      {showSavedModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl relative text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6 mx-auto border border-green-500/20">
              <CheckCircle size={28} />
            </div>
            <h3 className="text-lg font-display font-bold text-text-main mb-3 uppercase tracking-wider">Configurações Salvas</h3>
            <p className="text-xs text-text-dim leading-relaxed mb-8 font-medium">
              Suas preferências e chaves de segurança foram gravadas localmente e criptografadas com sucesso.
            </p>
            <button
              onClick={() => setShowSavedModal(false)}
              className="w-full py-4 bg-primary text-bg-deep font-black text-[10px] tracking-widest rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all uppercase cursor-pointer"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
