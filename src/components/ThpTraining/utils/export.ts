import { ThpRecord } from "../types";

function formatClinicalContent(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/^### (.*$)/gm, '<h3 style="font-family: \'Inter\', sans-serif; font-size: 16px; color: #1e293b; text-transform: uppercase; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-weight: 700;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="font-family: \'Inter\', sans-serif; font-size: 18px; color: #0f172a; margin-top: 40px; font-weight: 800;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="font-family: \'Inter\', sans-serif; font-size: 22px; color: #0f172a; margin-top: 50px; text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a; font-weight: 700;">$1</strong>')
    .replace(/^[*-] (.*$)/gm, '<li style="margin-bottom: 8px; padding-left: 5px;">$1</li>')
    .replace(/(<li>.*<\/li>(\n<li>.*<\/li>)*)/g, '<ul style="margin-top: 15px; margin-bottom: 20px; padding-left: 25px; list-style-type: disc;">$1</ul>')
    .split('\n\n').map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<ul')) return trimmed;
      return `<p style="margin-bottom: 18px; text-align: justify; line-height: 1.8;">${trimmed.replace(/\n/g, ' ')}</p>`;
    }).join('\n');
}

export function exportThpToHtml(record: ThpRecord) {
  const date = new Date(record.createdAt);
  const formattedDate = date.toLocaleDateString('pt-BR').replace(/\//g, '-');
  const formattedTime = date.getHours().toString().padStart(2, '0') + '-' + date.getMinutes().toString().padStart(2, '0');
  
  const fileName = `${record.patient.name.replace(/\s+/g, '_')}_Treinamento_THP_${record.skillName.replace(/\s+/g, '_')}_${formattedDate}.html`;

  const totalExercises = record.exercises.length;
  const completedExercises = record.exercises.filter(e => e.completed).length;
  const progressPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  const totalDuration = record.sessions.reduce((acc, s) => acc + s.duration, 0);

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laudo de Treinamento de Habilidades Psicológicas (THP) - ${record.patient.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #0f172a;
            --accent: #10b981;
            --text: #334155;
            --light: #f8fafc;
            --border: #cbd5e1;
            --academic: 'Libre Baskerville', serif;
            --sans: 'Inter', sans-serif;
            --positive: #10b981;
            --negative: #ef4444;
            --neutral: #64748b;
        }
        
        @page {
            margin: 2.5cm;
            size: A4;
        }

        body {
            font-family: var(--academic);
            color: var(--text);
            line-height: 1.7;
            background: #f1f5f9;
            margin: 0;
            padding: 50px 0;
        }

        .paper {
            background: white;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 3cm;
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.1);
            box-sizing: border-box;
            position: relative;
            border-radius: 2px;
        }

        header {
            text-align: center;
            border-bottom: 2px solid var(--primary);
            margin-bottom: 40px;
            padding-bottom: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .header-logo {
            max-height: 80px;
            max-width: 200px;
            margin-bottom: 20px;
            object-fit: contain;
        }

        .logo-box {
            font-family: var(--sans);
            font-weight: 800;
            font-size: 12px;
            letter-spacing: 5px;
            color: var(--accent);
            text-transform: uppercase;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .logo-box::before, .logo-box::after {
            content: '';
            width: 30px;
            height: 2px;
            background: var(--accent);
            opacity: 0.3;
        }

        h1.main-title {
            font-family: var(--sans);
            font-size: 18px;
            color: var(--primary);
            margin: 0;
            font-weight: 800;
            letter-spacing: -0.2px;
            text-transform: uppercase;
        }

        .id-card {
            margin-bottom: 40px;
            background: var(--light);
            border: 1px solid var(--border);
            padding: 25px;
            border-radius: 8px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            font-family: var(--sans);
        }

        .info-field {
            display: flex;
            flex-direction: column;
        }

        .info-label {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #64748b;
            margin-bottom: 6px;
        }

        .info-value {
            font-size: 15px;
            font-weight: 600;
            color: var(--primary);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 40px;
            font-family: var(--sans);
        }

        .stat-card {
            background: var(--light);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 15px;
            text-align: center;
        }

        .stat-value {
            font-size: 20px;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .section-header {
            font-family: var(--sans);
            font-size: 13px;
            color: var(--accent);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 25px;
            margin-top: 40px;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .section-header::after {
            content: '';
            flex: 1;
            height: 1px;
            background: var(--border);
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
            font-family: var(--sans);
            font-size: 12px;
        }

        .data-table th {
            background: var(--primary);
            color: white;
            text-align: left;
            padding: 10px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 1px;
        }

        .data-table td {
            padding: 10px;
            border-bottom: 1px solid var(--border);
            vertical-align: top;
        }

        .data-table tr:nth-child(even) {
            background: #f8fafc;
        }

        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: white;
        }

        .badge-completed { background-color: var(--positive); }
        .badge-pending { background-color: #f59e0b; }

        .content-area {
            font-size: 16px;
            color: #1e293b;
        }

        footer {
            margin-top: 80px;
            text-align: center;
            page-break-inside: avoid;
        }

        .signature-block {
            display: inline-block;
            text-align: center;
            position: relative;
        }

        .signature-image {
            max-width: 200px;
            max-height: 80px;
            margin-bottom: -15px;
            position: relative;
            z-index: 1;
            mix-blend-mode: multiply;
        }

        .signature-line {
            width: 300px;
            height: 1.5px;
            background: var(--primary);
            margin: 0 auto 15px auto;
        }

        .signature-name {
            font-family: var(--sans);
            font-weight: 700;
            font-size: 15px;
            margin: 0;
            color: var(--primary);
            text-transform: uppercase;
        }

        .signature-title {
            font-family: var(--sans);
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
            margin: 5px 0 0 0;
        }

        .legal-notice {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid var(--border);
            font-family: var(--sans);
            font-size: 10px;
            color: #94a3b8;
            text-align: justify;
            line-height: 1.5;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(16, 185, 129, 0.015);
            font-family: var(--sans);
            font-weight: 950;
            white-space: nowrap;
            pointer-events: none;
            user-select: none;
            z-index: 0;
        }

        @media print {
            body { background: white; padding: 0; }
            .paper { 
                box-shadow: none; 
                width: 100%; 
                margin: 0; 
                padding: 2cm;
            }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="paper">
        <div class="watermark">PROGRAMA THP</div>
        
        <header>
            ${record.patient.logoUrl ? `<img src="${record.patient.logoUrl}" class="header-logo" alt="Logo Profissional">` : `<div class="logo-box">PROGRAMA THP</div>`}
            <h1 class="main-title">Treinamento de Habilidades Psicológicas (THP)</h1>
        </header>

        <div class="section">
            <div class="section-header">Identificação Geral</div>
            <div class="id-card">
                <div class="info-field">
                    <span class="info-label">Paciente</span>
                    <span class="info-value">${record.patient.name}</span>
                </div>
                <div class="info-field">
                    <span class="info-label">Idade</span>
                    <span class="info-value">${record.patient.age} Anos</span>
                </div>
                <div class="info-field">
                    <span class="info-label">Psicólogo(a) Responsável</span>
                    <span class="info-value">${record.patient.psychologistName}</span>
                </div>
                <div class="info-field">
                    <span class="info-label">CRP</span>
                    <span class="info-value">${record.patient.crp}</span>
                </div>
                <div class="info-field">
                    <span class="info-label">Habilidade Alvo</span>
                    <span class="info-value" style="color: var(--accent);">${record.skillName}</span>
                </div>
                <div class="info-field">
                    <span class="info-label">Data de Registro</span>
                    <span class="info-value">${new Date(record.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">Métricas e Progresso de Habilidade</div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${record.currentLevel}%</div>
                    <div class="stat-label">Nível Atual</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${record.targetLevel}%</div>
                    <div class="stat-label">Nível Alvo</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${record.sessions.length}</div>
                    <div class="stat-label">Treinos Registrados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${totalDuration} min</div>
                    <div class="stat-label">Tempo Total</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">Plano de Exercícios Clínicos</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 70%;">Exercício / Atividade</th>
                        <th style="width: 15%;">Status</th>
                        <th style="width: 15%;">Anotações</th>
                    </tr>
                </thead>
                <tbody>
                    ${record.exercises.map(e => `
                        <tr>
                            <td><strong>${e.text}</strong></td>
                            <td>
                                <span class="badge ${e.completed ? 'badge-completed' : 'badge-pending'}">
                                    ${e.completed ? 'Concluído' : 'Pendente'}
                                </span>
                            </td>
                            <td style="font-size: 11px; color: #475569;">${e.notes || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        ${record.sessions.length > 0 ? `
        <div class="section" style="page-break-before: always;">
            <div class="section-header">Histórico de Sessões de Treinamento</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 15%;">Data</th>
                        <th style="width: 10%;">Dur.</th>
                        <th style="width: 10%;">Dif.</th>
                        <th style="width: 30%;">O que foi treinado</th>
                        <th style="width: 35%;">Obstáculos e Estratégia</th>
                    </tr>
                </thead>
                <tbody>
                    ${record.sessions.map(s => `
                        <tr>
                            <td>${new Date(s.date).toLocaleDateString('pt-BR')}</td>
                            <td>${s.duration}m</td>
                            <td><strong>${s.difficulty}/5</strong></td>
                            <td style="font-size: 11px; color: #334155;"><strong>${s.description}</strong><br><small style="color: #64748b;">Conquistas: ${s.achievements}</small></td>
                            <td style="font-size: 11px; color: #475569;"><strong>Obstáculo:</strong> ${s.obstacles}<br><strong>Estratégia:</strong> ${s.strategy}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${record.aiAnalysis ? `
        <div class="section" style="page-break-before: always;">
            <div class="section-header">Análise Interpretativa e Supervisão por IA</div>
            <div class="content-area">
                ${formatClinicalContent(record.aiAnalysis)}
            </div>
        </div>
        ` : ''}

        <footer>
            <div class="signature-block">
                ${record.patient.signatureUrl ? `<img src="${record.patient.signatureUrl}" class="signature-image" alt="Assinatura">` : ''}
                <div class="signature-line"></div>
                <p class="signature-name">${record.patient.psychologistName}</p>
                <p class="signature-title">Psicólogo(a) Clínico(a) • CRP ${record.patient.crp}</p>
            </div>
            
            <div class="legal-notice">
                <strong>REFERÊNCIAS E RESPONSABILIDADES:</strong> O presente documento documenta a aderência e o progresso do avaliando no Treinamento de Habilidades Psicológicas (THP) com fins psicoterapêuticos. O treinamento é baseado na abordagem empírica de Terapia Cognitivo-Comportamental para desenvolvimento de recursos protetivos e habilidades coping. Este laudo é de caráter estritamente sigiloso e restrito ao prontuário médico-psicológico do paciente.
            </div>
        </footer>
    </div>
    
    <div class="no-print" style="position: fixed; bottom: 40px; left: 0; right: 0; display: flex; justify-content: center;">
        <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 18px 50px; border-radius: 12px; font-weight: 800; font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 3px; cursor: pointer; box-shadow: 0 15px 40px rgba(0,0,0,0.3); transition: all 0.3s; text-transform: uppercase;">Exportar PDF / Imprimir</button>
    </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
