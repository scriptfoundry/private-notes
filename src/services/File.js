const { readFile, writeFile } = window.require('fs');
const { dialog } = window.require('electron').remote;
const TYPE_SAVE = 'file/type-save';
const TYPE_LOAD = 'file/type-load';
export const ERR_NO_FILE_SELECTED = 'No file or folder was selected';
export const ERR_INVALID_FILE = 'File selected is not a valid archive';

export const getUrl = (type=TYPE_LOAD) => new Promise(resolve => {
    let dialogMethod = type === TYPE_SAVE ? dialog.showSaveDialog : dialog.showOpenDialog;

    dialogMethod({
        defaultPath: 'privatenotesarchive.txt',
        showsTagField: false,
        filters: [
            { extensions: ['txt'], name: 'txt'}
        ]
    }, filename => resolve(filename));

}
);
export const save = (payload) => new Promise(async (resolve, reject) => {
    try {
        let url = await getUrl(TYPE_SAVE);
        if (url === undefined) resolve();
        writeFile(url, JSON.stringify(payload), err => {
            if (!err) return resolve();
            throw err;
        });
    } catch (err) {
        reject(err);
    }

});
export const load = () => new Promise(async (resolve, reject) => {
    let urls = await getUrl(TYPE_LOAD);
    if (!urls) return reject(new Error(ERR_NO_FILE_SELECTED));
    readFile(urls[0], (err, archive) => {
        if (err) return reject();
        try {
            let data = JSON.parse(archive.toString());
            resolve(data);
        } catch (err) {
            if (err.constructor === SyntaxError) return reject(new Error(ERR_INVALID_FILE));
            reject(new Error('An error occured'));
        }
    });
});
