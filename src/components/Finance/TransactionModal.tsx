import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign } from 'lucide-react';
import { db, type Transaction, type Patient } from '../../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface TransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionModal({ transaction, isOpen, onClose }: TransactionModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    tipo: 'receita',
    descricao: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    pacienteId: '',
    formaPagamento: 'Pix',
    categoria: ''
  });

  useEffect(() => {
    db.pacientes.toArray().then(setPatients);
    if (transaction) {
      setFormData(transaction);
    } else {
      setFormData({
        tipo: 'receita',
        descricao: '',
        valor: 0,
        data: new Date().toISOString().split('T')[0],
        pacienteId: '',
        formaPagamento: 'Pix',
        categoria: ''
      });
    }
  }, [transaction, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.valor || !formData.data) return;

    try {
      if (transaction) {
        await db.transacoes.update(transaction.id, formData);
      } else {
        await db.transacoes.add({
          ...formData,
          id: crypto.randomUUID()
        } as Transaction);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-bg-card border border-border-subtle w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
            
            <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between bg-bg-sidebar/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-text-main tracking-tight">
                    {transaction ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
                  </h2>
                  <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mt-1">Gestão de fluxo de caixa</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-bg-card rounded-2xl transition-all text-text-dim hover:text-red-400 border border-transparent hover:border-border-subtle">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Natureza do Fluxo</label>
                    <div className="flex bg-bg-sidebar rounded-2xl border border-border-subtle p-1.5 shadow-inner">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipo: 'receita' })}
                        className={cn(
                          "flex-grow py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                          formData.tipo === 'receita' 
                            ? "bg-green-500/20 text-green-400 shadow-sm" 
                            : "text-text-dim hover:text-text-main"
                        )}
                      >
                        Receita
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipo: 'despesa' })}
                        className={cn(
                          "flex-grow py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                          formData.tipo === 'despesa' 
                            ? "bg-red-500/20 text-red-400 shadow-sm" 
                            : "text-text-dim hover:text-text-main"
                        )}
                      >
                        Despesa
                      </button>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Valor Nominal (BRL)</label>
                    <input
                      type="number"
                      name="valor"
                      step="0.01"
                      value={formData.valor}
                      onChange={handleInputChange}
                      required
                      className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-bold tabular-nums transition-all"
                    />
                 </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Especificação / Descrição</label>
                <input
                  type="text"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Sessão Psicoterapia, Aluguel Setorial..."
                  className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-medium transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Data Competência</label>
                  <input
                    type="date"
                    name="data"
                    value={formData.data}
                    onChange={handleInputChange}
                    required
                    className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-bold tabular-nums transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Método de Liquidação</label>
                  <select
                    name="formaPagamento"
                    value={formData.formaPagamento}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-[11px] font-black uppercase tracking-widest transition-all appearance-none cursor-pointer"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Espécie / Dinheiro</option>
                    <option value="Cartão">Cartão Débito/Crédito</option>
                    <option value="Transferência">TED / DOC / IB</option>
                    <option value="Convênio">Repasse Convênio</option>
                  </select>
                </div>
              </div>

              {formData.tipo === 'receita' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Vincular Beneficiário (Opcional)</label>
                  <select
                    name="pacienteId"
                    value={formData.pacienteId}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-bold transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Lançamento Avulso</option>
                    {patients.map((p, pIdx) => (
                      <option key={`trans-opt-v2-${p.id || pIdx}-${pIdx}`} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-8 border-t border-border-subtle mt-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-bg-sidebar transition-all text-text-dim hover:text-text-main shadow-inner"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-10 py-4 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-primary/25 transition-all flex items-center gap-3 hover:-translate-y-0.5 active:scale-95"
                >
                  <Save size={18} /> Confirmar Lançamento
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
