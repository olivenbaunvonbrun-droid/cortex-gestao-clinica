import { DiagnosticRecord } from "../types";
import { db } from "../../../lib/db";

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

export async function exportToHtml(record: DiagnosticRecord) {
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

  const logoUrl = professionalLogo || record.patient.logoUrl || '';
  const signatureUrl = professionalSignature || record.patient.signatureUrl || '';
  const psychologistName = professionalName || record.patient.psychologistName || 'Psicólogo(a)';
  const crp = professionalCRP || record.patient.crp || '';

  const date = new Date(record.createdAt);
  const formattedDate = date.toLocaleDateString('pt-BR').replace(/\//g, '-');
  const formattedTime = date.getHours().toString().padStart(2, '0') + '-' + date.getMinutes().toString().padStart(2, '0');
  
  const fileName = `${record.patient.name.replace(/\s+/g, '_')}_Psidiagnostic_${formattedDate}_${formattedTime}.html`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laudo Psicodiagnóstico - ${record.patient.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #0f172a;
            --accent: #8b5cf6;
            --text: #334155;
            --light: #f8fafc;
            --border: #cbd5e1;
            --academic: 'Libre Baskerville', serif;
            --sans: 'Inter', sans-serif;
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

        .sources-box {
            background: #fdfeff;
            border: 1px solid #ddd;
            border-left: 4px solid var(--accent);
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 40px;
            font-family: var(--sans);
            font-size: 12px;
        }

        .sources-title {
            font-weight: 800;
            text-transform: uppercase;
            color: var(--primary);
            margin-bottom: 8px;
            letter-spacing: 0.5px;
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
            color: rgba(139, 92, 246, 0.015);
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
        <div class="watermark">PSIDIAGNOSTIC PRO</div>
        
        <header>
            ${logoUrl ? `<img src="${logoUrl}" class="header-logo" alt="Logo Profissional">` : `<div class="logo-box">PSIDIAGNOSTIC PRO</div>`}
            <h1 class="main-title">Laudo Psicodiagnóstico Clínico</h1>
        </header>

        <div class="section">
            <div class="section-header">Identificação do Avaliando</div>
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
                    <span class="info-value">${psychologistName}</span>
                </div>
                <div class="info-field">
                    <span class="info-label">Data de Emissão</span>
                    <span class="info-value">${new Date(record.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        </div>

        <div class="sources-box">
            <div class="sources-title">Fontes de Dados Consultadas:</div>
            <ul style="margin: 0; padding-left: 20px;">
                ${record.hasProntuarioData ? '<li>Histórico Clínico e Evoluções do Prontuário Integrado</li>' : ''}
                ${record.uploadedFilesCount > 0 ? `<li>Arquivos de Laudos, Exames ou Relatórios Anexados (${record.uploadedFilesCount} arquivo(s))</li>` : ''}
            </ul>
        </div>

        ${record.aiAnalysis ? `
        <div class="section">
            <div class="section-header">Laudo Psicodiagnóstico e Conclusões</div>
            <div class="content-area">
                ${formatClinicalContent(record.aiAnalysis)}
            </div>
        </div>
        ` : ''}

        <footer>
            <div class="signature-block">
                ${signatureUrl ? `<img src="${signatureUrl}" class="signature-image" alt="Assinatura">` : ''}
                <div class="signature-line"></div>
                <p class="signature-name">${psychologistName}</p>
                <p class="signature-title">Psicólogo(a) Clínico(a) • CRP ${crp}</p>
            </div>
            
            <div class="legal-notice">
                <strong>REFERÊNCIAS E DIRETRIZES:</strong> Este laudo foi elaborado estritamente sob as diretrizes da Resolução CFP nº 06/2019 do Conselho Federal de Psicologia, que regulamenta a elaboração de documentos escritos produzidos pela(o) psicóloga(o). Contém conclusões diagnósticas baseadas na compilação do prontuário técnico e/ou exames documentais complementares. Trata-se de documento sigiloso e confidencial, sendo vedada sua reprodução ou guarda desprotegida por terceiros não autorizados.
            </div>
        </footer>
    </div>
    
    <div class="no-print" style="position: fixed; bottom: 40px; left: 0; right: 0; display: flex; justify-content: center;">
        <button onclick="window.print()" style="background: #8b5cf6; color: white; border: none; padding: 18px 50px; border-radius: 12px; font-weight: 800; font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 3px; cursor: pointer; box-shadow: 0 15px 40px rgba(0,0,0,0.3); transition: all 0.3s; text-transform: uppercase;">Exportar PDF / Imprimir</button>
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
