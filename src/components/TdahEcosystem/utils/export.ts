import { TdahEcosystemAssessment } from '../types';
import { evaluateDsm5Criteria } from '../lib/scoring';

export function exportTdahEcosystemToHtml(assessment: TdahEcosystemAssessment, customLogo?: string, customSignature?: string): void {
  const dsm5 = evaluateDsm5Criteria(assessment);
  const p = assessment.patientInfo;
  const asrs = assessment.asrsData;
  const etdah = assessment.etdahData;
  const epf = assessment.epfData;
  const bdefs = assessment.bdefsData;
  const anamnese = assessment.anamneseData;
  const heterorrelato = assessment.heterorrelatoData;
  const diferenciais = assessment.diferenciaisData;
  const laudo = assessment.laudoData;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Laudo Psicológico - Avaliação Especializada TDAH em Adultos - ${p.name}</title>
      <style>
        @page {
          size: A4;
          margin: 18mm 16mm 20mm 16mm;
        }
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          line-height: 1.55;
          margin: 0;
          padding: 0;
          font-size: 11pt;
          background: #fff;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 14px;
          margin-bottom: 24px;
        }
        .title-block h1 {
          font-size: 16pt;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 4px 0;
          color: #0f172a;
        }
        .title-block p {
          font-size: 9pt;
          color: #64748b;
          margin: 0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .logo-img {
          max-height: 55px;
          max-width: 140px;
          object-fit: contain;
        }
        .section {
          margin-bottom: 22px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 11pt;
          font-weight: 800;
          text-transform: uppercase;
          color: #0f172a;
          border-left: 4px solid #f59e0b;
          padding-left: 8px;
          margin-bottom: 10px;
          background: #f8fafc;
          padding-top: 4px;
          padding-bottom: 4px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 14px;
        }
        .info-label {
          font-size: 8pt;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          display: block;
          margin-bottom: 2px;
        }
        .info-value {
          font-size: 10pt;
          font-weight: 600;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          margin-bottom: 8px;
          font-size: 9.5pt;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 6px 10px;
          text-align: left;
        }
        th {
          background: #f1f5f9;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          font-size: 8.5pt;
        }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 8pt;
          font-weight: 800;
          text-transform: uppercase;
        }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .conclusion-box {
          border: 2px solid #f59e0b;
          background: #fffbeb;
          border-radius: 8px;
          padding: 14px;
          margin-top: 14px;
        }
        .signature-box {
          margin-top: 40px;
          text-align: center;
          page-break-inside: avoid;
        }
        .signature-line {
          width: 260px;
          border-top: 1px solid #334155;
          margin: 0 auto 8px auto;
        }
        .signature-img {
          max-height: 50px;
          margin-bottom: 4px;
        }
        .footer-note {
          margin-top: 30px;
          font-size: 7.5pt;
          color: #94a3b8;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 8px;
        }
      </style>
    </head>
    <body>
      <!-- CABEÇALHO -->
      <div class="header">
        <div class="title-block">
          <h1>Laudo Psicológico - TDAH em Adultos</h1>
          <p>Conforme Resolução CFP nº 06/2019 • Avaliação Neuropsicológica & Clínica</p>
        </div>
        ${customLogo ? `<img src="${customLogo}" class="logo-img" alt="Logo" />` : ''}
      </div>

      <!-- 1. IDENTIFICAÇÃO -->
      <div class="section">
        <div class="section-title">1. Identificação do Paciente e do Responsável Técnico</div>
        <div class="grid-2">
          <div class="info-card">
            <span class="info-label">Nome do Avaliando</span>
            <span class="info-value">${p.name || 'Não informado'}</span>
          </div>
          <div class="info-card">
            <span class="info-label">Idade / Data de Nascimento</span>
            <span class="info-value">${p.age ? `${p.age} anos` : 'Não informada'} ${p.birthDate ? `(${p.birthDate})` : ''}</span>
          </div>
          <div class="info-card">
            <span class="info-label">Escolaridade / Profissão</span>
            <span class="info-value">${p.education || '-'} / ${p.profession || '-'}</span>
          </div>
          <div class="info-card">
            <span class="info-label">Psicólogo(a) / CRP</span>
            <span class="info-value">${p.psychologistName || 'Profissional Responsável'} - CRP: ${p.crp || 'Não informado'}</span>
          </div>
        </div>
      </div>

      <!-- 2. DESCRIÇÃO DA DEMANDA -->
      <div class="section">
        <div class="section-title">2. Descrição da Demanda</div>
        <p style="text-align: justify; margin: 0;">
          ${laudo?.descricaoDemanda || anamnese?.queixaPrincipal || 'Avaliação psicológica especializada e investigação clínica de Transtorno do Déficit de Atenção/Hiperatividade (TDAH) em vida adulta, solicitada em razão de queixas persistentes de desatenção, procrastinação, dificuldades de organização temporal e impacto na rotina acadêmica/laboral.'}
        </p>
      </div>

      <!-- 3. PROCEDIMENTOS UTILIZADOS -->
      <div class="section">
        <div class="section-title">3. Procedimentos e Instrumentos Utilizados</div>
        <p style="margin-bottom: 6px;">Foram empregados os seguintes recursos no processo de avaliação diagnóstica:</p>
        <ul style="margin: 0 0 10px 20px; padding: 0;">
          <li><strong>ASRS-18 (Adult ADHD Self-Report Scale - OMS):</strong> Instrumento padronizado de rastreio inicial sintomatológico.</li>
          <li><strong>Anamnese Retrospectiva Focada no Desenvolvimento e Infância:</strong> Resgate longitudinal de marcos do neurodesenvolvimento, histórico escolar, boletins e estratégias de compensação antes dos 12 anos.</li>
          <li><strong>ETDAH-AD (Escala de TDAH em Adultos - Edyleine Benczik / Vetor Editora):</strong> Avaliação psicométrica normatizada para população brasileira (Fatores: Desatenção, Impulsividade, Aspectos Emocionais, Autorregulação e Hiperatividade).</li>
          <li><strong>EPF-TDAH (Escala de Prejuízos Funcionais):</strong> Mensuração quantitativa e qualitativa do impacto em 9 domínios da vida adulta.</li>
          <li><strong>BDEFS (Barkley Deficits in Executive Functioning Scale - Versão Longa):</strong> Avaliação dimensional de disfunções executivas e cálculo do Índice FE-TDAH de Barkley.</li>
          <li><strong>Heterorrelato com Terceiros:</strong> Triangulação de informações com observador próximo para validação externa.</li>
          <li><strong>Entrevista Clínica Estruturada para Diagnósticos Diferenciais (DSM-5-TR):</strong> Exclusão e/ou mapeamento de comorbidades afetivas, ansiosas e sono.</li>
        </ul>
      </div>

      <!-- 4. ANÁLISE DOS RESULTADOS -->
      <div class="section">
        <div class="section-title">4. Análise e Resultados dos Instrumentos</div>
        
        <!-- Tabela Síntese dos Instrumentos -->
        <table>
          <thead>
            <tr>
              <th>Instrumento</th>
              <th>Escore Bruto / Domínio</th>
              <th>Classificação</th>
              <th>Interpretação Clínica</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>ASRS-18 (OMS)</strong></td>
              <td>Parte A: ${asrs ? `${asrs.partASignificant}/6` : '-'} | Parte B: ${asrs ? `${asrs.partBSignificant}/12` : '-'}</td>
              <td><span class="badge ${asrs?.thresholdMetA ? 'badge-danger' : 'badge-success'}">${asrs?.thresholdMetA ? 'Triagem Positiva' : 'Negativo'}</span></td>
              <td>${asrs?.thresholdMetA ? 'Indicadores consistentes que recomendam investigação diagnóstica aprofundada.' : 'Baixo índice de sintomas de rastreio.'}</td>
            </tr>
            <tr>
              <td><strong>ETDAH-AD</strong></td>
              <td>${etdah ? `${etdah.totalScore}/${etdah.maxTotalScore} pts` : '-'}</td>
              <td><span class="badge ${etdah?.totalScore && etdah.totalScore > 150 ? 'badge-danger' : 'badge-warning'}">${etdah?.overallClassification || 'Realizado'}</span></td>
              <td>${etdah?.factors ? Object.values(etdah.factors).map(f => `${f.name}: ${f.level}`).join(' | ') : 'Perfil mapeado nos 5 fatores.'}</td>
            </tr>
            <tr>
              <td><strong>EPF-TDAH (Prejuízo)</strong></td>
              <td>${epf ? `${epf.affectedDomainsCount} contextos com prejuízo` : '-'}</td>
              <td><span class="badge ${epf?.meetsDsmMultipleContexts ? 'badge-danger' : 'badge-success'}">${epf?.overallLevel || '-'}</span></td>
              <td>${epf?.meetsDsmMultipleContexts ? 'Prejuízo clinicamente significativo confirmado em múltiplos contextos de vida (critério DSM-5).' : 'Sem evidência de múltiplos prejuízos.'}</td>
            </tr>
            <tr>
              <td><strong>BDEFS (Barkley)</strong></td>
              <td>Índice FE-TDAH: ${bdefs ? `${bdefs.adhdEfIndexScore} pts` : '-'}</td>
              <td><span class="badge ${bdefs?.adhdEfIndexRisk === 'Alto Risco de TDAH' ? 'badge-danger' : 'badge-warning'}">${bdefs?.adhdEfIndexRisk || '-'}</span></td>
              <td>${bdefs?.overallLevel || 'Funções executivas no cotidiano.'}</td>
            </tr>
          </tbody>
        </table>

        <!-- Análise da Infância e Heterorrelato -->
        <div style="margin-top: 12px; font-size: 9.5pt; text-align: justify;">
          <p><strong>Trajetória Retrospectiva da Infância:</strong> ${anamnese?.marcosDesenvolvimento?.desempenhoAcademicoInfancia || 'Histórico de esforço compensatório e dificuldades atencionais com início identificado no período escolar.'}</p>
          ${heterorrelato ? `<p><strong>Heterorrelato (Validação Externa):</strong> Informante (${heterorrelato.grauParentesco}) relata ${heterorrelato.concordanciaGeralComAutorrelato.toLowerCase()} em relação aos sintomas de desatenção e impulsividade observados na rotina.</p>` : ''}
        </div>
      </div>

      <!-- 5. CRITÉRIOS DSM-5-TR E CONCLUSÃO -->
      <div class="section">
        <div class="section-title">5. Conclusão Diagnóstica e Parecer Clínico</div>
        <div class="conclusion-box">
          <div style="font-weight: 800; font-size: 11.5pt; color: #92400e; margin-bottom: 6px;">
            Síntese Diagnóstica: ${dsm5.conclusaoGlobal}
          </div>
          <div style="font-size: 10pt; line-height: 1.6; text-align: justify; color: #1e293b;">
            ${laudo?.conclusaoDiagnostica || `
              Com base na integração dos dados psicométricos, anamnese retrospectiva, mensuração de prejuízos funcionais em múltiplos contextos e avaliação de disfunções executivas cotidianas, os dados sustentam a hipótese clínica de <strong>Transtorno do Déficit de Atenção/Hiperatividade (TDAH) em Adultos - Apresentação ${dsm5.apresentacaoSugerida}</strong> (F90.0 / F90.2 / 314.01).
              Ressalta-se que o diagnóstico do TDAH em adultos é estritamente clínico e multiprofissional.
            `}
          </div>
        </div>
      </div>

      <!-- 6. ENCAMINHAMENTOS -->
      <div class="section">
        <div class="section-title">6. Encaminhamentos e Orientações</div>
        <ul style="margin: 0 0 10px 20px; font-size: 9.5pt;">
          <li><strong>Avaliação Médica Especializada:</strong> Encaminhamento ao Médico Psiquiatra ou Neurologista para discussão diagnóstica compartilhada e ponderação de intervenção farmacológica.</li>
          <li><strong>Intervenção Psicoterapêutica:</strong> Continuidade de Psicoterapia Cognitivo-Comportamental com foco em Treinamento de Habilidades Psicológicas (THP), estruturação de rotinas e manejo de contingências ambientais.</li>
          <li><strong>Adaptações no Ambiente de Trabalho/Estudos:</strong> Utilização de apoios visuais, blocos de tempo delimitados e redução de sobrecarga sensorial.</li>
        </ul>
      </div>

      <!-- ASSINATURA -->
      <div class="signature-box">
        ${customSignature ? `<img src="${customSignature}" class="signature-img" alt="Assinatura" /><br/>` : ''}
        <div class="signature-line"></div>
        <strong style="font-size: 10pt;">${p.psychologistName || 'Psicólogo(a) Responsável'}</strong><br/>
        <span style="font-size: 8.5pt; color: #64748b;">CRP: ${p.crp || '00/00000'}</span><br/>
        <span style="font-size: 8pt; color: #94a3b8;">Emitido em: ${new Date().toLocaleDateString('pt-BR')}</span>
      </div>

      <div class="footer-note">
        Este documento foi gerado pelo Cortex Clínica - Módulo Especializado de Avaliação de TDAH em Adultos. As conclusões refletem o momento avaliativo e exigem integração com a história de vida do indivíduo.
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }
}
