import { DfcRecord } from "../types";

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

export function exportToHtml(record: DfcRecord) {
  const date = new Date(record.createdAt);
  const formattedDate = date.toLocaleDateString('pt-BR').replace(/\//g, '-');
  const formattedTime = date.getHours().toString().padStart(2, '0') + '-' + date.getMinutes().toString().padStart(2, '0');
  
  const fileName = `${record.patient.name.replace(/\s+/g, '_')}_DFC_Cognitivo_${formattedDate}_${formattedTime}.html`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DFC Conceituação Cognitiva - ${record.patient.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #0f172a;
            --accent: #6366f1;
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
            line-height: 1.6;
            background: #f1f5f9;
            margin: 0;
            padding: 40px 0;
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
            margin-bottom: 30px;
            padding-bottom: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .header-logo {
            max-height: 60px;
            max-width: 180px;
            margin-bottom: 15px;
            object-fit: contain;
        }

        .logo-box {
            font-family: var(--sans);
            font-weight: 800;
            font-size: 11px;
            letter-spacing: 4px;
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
            width: 20px;
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
            margin-bottom: 30px;
            background: var(--light);
            border: 1px solid var(--border);
            padding: 20px;
            border-radius: 6px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
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
            letter-spacing: 1px;
            color: #64748b;
            margin-bottom: 4px;
        }

        .info-value {
            font-size: 13px;
            font-weight: 600;
            color: var(--primary);
        }

        .diagram-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            margin-bottom: 30px;
            font-family: var(--sans);
        }

        .diagram-box {
            border: 1.5px solid var(--primary);
            border-radius: 8px;
            padding: 15px;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
        }

        .diagram-box-title {
            font-weight: 800;
            text-transform: uppercase;
            font-size: 11px;
            color: var(--accent);
            margin-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            letter-spacing: 1px;
        }

        .diagram-box-content {
            font-size: 12px;
            color: #1e293b;
            line-height: 1.5;
            white-space: pre-wrap;
        }

        .situations-container {
            margin-bottom: 30px;
            font-family: var(--sans);
        }

        .situation-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 15px;
        }

        .situation-table th {
            background: var(--primary);
            color: white;
            text-align: left;
            padding: 8px 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .situation-table td {
            padding: 10px;
            border: 1px solid var(--border);
            vertical-align: top;
        }

        .situation-table tr:nth-child(even) {
            background: #f8fafc;
        }

        .section-header {
            font-family: var(--sans);
            font-size: 12px;
            color: var(--accent);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 20px;
            margin-top: 35px;
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

        .content-area {
            font-size: 15px;
            color: #1e293b;
        }

        footer {
            margin-top: 60px;
            text-align: center;
            page-break-inside: avoid;
        }

        .signature-block {
            display: inline-block;
            text-align: center;
            position: relative;
        }

        .signature-image {
            max-width: 180px;
            max-height: 70px;
            margin-bottom: -15px;
            position: relative;
            z-index: 1;
            mix-blend-mode: multiply;
        }

        .signature-line {
            width: 260px;
            height: 1.5px;
            background: var(--primary);
            margin: 0 auto 12px auto;
        }

        .signature-name {
            font-family: var(--sans);
            font-weight: 700;
            font-size: 14px;
            margin: 0;
            color: var(--primary);
            text-transform: uppercase;
        }

        .signature-title {
            font-family: var(--sans);
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
            margin: 4px 0 0 0;
        }

        .legal-notice {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid var(--border);
            font-family: var(--sans);
            font-size: 9px;
            color: #94a3b8;
            text-align: justify;
            line-height: 1.4;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 110px;
            color: rgba(99, 102, 241, 0.015);
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
                padding: 1.5cm;
            }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="paper">
        <div class="watermark">DFC COGNITIVO</div>
        
        <header>
            ${record.patient.logoUrl ? `<img src="${record.patient.logoUrl}" class="header-logo" alt="Logo Profissional">` : `<div class="logo-box">DFC ASSISTIDO</div>`}
            <h1 class="main-title">Diagrama de Funcionamento Cognitivo (DFC)</h1>
        </header>

        <div class="section">
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
                    <span class="info-label">Data de Emissão</span>
                    <span class="info-value">${new Date(record.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        </div>

        <div class="section-header">Estrutura de Crenças e Funcionamento</div>
        <div class="diagram-grid">
            <div class="diagram-box">
                <div class="diagram-box-title">Histórico e Dados Relevantes da Infância</div>
                <div class="diagram-box-content">${record.relevantChildhoodData}</div>
            </div>
            
            <div class="diagram-box" style="border-color: #ef4444;">
                <div class="diagram-box-title" style="color: #ef4444;">Crença(s) Central(ais) / Núcleo</div>
                <div class="diagram-box-content" style="font-weight: 700;">${record.coreBeliefs}</div>
            </div>

            <div class="diagram-box" style="border-color: #f59e0b;">
                <div class="diagram-box-title" style="color: #f59e0b;">Regras, Suposições e Condicionais ("Se... então...")</div>
                <div class="diagram-box-content">${record.conditionalRules}</div>
            </div>

            <div class="diagram-box" style="border-color: #10b981;">
                <div class="diagram-box-title" style="color: #10b981;">Estratégias Compensatórias / Enfrentamento</div>
                <div class="diagram-box-content">${record.compensatoryStrategies}</div>
            </div>
        </div>

        <div class="situations-container">
            <div class="section-header">Mapeamento de Situações Típicas</div>
            <table class="situation-table">
                <thead>
                    <tr>
                        <th style="width: 20%;">Situação</th>
                        <th style="width: 25%;">Pensamento Automático</th>
                        <th style="width: 20%;">Significado para o Paciente</th>
                        <th style="width: 15%;">Emoções</th>
                        <th style="width: 20%;">Comportamento resultante</th>
                    </tr>
                </thead>
                <tbody>
                    ${record.situations.map(s => `
                        <tr>
                            <td><strong>${s.situation}</strong></td>
                            <td><em>"${s.automaticThought}"</em></td>
                            <td>${s.meaning}</td>
                            <td><strong>${s.emotion}</strong></td>
                            <td>${s.behavior}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        ${record.aiAnalysis ? `
        <div class="section" style="page-break-before: always;">
            <div class="section-header">Conceituação Clínica e Análise de IA</div>
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
                <strong>REFERÊNCIAS E DIRETRIZES:</strong> Este Diagrama de Funcionamento Cognitivo (DFC) segue os modelos clássicos de conceituação de caso de Aaron Beck e Judith Beck no âmbito da Terapia Cognitivo-Comportamental (TCC). Trata-se de documento estritamente sigiloso e confidencial de uso exclusivo no processo psicoterapêutico sob a regência do Código de Ética Profissional do Psicólogo (Resolução CFP nº 10/2005).
            </div>
        </footer>
    </div>
    
    <div class="no-print" style="position: fixed; bottom: 40px; left: 0; right: 0; display: flex; justify-content: center;">
        <button onclick="window.print()" style="background: #6366f1; color: white; border: none; padding: 18px 50px; border-radius: 12px; font-weight: 800; font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 3px; cursor: pointer; box-shadow: 0 15px 40px rgba(0,0,0,0.3); transition: all 0.3s; text-transform: uppercase;">Exportar PDF / Imprimir</button>
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
