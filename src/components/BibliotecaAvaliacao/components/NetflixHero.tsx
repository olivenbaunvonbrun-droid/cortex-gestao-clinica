import React from "react";

export default function NetflixHero() {
  return (
    <div 
      className="relative h-[340px] w-full overflow-hidden flex items-end p-6 md:p-16 mb-8 rounded-b-2xl bg-gradient-to-t from-[#050505] via-transparent to-black"
      id="netflix-hero-banner"
    >
      {/* Background Cinematic Graphic Overlay */}
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center brightness-[0.2]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#00A3FF22] to-transparent pointer-events-none opacity-40 z-0"></div>

      {/* Hero Content text */}
      <div className="relative z-10 max-w-3xl space-y-4" id="hero-content">

        <h1 className="text-4xl md:text-5xl font-black font-display text-white tracking-tight leading-tight">
          Ferramentas da TCC de 4ª Geração Automatizadas por IA
        </h1>

        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
          Acesse o ecossistema avançado de Ferramentas Integradoras da TCC de 4ª Geração. Monitore o desenvolvimento de mentalidades saudáveis, avalie competências socioemocionais e gere laudos neuroclínicos robustos fundamentados em neurociência baseada em evidências, regulação afetiva e flexibilidade psicológica.
        </p>
      </div>
    </div>
  );
}
