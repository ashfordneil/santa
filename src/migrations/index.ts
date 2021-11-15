import Database from 'better-sqlite3';

import InitialTables from './InitialTables.sql';

let lazyConn: Database.Database | null = null;
const MIGRATION_SCRIPTS: string[] = [
  InitialTables
];

export const getDb = (): Database.Database => {
  if (lazyConn === null) {
    const db = new Database('neils-database.db');
    const [ { user_version: version }]: [{ user_version: number }] = db.pragma('user_version');
    const toApply = MIGRATION_SCRIPTS.slice(version);
    toApply.forEach((migration, i) => {
      console.log(`Applying migration ${i}`);
      db.exec(migration);
    });

    if (toApply.length === 0) {
      console.log('No migrations necessary');
    }

    lazyConn = db;
  }

  return lazyConn;
};