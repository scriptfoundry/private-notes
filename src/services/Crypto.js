import { delay } from './Utils';

export const ERR_COULD_NOT_DECRYPT = 'Could not decrypt.';
export const TEST_STRING = `09dcX@phAy,U"Cv-h{oqX;.dKyj.q9y-*e-;m,1ok@:_]0CZ/HbbU;ul#'jO/yMoBl.]SB!giHVqLLOpduf6FY/5beMro`; // eslint-disable-line

const digest = async (text) => {
    const pwUtf8 = new TextEncoder().encode(text);
    return await crypto.subtle.digest('SHA-256', pwUtf8);
};

const ab2str = buffer => {
    let bytes = new Uint8Array(buffer).reduce((str, byte) => str + String.fromCharCode(byte), '');
    return window.btoa(bytes);
};
const str2ab = str => {
    const raw = window.atob(str);
    return new Uint8Array(raw.length).map((char, index) => raw.charCodeAt(index));
};

export const encryptText = async (textIn, password) => {
    const inUtf8 = new TextEncoder().encode(textIn);
    const pwHash = await digest(password);

    const rawIv = crypto.getRandomValues(new Uint8Array(12));
    const alg = { name: 'AES-GCM', iv: rawIv };

    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);
    const encBuffer = await crypto.subtle.encrypt(alg, key, inUtf8);

    const plainText = ab2str(encBuffer); //btoa(String.fromCharCode(...new Uint8Array(encBuffer)));
    const iv = ab2str(rawIv);

    return { iv, plainText };
};

export const decryptText = async (input, iv, password, delayTime=500) => {
    const ctBuffer = str2ab(input);
    const pwHash = await digest(password);

    const alg = { name: 'AES-GCM', iv: str2ab(iv) };
    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);
    let ptBuffer;

    try {
        ptBuffer = await crypto.subtle.decrypt(alg, key, ctBuffer);
    } catch (err) {
        await delay(delayTime);
        throw new Error(ERR_COULD_NOT_DECRYPT);
    }
    const plainText = new TextDecoder().decode(ptBuffer);

    return { plainText };
};

export const test = async (input, iv, password, expected) => {
    try {
        const { plainText } = await decryptText(input, iv, password);

        if (plainText === expected){
            return { success: true };
        }
        return { success: false, error: 'Message decryption successful, but returned value does not match expected value' };
    } catch (err) {
        return { success: false, error: 'Invalid or incorrect password'};
    }
};