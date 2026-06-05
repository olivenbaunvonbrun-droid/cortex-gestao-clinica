import { Assessment, LifeEvent } from "../types";

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

export function exportToHtml(assessment: Assessment) {
  const date = new Date(assessment.createdAt);
  const formattedDate = date.toLocaleDateString('pt-BR').replace(/\//g, '-');
  const formattedTime = date.getHours().toString().padStart(2, '0') + '-' + date.getMinutes().toString().padStart(2, '0');
  
  const fileName = `${assessment.patient.name.replace(/\s+/g, '_')}_Linha_Vida_${formattedDate}_${formattedTime}.html`;

  // Sort events chronologically by age
  const sortedEvents = [...assessment.events].sort((a, b) => a.age - b.age);

  // Statistics
  const totalEvents = sortedEvents.length;
  const positiveEvents = sortedEvents.filter(e => e.type === 'positive').length;
  const negativeEvents = sortedEvents.filter(e => e.type === 'negative').length;
  const neutralEvents = sortedEvents.filter(e => e.type === 'neutral').length;

  // Find emotional peaks and valleys
  const peaks = sortedEvents.filter(e => e.type === 'positive').sort((a, b) => b.intensity - a.intensity);
  const valleys = sortedEvents.filter(e => e.type === 'negative').sort((a, b) => b.intensity - a.intensity);

  const emotionalPeak = peaks.length > 0 ? `${peaks[0].title} (Idade: ${peaks[0].age}, Impacto: +${peaks[0].intensity})` : 'Nenhum';
  const emotionalValley = valleys.length > 0 ? `${valleys[0].title} (Idade: ${valleys[0].age}, Impacto: -${valleys[0].intensity})` : 'Nenhum';

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Linha da Vida - ${assessment.patient.name}</title>
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
            font-size: 20px;
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
            font-size: 24px;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 10px;
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

        .event-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
            font-family: var(--sans);
            font-size: 13px;
        }

        .event-table th {
            background: var(--primary);
            color: white;
            text-align: left;
            padding: 12px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 1px;
        }

        .event-table td {
            padding: 12px;
            border-bottom: 1px solid var(--border);
            vertical-align: top;
        }

        .event-table tr:nth-child(even) {
            background: #f8fafc;
        }

        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: white;
        }

        .badge-positive { background-color: var(--positive); }
        .badge-negative { background-color: var(--negative); }
        .badge-neutral { background-color: var(--neutral); }

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
            font-size: 120px;
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
        <div class="watermark">LINHA DA VIDA</div>
        
        <header>
            ${assessment.patient.logoUrl ? `<img src="${assessment.patient.logoUrl}" class="header-logo" alt="Logo Profissional">` : `<div class="logo-box">LINHA DA VIDA</div>`}
            <h1 class="main-title">Mapeamento da Linha da Vida</h1>
        </header>

        <div class="section">
            <div class="section-header">Identificação do Avaliando</div>
            <div class="id-card">
                <div class="info-field">
                    <span class="info-label">Paciente</span>
                    <span class="info-value">${assessment.patient.name}</span>
                </div>
                <div class="info-field">
                    <span class="info-label">Idade</span>
                    <span class="info-value">${assessment.patient.age} Anos</span>
                </div>
                <div class="info-field">
                    <span class="info-label">Psicólogo(a) Responsável</span>
                    <span class="info-value">${assessment.patient.psychologistName}</span>
                </div>
                <div class="info-field">
                    <span class="info-label">Data de Elaboração</span>
                    <span class="info-value">${new Date(assessment.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">Indicadores e Métricas Emocionais</div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${totalEvents}</div>
                    <div class="stat-label">Total Eventos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--positive);">${positiveEvents}</div>
                    <div class="stat-label">Positivos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--negative);">${negativeEvents}</div>
                    <div class="stat-label">Negativos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--neutral);">${neutralEvents}</div>
                    <div class="stat-label">Neutros</div>
                </div>
            </div>
            <div style="font-family: var(--sans); font-size: 12px; margin-bottom: 40px; background: var(--light); border: 1px solid var(--border); padding: 15px; border-radius: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <strong style="color: var(--primary);">Pico Emocional (Valência Positiva Máxima):</strong><br>
                    <span style="color: #475569;">${emotionalPeak}</span>
                </div>
                <div>
                    <strong style="color: var(--primary);">Vale Emocional (Valência Negativa Máxima):</strong><br>
                    <span style="color: #475569;">${emotionalValley}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">Cronologia de Marcos Históricos</div>
            <table class="event-table">
                <thead>
                    <tr>
                        <th style="width: 10%;">Idade</th>
                        <th style="width: 35%;">Evento</th>
                        <th style="width: 15%;">Valência</th>
                        <th style="width: 10%;">Intensidade</th>
                        <th style="width: 30%;">Relato/Contexto</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedEvents.map(e => `
                        <tr>
                            <td><strong>${e.age} anos</strong></td>
                            <td><strong>${e.title}</strong></td>
                            <td>
                                <span class="badge badge-${e.type}">
                                    ${e.type === 'positive' ? 'Positivo' : e.type === 'negative' ? 'Negativo' : 'Neutro'}
                                </span>
                            </td>
                            <td><strong>${e.intensity}/5</strong></td>
                            <td style="font-size: 12px; line-height: 1.5; color: #475569;">${e.description}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        ${assessment.aiAnalysis ? `
        <div class="section" style="page-break-before: always;">
            <div class="section-header">Análise Interpretativa de IA</div>
            <div class="content-area">
                ${formatClinicalContent(assessment.aiAnalysis)}
            </div>
        </div>
        ` : ''}

        <footer>
            <div class="signature-block">
                ${assessment.patient.signatureUrl ? `<img src="${assessment.patient.signatureUrl}" class="signature-image" alt="Assinatura">` : ''}
                <div class="signature-line"></div>
                <p class="signature-name">${assessment.patient.psychologistName}</p>
                <p class="signature-title">Psicólogo(a) Clínico(a) • CRP ${assessment.patient.crp}</p>
            </div>
            
            <div class="legal-notice">
                <strong>REFERÊNCIAS E RESPONSABILIDADES:</strong> O presente documento foi elaborado sob as diretrizes da Resolução CFP nº 06/2019 do Conselho Federal de Psicologia. A Linha da Vida é uma técnica semiestruturada recomendada no mapeamento longitudinal da história do paciente no âmbito da terapia cognitivo-comportamental e terapia do esquema. Trata-se de material de cunho estritamente confidencial, devendo sua guarda e uso serem mantidos sob absoluto sigilo ético-profissional.
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
