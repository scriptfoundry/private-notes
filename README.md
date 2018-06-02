## Private Notes

A bare-bones Electron app for writing password-protected notes and organizing them into a flexible folder structure.

This is is a personal project to solve an immediate problem for me: migrating from Apple's Keychain Access app to something cross-platform, local-only and a bit more feature-rich.

Features:

 * All notes are searchable
 * Notes are organized into folders
 * Password is not connected to your system password
 * Asks for password only once when the app starts
 * You can change the password at any time
 * Notes can be exported in their encrypted form in a single archive and reimported later

Known issues:

 * You can't rename folders directly
 * The window should probably de-authenticate after ~10 minutes of inactivity
 * When you open a note, you should have to unlock it to start editing it
 * Probably, whenever you open the app or change folders, the "top" note should automatically appear (rather than loading showing nothing)

### A note about cryptography and security

I'm not a crypto programmer and because I'm not foolhardy enough to "roll my own", the AES-GCM implementation here was lifted without any substantive change from MDN's reference page on `SubtleCrypto.encrypt()` found [here](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt). This version uses AES-GCM cipher suite with the recommended 96-bit initialization vector. The [WebCrypto API](https://www.w3.org/TR/WebCryptoAPI/#SubtleCrypto-method-encrypt) is fairly straight-forward and I think their implementation is technically correct, but as I just said, I am not a crypto programmer, so use this code at your own risk.

The output of `crypto.subtle.encrypt()` is an `ArrayBuffer`, which could be stored in `indexedDB`, but I've elected to serialize it into a binary string and then convert it to Base64 string for plain-text storage in nearly any kind of store. The initialization vector array is likewise serialized and converted to Base64. AES-GCM uses an initialization vector that is generated randomly on every pass to ensure that even if the same message is encrypted using the same password, the IV and ciphertext will always be different. I've made sure to do that here.

If YOU are a crypto programmer and see any issues with the WebCrypto implementation found here (in `/src/services/Crypto.js`), please log an issue or submit a pull request.

And if you want to use this for your own private notes, I cannot over-emphasize this: please do so at your own risk.

### A note about storage

I'm using [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB), though you will see that in much earlier commits I was using WebSQL with SQLite. In my opinion, IndexedDB is an awful, awful API and WebSQL is almost infinitely superior, easier and more fun to use. Sadly, WebSQL is basically deprecated on most platforms. It is currently supported on Chromium, but I see no reason for it not to be deprecated there either at some point in the future. There are native implementations for Electron that get around this but I am not confident that they will continue to be maintained if WebSQL is eventually, inevitably removed from all platforms. It is fairly simple though to introduce any other storage engine: just write your own module that implements `init`, `notesExist`, `getNotes`, `getNoteById`, `deleteNoteById`, `updateNote`, `createNote`, `exportNotes`, `importNotes`, `updatePassword`, and `search`. Consult the JSDocs for more interface information.
