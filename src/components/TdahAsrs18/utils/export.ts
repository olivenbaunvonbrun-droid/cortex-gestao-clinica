import { Assessment, ASRS_QUESTIONS, FREQUENCY_LABELS, Frequency } from "../types";
import { calculateTdahAssessment } from "../lib/scoring";
import { db } from "../../../lib/db";

function formatClinicalContent(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3 style="font-family: \'Inter\', sans-serif; font-size: 15px; color: #1e293b; text-transform: uppercase; margin-top: 26px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-weight: 700;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="font-family: \'Inter\', sans-serif; font-size: 17px; color: #0f172a; margin-top: 35px; font-weight: 800; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="font-family: \'Inter\', sans-serif; font-size: 20px; color: #0f172a; margin-top: 40px; text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px;">$1</h1>')
    
    // Bold: **text** -> <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a; font-weight: 700;">$1</strong>')
    
    // Lists: * item or - item -> <li>item</li>
    .replace(/^[*-] (.*$)/gm, '<li style="margin-bottom: 6px; padding-left: 4px;">$1</li>')
    
    // Wrap groups of <li> into <ul>
    .replace(/(<li>.*<\/li>(\n<li>.*<\/li>)*)/g, '<ul style="margin-top: 12px; margin-bottom: 16px; padding-left: 20px; list-style-type: disc;">$1</ul>')
    
    // Paragraphs
    .split('\n\n').map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<ul')) return trimmed;
      return `<p style="margin-bottom: 14px; text-align: justify; line-height: 1.7;">${trimmed.replace(/\n/g, ' ')}</p>`;
    }).join('\n');
}

export async function exportToHtml(assessment: Assessment) {
  let professionalName = '';
  let professionalCRP = '';
  let professionalLogo = '';
  let professionalSignature = '';

  try {
    const items = await db.settings.toArray();
    const s: Record<string, any> = {};
    items.forEach(item => {
      s[item.key] = item.value;
    });
    professionalName = s.appTitle && s.appTitle !== 'Sistema de Gestão para Psicólogos' ? s.appTitle : '';
    professionalCRP = s.psychCrp || '';
    professionalLogo = s.appLogo || '';
    professionalSignature = s.psychSignature || '';
  } catch (err) {
    console.error("Failed to load settings in export:", err);
  }

  const logoUrl = professionalLogo || assessment.patient.logoUrl || '';
  const signatureUrl = professionalSignature || assessment.patient.signatureUrl || '';
  const psychologistName = professionalName || assessment.patient.psychologistName || 'Psicólogo(a)';
  const crp = professionalCRP || assessment.patient.crp || '';

  const date = new Date(assessment.createdAt);
  const formattedDate = date.toLocaleDateString('pt-BR').replace(/\//g, '-');
  const formattedTime = date.getHours().toString().padStart(2, '0') + '-' + date.getMinutes().toString().padStart(2, '0');
  
  const fileName = `${assessment.patient.name.replace(/\s+/g, '_')}_TDAH_ASRS-18_${formattedDate}_${formattedTime}.html`;

  const results = calculateTdahAssessment(assessment.answers);

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório TDAH ASRS-18 - ${assessment.patient.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #0f172a;
            --accent: #f59e0b;
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
            margin-bottom: 40px;
            padding-bottom: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .header-logo {
            max-height: 70px;
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
            width: 25px;
            height: 2px;
            background: var(--accent);
            opacity: 0.4;
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
            margin-bottom: 35px;
            background: var(--light);
            border: 1px solid var(--border);
            padding: 22px;
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
            font-size: 14px;
            font-weight: 600;
            color: var(--primary);
        }

        .scores-panel {
            margin-bottom: 35px;
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 20px;
            font-family: var(--sans);
        }

        .scores-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
        }

        .score-box {
            background: white;
            border: 1px solid #fcd34d;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
        }

        .score-val {
            font-size: 22px;
            font-weight: 800;
            color: #b45309;
            line-height: 1;
            margin-bottom: 4px;
        }

        .score-lbl {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #78350f;
            letter-spacing: 1px;
        }

        .score-sub {
            font-size: 11px;
            color: #92400e;
            margin-top: 4px;
        }

        .badge-risk {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #f59e0b;
        }

        .section-header {
            font-family: var(--sans);
            font-size: 12px;
            color: var(--accent);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .section-header::after {
            content: '';
            flex: 1;
            height: 1px;
            background: var(--border);
        }

        .content-area {
            font-size: 14px;
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
            margin-bottom: -10px;
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
            line-height: 1.5;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 90px;
            color: rgba(0,0,0,0.018);
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
        <div class="watermark">TDAH ASRS-18</div>
        
        <header>
            ${logoUrl ? `<img src="${logoUrl}" class="header-logo" alt="Logo">` : '<div class="logo-box">Cortex Clínico • Neuropsicologia</div>'}
            <h1 class="main-title">Escala de Autoavaliação de TDAH em Adultos (ASRS-18)</h1>
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
                    <span class="info-value">${assessment.patient.age ? `${assessment.patient.age} Anos` : 'N/D'}</span>
                </div>
                <div class="info-field">
                    <span class="info-label">Psicólogo(a) Responsável</span>
                    <span class="info-value">${psychologistName} ${crp ? `• CRP ${crp}` : ''}</span>
                </div>
                <div class="info-field">
                    <span class="info-label">Data de Aplicação</span>
                    <span class="info-value">${date.toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">Sumário Psicométrico e Triagem (OMS / DSM-5)</div>
            <div class="scores-panel">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span class="badge-risk">${results.riskLevel}</span>
                        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 8px 0 2px 0;">${results.classification}</h3>
                        <p style="font-size: 11px; color: #475569; margin: 0;">${results.summaryText}</p>
                    </div>
                </div>

                <div class="scores-grid">
                    <div class="score-box">
                        <div class="score-val">${results.partA.rawScore}/27</div>
                        <div class="score-lbl">Parte A (Desatenção)</div>
                        <div class="score-sub">${results.partA.significantSymptoms}/9 sintomas ativos (${results.partA.percentage}%)</div>
                    </div>
                    <div class="score-box">
                        <div class="score-val">${results.partB.rawScore}/27</div>
                        <div class="score-lbl">Parte B (Hiperatividade)</div>
                        <div class="score-sub">${results.partB.significantSymptoms}/9 sintomas ativos (${results.partB.percentage}%)</div>
                    </div>
                    <div class="score-box">
                        <div class="score-val">${results.totalScore}/54</div>
                        <div class="score-lbl">Escore Global ASRS-18</div>
                        <div class="score-sub">${results.totalSignificantSymptoms}/18 sintomas frequentes</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">Parecer Clínico e Laudo Interpretativo (IA)</div>
            <div class="content-area">
                ${formatClinicalContent(assessment.aiAnalysis)}
            </div>
        </div>

        <div class="section" style="page-break-before: always; margin-top: 40px;">
            <div class="section-header">Espelho Completo de Respostas do Examinando</div>
            <div class="content-area">
                <p style="font-family: var(--sans); font-size: 11px; color: #64748b; margin-bottom: 12px;">
                    Legenda de pontuação: 0 = Nem um pouco; 1 = Só um pouco; 2 = Bastante; 3 = Demais. 
                    * Respostas destacadas com pontuação ≥ 2 atingem o limiar de sintoma frequente/significativo conforme o padrão normativo da OMS.
                </p>
                <table style="width: 100%; border-collapse: collapse; font-family: var(--sans); font-size: 11px; margin-top: 10px;">
                    <thead>
                        <tr style="background: var(--primary); color: white; text-align: left;">
                            <th style="padding: 8px 10px; width: 6%;">Nº</th>
                            <th style="padding: 8px 10px; width: 14%;">Parte</th>
                            <th style="padding: 8px 10px; width: 50%;">Pergunta / Item Avaliado</th>
                            <th style="padding: 8px 10px; width: 30%; text-align: right;">Resposta Registrada</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ASRS_QUESTIONS.map((q, idx) => {
                          const ansVal = assessment.answers[q.id] ?? 0;
                          const isSignificant = ansVal >= Frequency.OFTEN;
                          const bg = isSignificant ? '#fef3c7' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc');
                          const textCol = isSignificant ? '#b45309' : 'var(--primary)';
                          return `
                            <tr style="border-bottom: 1px solid var(--border); background: ${bg};">
                                <td style="padding: 8px 10px; font-weight: 700; color: ${textCol};">${q.id}</td>
                                <td style="padding: 8px 10px; font-size: 10px; font-weight: 600; color: #64748b;">${q.partTitle.split(' - ')[0]}</td>
                                <td style="padding: 8px 10px; color: #334155;">${q.text}</td>
                                <td style="padding: 8px 10px; text-align: right; font-weight: 700; color: ${textCol};">
                                    ${FREQUENCY_LABELS[ansVal as Frequency] || ansVal} ${isSignificant ? '★' : ''}
                                </td>
                            </tr>
                          `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <footer>
            <div class="signature-block">
                ${signatureUrl ? `<img src="${signatureUrl}" class="signature-image" alt="Assinatura">` : ''}
                <div class="signature-line"></div>
                <p class="signature-name">${psychologistName}</p>
                <p class="signature-title">Psicólogo(a) Clínico(a) ${crp ? `• CRP ${crp}` : ''}</p>
            </div>
            
            <div class="legal-notice">
                <strong>REFERÊNCIAS NORMATIVAS E RESPONSABILIDADE ÉTICA:</strong> Este documento foi elaborado com observância estrita às diretrizes da Resolução CFP nº 06/2019 do Conselho Federal de Psicologia. Trata-se de instrumento complementar de rastreio clínico de sintomas de TDAH em adultos com base na escala ASRS-18 v1.1 (Adult Self-Report Scale - World Health Organization / Versão brasileira validada por Mattos et al., 2006). Os resultados aqui expressos não constituem diagnóstico médico isolado e exigem contextualização clínica e anamnese longitudinal conduzida por profissional habilitado.
            </div>
        </footer>
    </div>
    
    <div class="no-print" style="position: fixed; bottom: 30px; left: 0; right: 0; display: flex; justify-content: center; z-index: 100;">
        <button onclick="window.print()" style="background: #0f172a; color: white; border: none; padding: 15px 40px; border-radius: 12px; font-weight: 800; font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 2px; cursor: pointer; box-shadow: 0 15px 35px rgba(0,0,0,0.25); transition: all 0.3s; text-transform: uppercase;">Exportar PDF / Imprimir Relatório</button>
    </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
