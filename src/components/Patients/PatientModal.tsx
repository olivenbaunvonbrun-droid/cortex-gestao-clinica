import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, ExternalLink, Camera, FileText, Download, UserPlus, Users } from 'lucide-react';
import { db, type Patient, logAction } from '../../lib/db';
import { cn } from '../../lib/utils';
import RichTextEditor from '../RichTextEditor';
import { CONTRACT_TEMPLATES, type ContractType } from '../../constants/contracts';

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

interface PatientModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientModal({ patient, isOpen, onClose }: PatientModalProps) {
  const [formData, setFormData] = useState<Partial<Patient>>({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    nascimento: '',
    endereco: '',
    estado: '',
    fotoPerfilDataUrl: '',
    historicoHtml: '',
    psicodiagnosticoHtml: '',
    linksUteis: [],
    dataCadastro: new Date().toISOString(),
    isMenor: false,
    responsavelNome: '',
    responsavelCpf: '',
    responsavelTelefone: '',
    responsavelEmail: '',
    contratoTerapeuticoHtml: '',
    valorConsulta: 0,
    frequenciaSemanal: 1,
    valorMensal: 0,
    valorFinalCombinado: 0,
    dataReajuste: '',
    status: 'ativo',
  });

  const [activeTab, setActiveTab] = useState<'dados' | 'historico' | 'contrato'>('dados');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractType | ''>('');
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const items = await db.settings.toArray();
    const s: any = {};
    items.forEach(item => s[item.key] = item.value);
    setSettings(s);
  };

  const applyTemplate = (templateId: ContractType) => {
    const template = CONTRACT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    let content = template.content;
    
    const psychDisplayName = (!settings.appTitle || settings.appTitle === "Sistema de Gestão para Psicólogos") ? '[Seu Nome]' : settings.appTitle;

    // Auto-fill logic
    content = content
      .replace(/{psicologo_nome}/g, psychDisplayName)
      .replace(/{psicologo_crp}/g, settings.psychCrp || '_________________')
      .replace(/{paciente_nome}/g, formData.nome || '[Nome do Paciente]')
      .replace(/{paciente_cpf}/g, formData.cpf || '_________________')
      .replace(/{paciente_endereco}/g, formData.endereco || '_________________')
      .replace(/{responsavel_nome}/g, formData.responsavelNome || '[Nome do Responsável]')
      .replace(/{responsavel_cpf}/g, formData.responsavelCpf || '_________________');

    setFormData({ ...formData, contratoTerapeuticoHtml: content });
    setSelectedTemplate(templateId);
  };

  useEffect(() => {
    if (patient) {
      setFormData(patient);
    }
  }, [patient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    const numericFields = ['valorConsulta', 'frequenciaSemanal', 'valorMensal', 'valorFinalCombinado'];
    
    setFormData({ 
      ...formData, 
      [name]: numericFields.includes(name) ? (value === '' ? 0 : Number(value)) : value 
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fotoPerfilDataUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return alert("O nome é obrigatório!");

    const saveData = {
      ...formData,
      valorConsulta: formData.valorConsulta !== undefined && formData.valorConsulta !== null && formData.valorConsulta !== '' ? Number(formData.valorConsulta) : 0,
      frequenciaSemanal: formData.frequenciaSemanal !== undefined && formData.frequenciaSemanal !== null && formData.frequenciaSemanal !== '' ? Number(formData.frequenciaSemanal) : 1,
      valorMensal: formData.valorMensal !== undefined && formData.valorMensal !== null && formData.valorMensal !== '' ? Number(formData.valorMensal) : 0,
      valorFinalCombinado: formData.valorFinalCombinado !== undefined && formData.valorFinalCombinado !== null && formData.valorFinalCombinado !== '' ? Number(formData.valorFinalCombinado) : 0,
    };

    try {
      const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
      if (patient) {
        // Compare changes for timeline
        const changes: string[] = [];
        if (formData.nome !== patient.nome) changes.push(`Nome alterado de "${patient.nome}" para "${formData.nome}"`);
        if (formData.telefone !== patient.telefone) changes.push(`Telefone alterado`);
        if (formData.email !== patient.email) changes.push(`E-mail alterado`);
        if (formData.endereco !== patient.endereco) changes.push(`Endereço alterado`);
        if (formData.isMenor !== patient.isMenor) changes.push(`Status de menor de idade alterado`);
        
        await db.pacientes.update(patient.id, saveData);
        logAction(currentUser, `Editou paciente: ${formData.nome}`);

        if (changes.length > 0) {
          const record = await db.prontuarios.get(patient.id);
          if (record) {
            const newEntry = {
              timestamp: Date.now(),
              data: new Date().toISOString().split('T')[0],
              textoHtml: `<p><strong>Atualização Cadastral:</strong></p><ul>${changes.map((c, cIdx) => `<li key="change-${cIdx}">${c}</li>`).join('')}</ul>`,
              tipo: 'sistema' as const
            };
            await db.prontuarios.update(patient.id, {
              entradas: [newEntry, ...record.entradas]
            });
          }
        }
      } else {
        const newPatient = {
          ...saveData,
          id: crypto.randomUUID(),
          dataCadastro: new Date().toISOString()
        } as Patient;
        await db.pacientes.add(newPatient);
        logAction(currentUser, `Cadastrou paciente: ${formData.nome}`);

        // Initial record entry for creation
        await db.prontuarios.add({
          pacienteId: newPatient.id,
          entradas: [{
            timestamp: Date.now(),
            data: new Date().toISOString().split('T')[0],
            textoHtml: '<p><strong>Cadastro Inicial:</strong> Paciente registrado no sistema.</p>',
            tipo: 'sistema'
          }],
          anamneseData: {}
        });
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      alert("Erro ao salvar paciente.");
    }
  };

  const addLink = () => {
    const links = [...(formData.linksUteis || []), { titulo: '', url: '' }];
    setFormData({ ...formData, linksUteis: links });
  };

  const updateLink = (index: number, field: 'titulo' | 'url', value: string) => {
    const links = [...(formData.linksUteis || [])];
    links[index][field] = value;
    setFormData({ ...formData, linksUteis: links });
  };

  const removeLink = (index: number) => {
    const links = formData.linksUteis?.filter((_, i) => i !== index);
    setFormData({ ...formData, linksUteis: links });
  };

  const exportContract = () => {
    if (!formData.contratoTerapeuticoHtml) return alert("Preencha o contrato antes de exportar.");

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor, permita pop-ups para este site para poder exportar o contrato.");
      return;
    }

    const clinicTitle = settings.appTitle || "Gestão Clínica Psicológica";
    const psychName = (!settings.appTitle || settings.appTitle === "Sistema de Gestão para Psicólogos") ? "Psicólogo(a)" : settings.appTitle;
    const psychCrp = settings.psychCrp || "_________________";
    const logoUrl = settings.appLogo || '';
    const signatureUrl = settings.psychSignature || '';
    const dateStr = new Date().toLocaleDateString('pt-BR');

    printWindow.document.write(`
      <html>
        <head>
          <title>Contrato Terapêutico - ${formData.nome}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600;700&display=swap');
            
            @page {
              size: A4;
              margin: 15mm 20mm;
            }

            body { 
              font-family: 'Inter', sans-serif; 
              line-height: 1.5; 
              color: #0f172a; 
              margin: 0;
              background: #fff;
              font-size: 11px;
            }

            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 0.5pt solid #e2e8f0; 
              padding-bottom: 15px; 
            }

            .prof-logo {
              max-height: 50px;
              max-width: 150px;
              margin-bottom: 10px;
              object-fit: contain;
            }

            .document-title { 
              text-transform: uppercase; 
              letter-spacing: 0.25em; 
              font-size: 16px; 
              font-weight: 800; 
              color: #000; 
            }

            h1, h2, h3 { 
              color: #000; 
              margin-top: 15px; 
              margin-bottom: 8px; 
              page-break-after: avoid;
            }

            h2, h3 { 
              font-size: 13px; 
              border-left: 2pt solid #000; 
              padding-left: 10px; 
              text-transform: uppercase; 
              letter-spacing: 0.02em; 
              font-weight: 700;
            }

            .content { 
              text-align: justify; 
            }

            .content p { margin-bottom: 10px; }

            .date-place { 
              margin-top: 30px; 
              font-weight: 600; 
              color: #000; 
              font-size: 11px;
            }

            .signatures-container { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 40px; 
              margin-top: 50px; 
              page-break-inside: avoid;
            }

            .signature-block { 
              text-align: center; 
            }

            .signature-image {
              max-height: 60px;
              max-width: 150px;
              margin-bottom: -15px;
              mix-blend-mode: multiply;
            }

            .signature-line { 
              border-top: 0.5pt solid #000; 
              margin-bottom: 6px; 
            }

            .signature-name { 
              font-weight: 700; 
              font-size: 11px; 
            }

            .signature-role { 
              font-size: 9px; 
              text-transform: uppercase; 
              letter-spacing: 0.05em; 
              color: #475569; 
              font-weight: 600; 
            }

            .footer { 
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              text-align: center; 
              font-size: 8px; 
              color: #94a3b8; 
              font-weight: 600; 
              text-transform: uppercase; 
              letter-spacing: 0.1em; 
              padding-top: 10px;
              border-top: 0.5pt solid #f1f5f9;
            }

            @media print { 
              body { -webkit-print-color-adjust: exact; }
              .header { border-bottom-color: #000; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoUrl ? `<img src="${logoUrl}" class="prof-logo" alt="Logo"><br>` : ''}
            <div class="document-title">Contrato de Prestação de Serviços Psicológicos</div>
          </div>

          <div class="content">
            ${formData.contratoTerapeuticoHtml}
          </div>

          <div class="date-place">
            Local e data: ___________________________, ${dateStr}
          </div>

          <div class="signatures-container">
            <div class="signature-block">
              <div style="height: 60px;"></div>
              <div class="signature-line"></div>
              <div class="signature-name">${formData.isMenor ? (formData.responsavelNome || '[Nome do Responsável]') : (formData.nome || '[Nome do Paciente]')}</div>
              <div class="signature-role">${formData.isMenor ? 'Contratante / Responsável Legal' : 'Contratante / Paciente'}</div>
              <div class="signature-role">CPF: ${formData.isMenor ? (formData.responsavelCpf || '___________') : (formData.cpf || '___________')}</div>
            </div>

            <div class="signature-block">
              ${signatureUrl ? `<img src="${signatureUrl}" class="signature-image" alt="Assinatura">` : '<div style="height: 60px;"></div>'}
              <div class="signature-line"></div>
              <div class="signature-name">${psychName}</div>
              <div class="signature-role">Contratada / Psicólogo(a)</div>
              <div class="signature-role">CRP nº ${psychCrp}</div>
            </div>
          </div>

          <div class="footer">Gerado digitalmente via PSI.CORE</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content max-w-5xl">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-border-subtle">
          <div>
            <h2 className="text-3xl font-display font-bold text-text-main tracking-tight">
              {patient ? 'Prontuário de Paciente' : 'Novo Registro Clínico'}
            </h2>
            <p className="text-xs font-bold text-text-dim uppercase tracking-[0.2em] mt-2 opacity-60">Cadastro profissional e documentos</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-bg-sidebar p-1 rounded-2xl border border-border-subtle mr-4">
                <button 
                  type="button"
                  onClick={() => setActiveTab('dados')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'dados' ? "bg-primary text-bg-deep shadow-lg shadow-primary/20" : "text-text-dim hover:text-text-main"
                  )}
                >
                  Dados
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab('historico')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'historico' ? "bg-primary text-bg-deep shadow-lg shadow-primary/20" : "text-text-dim hover:text-text-main"
                  )}
                >
                  Clínico
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab('contrato')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'contrato' ? "bg-primary text-bg-deep shadow-lg shadow-primary/20" : "text-text-dim hover:text-text-main"
                  )}
                >
                  Contrato
                </button>
             </div>
             <button onClick={onClose} className="p-3 bg-bg-sidebar border border-border-subtle hover:border-text-dim/30 rounded-2xl transition-all text-text-dim hover:text-text-main shadow-inner">
               <X size={20} />
             </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-10">
          {activeTab === 'dados' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex flex-col lg:flex-row gap-12 mb-10">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative w-40 h-40 rounded-[2.5rem] bg-bg-sidebar border-2 border-dashed border-border-subtle flex items-center justify-center overflow-hidden group shadow-inner">
                    {formData.fotoPerfilDataUrl ? (
                      <img src={formData.fotoPerfilDataUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={48} className="text-text-dim/20" />
                    )}
                    <label className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                      <Plus size={24} className="text-primary mb-1" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-main">Carregar</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                  {formData.fotoPerfilDataUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, fotoPerfilDataUrl: '' })}
                      className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remover Foto
                    </button>
                  )}
                </div>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
                      <div className="flex items-center justify-between flex-grow">
                        <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Modalidade de Registro</label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isMenor: !formData.isMenor })}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                            formData.isMenor 
                              ? "bg-primary/20 border-primary/50 text-white" 
                              : "bg-bg-sidebar border-border-subtle text-text-dim hover:text-text-main"
                          )}
                        >
                          {formData.isMenor ? <Users size={14} /> : <UserPlus size={14} />}
                          {formData.isMenor ? 'Paciente Menor de Idade' : 'Paciente Individual/Adulto'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between flex-grow md:pl-6 md:border-l border-border-subtle/30">
                        <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Status de Atividade</label>
                        <div className="flex bg-bg-sidebar p-1 rounded-xl border border-border-subtle shrink-0">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, status: 'ativo' })}
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-transparent",
                              formData.status === 'ativo' || !formData.status
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black shadow-md shadow-emerald-500/5"
                                : "text-text-dim hover:text-text-main"
                            )}
                          >
                            Ativo
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, status: 'inativo' })}
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-transparent",
                              formData.status === 'inativo'
                                ? "bg-red-500/10 text-red-400 border-red-500/20 font-black shadow-md shadow-red-500/5"
                                : "text-text-dim hover:text-text-main"
                            )}
                          >
                            Inativo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Nome Completo</label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      className="w-full px-5 py-3.5 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-medium placeholder:text-text-dim/20"
                      placeholder="Nome civil do paciente"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">CPF / Documento</label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">E-mail de Contato</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Data de Nascimento</label>
                    <input
                      type="date"
                      name="nascimento"
                      value={formData.nascimento}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Endereço Residencial</label>
                    <input
                      type="text"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Estado (UF)</label>
                    <select
                      name="estado"
                      value={formData.estado || ''}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-medium cursor-pointer text-text-main"
                    >
                      <option value="">Selecione...</option>
                      {BRAZILIAN_STATES.map(st => (
                        <option key={`st-opt-${st.value}`} value={st.value}>{st.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Valor p/ Consulta (R$)</label>
                        <input
                          type="number"
                          name="valorConsulta"
                          value={formData.valorConsulta || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const freq = formData.frequenciaSemanal || 1;
                            setFormData(prev => ({ 
                              ...prev, 
                              valorConsulta: val,
                              valorMensal: val * freq * 4
                            }));
                          }}
                          className="w-full px-5 py-3.5 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-medium"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Freq. Semanal (Sessões)</label>
                        <input
                          type="number"
                          name="frequenciaSemanal"
                          value={formData.frequenciaSemanal || ''}
                          onChange={(e) => {
                            const freq = Number(e.target.value);
                            const val = formData.valorConsulta || 0;
                            setFormData(prev => ({ 
                              ...prev, 
                              frequenciaSemanal: freq,
                              valorMensal: val * freq * 4
                            }));
                          }}
                          className="w-full px-5 py-3.5 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-medium"
                          placeholder="Ex: 1"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Valor Mensal Estimado (R$)</label>
                        <input
                          type="number"
                          name="valorMensal"
                          value={formData.valorMensal || ''}
                          readOnly
                          className="w-full px-5 py-3.5 bg-bg-sidebar/50 border border-border-subtle rounded-2xl outline-none text-sm font-black text-primary"
                          placeholder="Calculado automaticamente"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Valor Final Combinado (R$)</label>
                        <input
                          type="number"
                          name="valorFinalCombinado"
                          value={formData.valorFinalCombinado || ''}
                          onChange={handleInputChange}
                          className="w-full px-5 py-3.5 bg-bg-card border border-primary/20 rounded-2xl focus:border-primary outline-none text-sm font-bold"
                          placeholder="Valor acordado"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Próxima Data de Reajuste</label>
                        <input
                          type="date"
                          name="dataReajuste"
                          value={formData.dataReajuste || ''}
                          onChange={handleInputChange}
                          className="w-full px-5 py-3.5 bg-bg-card border border-primary/20 rounded-2xl focus:border-primary outline-none text-sm font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {formData.isMenor && (
                <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2.5rem] mb-10 animate-in slide-in-from-top-4 duration-500">
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3 mb-8">
                     <Users size={18} /> Dados do Responsável Legal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-primary/60 uppercase tracking-widest ml-1">Nome do Responsável</label>
                      <input
                        type="text"
                        name="responsavelNome"
                        value={formData.responsavelNome}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-bg-sidebar/50 border border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-primary/60 uppercase tracking-widest ml-1">CPF do Responsável</label>
                      <input
                        type="text"
                        name="responsavelCpf"
                        value={formData.responsavelCpf}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-bg-sidebar/50 border border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-primary/60 uppercase tracking-widest ml-1">Telefone do Responsável</label>
                      <input
                        type="text"
                        name="responsavelTelefone"
                        value={formData.responsavelTelefone}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-bg-sidebar/50 border border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-primary/60 uppercase tracking-widest ml-1">E-mail do Responsável</label>
                      <input
                        type="email"
                        name="responsavelEmail"
                        value={formData.responsavelEmail}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-bg-sidebar/50 border border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/50 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-text-dim flex items-center gap-3">
                     <span className="w-8 h-[1px] bg-primary/30" />
                     Links e Documentos Externos
                  </h3>
                  <button
                    type="button"
                    onClick={addLink}
                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-text-main rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <Plus size={14} className="text-primary" /> Adicionar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.linksUteis?.map((link, lIdx) => (
                    <div key={`patient-link-v2-${lIdx}-${link.titulo || 'unnamed'}-${formData.linksUteis?.length}`} className="flex gap-3 items-center bg-bg-sidebar border border-border-subtle p-3 rounded-2xl group/link">
                      <div className="flex-grow space-y-2">
                        <input
                          type="text"
                          value={link.titulo}
                          onChange={(e) => updateLink(lIdx, 'titulo', e.target.value)}
                          placeholder="Título"
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-text-main placeholder:text-text-dim/20"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateLink(lIdx, 'url', e.target.value)}
                          placeholder="Link (URL)"
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-[10px] text-text-dim font-medium"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLink(lIdx)}
                        className="p-2 text-text-dim hover:text-red-500 transition-colors opacity-0 group-hover/link:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-10">
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-text-dim flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/30" />
                  Histórico e Queixa Principal
                </h3>
                <div className="bg-bg-sidebar rounded-3xl border border-border-subtle overflow-hidden shadow-inner">
                  <RichTextEditor
                    value={formData.historicoHtml || ''}
                    onChange={(val) => setFormData({ ...formData, historicoHtml: val })}
                    placeholder="Descreva o histórico clínico e as queixas apresentadas..."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-text-dim flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-primary/30" />
                  Psicodiagnóstico Inicial
                </h3>
                <div className="bg-bg-sidebar rounded-3xl border border-border-subtle overflow-hidden shadow-inner">
                  <RichTextEditor
                    value={formData.psicodiagnosticoHtml || ''}
                    onChange={(val) => setFormData({ ...formData, psicodiagnosticoHtml: val })}
                    placeholder="Anotações sobre a primeira escuta e avaliação..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contrato' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-text-dim flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-primary/30" />
                    Modelos de Contrato (CFP)
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {CONTRACT_TEMPLATES.map((t) => (
                      <button
                        key={`contract-tmpl-${t.id}`}
                        type="button"
                        onClick={() => applyTemplate(t.id)}
                        className={cn(
                          "w-full text-left p-5 rounded-2xl border transition-all relative group",
                          selectedTemplate === t.id 
                            ? "bg-primary/10 border-primary/40 ring-4 ring-primary/5" 
                            : "bg-bg-sidebar border-border-subtle hover:border-primary/20"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "text-xs font-black uppercase tracking-widest",
                            selectedTemplate === t.id ? "text-primary" : "text-text-main"
                          )}>{t.title}</span>
                          {selectedTemplate === t.id && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        </div>
                        <p className="text-[10px] text-text-dim font-medium leading-relaxed italic pr-4">
                          {t.legend}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                    <div className="flex items-start gap-4">
                      <FileText size={20} className="text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-relaxed">Diretrizes do CFP</p>
                        <p className="text-[9px] text-text-dim leading-relaxed mt-2 font-bold uppercase tracking-widest">
                          O contrato é um documento ético. Garanta que honorários, sigilo, faltas e interrupções estejam claros. O preenchimento automático usa os dados básicos do cadastro.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-dim">Editor do Contrato</h4>
                    <button
                      type="button"
                      onClick={exportContract}
                      className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-blue-500/20"
                    >
                      <Download size={14} /> Exportar (PDF/HTML)
                    </button>
                  </div>
                  <div className="bg-bg-sidebar rounded-3xl border border-border-subtle overflow-hidden shadow-inner h-[500px]">
                    <RichTextEditor
                      value={formData.contratoTerapeuticoHtml || ''}
                      onChange={(val) => setFormData({ ...formData, contratoTerapeuticoHtml: val })}
                      placeholder="Selecione um modelo à esquerda ou escreva aqui o contrato..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-10 border-t border-border-subtle mt-12">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3.5 bg-bg-sidebar hover:bg-white/5 border border-border-subtle rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-dim transition-all"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="px-10 py-3.5 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center gap-3 hover:-translate-y-0.5 active:scale-95"
            >
              <Save size={18} /> Salvar Prontuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
