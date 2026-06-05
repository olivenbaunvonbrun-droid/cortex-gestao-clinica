import { Assessment } from '../types';
import { calculateAssessment } from '../lib/scoring';

function formatClinicalContent(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gm, '<h3 style="font-family: \'Inter\', sans-serif; font-size: 14px; color: #1e293b; text-transform: uppercase; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-weight: 700;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="font-family: \'Inter\', sans-serif; font-size: 16px; color: #0f172a; margin-top: 40px; font-weight: 800;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="font-family: \'Inter\', sans-serif; font-size: 20px; color: #0f172a; margin-top: 50px; text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px;">$1</h1>')
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
  
  const fileName = `${assessment.patient.name.replace(/\s+/g, '_')}_IHP_PR_${formattedDate}_${formattedTime}.html`;

  // Calculate scores using calculateAssessment
  const { subscales, qip } = calculateAssessment(assessment.answers);

  const getStatusBadge = (classification: string) => {
    if (classification === 'Proficiente') {
      return `<span style="background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 10px; font-family: 'Inter', sans-serif;">PROFICIENTE</span>`;
    } else if (classification === 'Satisfatório') {
      return `<span style="background-color: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 10px; font-family: 'Inter', sans-serif;">SATISFATÓRIO</span>`;
    } else if (classification === 'Insuficiente') {
      return `<span style="background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 10px; font-family: 'Inter', sans-serif;">INSUFICIENTE</span>`;
    } else {
      return `<span style="background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 10px; font-family: 'Inter', sans-serif;">DEFICITÁRIO</span>`;
    }
  };

  const tableRows = Object.entries(subscales).map(([key, res], idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 16px; font-weight: 700; color: #0f172a; font-size: 12px;">${res.name}</td>
      <td style="padding: 12px 16px; text-align: center; font-weight: 800; color: #0f172a; font-size: 12px; font-family: monospace;">${res.score} / ${res.maxScore}</td>
      <td style="padding: 12px 16px; text-align: center;">${getStatusBadge(res.classification)}</td>
    </tr>
  `).join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laudo IHP-PR - ${assessment.patient.name}</title>
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
        }
        @page {
            margin: 2cm;
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
            padding: 2.5cm;
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.1);
            box-sizing: border-box;
            position: relative;
            border-radius: 2px;
        }
        header {
            text-align: center;
            border-bottom: 2px solid var(--primary);
            margin-bottom: 40px;
            padding-bottom: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .logo-box {
            font-family: var(--sans);
            font-weight: 800;
            font-size: 12px;
            letter-spacing: 5px;
            color: var(--accent);
            text-transform: uppercase;
            margin-bottom: 15px;
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
            padding: 24px;
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
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #64748b;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 13px;
            font-weight: 600;
            color: var(--primary);
        }
        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        .section-header {
            font-family: var(--sans);
            font-size: 11px;
            color: var(--primary);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 20px;
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
        table {
            width: 100%;
            border-collapse: collapse;
            font-family: var(--sans);
            margin-bottom: 30px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
        }
        th {
            background: #0f172a;
            color: white;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            padding: 12px 16px;
            text-align: left;
        }
        footer {
            margin-top: 80px;
            text-align: center;
            page-break-inside: avoid;
        }
        .signature-line {
            width: 300px;
            height: 1.5px;
            background: var(--primary);
            margin: 0 auto 12px auto;
        }
        @media print {
            body { background: white; padding: 0; }
            .paper { 
                box-shadow: none; 
                width: 100%; 
                margin: 0; 
                padding: 1.5cm;
            }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="paper">
        <header>
            ${assessment.patient.logoUrl ? `<img src="${assessment.patient.logoUrl}" style="max-height: 80px; max-width: 200px; margin-bottom: 15px; object-fit: contain;" alt="Logo">` : `<div class="logo-box">IHP-PR DIGITAL</div>`}
            <h1 class="main-title">Inventário de Habilidades Psicológicas (IHP-PR)</h1>
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
                    <span class="info-label">QIP Total</span>
                    <span class="info-value">${qip.score} / ${qip.maxScore} (${qip.classification})</span>
                </div>
                <div class="info-field">
                    <span class="info-label">Psicólogo(a) Responsável</span>
                    <span class="info-value">${assessment.patient.psychologistName} • CRP ${assessment.patient.crp}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">Resultados por Habilidade Psicológica</div>
            <table>
                <thead>
                    <tr>
                        <th>Habilidade Psicológica (Poubel & Rodrigues)</th>
                        <th style="text-align: center; width: 140px;">Pontuação</th>
                        <th style="text-align: center; width: 180px;">Nível de Funcionamento</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>

        ${assessment.aiAnalysis ? `
          <div class="section" style="page-break-before: always;">
              <div class="section-header">Relatório e Análise Clínicos (IA)</div>
              <div style="font-size: 14px; text-align: justify; color: #1e293b;">
                  ${formatClinicalContent(assessment.aiAnalysis)}
              </div>
          </div>
        ` : ''}

        <footer>
            <div style="display: inline-block; text-align: center; position: relative;">
                ${assessment.patient.signatureUrl ? `<img src="${assessment.patient.signatureUrl}" style="max-width: 200px; max-height: 80px; margin-bottom: -15px; mix-blend-mode: multiply;" alt="Assinatura">` : ''}
                <div class="signature-line"></div>
                <p style="font-family: var(--sans); font-weight: 700; font-size: 14px; margin: 0; color: var(--primary); text-transform: uppercase;">${assessment.patient.psychologistName}</p>
                <p style="font-family: var(--sans); font-size: 11px; color: #64748b; font-weight: 600; margin: 4px 0 0 0;">Psicólogo(a) Clínico(a) • CRP ${assessment.patient.crp}</p>
            </div>
        </footer>
    </div>
    
    <div class="no-print" style="position: fixed; bottom: 40px; left: 0; right: 0; display: flex; justify-content: center; z-index: 1000;">
        <button onclick="window.print()" style="background: #0f172a; color: white; border: none; padding: 18px 50px; border-radius: 12px; font-weight: 800; font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 3px; cursor: pointer; box-shadow: 0 15px 40px rgba(0,0,0,0.3); transition: all 0.3s; text-transform: uppercase;">Exportar PDF / Imprimir Laudo</button>
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
