/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RidEntry, AppSettings } from '../types';
import { marked } from 'marked';
import { sanitizeAnalysis } from './stringUtils';

export function generateClinicalReportHTML(entry: RidEntry, settings: AppSettings): string {
  const dateStr = new Date(entry.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const cleanAnalysis = entry.analysis ? sanitizeAnalysis(entry.analysis) : '';
  const analysisHtml = cleanAnalysis ? marked.parse(cleanAnalysis) : '<p>Análise não realizada.</p>';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Clínico - ${entry.patientName || 'Paciente'}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+Pro:wght@400;600;700&display=swap');
        
        :root {
            --primary: #1e293b;
            --accent: #2563eb;
            --border: #e2e8f0;
            --bg-soft: #f8fafc;
        }

        @page {
            margin: 2cm;
            size: A4;
        }

        body {
            font-family: 'Source Sans Pro', sans-serif;
            line-height: 1.5;
            color: #334155;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
        }

        header {
            border-bottom: 2px solid var(--primary);
            margin-bottom: 30px;
            padding-bottom: 20px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        .logo-img {
            max-height: 70px;
            margin-bottom: 5px;
        }

        h1 {
            font-family: 'Libre Baskerville', serif;
            font-size: 20px;
            margin: 0;
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }

        .meta-info {
            font-size: 11px;
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .patient-info {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
            padding: 20px;
            background: var(--bg-soft);
            border-radius: 8px;
            border: 1px solid var(--border);
        }

        .info-item b {
            display: block;
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 4px;
        }

        .info-item span {
            font-weight: 600;
            font-size: 14px;
            color: var(--primary);
        }

        .section {
            margin-bottom: 30px;
            text-align: justify;
        }

        .section-title {
            font-size: 12px;
            font-weight: 700;
            color: var(--accent);
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid var(--border);
            margin-bottom: 12px;
            padding-bottom: 4px;
        }

        .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-bottom: 25px;
        }

        .grid-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .grid-item b {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
        }

        .grid-content {
            font-size: 13px;
        }

        .analysis-box {
            font-size: 14px;
            color: #334155;
            text-align: justify;
        }

        .analysis-box h1, .analysis-box h2, .analysis-box h3 {
            font-size: 16px;
            color: var(--primary);
            margin-top: 20px;
            margin-bottom: 10px;
            border-left: 3px solid var(--accent);
            padding-left: 10px;
        }

        .analysis-box p {
            margin-bottom: 12px;
        }

        .analysis-box ul, .analysis-box ol {
            margin-bottom: 15px;
            padding-left: 20px;
        }

        .footer {
            margin-top: 80px;
            padding-top: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            page-break-inside: avoid;
        }

        .signature-img {
            max-height: 70px;
            margin-bottom: 10px;
            filter: contrast(110%);
        }

        .signature-line {
            width: 280px;
            border-top: 1px solid #94a3b8;
            margin-bottom: 8px;
        }

        .prof-name {
            font-weight: 700;
            font-size: 15px;
            color: var(--primary);
            margin: 0;
        }

        .prof-crp {
            font-size: 12px;
            color: #64748b;
            margin: 0;
        }

        .references {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px dashed var(--border);
            font-size: 10px;
            color: #94a3b8;
            line-height: 1.4;
        }

        .references b {
            display: block;
            margin-bottom: 8px;
            color: #64748b;
        }

        .no-print {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 12px;
            z-index: 1000;
        }

        .btn {
            padding: 12px 24px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            transition: all 0.2s;
        }

        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            background: #1d4ed8;
        }

        @media print {
            .no-print { display: none; }
            body { padding: 0; margin: 0; width: 100%; max-width: none; }
        }
    </style>
</head>
<body>
    <div class="no-print">
        <button class="btn" onclick="window.print()">Gerar PDF / Imprimir</button>
    </div>

    <header>
        ${settings.professionalLogo ? `<img src="${settings.professionalLogo}" class="logo-img" alt="Logo">` : ''}
        <h1>Relatório de Registro Cognitivo-Dialógico</h1>
        <div class="meta-info">Data de Emissão: ${dateStr}</div>
    </header>

    <div class="patient-info">
        <div class="info-item">
            <b>Paciente</b>
            <span>${entry.patientName || 'Não Identificado'}</span>
        </div>
        <div class="info-item">
            <b>Idade</b>
            <span>${entry.patientAge || '--'} anos</span>
        </div>
        <div class="info-item">
            <b>Data Sessão</b>
            <span>${new Date(entry.date).toLocaleDateString('pt-BR')}</span>
        </div>
    </div>

    <div class="data-grid">
        <div class="grid-item">
            <b>Contexto / Gatilho</b>
            <div class="grid-content">${entry.situacao}</div>
        </div>
        <div class="grid-item">
            <b>Resposta Emocional</b>
            <div class="grid-content">${entry.emocao.name} (${entry.emocao.intensity}%)</div>
        </div>
        <div class="grid-item">
            <b>Necessidades Psicológicas</b>
            <div class="grid-content">${Array.isArray(entry.necessidade) ? entry.necessidade.join(', ') : entry.necessidade}</div>
        </div>
        <div class="grid-item">
            <b>Ativação de Esquemas</b>
            <div class="grid-content">${Array.isArray(entry.esquema) ? entry.esquema.join(', ') : entry.esquema}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Cognições Automáticas Relatadas</div>
        <div class="grid-content" style="font-style: italic; color: #475569; padding-left: 15px; border-left: 2px solid var(--border);">
            "${entry.pensamento}"
        </div>
    </div>

    <div class="section">
        <div class="section-title">Resposta Comportamental</div>
        <div class="grid-content">${entry.comportamento}</div>
    </div>

    <div class="data-grid" style="margin-top: 20px;">
        <div class="grid-item">
            <b>Consequências Curto Prazo</b>
            <div class="grid-content">${entry.consequenciasCurtoPrazo}</div>
        </div>
        <div class="grid-item">
            <b>Consequências Longo Prazo</b>
            <div class="grid-content">${entry.consequenciasLongoPrazo}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Análise de Processamento e Reestruturação</div>
        <div class="analysis-box">
            ${analysisHtml}
        </div>
    </div>

    <footer class="footer">
        ${settings.professionalSignature ? `<img src="${settings.professionalSignature}" class="signature-img" alt="Assinatura">` : '<div style="height: 60px;"></div>'}
        <div class="signature-line"></div>
        <p class="prof-name">${settings.professionalName || 'Profissional Responsável'}</p>
        <p class="prof-crp">${settings.professionalCRP || 'CRP N/A'}</p>
    </footer>

    <div class="references">
        <b>Fundamentação Clínica:</b>
        Young, J. E., Klosko, J. S., & Weishaar, M. E. (2003). Schema Therapy: A Practitioner's Guide. Guilford Press. | 
        Beck, J. S. (2011). Cognitive Behavior Therapy: Basics and Beyond. Guilford Press. | 
        Leahy, R. L. (2017). Cognitive Therapy Techniques: A Practitioner's Guide. Guilford Press.
    </div>
</body>
</html>
  `;
}
