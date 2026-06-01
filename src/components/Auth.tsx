import React, { useState } from 'react';
import { User, Lock, Key, Shield, ArrowLeft, Chrome } from 'lucide-react';
import { db } from '../lib/db';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface AuthProps {
  onLogin: (user: any) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    crp: '',
    keyword: '',
    currentKeyword: '',
    newPassword: '',
    newCRP: '',
    newKeyword: ''
  });
  const [feedback, setFeedback] = useState({ message: '', type: 'info' });

  const handleGoogleLogin = async () => {
    setLoading(true);
    setFeedback({ message: '', type: 'info' });
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Create or update user in local DB as well for legacy compatibility if needed
      const user = {
        id: result.user.uid,
        username: result.user.displayName || result.user.email?.split('@')[0] || 'Profissional',
        email: result.user.email
      };
      // We don't necessarily need to store the password in local DB for Google users
      onLogin(user);
    } catch (error: any) {
      console.error(error);
      setFeedback({ message: 'Erro ao entrar com Google. Tente novamente.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await db.users.where({ 
        username: formData.username, 
        password: formData.password 
      }).first();
      
      if (user) {
        onLogin(user);
      } else {
        setFeedback({ message: 'Usuário ou senha inválidos!', type: 'error' });
      }
    } catch (error) {
      setFeedback({ message: 'Erro ao fazer login.', type: 'error' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.users.add({
        id: Date.now().toString(),
        username: formData.username,
        password: formData.password,
        crp: formData.crp,
        keyword: formData.keyword
      });
      setFeedback({ message: 'Usuário registrado com sucesso!', type: 'success' });
      setMode('login');
    } catch (error: any) {
      if (error.name === 'ConstraintError') {
        setFeedback({ message: 'Usuário já existe!', type: 'error' });
      } else {
        setFeedback({ message: 'Erro ao registrar.', type: 'error' });
      }
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await db.users.where({ 
        username: formData.username, 
        keyword: formData.currentKeyword 
      }).first();

      if (user) {
        const updates: any = {};
        if (formData.newPassword) updates.password = formData.newPassword;
        if (formData.newCRP) updates.crp = formData.newCRP;
        if (formData.newKeyword) updates.keyword = formData.newKeyword;

        if (Object.keys(updates).length > 0) {
          await db.users.update(user.id, updates);
          setFeedback({ message: 'Dados atualizados com sucesso!', type: 'success' });
        } else {
          setFeedback({ message: `Sua senha é: ${user.password}`, type: 'info' });
        }
      } else {
        setFeedback({ message: 'Usuário ou palavra-chave inválidos!', type: 'error' });
      }
    } catch (error) {
      setFeedback({ message: 'Erro ao recuperar conta.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-6 selection:bg-primary/30">
      <div className="w-full max-w-md bg-bg-card border border-border-subtle rounded-[2rem] p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary mb-6 shadow-xl shadow-primary/5 rotate-3">
            <Shield size={40} className="-rotate-3" />
          </div>
          <h2 className="text-3xl font-display font-bold text-text-main tracking-tight">
            {mode === 'login' ? 'PSI.CORE' : mode === 'register' ? 'Nova Conta' : 'Recuperação'}
          </h2>
          <p className="text-text-dim text-xs font-semibold uppercase tracking-[0.2em] mt-3 opacity-60">
            {mode === 'login' ? 'Acesso ao Consultório' : 'Gestão Profissional'}
          </p>
        </div>

        {feedback.message && (
          <div className={cn(
            "p-4 rounded-xl text-xs text-center font-bold uppercase tracking-wider animate-in slide-in-from-top-2",
            feedback.type === 'error' ? "bg-red-500/10 text-red-500 border border-red-500/20" : 
            feedback.type === 'success' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
            "bg-blue-500/10 text-blue-500 border border-blue-500/20"
          )}>
            {feedback.message}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white hover:bg-white/90 text-bg-deep font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl shadow-xl shadow-white/5 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            <Chrome size={18} />
            {loading ? 'Processando...' : 'Entrar com Google'}
          </button>
          
          <div className="flex items-center gap-4 py-2">
             <div className="h-[1px] flex-grow bg-border-subtle/50" />
             <span className="text-[10px] font-bold text-text-dim/40 uppercase tracking-widest">ou use credenciais locais</span>
             <div className="h-[1px] flex-grow bg-border-subtle/50" />
          </div>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleRecover} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Usuário Profissional</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all text-sm placeholder:text-text-dim/30"
                placeholder="Dr. Nome de usuário"
              />
            </div>
          </div>

          {(mode === 'login' || mode === 'register') && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Senha Segura</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all text-sm placeholder:text-text-dim/30"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="animate-in fade-in duration-300 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Registro Profissional (CRP)</label>
                <input
                  type="text"
                  name="crp"
                  value={formData.crp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all text-sm"
                  placeholder="00/00000"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Palavra-Chave de Recuperação</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="text"
                    name="keyword"
                    value={formData.keyword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-bg-sidebar border border-border-subtle rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all text-sm placeholder:text-text-dim/30"
                    placeholder="Em caso de perda da senha"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase tracking-[0.15em] text-xs rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-4"
          >
            {mode === 'login' ? 'Entrar no Sistema' : mode === 'register' ? 'Concluir Cadastro' : 'Atualizar Credenciais'}
          </button>
        </form>

        <div className="pt-6 border-t border-border-subtle flex flex-col gap-4 text-center">
          {mode === 'login' ? (
            <>
              <button onClick={() => setMode('register')} className="text-xs font-bold text-primary hover:text-white uppercase tracking-widest transition-colors">
                Criar conta profissional
              </button>
              <button onClick={() => setMode('recover')} className="text-[10px] font-bold text-text-dim hover:text-text-main uppercase tracking-widest transition-colors">
                Esqueci minhas credenciais
              </button>
            </>
          ) : (
            <button
              onClick={() => setMode('login')}
              className="text-xs font-bold text-text-main flex items-center justify-center gap-2 hover:bg-white/5 py-3 rounded-2xl transition-all uppercase tracking-widest"
            >
              <ArrowLeft size={16} /> Voltar ao início
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
