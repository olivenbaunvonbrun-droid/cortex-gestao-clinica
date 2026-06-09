const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/Bruno/antigravity/Cortex---Gestão-Clínica-Inteligente/src/components/ThpTraining/components';
const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.tsx'));

console.log(`Encontrados ${files.length} arquivos para reestilização.`);

const replacements = [
  // 1. Containers and Cards
  { from: /bg-slate-50/g, to: 'bg-bg-card' },
  { from: /bg-slate-100/g, to: 'bg-bg-sidebar' },
  { from: /bg-slate-200/g, to: 'bg-bg-sidebar' },
  { from: /bg-slate-300/g, to: 'bg-bg-deep' },
  { from: /bg-white/g, to: 'bg-bg-sidebar' },
  { from: /bg-slate-900/g, to: 'bg-bg-deep' },
  { from: /bg-slate-950/g, to: 'bg-bg-deep' },
  
  // 2. Borders
  { from: /border-slate-100/g, to: 'border-border-subtle' },
  { from: /border-slate-200/g, to: 'border-border-subtle' },
  { from: /border-slate-300/g, to: 'border-border-subtle' },
  { from: /border-slate-800/g, to: 'border-border-subtle' },
  { from: /border-slate-900/g, to: 'border-border-subtle' },
  { from: /divide-slate-200/g, to: 'divide-border-subtle' },
  { from: /divide-slate-100/g, to: 'divide-border-subtle' },

  // 3. Text Colors
  { from: /text-slate-950/g, to: 'text-text-main' },
  { from: /text-slate-900/g, to: 'text-text-main' },
  { from: /text-slate-800/g, to: 'text-text-main' },
  { from: /text-slate-700/g, to: 'text-text-main' },
  { from: /text-slate-600/g, to: 'text-text-dim' },
  { from: /text-slate-500/g, to: 'text-text-dim' },
  { from: /text-slate-400/g, to: 'text-text-dim' },
  { from: /text-slate-300/g, to: 'text-text-main' },
  { from: /text-slate-200/g, to: 'text-text-main' },
  { from: /text-slate-100/g, to: 'text-text-main' },

  // 4. Hover states
  { from: /hover:bg-slate-50/g, to: 'hover:bg-white/5' },
  { from: /hover:bg-slate-100/g, to: 'hover:bg-white/5' },
  { from: /hover:bg-slate-200/g, to: 'hover:bg-white/5' },
  { from: /hover:bg-slate-800/g, to: 'hover:bg-white/10' },
  { from: /hover:bg-slate-900/g, to: 'hover:bg-white/10' },

  // 5. Indigo/Emerald highlights and accents (primary mappings)
  { from: /bg-indigo-600/g, to: 'bg-primary text-bg-deep font-bold' },
  { from: /bg-indigo-500/g, to: 'bg-primary text-bg-deep font-bold' },
  { from: /bg-indigo-700/g, to: 'bg-primary-hover text-bg-deep font-bold' },
  { from: /hover:bg-indigo-700/g, to: 'hover:bg-primary-hover' },
  { from: /hover:bg-indigo-600/g, to: 'hover:bg-primary-hover' },
  { from: /text-indigo-600/g, to: 'text-primary' },
  { from: /text-indigo-500/g, to: 'text-primary' },
  { from: /text-indigo-700/g, to: 'text-primary' },
  { from: /text-indigo-800/g, to: 'text-primary' },
  { from: /text-indigo-400/g, to: 'text-primary' },
  { from: /bg-indigo-50\/50/g, to: 'bg-primary/5' },
  { from: /bg-indigo-50/g, to: 'bg-primary/10' },
  { from: /hover:bg-indigo-100/g, to: 'hover:bg-primary/20' },
  { from: /border-indigo-100/g, to: 'border-primary/20' },
  { from: /border-indigo-200/g, to: 'border-primary/20' },
  { from: /border-indigo-300/g, to: 'border-primary/40' },
  { from: /border-indigo-500/g, to: 'border-primary' },
  { from: /border-indigo-600/g, to: 'border-primary' },
  { from: /focus:outline-indigo-500/g, to: 'focus:ring-2 focus:ring-primary/25 outline-none' },
  { from: /focus:border-indigo-500/g, to: 'focus:ring-2 focus:ring-primary/25 outline-none' },

  // Emerald -> Primary
  { from: /bg-emerald-100/g, to: 'bg-primary/10' },
  { from: /bg-emerald-500/g, to: 'bg-primary' },
  { from: /bg-emerald-600/g, to: 'bg-primary' },
  { from: /text-emerald-500/g, to: 'text-primary' },
  { from: /text-emerald-600/g, to: 'text-primary' },
  { from: /text-emerald-700/g, to: 'text-primary' },
  { from: /hover:bg-emerald-700/g, to: 'hover:bg-primary-hover' },
  { from: /hover:bg-emerald-600/g, to: 'hover:bg-primary-hover' },
  { from: /border-emerald-500/g, to: 'border-primary' },
  { from: /border-emerald-600/g, to: 'border-primary' },

  // Rose/Red/Amber custom mapping (keep soft alerts but make them fit dark theme)
  { from: /bg-rose-50/g, to: 'bg-rose-500/5' },
  { from: /bg-rose-100/g, to: 'bg-rose-500/10' },
  { from: /text-rose-700/g, to: 'text-rose-400' },
  { from: /text-rose-800/g, to: 'text-rose-400' },
  { from: /border-rose-200/g, to: 'border-rose-500/20' },
  
  // 6. Buttons
  // bg-slate-900 buttons should become premium dark or primary buttons
  { from: /px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition/g, to: 'px-5 py-2 bg-primary hover:bg-primary-hover text-bg-deep font-bold text-xs rounded-lg transition' },
  { from: /px-4 py-2 bg-slate-905 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800/g, to: 'px-4 py-2 bg-primary text-bg-deep font-bold rounded-lg hover:bg-primary-hover' },
  { from: /w-full py-2 bg-slate-900 hover:bg-slate-800 text-white/g, to: 'w-full py-2 bg-primary hover:bg-primary-hover text-bg-deep' },
  { from: /px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800/g, to: 'px-4 py-2 bg-primary text-bg-deep font-bold rounded-lg hover:bg-primary-hover' },
  { from: /bg-slate-900 hover:bg-slate-800 text-white/g, to: 'bg-primary hover:bg-primary-hover text-bg-deep' },
  { from: /bg-slate-900 text-white/g, to: 'bg-primary text-bg-deep' },
  { from: /hover:bg-slate-800/g, to: 'hover:bg-primary-hover' },
  
  // 7. Graph and SVGs adjustment (like #1e293b, etc.)
  { from: /stroke="#1e293b"/g, to: 'stroke="rgba(255, 255, 255, 0.08)"' },
  { from: /fill="#64748b"/g, to: 'fill="#adb5bd"' },
  { from: /stroke="#e2e8f0"/g, to: 'stroke="rgba(255, 255, 255, 0.08)"' },
  { from: /stroke="#f1f5f9"/g, to: 'stroke="rgba(255, 255, 255, 0.04)"' },
];

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  replacements.forEach(rep => {
    content = content.replace(rep.from, rep.to);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Reestilizado: ${file}`);
  } else {
    console.log(`Sem alterações necessárias: ${file}`);
  }
});

console.log('Procedimento de reestilização finalizado.');
