import React from 'react';
import { ShieldCheck, Lock, Eye, AlertCircle } from 'lucide-react';

interface LGPDNoticeProps {
  onAccept: () => void;
}

export default function LGPDNotice({ onAccept }: LGPDNoticeProps) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-bg-deep/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-2xl bg-bg-card border border-border-subtle rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden flex flex-col gap-8 max-h-[90vh]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-xl shadow-primary/5">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-display font-bold text-text-main tracking-tight">Compromisso com a LGPD</h2>
          <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em]">Gestão Segura de Dados Sensíveis</p>
        </div>

        <div className="overflow-y-auto pr-4 space-y-6 scroller-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-bg-sidebar border border-border-subtle rounded-2xl space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <Lock size={18} />
                <h4 className="text-xs font-black uppercase tracking-widest">Segurança Máxima</h4>
              </div>
              <p className="text-xs text-text-dim leading-relaxed">
                Todos os dados de seus pacientes são armazenados localmente e criptografados. Somente você tem acesso às chaves de recuperação.
              </p>
            </div>
            <div className="p-5 bg-bg-sidebar border border-border-subtle rounded-2xl space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <Eye size={18} />
                <h4 className="text-xs font-black uppercase tracking-widest">Privacidade Total</h4>
              </div>
              <p className="text-xs text-text-dim leading-relaxed">
                Nenhum dado sensível é compartilhado com terceiros. O sistema opera sob diretrizes rigorosas da Lei Geral de Proteção de Dados (LGPD).
              </p>
            </div>
          </div>

          <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <AlertCircle size={20} />
              <h4 className="text-xs font-black uppercase tracking-widest">Responsabilidades</h4>
            </div>
            <ul className="space-y-2 text-[10px] text-text-dim font-bold uppercase tracking-widest leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span> Coleta apenas de dados estritamente necessários para o atendimento clínico.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span> Garantia de sigilo profissional conforme o Código de Ética do Psicólogo.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span> Direito do paciente de solicitar, a qualquer momento, o acesso ou exclusão de seus dados.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-auto">
          <button
            onClick={onAccept}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
          >
            Compreendo e Aceito as Diretrizes
          </button>
          <p className="text-[9px] text-center text-text-dim font-bold uppercase tracking-widest opacity-40">
            Ao continuar, você confirma que está ciente de suas responsabilidades como controlador de dados.
          </p>
        </div>
      </div>
    </div>
  );
}
