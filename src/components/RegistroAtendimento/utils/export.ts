import { AttendanceRecord, AttendanceTemplateType } from '../types';
import { ATTENDANCE_TEMPLATES } from './templates';
import { db } from '../../../lib/db';

function formatMarkdown(markdown: string): string {
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

function getTemplateLabel(id: AttendanceTemplateType): string {
  if (id === 'soap') return 'Registro Clínico (SOAP)';
  if (id === 'evolution') return 'Evolução Clínico-Terapêutica';
  return 'Ficha de Triagem / Anamnese Rápida';
}

function renderRecordContent(record: AttendanceRecord, logoUrl: string, signatureUrl: string, psychologistName: string, crp: string): string {
  const template = ATTENDANCE_TEMPLATES.find(t => t.id === record.template);
  const fieldsHtml = template?.fields.map(f => {
    const val = record.fields[f.id] || 'Não preenchido';
    return `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <strong style="font-family: 'Inter', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #475569; display: block; margin-bottom: 6px;">${f.label}</strong>
        <div style="font-size: 13px; text-align: justify; line-height: 1.6; color: #1e293b; background: #f8fafc; border-left: 3px solid #cbd5e1; padding: 12px 16px; border-radius: 0 8px 8px 0; white-space: pre-wrap;">${val}</div>
      </div>
    `;
  }).join('') || '';

  return `
    <div class="session-page" style="page-break-after: always; position: relative; min-height: 270mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding-bottom: 20px; margin-bottom: 50px; border-bottom: 1px dashed #cbd5e1;">
      <div>
        <header style="text-align: center; border-bottom: 2px solid #0f172a; margin-bottom: 40px; padding-bottom: 20px; display: flex; flex-direction: column; align-items: center;">
          ${logoUrl ? `<img src="${logoUrl}" style="max-height: 80px; max-width: 200px; margin-bottom: 15px; object-fit: contain;" alt="Logo Profissional">` : `<div style="font-family: 'Inter', sans-serif; font-weight: 800; font-size: 12px; letter-spacing: 5px; color: #10b981; text-transform: uppercase; margin-bottom: 15px;">REGISTRO DE ATENDIMENTO</div>`}
          <h1 style="font-family: 'Inter', sans-serif; font-size: 18px; color: #0f172a; margin: 0; font-weight: 800; text-transform: uppercase;">${getTemplateLabel(record.template)}</h1>
        </header>

        <div style="margin-bottom: 40px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 24px; border-radius: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-family: 'Inter', sans-serif;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 4px;">Paciente</span>
            <span style="font-size: 13px; font-weight: 600; color: #0f172a;">${record.patient.name}</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 4px;">Idade</span>
            <span style="font-size: 13px; font-weight: 600; color: #0f172a;">${record.patient.age} Anos</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 4px;">Psicólogo(a) Responsável</span>
            <span style="font-size: 13px; font-weight: 600; color: #0f172a;">${psychologistName}</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 4px;">Data de Emissão</span>
            <span style="font-size: 13px; font-weight: 600; color: #0f172a;">${new Date(record.createdAt).toLocaleDateString('pt-BR')} ${new Date(record.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div style="margin-bottom: 40px;">
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; color: #0f172a; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
            Anotações Clínicas Estruturadas
            <div style="flex: 1; height: 1px; background: #cbd5e1;"></div>
          </div>
          <div style="font-family: 'Inter', sans-serif;">
            ${fieldsHtml}
          </div>
        </div>

        ${record.aiAnalysis ? `
          <div style="margin-bottom: 40px; page-break-before: auto;">
            <div style="font-family: 'Inter', sans-serif; font-size: 11px; color: #0f172a; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
              Resumo Clínico Integrativo (IA)
              <div style="flex: 1; height: 1px; background: #cbd5e1;"></div>
            </div>
            <div style="font-family: 'Libre Baskerville', serif; font-size: 14px; line-height: 1.8; text-align: justify; color: #1e293b;">
              ${formatMarkdown(record.aiAnalysis)}
            </div>
          </div>
        ` : ''}
      </div>

      <footer style="margin-top: 50px; text-align: center; page-break-inside: avoid;">
        <div style="display: inline-block; text-align: center; position: relative;">
          ${signatureUrl ? `<img src="${signatureUrl}" style="max-width: 200px; max-height: 80px; margin-bottom: -15px; mix-blend-mode: multiply;" alt="Assinatura">` : ''}
          <div style="width: 300px; height: 1.5px; background: #0f172a; margin: 0 auto 12px auto;"></div>
          <p style="font-family: 'Inter', sans-serif; font-weight: 700; font-size: 13px; margin: 0; color: #0f172a; text-transform: uppercase;">${psychologistName}</p>
          <p style="font-family: 'Inter', sans-serif; font-size: 10px; color: #64748b; font-weight: 600; margin: 4px 0 0 0;">Psicólogo(a) Clínico(a) • CRP ${crp}</p>
        </div>
      </footer>
    </div>
  `;
}

export async function exportToHtml(records: AttendanceRecord | AttendanceRecord[]) {
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

  const isArray = Array.isArray(records);
  const recordList = isArray ? records : [records];
  if (recordList.length === 0) return;

  const primaryRecord = recordList[0];
  const formattedDate = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  
  let fileName = '';
  if (isArray) {
    fileName = `${primaryRecord.patient.name.replace(/\s+/g, '_')}_LoteAtendimentos_${formattedDate}.html`;
  } else {
    fileName = `${primaryRecord.patient.name.replace(/\s+/g, '_')}_RegistroAtendimento_${formattedDate}.html`;
  }

  // Load patient fallback values if settings are not set
  const logoUrl = professionalLogo || primaryRecord.patient.logoUrl || '';
  const signatureUrl = professionalSignature || primaryRecord.patient.signatureUrl || '';
  const psychologistName = professionalName || primaryRecord.patient.psychologistName || 'Psicólogo(a)';
  const crp = professionalCRP || primaryRecord.patient.crp || '';

  const pagesHtml = recordList.map(r => renderRecordContent(r, logoUrl, signatureUrl, psychologistName, crp)).join('\n');

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de Atendimento - ${primaryRecord.patient.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        @page {
            margin: 1.5cm;
            size: A4;
        }
        body {
            font-family: 'Libre Baskerville', serif;
            color: #334155;
            line-height: 1.6;
            background: #f1f5f9;
            margin: 0;
            padding: 50px 0;
        }
        .paper {
            background: white;
            width: 210mm;
            margin: 0 auto;
            padding: 2cm;
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.1);
            box-sizing: border-box;
            border-radius: 2px;
        }
        @media print {
            body { background: white; padding: 0; }
            .paper { 
                box-shadow: none; 
                width: 100%; 
                margin: 0; 
                padding: 0;
            }
            .no-print { display: none; }
            .session-page { 
                page-break-after: always;
                border-bottom: none !important;
                margin-bottom: 0 !important;
            }
            .session-page:last-child {
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="paper">
        ${pagesHtml}
    </div>
    
    <div class="no-print" style="position: fixed; bottom: 40px; left: 0; right: 0; display: flex; justify-content: center; z-index: 1000;">
        <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 18px 50px; border-radius: 12px; font-weight: 800; font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 3px; cursor: pointer; box-shadow: 0 15px 40px rgba(16,185,129,0.3); transition: all 0.3s; text-transform: uppercase;">Imprimir Relatórios / Salvar PDF</button>
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
