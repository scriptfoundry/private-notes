import { memoize } from './Utils';
import { decryptText, encryptText } from './Crypto';

export const ERR_CANNOT_CREATE_TABLES = 'Cannot create tables';
export const ERR_CANNOT_CREATE_NOTE = 'Cannot create note';
export const ERR_CANNOT_GET_NOTE = 'Cannot retrieve note';
export const ERR_CANNOT_UPDATE_NOTE = 'Cannot update note';
export const ERR_CANNOT_DELETE_NOTE = 'Cannot delete note';
export const ERR_NO_RECORD_FOUND = 'Query found no matching record';

let _db = null;

const decryptValue = memoize(async (input, iv, password) => {
    const {plainText} = await decryptText(input, iv, password, 0);
    return plainText;
}, 100);

const query = (statement, params=[], db=_db) => new Promise((resolve, reject) => db.transaction(tx => {
    tx.executeSql(statement, params, (tx, result) => {
        let rowsAffected = typeof result.rowsAffected === 'number' ? result.rowsAffected : null;
        let rows = result.rows ? result.rows : null;

        resolve({rowsAffected, rows, result});
    },
    (tx, err) => {
        console.log(err); // eslint-disable-line no-console
        reject(err);
    });
}));

const queryOne = async (...args) => {
    let { rows } = await query(...args);

    if (rows && rows.length > 0) return rows.item(0);

    throw new Error(ERR_CANNOT_GET_NOTE);
};
const insertOne = async (...args) => {
    let { rowsAffected, rows, result } = await query(...args);
    let insertId = result.insertId;

    return { rowsAffected, rows, insertId };
};

export const init = async () => {
    _db = openDatabase('Notes', '1.0', 'Notes DB', 2 * 1024 * 1024);
    // await query('DROP TABLE notes');
    await createTables();
    // setTimeout(() => query('DROP TABLE notes'), 4000);
    // throw new Error("NO")
};

export const createTables = async () => {
    try {
        // await query('DROP TABLE IF EXISTS notes;');
        await query(`
            CREATE TABLE IF NOT EXISTS notes(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                folder VARCHAR(255),
                folder_iv VARCHAR(12),
                name VARCHAR(255),
                name_iv VARCHAR(12),
                content TEXT,
                content_iv VARCHAR(12),
                version INTEGER,
                created INTEGER,
                updated INTEGER
            )
        `);
    } catch (err) {
        throw new Error(ERR_CANNOT_CREATE_TABLES);
    }
};

export const notesExist = async () => {
    const {noteCount} = await queryOne('SELECT count(id) AS noteCount FROM notes');
    return noteCount > 0;
};

export const getNotes = async (password) => {
    const {rows} = await query('SELECT * FROM notes');
    const notes = [];
    for (let i = 0; i < rows.length; i++) {
        let { id, folder, folder_iv, name, name_iv, updated, created } = rows.item(i);

        folder = await decryptValue(folder, folder_iv, password);
        name = await decryptValue(name, name_iv, password);

        notes.push({ id, folder, name, created, updated });
    }
    return notes;
};


export const getNoteById = async (sought, password) => {
    try {
        let { id, folder, folder_iv, name, name_iv, content, content_iv, version, created, updated } = await queryOne('SELECT * FROM notes WHERE id = ?', [sought]);
        folder = await decryptValue(folder, folder_iv, password);
        name = await decryptValue(name, name_iv, password);
        content = await decryptValue(content, content_iv, password);

        return { id, folder, name, content, version, created, updated };
    } catch (err) {
        console.log(err); // eslint-disable-line no-console
        throw new Error(ERR_CANNOT_GET_NOTE);
    }
};

export const deleteNoteById = async (id) => {
    try {
        let { rowsAffected } = await query('DELETE FROM notes WHERE id=?', [id]);
        if (rowsAffected !== 1) throw new Error(ERR_CANNOT_DELETE_NOTE);
    } catch (err) {
        throw new Error(ERR_CANNOT_DELETE_NOTE);
    }
};

export const updateNote = async ({ id, folder, name, content }, password) => {
    await getNoteById(id, password); // confirm that the password works -- this will throw otherwise

    let folder_iv, name_iv, content_iv;

    ({ plainText: folder, iv: folder_iv } = await encryptText(folder, password));
    ({ plainText: name, iv: name_iv } = await encryptText(name, password));
    ({ plainText: content, iv: content_iv } = await encryptText(content, password));
    let updated = Date.now();

    let { rowsAffected } = await query(
        'UPDATE notes SET folder=?, folder_iv=?, name=?, name_iv=?, content=?, content_iv=?, updated=?, version=version + 1 WHERE id =?',
        [folder, folder_iv, name, name_iv, content, content_iv, updated, id]
    );

    if (rowsAffected !== 1) throw new Error(ERR_CANNOT_UPDATE_NOTE);
};

export const createNote = async ({ name, folder, content }, password) => {
    let folder_iv, name_iv, content_iv;

    ({ plainText: folder, iv: folder_iv } = await encryptText(folder, password));
    ({ plainText: name, iv: name_iv } = await encryptText(name, password));
    ({ plainText: content, iv: content_iv } = await encryptText(content, password));
    let created = Date.now();

    let result = await insertOne(
        'INSERT INTO notes (folder, folder_iv, name, name_iv, content, content_iv, created, version) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
        [folder, folder_iv, name, name_iv, content, content_iv, created]
    );

    let { insertId } = result;
    if ( !insertId ) throw new Error(ERR_CANNOT_CREATE_NOTE);

    return insertId;
};
