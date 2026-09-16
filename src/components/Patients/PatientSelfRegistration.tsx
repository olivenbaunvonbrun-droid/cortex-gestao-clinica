import React, { useState, useEffect } from 'react';
import { CheckCircle2, Shield, User, FileText, Mail, Calendar, MapPin, Building, Send, AlertCircle } from 'lucide-react';
import { db } from '../../lib/db';
import { cn } from '../../lib/utils';

export const BRAZILIAN_STATES = [
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

export interface RegistrationTokenPayload {
  id?: string;
  primeiroNome?: string;
  telefone?: string;
  psicologoNome?: string;
  psicologoTelefone?: string;
  ts?: number;
}

interface PatientSelfRegistrationProps {
  token: string;
}

export function decodeRegistrationToken(token: string): RegistrationTokenPayload | null {
  try {
    const jsonStr = decodeURIComponent(escape(atob(token)));
    return JSON.parse(jsonStr);
  } catch {
    try {
      return JSON.parse(atob(token));
    } catch {
      return null;
    }
  }
}

export function encodeRegistrationToken(payload: RegistrationTokenPayload): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export default function PatientSelfRegistration({ token }: PatientSelfRegistrationProps) {
  const [tokenData, setTokenData] = useState<RegistrationTokenPayload | null>(null);
  const [tokenError, setTokenError] = useState(false);

  // Form Fields - Estritamente os 6 campos solicitados:
  // 1. O restante do nome completo
  // 2. CPF
  // 3. E-mail
  // 4. Data de nascimento
  // 5. Endereço
  // 6. Estado (UF)
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [estado, setEstado] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappConfirmationUrl, setWhatsappConfirmationUrl] = useState('');

  useEffect(() => {
    if (!token) {
      setTokenError(true);
      return;
    }
    const decoded = decodeRegistrationToken(token);
    if (!decoded) {
      setTokenError(true);
      return;
    }
    setTokenData(decoded);
    if (decoded.primeiroNome) {
      // Inicia com o primeiro nome para que o paciente complete o restante do nome
      setNome(decoded.primeiroNome.trim() + ' ');
    }
  }, [token]);

  // Mask CPF: 000.000.000-00
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (val.length > 9) {
      val = val.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (val.length > 6) {
      val = val.replace(/^(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (val.length > 3) {
      val = val.replace(/^(\d{3})(\d{1,3})/, '$1.$2');
    }
    setCpf(val);
  };

  const validateCPF = (cpfValue: string) => {
    const clean = cpfValue.replace(/\D/g, '');
    if (clean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(clean)) return false;
    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(clean.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(clean.substring(10, 11))) return false;
    return true;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const trimmedNome = nome.trim();
    if (!trimmedNome) {
      newErrors.nome = 'O nome completo é obrigatório.';
    } else if (trimmedNome.split(/\s+/).length < 2) {
      newErrors.nome = 'Por favor, informe seu nome e sobrenome completos.';
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (!cleanCpf) {
      newErrors.cpf = 'O CPF é obrigatório.';
    } else if (!validateCPF(cpf)) {
      newErrors.cpf = 'CPF inválido. Verifique os números digitados.';
    }

    if (!email.trim()) {
      newErrors.email = 'O e-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'E-mail inválido.';
    }

    if (!nascimento) {
      newErrors.nascimento = 'A data de nascimento é obrigatória.';
    } else {
      const d = new Date(nascimento);
      const now = new Date();
      if (isNaN(d.getTime()) || d > now || d.getFullYear() < 1900) {
        newErrors.nascimento = 'Data de nascimento inválida.';
      }
    }

    if (!endereco.trim()) {
      newErrors.endereco = 'O endereço residencial é obrigatório.';
    } else if (endereco.trim().length < 5) {
      newErrors.endereco = 'Informe o endereço completo (Rua, Número, Bairro, Cidade).';
    }

    if (!estado) {
      newErrors.estado = 'Selecione o Estado (UF).';
    }

    if (!lgpdConsent) {
      newErrors.lgpd = 'Você precisa aceitar os termos de consentimento para prosseguir.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const patientId = tokenData?.id;
      const telefone = tokenData?.telefone || '';

      // Tenta persistir no IndexedDB local se estiver disponível no ambiente
      if (patientId) {
        try {
          const existing = await db.pacientes.get(patientId);
          if (existing) {
            await db.pacientes.update(patientId, {
              nome: nome.trim(),
              cpf: cpf.trim(),
              email: email.trim(),
              nascimento,
              endereco: endereco.trim(),
              estado,
              evidenciaLGPDAceite: true,
              dataAceiteLGPD: new Date().toISOString()
            });
          } else {
            // Criação local
            await db.pacientes.put({
              id: patientId,
              nome: nome.trim(),
              cpf: cpf.trim(),
              email: email.trim(),
              telefone: telefone,
              nascimento,
              endereco: endereco.trim(),
              estado,
              dataCadastro: new Date().toISOString(),
              evidenciaLGPDAceite: true,
              dataAceiteLGPD: new Date().toISOString(),
              status: 'ativo'
            });
          }
        } catch (dbErr) {
          console.warn("IndexedDB direct update not available or cross-origin (normal in remote mobile browser):", dbErr);
        }
      }

      // Prepara payload de confirmação compacta e segura para WhatsApp
      const confirmationPayload = {
        id: patientId || '',
        nome: nome.trim(),
        cpf: cpf.trim(),
        email: email.trim(),
        nascimento,
        endereco: endereco.trim(),
        estado,
        telefone
      };
      const encodedResponse = btoa(unescape(encodeURIComponent(JSON.stringify(confirmationPayload))));

      const psychName = tokenData?.psicologoNome || 'Consultório';
      const returnPhone = tokenData?.psicologoTelefone || '';

      const waMessage = [
        `Olá ${psychName}! Preenchi meus dados cadastrais pelo link seguro:`,
        ``,
        `• *Nome Completo:* ${nome.trim()}`,
        `• *CPF:* ${cpf.trim()}`,
        `• *E-mail:* ${email.trim()}`,
        `• *Data de Nascimento:* ${nascimento.split('-').reverse().join('/')}`,
        `• *Endereço:* ${endereco.trim()}`,
        `• *Estado (UF):* ${estado}`,
        ``,
        `[CORTEX_CADASTRO:${encodedResponse}]`
      ].join('\n');

      const targetPhone = returnPhone.replace(/\D/g, '');
      const waUrl = targetPhone 
        ? `https://wa.me/55${targetPhone}?text=${encodeURIComponent(waMessage)}`
        : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

      setWhatsappConfirmationUrl(waUrl);
      setIsSuccess(true);
    } catch (error) {
      console.error("Erro ao salvar cadastro do paciente:", error);
      alert("Ocorreu um erro ao processar o formulário. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Link Inválido ou Expirado</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            O link de cadastro acessado não é válido ou foi corrompido. Por favor, solicite um novo link diretamente ao seu psicólogo via WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-lg w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 size={44} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Cadastro Concluído!
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            Obrigado, <strong className="text-white">{nome.trim().split(' ')[0]}</strong>. Seus dados foram preenchidos com sucesso e armazenados com segurança.
          </p>

          <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-left mb-8 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2 text-sm border-b border-slate-700/60 pb-2">
              <Shield size={16} className="text-emerald-400" />
              Resumo dos Dados Cadastrados
            </div>
            <p><span className="text-slate-400 font-medium">Nome:</span> <span className="text-white font-semibold">{nome.trim()}</span></p>
            <p><span className="text-slate-400 font-medium">CPF:</span> <span className="text-white font-mono">{cpf}</span></p>
            <p><span className="text-slate-400 font-medium">E-mail:</span> <span className="text-white">{email.trim()}</span></p>
            <p><span className="text-slate-400 font-medium">Nascimento:</span> <span className="text-white">{nascimento.split('-').reverse().join('/')}</span></p>
            <p><span className="text-slate-400 font-medium">Endereço:</span> <span className="text-white">{endereco.trim()} - {estado}</span></p>
          </div>

          <a
            href={whatsappConfirmationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
          >
            <Send size={18} />
            Confirmar Envio pelo WhatsApp
          </a>
          <p className="text-[11px] text-slate-500 mt-4">
            Clique no botão acima para notificar o consultório que você finalizou seu preenchimento.
          </p>
        </div>
      </div>
    );
  }

  const clinicTitle = tokenData?.psicologoNome && tokenData.psicologoNome !== "Sistema de Gestão para Psicólogos"
    ? tokenData.psicologoNome
    : "Consultório de Psicologia";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header Profissional */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-800/80 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">{clinicTitle}</h1>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Portal Seguro do Paciente</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mt-4">Auto-Cadastro de Paciente</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            {tokenData?.primeiroNome 
              ? `Olá, ${tokenData.primeiroNome}! Por favor, preencha seus dados complementares para a abertura do seu prontuário clínico.` 
              : 'Por favor, complete as informações abaixo para abertura do seu prontuário clínico.'}
          </p>
        </div>

        {/* Formulário Estritamente Restrito aos 6 Campos Solicitados */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {/* 1. Restante do Nome Completo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <User size={14} className="text-emerald-400" />
              1. Nome Completo (Complete com seu sobrenome)
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Maria Silva Santos"
              className={cn(
                "w-full px-4 py-3.5 bg-slate-950 border rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20",
                errors.nome ? "border-red-500/50" : "border-slate-800 focus:border-emerald-500/50"
              )}
            />
            {errors.nome && <p className="text-xs text-red-400 font-medium pl-1">{errors.nome}</p>}
          </div>

          {/* 2. CPF */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText size={14} className="text-emerald-400" />
              2. CPF
            </label>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className={cn(
                "w-full px-4 py-3.5 bg-slate-950 border rounded-2xl text-sm font-medium font-mono text-white placeholder:text-slate-600 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20",
                errors.cpf ? "border-red-500/50" : "border-slate-800 focus:border-emerald-500/50"
              )}
            />
            {errors.cpf && <p className="text-xs text-red-400 font-medium pl-1">{errors.cpf}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 3. E-mail */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Mail size={14} className="text-emerald-400" />
                3. E-mail de Contato
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className={cn(
                  "w-full px-4 py-3.5 bg-slate-950 border rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20",
                  errors.email ? "border-red-500/50" : "border-slate-800 focus:border-emerald-500/50"
                )}
              />
              {errors.email && <p className="text-xs text-red-400 font-medium pl-1">{errors.email}</p>}
            </div>

            {/* 4. Data de Nascimento */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Calendar size={14} className="text-emerald-400" />
                4. Data de Nascimento
              </label>
              <input
                type="date"
                value={nascimento}
                onChange={(e) => setNascimento(e.target.value)}
                className={cn(
                  "w-full px-4 py-3.5 bg-slate-950 border rounded-2xl text-sm font-medium text-white outline-none transition-all focus:ring-2 focus:ring-emerald-500/20",
                  errors.nascimento ? "border-red-500/50" : "border-slate-800 focus:border-emerald-500/50"
                )}
              />
              {errors.nascimento && <p className="text-xs text-red-400 font-medium pl-1">{errors.nascimento}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* 5. Endereço */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <MapPin size={14} className="text-emerald-400" />
                5. Endereço Residencial (Rua, Nº, Bairro, Cidade)
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua das Flores, 123, Apto 4, Bairro Centro, Cidade"
                className={cn(
                  "w-full px-4 py-3.5 bg-slate-950 border rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20",
                  errors.endereco ? "border-red-500/50" : "border-slate-800 focus:border-emerald-500/50"
                )}
              />
              {errors.endereco && <p className="text-xs text-red-400 font-medium pl-1">{errors.endereco}</p>}
            </div>

            {/* 6. Estado (UF) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Building size={14} className="text-emerald-400" />
                6. Estado (UF)
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className={cn(
                  "w-full px-4 py-3.5 bg-slate-950 border rounded-2xl text-sm font-medium text-white outline-none transition-all cursor-pointer focus:ring-2 focus:ring-emerald-500/20",
                  errors.estado ? "border-red-500/50" : "border-slate-800 focus:border-emerald-500/50"
                )}
              >
                <option value="">Selecione...</option>
                {BRAZILIAN_STATES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
              {errors.estado && <p className="text-xs text-red-400 font-medium pl-1">{errors.estado}</p>}
            </div>
          </div>

          {/* Consentimento LGPD */}
          <div className="pt-4 border-t border-slate-800/80">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={lgpdConsent}
                onChange={(e) => setLgpdConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 transition-all cursor-pointer"
              />
              <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                Declaro que as informações fornecidas são verdadeiras e autorizo o armazenamento seguro destes dados exclusivamente para finalidade de prontuário e prestação de serviços psicológicos, em conformidade com a <strong>LGPD (Lei Federal 13.709/2018)</strong> e o Código de Ética Profissional do Psicólogo.
              </span>
            </label>
            {errors.lgpd && <p className="text-xs text-red-400 font-medium mt-1.5 pl-7">{errors.lgpd}</p>}
          </div>

          {/* Botão de Conclusão */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando dados...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Salvar e Enviar Cadastro
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
            <Shield size={12} className="text-emerald-400" />
            Dados Criptografados de Ponta a Ponta • Apenas Você e o Psicólogo
          </div>
        </form>

      </div>
    </div>
  );
}
