# Registro de Atendimento: orientação TCC de 4ª geração / THP

Versão da orientação: 2026-10-09. Escopo: somente análise e preenchimento do Registro de Atendimento, inclusive Escriba/áudio, reanálise, preenchimento sequencial e botões individuais. Outros módulos não herdam esta orientação automaticamente.

## Fontes fornecidas pelo usuário

Os nomes abaixo identificam os nove PDFs enviados; os PDFs não são publicados no repositório. As páginas são as páginas físicas dos arquivos, contando a partir de 1.

| Documento | Páginas de referência | Aplicação |
| --- | --- | --- |
| Aula 1 - THP - 1ª Fase(5).pdf | 1–5 | Acolhimento/contrato, RID em quatro componentes, investigação de padrões, seis HPs nomeadas e pergunta orientadora do déficit |
| Aula 2 - THP - 2ª Fase(5).pdf | 1–4 | Investigação longitudinal, YSQ/IHP, hipótese de origem e PCI colaborativo |
| Aula 3 - THP - 3ª Fase(5).pdf | 1–4 | PME/PDP, desfusão identitária, cinco subfases do PDP, treino e generalização |
| Esquemas e crenças(5).pdf | 1–2, 4–9 | 18 esquemas em cinco domínios; enfrentamento; pensamentos automáticos, crenças intermediárias e centrais |
| Guia Completo dos Parâmetros Clínicos(4).pdf | 1–9 | Vocabulário dos parâmetros infantis, parentais, conjugais, adultos e esquemáticos, conforme pertinência da fonte clínica |
| THP - 4ª Fase (Reparentalização Limitada 1)(2).pdf | 1–3 | Preparação, memória-alvo, Eu Adulto, acolhimento/proteção e processamento/retorno |
| THP - 4ª Fase (Reparentalização Limitada 2)(1).pdf | 1–4 | Vivência imagética, validação, segurança/lugar seguro e critérios de pertinência |
| THP - 4ª Fase(1).pdf | 1–5 | Integração AC/PP/TCC, rotas PME/PDP, revisão do PCI, autonomia e prevenção de recaída |
| Treino de assertividade(3).pdf | 1–4 | Direitos próprios/alheios, modelagem/ensaio, expressão/pedido, comunicação não verbal, feedback e prática gradual |

## Critérios de tradução dos materiais

- RID: contexto; necessidades/estressores; resposta (pensamentos, emoções, corpo, ações/omissões); consequências imediatas e de longo prazo. Uma lacuna não autoriza inferir o componente ausente.
- Formulação: relacionar evidências a necessidades, níveis cognitivos, esquemas, enfrentamento e possíveis HPs. Uma hipótese inclui suporte e pergunta de verificação. Recorrência e causalidade não são inferidas de um episódio isolado.
- PCI: organizar metas, hipóteses, alvos e indicadores em colaboração. PME visa reabilitação esquemática; PDP visa desenvolvimento de habilidades. A seleção de técnicas depende do caso.
- Aula 4 consolida raciocínio clínico; não impõe uma quarta fase sequencial ao paciente. As cinco subfases do PDP são outro nível de organização. Número da sessão não determina fase.
- O guia tem 15 entradas esquemáticas; o documento específico tem 18 em cinco domínios. Usamos este último como catálogo mais completo, preservando termos originais quando relatados. Indesejabilidade Social não é automaticamente igualada a Isolamento Social/Alienação.
- As aulas citam dez HPs, mas nomeiam seis. Não completar a lista sem fonte adicional. Resolutividade e Enfrentamento inclui treino assertivo.
- Associações esquema/transtorno e classificações diagnósticas do material não produzem diagnóstico automático. YSQ/IHP só são registrados quando aplicação/resultados constam dos dados.
- Exemplos de pacientes, cenários profissionais, sintomas, memórias, falas e tarefas dos PDFs são didáticos e não são incorporados ao caso. O catálogo conjugal de Apoio Doméstico não prova sobrecarga doméstica.
- Memórias são relatos; vivências imagéticas não comprovam eventos históricos. Técnicas vivenciais requerem avaliação de pertinência, aliança, formulação e segurança; não são prescritas automaticamente.
- Os materiais orientam o raciocínio, sem promessas de cura ou certeza diagnóstica. O profissional revisa o rascunho antes de salvá-lo.

## Regras por campo

| Campo | Regra |
| --- | --- |
| Relato original | Preservação determinística; não recebe formulação da IA |
| Síntese clínica | RID e recursos/lacunas; hipóteses de formulação em seção própria, com suporte/pergunta |
| Motivo da consulta | Queixa/contexto/impacto declarados |
| Objetivos do cliente | Metas/prioridades/valores explicitados pelo cliente |
| Objetivos do terapeuta | Objetivos documentados; propostas novas ficam em Planejamento |
| Intervenções | Ações realizadas, finalidade PME/PDP quando sustentada, resposta registrada |
| Observações | Observações explícitas e formulação funcional; hipóteses identificadas |
| Insights | Compreensões verbalizadas pelo paciente, não conclusões da IA |
| Percepção do cliente | Avaliação do próprio cliente; participação não demonstra satisfação |
| Progresso | Categoria apenas se expressamente documentada; sem dados fica vazio |
| Tarefas | Apenas pactuadas, com parâmetros efetivamente combinados |
| Planejamento | Decisões registradas; sugestões condicionais separadas e ligadas à formulação |
| Confidencialidade | Contrato/sigilo/consentimento apenas se documentados |
| Encaminhamentos | Decisões registradas; propostas futuras em Planejamento |

## Implementação e verificação

`src/lib/registroTcc4.ts` centraliza o referencial e os critérios de cada campo. O serviço abrangente envia todas as regras via `systemInstruction`; o botão individual envia o mesmo referencial e a regra do campo. Abordagens selecionadas permanecem metadados e não substituem a orientação solicitada. Dados da sessão/histórico são enviados separadamente das instruções.

Transcrição original e síntese continuam separadas, o salvamento de conteúdo gerado requer revisão e permanecem as proteções contra troca de paciente, expansão artificial e saída truncada. O preenchimento abrangente passa a incluir Confidencialidade, com a mesma regra de evidência do botão individual.

Execute `npm run lint`, `npm run test:clinical-record` e `npm run build`. Os testes usam transporte simulado e dados fictícios: verificam instruções efetivamente enviadas, alinhamento dos dois caminhos, limites de inferência, separação da fonte e tratamento de campos ausentes. Não medem qualidade clínica de respostas reais do Gemini. Mudanças de modelo ou prompt requerem avaliação profissional com casos fictícios representativos antes do uso; testes locais não garantem ausência de alucinações.
