import Dexie from 'dexie';

const db = new Dexie('naidoc');

db.version(1).stores({
  documents: 'id,templateId,name,creationDate,modificationDate',
  templates: 'id,name,creationDate,modificationDate'
});

export default db;