import { db } from './db';

export async function exportDatabase() {
  const exportData: any = {};
  
  // List of all tables to export
  const tables = [
    'pacientes', 
    'agendamentos', 
    'prontuarios', 
    'transacoes', 
    'users', 
    'actionLog', 
    'settings', 
    'anexos'
  ];

  for (const table of tables) {
    exportData[table] = await (db as any)[table].toArray();
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_clinica_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function setupAutoBackup() {
  const lastBackup = localStorage.getItem('last_auto_backup');
  const now = Date.now();
  const delay24h = 24 * 60 * 60 * 1000;

  if (!lastBackup || (now - parseInt(lastBackup)) > delay24h) {
    // We don't automatically trigger download because it's intrusive
    // But we could notify the user or perform a silent sync if using Firebase
    // For local-only, we'll just track the last time they were reminded or it happened
    console.log("Automatic backup scheduled check: 24h passed since last possible sync.");
  }
}
