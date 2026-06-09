import { PciRecord } from '../types';
import { db } from '../../../lib/db';

export async function exportToHtml(data: PciRecord) {
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

  const logoUrl = professionalLogo || data.patient.logoUrl || '';
  const signatureUrl = professionalSignature || data.patient.signatureUrl || '';
  const psychologistName = professionalName || data.patient.psychologistName || 'Psicólogo(a)';
  const crp = professionalCRP || data.patient.crp || '';

  const dateStr = new Date().toLocaleDateString('pt-BR');
  const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
  
  const fileName = `PCI_${data.patient.name.replace(/\s+/g, '_')}_${dateStr.replace(/\//g, '-')}_${timeStr}.html`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Plano Clínico Integrado - ${data.patient.name}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        
        :root {
            --primary: #1a365d;
            --text: #2d3748;
            --border: #e2e8f0;
        }

        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--text);
            background: #f7fafc;
            margin: 0;
            padding: 40px;
        }

        .document-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }

        header {
            text-align: center;
            border-bottom: 2px solid var(--primary);
            margin-bottom: 40px;
            padding-bottom: 20px;
        }

        .logo-container {
            margin-bottom: 15px;
        }

        .logo-container img {
            max-height: 80px;
            max-width: 200px;
            object-fit: contain;
        }

        h1 {
            font-family: 'Playfair Display', serif;
            color: var(--primary);
            font-size: 28px;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .header-meta {
            font-size: 14px;
            color: #718096;
            margin-top: 10px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 30px;
            border: 1px solid var(--border);
        }

        .info-item b {
            display: block;
            font-size: 12px;
            text-transform: uppercase;
            color: #4a5568;
            margin-bottom: 4px;
        }

        section {
            margin-bottom: 30px;
        }

        h2 {
            font-size: 18px;
            border-left: 4px solid var(--primary);
            padding-left: 15px;
            color: var(--primary);
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .content {
            font-size: 15px;
            white-space: pre-wrap;
            text-align: justify;
        }

        .imf-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 10px;
        }

        .imf-item {
            background: #f1f5f9;
            padding: 10px;
            border-radius: 4px;
            font-size: 13px;
        }

        .imf-item b { color: var(--primary); }

        footer {
            margin-top: 60px;
            text-align: center;
            border-top: 1px solid var(--border);
            padding-top: 30px;
        }

        .signature img {
            max-height: 80px;
            margin-bottom: 10px;
        }

        .signature-line {
            width: 250px;
            height: 1px;
            background: #000;
            margin: 0 auto 10px;
        }

        .refs {
            font-size: 12px;
            color: #718096;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px dashed var(--border);
        }

        @media print {
            body { background: white; padding: 0; }
            .document-container { box-shadow: none; padding: 0; }
        }
    </style>
</head>
<body>
    <div class="document-container">
        <header>
            ${logoUrl ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo"></div>` : ''}
            <h1>Plano Clínico Integrado (PCI)</h1>
            <div class="header-meta">Documento Psicológico - Confidencial</div>
        </header>

        <div class="info-grid">
            <div class="info-item"><b>Paciente</b> ${data.patient.name}</div>
            <div class="info-item"><b>Nascimento</b> ${data.patient.name ? 'Informado' : 'N/D'}</div>
            <div class="info-item"><b>Psicólogo(a)</b> ${psychologistName}</div>
            <div class="info-item"><b>CRP</b> ${crp}</div>
            <div class="info-item"><b>Data do Plano</b> ${dateStr}</div>
            <div class="info-item"><b>Horário</b> ${timeStr.replace('h', ':')}</div>
        </div>

        <section>
            <h2>1. Caracterização do Paciente</h2>
            <div class="content">
<b>Idade:</b> ${data.idade}
<b>Escolaridade/Profissão:</b> ${data.escolaridade}
<b>Estado Civil:</b> ${data.estadoCivil}

<b>Estrutura Familiar:</b>
${data.familiaOrigem}

<b>Rotina Diária:</b>
${data.rotina}
            </div>
        </section>

        <section>
            <h2>2. Queixa Principal e Antecedentes</h2>
            <div class="content">${data.eventoQueixas}</div>
        </section>

        <section>
            <h2>3. Análise Funcional (RID)</h2>
            <div class="content">
<b>Situação:</b> ${data.ridSituacao}
<b>Pensamento:</b> ${data.ridPensamento}
<b>Emoção:</b> ${data.ridEmocao} (Intensidade: ${data.ridEmocaoIntensidade || 0}%)
<b>Comportamento:</b> ${data.ridComportamento}
<b>Consequências CP:</b> ${data.ridConsequencias}
<b>Consequências LP:</b> ${data.ridConsequenciasLP}
            </div>
        </section>

        <section>
            <h2>4. Análise de Satisfação (IMF)</h2>
            <div class="imf-grid">
                <div class="imf-item"><b>Pessoal:</b> ${data.satisfacaoPessoal}%</div>
                <div class="imf-item"><b>Interpessoal:</b> ${data.satisfacaoInterpessoal}%</div>
                <div class="imf-item"><b>Ocupacional:</b> ${data.satisfacaoOcupacional}%</div>
                <div class="imf-item"><b>Material:</b> ${data.satisfacaoMaterial}%</div>
                <div class="imf-item"><b>Recreativa:</b> ${data.satisfacaoRecreativa}%</div>
                <div class="imf-item"><b>Existencial:</b> ${data.satisfacaoExistencial}%</div>
            </div>
        </section>

        <section>
            <h2>5. Funcionamento Psicológico Profundo</h2>
            <div class="content">
<b>Necessidades Identificadas (Cronicamente Insatisfeitas):</b>
${data.necessidadesIdentificadas || 'N/D'}

<b>Esquemas Cognitivos:</b>
${data.esquemasCognitivos}

<b>Crenças Centrais:</b>
${data.crencasCentrais}

<b>Crenças Periféricas/Regras:</b>
${data.crencasPerifericas}

<b>Excessos Comportamentais:</b>
${data.excessosComp}

<b>Déficits de Habilidades:</b>
${data.deficitsHab}

<b>Histórico Formativo:</b>
${data.historicoFormativo}
            </div>
        </section>

        <section>
            <h2>6. Diagnóstico e Conduta</h2>
            <div class="content">
<b>Diagnóstico Topográfico (Sintomatológico):</b>
${data.diagTopo}

<b>Análise Funcional-Contextual (Diagnóstico Funcional):</b>
${data.diagFunc}

<b>Instrumentos de Avaliação / Psicometria:</b>
${data.instrumentos || 'N/D'}

<b>Estratégia de Relacionamento Terapêutico:</b>
${data.relacionamentoTerap || 'N/D'}

<b>Projeto Terapêutico Planejado:</b>
${data.projetoTerap}
            </div>
        </section>

        ${data.aiAnalysis ? `
        <section>
            <h2>7. Análise Integrativa Especializada (IA)</h2>
            <div class="content">${data.aiAnalysis}</div>
        </section>` : ''}

        <section>
            <h2>8. Evolução Clínica</h2>
            <div class="content">${data.evolucao || 'Início do acompanhamento.'}</div>
        </section>

        <footer>
            <div class="signature">
                ${signatureUrl ? `<img src="${signatureUrl}" alt="Assinatura">` : ''}
                <div class="signature-line"></div>
                <b>${psychologistName}</b><br>
                Psicólogo(a) - CRP ${crp}
            </div>
        </footer>

        <div class="refs">
            <b>Referências Bibliográficas e Científicas:</b>
            <p>1. American Psychiatric Association. (2022). Manual diagnóstico e estatístico de transtornos mentais (5ª ed., texto revisado). Artmed.</p>
            <p>2. Young, J. E. (2003). Terapia do esquema: Guia de técnicas cognitivo-comportamentais. Artmed.</p>
            <p>3. Resolução CFP nº 06/2019: Diretrizes para a elaboração de documentos decorrentes de avaliações psicológicas.</p>
        </div>
    </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
