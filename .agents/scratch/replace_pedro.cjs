const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/Bruno/antigravity/Cortex---Gestão-Clínica-Inteligente/src/components/ThpTraining/components';

// 1. AutocontroleExercise.tsx
{
  const filePath = path.join(targetDir, 'AutocontroleExercise.tsx');
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import { Patient }")) {
    content = content.replace('import React, { useState } from "react";', 'import React, { useState } from "react";\nimport { Patient } from "../types";');
  }
  content = content.replace('export default function AutocontroleExercise({ onAwardXp }: ExerciseProps)', 'export default function AutocontroleExercise({ patient, onAwardXp }: { patient: Patient; onAwardXp: (xp: number) => void })');
  content = content.replace('Desenhe os Ativadores do Ambiente de Pedro:', 'Desenhe os Ativadores do Ambiente de {patient?.name || "Paciente"}:');
  content = content.replace('Pedro organizou seu ambiente para evitar ativadores nocivos de esquiva, poupando fadiga decisória diária. O marcador de Autocuidado foi elevado.', '{patient?.name || "O paciente"} organizou seu ambiente para evitar ativadores nocivos de esquiva, poupando fadiga decisória diária. O marcador de Autocuidado foi elevado.');
  content = content.replace('Desenhe os Ativadores do Ambiente de Pedro:', 'Desenhe os Ativadores do Ambiente de {patient?.name || "Paciente"}:');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed AutocontroleExercise.tsx');
}

// 2. AutoesteemExercise.tsx
{
  const filePath = path.join(targetDir, 'AutoesteemExercise.tsx');
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import { Patient }")) {
    content = content.replace('import React, { useState } from "react";', 'import React, { useState } from "react";\nimport { Patient } from "../types";');
  }
  content = content.replace('export default function AutoesteemExercise({ onAwardXp }: ExerciseProps)', 'export default function AutoesteemExercise({ patient, onAwardXp }: { patient: Patient; onAwardXp: (xp: number) => void })');
  content = content.replace('Pedro frequentemente direciona ataques de extrema cobrança a si mesmo devido ao Esquema Infantil de Defectividade.', '{patient?.name || "O paciente"} frequentemente direciona ataques de extrema cobrança a si mesmo devido ao Esquema de {patient?.activeSchemas?.[0] || "Defectividade/Vergonha"}.');
  content = content.replace('Você acolheu Pedro com compaixão incondicional, mitigando a tirania de autocriticas e reforçando o valor inviolável de sua identidade clínica.', 'Você acolheu {patient?.name || "o paciente"} com compaixão incondicional, mitigando a tirania de autocríticas e reforçando o valor de sua identidade clínica.');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed AutoesteemExercise.tsx');
}

// 3. HedonismoResponsavelExercise.tsx
{
  const filePath = path.join(targetDir, 'HedonismoResponsavelExercise.tsx');
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import { Patient }")) {
    content = content.replace('import React, { useState } from "react";', 'import React, { useState } from "react";\nimport { Patient } from "../types";');
  }
  content = content.replace('export default function HedonismoResponsavelExercise({ onAwardXp }: ExerciseProps)', 'export default function HedonismoResponsavelExercise({ patient, onAwardXp }: { patient: Patient; onAwardXp: (xp: number) => void })');
  content = content.replace('Pedro Silveira sofre com cobranças cognitivas rígidas de perfeccionismo que sabotam seus descansos com sentimentos fantasmas de culpa. Este exercício ensina a planejar e blindar pequenos momentos de lazer inegociáveis.', '{patient?.name || "O paciente"} sofre com cobranças cognitivas rígidas que sabotam seus descansos com sentimentos fantasmas de culpa. Este exercício ensina a planejar e blindar pequenos momentos de lazer.');
  content = content.replace('Nenhuma atividade agendada para Pedro.', 'Nenhuma atividade agendada para {patient?.name || "o paciente"}.');
  content = content.replace('Pedro deve agir voluntariamente mesmo sob a voz autocrítica da culpa para dessensibilizar o medo do ócio.', '{patient?.name || "O paciente"} deve agir voluntariamente mesmo sob a voz autocrítica da culpa para dessensibilizar o medo do ócio.');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed HedonismoResponsavelExercise.tsx');
}

// 4. RealismoOtimistaExercise.tsx
{
  const filePath = path.join(targetDir, 'RealismoOtimistaExercise.tsx');
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import { Patient }")) {
    content = content.replace('import React, { useState } from "react";', 'import React, { useState } from "react";\nimport { Patient } from "../types";');
  }
  content = content.replace('export default function RealismoOtimistaExercise({ onAwardXp }: ExerciseProps)', 'export default function RealismoOtimistaExercise({ patient, onAwardXp }: { patient: Patient; onAwardXp: (xp: number) => void })');
  content = content.replace('Parabéns Pedro!', 'Parabéns {patient?.name || "Paciente"}!');
  content = content.replace('Parabéns! Pedro atingiu reestruturação cognitiva robusta.', 'Parabéns! {patient?.name || "O paciente"} atingiu reestruturação cognitiva robusta.');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed RealismoOtimistaExercise.tsx');
}

// 5. SensibilidadeSocialExercise.tsx
{
  const filePath = path.join(targetDir, 'SensibilidadeSocialExercise.tsx');
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import { Patient }")) {
    content = content.replace('import React, { useState } from "react";', 'import React, { useState } from "react";\nimport { Patient } from "../types";');
  }
  content = content.replace('export default function SensibilidadeSocialExercise({ onAwardXp }: ExerciseProps)', 'export default function SensibilidadeSocialExercise({ patient, onAwardXp }: { patient: Patient; onAwardXp: (xp: number) => void })');
  content = content.replace('Pedro Silveira agendou e executou o suporte amigável. Essa quebra nos ciclos de medo egocêntrico foi reportada ao painel de evolução clínica de Lincoln.', '{patient?.name || "O paciente"} agendou e executou o suporte amigável. Essa quebra nos ciclos de medo egocêntrico foi reportada ao painel de evolução clínica.');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed SensibilidadeSocialExercise.tsx');
}

// 6. SociabilidadeExercise.tsx
{
  const filePath = path.join(targetDir, 'SociabilidadeExercise.tsx');
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import { Patient }")) {
    content = content.replace('import React, { useState } from "react";', 'import React, { useState } from "react";\nimport { Patient } from "../types";');
  }
  content = content.replace('export default function SociabilidadeExercise({ onAwardXp }: ExerciseProps)', 'export default function SociabilidadeExercise({ patient, onAwardXp }: { patient: Patient; onAwardXp: (xp: number) => void })');
  content = content.replace('Anular suas próprias necessidades saudáveis gera amargura extrema e ressentimento cumulativo no médio prazo. Isso fortalece o Esquema de Auto-sacrifício de Pedro.', 'Anular suas próprias necessidades saudáveis gera amargura extrema. Isso fortalece o Esquema de {patient?.activeSchemas?.[0] || "Auto-sacrifício"} de {patient?.name || "Pedro"}.');
  content = content.replace('"Pedro, estou completamente atolado hoje com esses relatórios e não vou conseguir formatar a planilha de clientes a tempo. Você tem a obrigação de me ajudar nisso rápido!"', '`"${patient?.name || "Pedro"}, estou completamente atolado hoje com esses relatórios e não vou conseguir formatar a planilha de clientes a tempo. Você tem a obrigação de me ajudar nisso rápido!"`');
  content = content.replace('Você selecionou e internalizou a resposta assertiva sã de quarta geração terapêutica. O marcadores de sociabilidade e cooperação foram elevados para Pedro!', 'Você selecionou e internalizou a resposta assertiva sã de quarta geração terapêutica. O marcadores de sociabilidade e cooperação foram elevados para {patient?.name || "o paciente"}!');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed SociabilidadeExercise.tsx');
}

// 7. ClinicalMap.tsx
{
  const filePath = path.join(targetDir, 'ClinicalMap.tsx');
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace('esquemas de Pedro.', 'esquemas de {patient.name}.');
  content = content.replace(
    '"O circuito CSTC de Pedro encontra-se hiperativo. O filtro inibitório do Núcleo Caudado falha diante do estímulo \'apresentação\', fazendo com que o Tálamo bombardeie o Córtex de ruminações de catastrofização recorrentes."',
    '`O circuito CSTC de ${patient.name} encontra-se hiperativo. O filtro inibitório do Núcleo Caudado falha diante de gatilhos clínicos, fazendo com que o Tálamo bombardeie o Córtex de ruminações (${patient.beliefs?.automaticThoughts?.[0] || "pensamentos disfuncionais"}).`'
  );
  content = content.replace(
    '"A ativação do Esquema de Inadequação em Pedro ativa imediatamente a amígdala límbica, que recruta o Hipotálamo. Este dispara a cascata hormonal do Eixo HPA, gerando cortisol crônico, insônia e hiper-resposta corporal."',
    '`A ativação do Esquema de ${patient.activeSchemas?.[0] || "Inadequação"} em ${patient.name} ativa imediatamente a amígdala límbica, que recruta o Hipotálamo. Este dispara a cascata hormonal do Eixo HPA, gerando cortisol crônico, insônia e hiper-resposta corporal.`'
  );
  content = content.replace(
    '"O tônus vagal de Pedro é deficitário (baixa VFC/HRV), diminuindo sua resiliência cardiovascular sob avaliação. O treino abdominal diário recontrata as fibras vagais respiratórias, inibindo os picos de taquicardia adrenérgica."',
    '`O tônus vagal de ${patient.name} é deficitário (baixa VFC/HRV), diminuindo sua resiliência cardiovascular sob avaliação. O treino diário recontrata as fibras vagais respiratórias.`'
  );
  content = content.replace(
    'A fadiga física, tensão muscular e cefaleia descritas em Pedro decorrem do estresse oxidativo sustentado pelo cortisol das suprarrenais.',
    'A fadiga física, tensão muscular e cefaleia descritas em ${patient.name} decorrem do estresse oxidativo sustentado pelo cortisol das suprarrenais.'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed ClinicalMap.tsx');
}

// 8. PharmacologyConsultant.tsx
{
  const filePath = path.join(targetDir, 'PharmacologyConsultant.tsx');
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(
    'Ansiedade antecipatória aguda de curtíssimo fôlego (ex: segundos antes de uma apresentação de Pedro).',
    'Ansiedade antecipatória aguda de curtíssimo fôlego.'
  );
  content = content.replace(
    'Acompanhe a introdução empírica de fármacos de Pedro Silveira e confira se a cascata hormonal se correlaciona com a redução subjetiva da sua ansiedade social em picos (Escala SUD - Unidades Subjetivas de Desconforto).',
    'Acompanhe a introdução empírica de fármacos de {patient.name} e confira se a cascata hormonal se correlaciona com a redução subjetiva do estresse em picos (Escala SUD - Unidades Subjetivas de Desconforto).'
  );
  content = content.replace(
    '<span>Pedro Silveira</span>',
    '<span>{patient.name}</span>'
  );
  
  // Generalize presets
  content = content.replace('if (patient.id === "pedro-30") {', 'if (true) { // auto-preset');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed PharmacologyConsultant.tsx');
}

// 9. ScalesCabinet.tsx
{
  const filePath = path.join(targetDir, 'ScalesCabinet.tsx');
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace('if (patient.id === "pedro-30") {', 'if (true) { // auto-preset');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed ScalesCabinet.tsx');
}

// 10. TrainingModule.tsx
{
  const filePath = path.join(targetDir, 'TrainingModule.tsx');
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(
    'ajudará Pedro no alcance pleno de seus propósitos éticos e clínicos.',
    'ajudará {patient.name} no alcance pleno de seus propósitos éticos e clínicos.'
  );
  content = content.replace(
    'Ajuste os parâmetros biológicos do corpo de Pedro para restaurar sua inibição muscular de timidez',
    'Ajuste os parâmetros biológicos do corpo de {patient.name} para restaurar sua regulação corporal'
  );
  content = content.replace(
    'Escolha o roteiro verbal de Pedro ou opte pelo',
    'Escolha o roteiro verbal de {patient.name} ou opte pelo'
  );
  content = content.replace(
    '\"Pedro, percebo pelos seus expressivos que algo no que estou apresentando não está agradando ou parece incorreto. Gostaria muito de ouvir seu feedback estruturado.\"',
    '`"${patient.name}, percebo pelos seus expressivos que algo no que estou apresentando não está agradando ou parece incorreto. Gostaria muito de ouvir seu feedback estruturado."`'
  );
  content = content.replace(
    'ajudou Pedro a enfraquecer o seu <span className="font-bold text-sky-400">Esquema de Fracasso</span>',
    'ajudou {patient.name} a enfraquecer o seu <span className="font-bold text-sky-400">Esquema de {patient.activeSchemas?.[0] || "Fracasso"}</span>'
  );
  content = content.replace(
    'A respiração diafragmática ativa o sistema respiratório de Pedro e estimula diretamente as fibras do <strong>Nervo Vago</strong>.',
    'A respiração diafragmática ativa o sistema respiratório de {patient.name} e estimula diretamente as fibras do <strong>Nervo Vago</strong>.'
  );
  content = content.replace(
    'O tônus parassimpático inibiu com êxito a reatividade límbica de Pedro.',
    'O tônus parassimpático inibiu com êxito a reatividade límbica de {patient.name}.'
  );
  content = content.replace(
    'Usar Prontuário de Pedro: <span className="text-primary underline">"Se eu gaguejar na reunião, todos confirmarão que sou..."</span>',
    'Usar Prontuário de {patient.name}: <span className="text-primary underline">"{patient.beliefs?.automaticThoughts?.[0] || "Se eu gaguejar na reunião, todos confirmarão que sou..."}"</span>'
  );
  content = content.replace(
    'O córtex de Pedro inibiu com firmeza o disparo límbico na fenda sináptica após desafio cognitivo!',
    'O córtex de {patient.name} inibiu com firmeza o disparo límbico na fenda sináptica após desafio cognitivo!'
  );
  content = content.replace(
    'let schemaRationals = "Pedro usa termos que revelam sentimentos reprimidos de insuficiência profissional na fenda sináptica.";',
    'let schemaRationals = `${patient.name} apresenta ativação do esquema de ${patient.activeSchemas?.[0] || "Fracasso"}.`;'
  );
  content = content.replace(
    'indicam que o medo do julgamento recruta reações simpáticas ativas ocultas em Pedro.',
    'indicam que o medo do julgamento recruta reações simpáticas ativas ocultas em {patient.name}.'
  );
  content = content.replace(
    'Pedro descreve somatizações latentes sutilmente controladas.',
    '{patient.name} descreve somatizações latentes sutilmente controladas.'
  );
  content = content.replace(
    'Pedro tende a diminuir a dependência de atos de evitação (delegar apresentações)',
    '{patient.name} tende a diminuir a dependência de atos de evitação ({patient.copingBehaviors?.[0] || "fuga"})'
  );
  content = content.replace(
    'Acoplamento Sináptico de Pedro',
    'Acoplamento Sináptico de {patient.name}'
  );
  content = content.replace(
    'Ao expor Pedro de forma progressiva',
    'Ao expor {patient.name} de forma progressiva'
  );
  content = content.replace(
    'Hierarquia Progressiva de Dessensibilização Social de Pedro',
    'Hierarquia Progressiva de Dessensibilização Social de {patient.name}'
  );
  content = content.replace(
    'Pedi Pedro feedback em tempo real',
    'Pedi a {patient.name} feedback em tempo real'
  );
  content = content.replace(
    'Pedro desestimulou o engrama de ansiedade correspondente, promovendo habituação fisiológica rápida',
    '{patient.name} desestimulou o engrama de ansiedade correspondente, promovendo habituação fisiológica rápida'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed TrainingModule.tsx');
}

console.log('Dynamic replacements finished.');
