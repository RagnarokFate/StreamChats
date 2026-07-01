const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve('apps', 'local-server', 'streamchats.db');
const db = new Database(dbPath);

const count = db.prepare('SELECT COUNT(*) as c FROM events').get();
console.log('Total events in DB:', count.c);

const recent = db.prepare('SELECT * FROM events ORDER BY sequenceNumber DESC LIMIT 5').all();
console.log('Recent events:', JSON.stringify(recent, null, 2));
