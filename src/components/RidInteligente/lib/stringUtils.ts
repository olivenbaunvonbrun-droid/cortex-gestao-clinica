export const sanitizeAnalysis = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\$\\rightarrow\$/g, ' → ')
    .replace(/\$\\leftarrow\$/g, ' ← ')
    .replace(/\$\\leftrightarrow\$/g, ' ↔ ')
    .replace(/\$/g, ''); // Remove remaining $ signs if they look like markers
};
