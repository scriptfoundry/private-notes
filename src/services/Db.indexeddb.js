import { decryptText, encryptText, ERR_COULD_NOT_DECRYPT } from './Crypto';

export const ERR_CANNOT_CREATE_NOTE = 'Cannot create note';
export const ERR_CANNOT_GET_NOTE = 'Cannot retrieve note';
export const ERR_CANNOT_UPDATE_NOTE = 'Cannot update note';
export const ERR_CANNOT_DELETE_NOTE = 'Cannot delete note';
export const ERR_NO_RECORD_FOUND = 'Query found no matching record';
export const ERR_CANNOT_IMPORT = 'Cannot import notes';

const VERSION = 1;
let db = null;

const getStore = (readwrite) => {
    const tx = db.transaction(['notes'], readwrite ? 'readwrite' : 'readonly');
    return tx.objectStore(['notes']);
};
const encryptNote = async ({ name, folder, content }, password) => {
    let folder_iv, name_iv, content_iv;

    ({plainText: name, iv: name_iv} = await encryptText(name, password));
    ({plainText: folder, iv: folder_iv} = await encryptText(folder, password));
    ({plainText: content, iv: content_iv} = await encryptText(content, password));

    return { name, name_iv, folder, folder_iv, content, content_iv};
};
const decryptNote = async ({ name, name_iv, folder, folder_iv, content, content_iv }, password) => {
    ({ plainText:name } = await decryptText(name, name_iv, password, 0));
    ({ plainText:folder } = await decryptText(folder, folder_iv, password, 0));
    ({ plainText:content } = await decryptText(content, content_iv, password, 0));

    return { name, folder, content };
};

/**
 * Initializes database
 * Note that while `upgradeneeded` is implemented, it is only used for creating the database.
 * Any schema changes in the future must provide a complete upgrade implementation.
 *
 * @returns Promise that resolves when finished or rejects when an error is encountered.
 */
export const init = () => new Promise((resolve, reject) => {
    if (db !== null) return resolve();

    // indexedDB.deleteDatabase();
    const request = indexedDB.open('PrivateNotes', VERSION);

    request.addEventListener('success', ({ target: { result: _db }}) => {
        db = _db;
        resolve();
    });
    request.addEventListener('error', err => reject(err));
    request.addEventListener('upgradeneeded', ({target: {result: db}}) => {
        db.createObjectStore('notes', { autoIncrement: true });

    });
});

/**
 * Returns if notes exist at all
 * If no notes exist, then the app is considered "fresh" and a new password should be requested -- even if
 * a database exists and is merely empty.
 *
 * @returns Promise that resolves true if notes exist or false if no notes exist
 */
export const notesExist = () => new Promise((resolve) => getStore().getAll().onsuccess = ({ target: { result }}) => resolve(result && result.length > 0));

/**
 * Gets a list of the summary of all notes
 *
 * @param {string} password
 * @returns Promise that resolves with a list of each note's id, name, folder and creation/update timestamps
 */
export const getNotes = (password) => new Promise((resolve, reject) => {
    let results = [];

    getStore().openCursor().onsuccess = async ({ target: { result:cursor }}) => {
        try {
            if (cursor) {
                let { key, value } = cursor;
                results.push({ key, value });
                cursor.continue();
            } else {
                let notes = [];
                for (const { key, value } of results) {
                    let { updated, created, ...note } = value;
                    note = await decryptNote(note, password);
                    let { name, folder } = note;
                    notes.push({ id: key, name, folder, created, updated });
                }

                resolve(notes);
            }
        } catch (err) {
            reject(err);
        }
    };
});

/**
 * Get a note by its id
 * @param {number} id
 * @param {string} password
 * @returns Promise that resolves with the entire contents of a note by its id, or rejects if no note of that ID exists
 */
export const getNoteById = (id, password) => new Promise((resolve, reject) => {
    getStore().get(id).onsuccess = async ({ target: { result }}) => {
        try {
            if (!result) return reject(new Error(ERR_CANNOT_GET_NOTE));

            let { updated=null, created=null } = result;
            const note =  await decryptNote(result, password);
            resolve({...note, updated, created, id});
        } catch (err) {
            console.log(err); // eslint-disable-line no-console
            reject(new Error(ERR_CANNOT_GET_NOTE));
        }
    };
});

/**
 * Delete a note by its id
 * @param {number} id
 * @returns Promise that resolves when the note is deleted
 */
export const deleteNoteById = (id) => new Promise((resolve) => {
    getStore(true).delete(id).onsuccess = () => resolve();
});

/**
 * Update an existing note
 * @param {object} note
 * @param {string} password
 * @returns Promise that resolves when the note is updated, or rejects if an error was encountered
 */
export const updateNote = ({ id, folder, name, content }, password) => new Promise(async (resolve, reject) => {
    let currentNote = await getNoteById(id, password);
    let updatedNote = await encryptNote({ name, folder, content }, password);
    let updated = Date.now();

    let note = { ...currentNote, ...updatedNote, updated };

    let request = getStore(true).put(note, id);
    request.onsuccess = ({target: { result }}) => {
        if (result !== id) return reject(new Error(ERR_CANNOT_UPDATE_NOTE));
        resolve();
    };
    request.onerror = (err) => {
        console.error(err); // eslint-disable-line no-console
        reject(new Error(ERR_CANNOT_UPDATE_NOTE));
    };
    resolve(8);
});

/**
 * Creates a new note
 * @param {object} note
 * @param {string} password
 * @returns Promise that resolves the new note id, or rejects if there was an error
 */
export const createNote = ({ name, folder, content }, password) => new Promise(async (resolve, reject) => {
    let note = await encryptNote({ name, folder, content }, password);
    let created = Date.now();
    let updated = null;

    note = {...note, created, updated};

    const request = getStore(true).add(note);

    request.addEventListener('success', ({ target: { result:insertId }}) => {
        if ( !insertId ) throw new Error(ERR_CANNOT_CREATE_NOTE);

        resolve(insertId);
    });
    request.addEventListener('error', err => reject(err));
});

/**
 * Gets a verbatim list of all (encrypted) notes in the database
 * @returns Promise that resolves when the export list is complete
 */
export const exportNotes = () => new Promise(resolve => {
    let records = [];
    getStore().openCursor().onsuccess = ({ target: { result:cursor } }) => {
        if (cursor) {
            let { key, value } = cursor;
            records = [...records, {key, value}];
            cursor.continue();
        } else resolve(records);
    };
});

/**
 * Re-imports a list of verbatim notes
 * If any note in the archive cannot be decrypted, the user password may have changed. The user is
 * allowed the opportunity to exit early or continue and import the notes as is.
 * @param {object} notes
 * @param {string} password
 * @returns Promise that resolves when the import is complete or rejects if the process could not be
 * completed, either due to error or because the user exited early.
 */
export const importNotes = (notes, password) => new Promise(async (resolve, reject) => {
    if (!notes) return reject(new Error(ERR_CANNOT_IMPORT));

    let passwordWorks = true;
    for (let { value } of notes) {
        try {
            await decryptNote(value, password);
        } catch ({ message }) {
            if (message === ERR_COULD_NOT_DECRYPT) passwordWorks = false;
        }
    }
    if (!passwordWorks && !window.confirm('It looks like your current password will not work with this archive. Are you sure you want to continue?\n\nYou can cancel now or click "Ok" to continue.')) return;

    const clearDb = (tx, cb) => tx.clear().onsuccess = cb;
    const addNextRecord = (tx, records, cb) => {
        if (!records.length) return cb(passwordWorks);

        let [{ key, value }, ...remainingRecords] = records;

        tx.put(value, key).onsuccess = () => addNextRecord(tx, remainingRecords, cb);
    };
    const tx = getStore(true);

    clearDb(tx, () => addNextRecord(tx, notes, () => resolve()));
});

/**
 * Change the password used to encrypt every note
 * Because all notes require the same password, this must be done transactionally. Any failure here must
 * cause an early exit and a promise rejection
 * @param {string} password
 * @param {string} newPassword
 * @returns Promise that resolves when the process is complete or rejects if an error was encountered
 */
export const updatePassword = (password, newPassword) => new Promise(async (resolve, reject) => {
    const getRecords = () => new Promise(resolve => {
        let records = [];
        getStore().openCursor().onsuccess = ({ target: { result:cursor }}) => {
            if (cursor) {
                let { key, value } = cursor;
                records.push({ key, value });
                cursor.continue();
            }
            else resolve(records);
        };
    });
    const updateNotes = async records => {
        let notes = [];

        for (let { key, value } of records) {
            let note = await decryptNote(value, password);
            note = await encryptNote(note, newPassword);
            notes.push({ ...note, id: key });
        }

        return notes;
    };
    const updateAllNotes = notes => new Promise(resolve => {
        const tx = getStore(true);
        const processNext = notes => {
            let [note, ...remainingNotes] = notes;

            if (!note) return resolve();

            tx.put(note, note.id).onsuccess = processNext(remainingNotes);
        };
        processNext(notes);
    });

    try {
        let records = await getRecords();
        let notes = await updateNotes(records);
        await updateAllNotes(notes);

        resolve();
    } catch (err) {
        console.error(err); // eslint-disable-line no-console
        reject(err);
    }
});

/**
 * Search every note's name and contents for a string
 * @param {strint} needles
 * @param {boolean} exact
 * @param {string} password
 * @returns Promise that resolves with matching notes
 */
export const search = (needles, exact, password) => new Promise((resolve) => {
    let matches = [];

    if (needles.trim() === '') return resolve(null);

    needles = needles.trim().split(/\s+/).map(needle => {
        let pattern = exact ? `\\b${needle}\\b` : needle;
        return new RegExp(pattern, 'ig');
    }).filter(needle => needle !== '');

    if (needles.length === 0) return resolve(null);

    const scanKeys = (keys) => {
        let [key, ...remainingKeys] = keys;
        if (!key) return resolve(matches);

        getStore().get(key).onsuccess = async ({ target: { result }}) => {
            if (result) {
                let { name, folder, content } = await decryptNote(result, password);
                let haystack = name + ' ' + content;

                if (needles.some(needle => needle.test(haystack))) matches.push({ id: key, name, folder });
            }

            scanKeys(remainingKeys);
        };
    };

    getStore().getAllKeys().onsuccess = ({ target: { result }}) => scanKeys(result);
});