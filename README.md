# Private Notes

A bare-bones Electron app for writing password-protected notes and organizing them into a flexible folder structure.

This is is a personal project to solve an immediate problem for me: migrating from Apple's Keychain Access app to something cross-platform, local-only and a bit more feature-rich.

### Features:

 * Notes are searchable
 * Notes are organized into folders
 * Password are independent from your system password
 * The password is required only once: when you open the app
 * Notes can be exported in their encrypted form in a single archive and reimported later
 * You can change the password at any time

### Known issues / coming changes:

 * You can't rename folders directly
 * The window should probably de-authenticate after ~10 minutes of inactivity
 * When you open a note, you should have to unlock it to start editing it, or the editor should look less like a text area
 * Probably, whenever you open the app or change folders, the "top" note should automatically appear (rather than loading showing nothing)

## Installing

You need git and node/npm installed. I'm not using yarn here because I haven't migrated to it yet myself. But of course yarn is installed with Electron, so there's no reason I can't get this working with yarn, I think. Steps to install are:

    $ git clone git@github.com:scriptfoundry/private-notes.git
    $ cd private-notes
    $ npm install

(Or you can download the repo as a ZIP file, unpack it and run `npm install` from there.)

### Development:

This does not require CRA, Electron or node-sass to be installed globally -- in fact, I recommend that you avoid doing this as a general rule. All dependencies will be installed locally and can be invoked via `package.json`'s custom scripts without any changes to your system's settings. 

One downside to the way I've set things up is that, during development, you must manually start create-react-app's dev server and once the dev-server is running, you can to start up Electron. If you just start Electron, **you'll see a blank screen.** There are ways to start both simultaneously from a single command, but I find that kind of pointlessly complex. And this way you get both live-reloading in CRA and in Electron. Take a look at the `scripts` in `package.json` for more details.

If you want to edit the main electron file, it is located in `public/`.

These are the steps to get things running for development.

 1. In one window, run create-react-app's dev-server
 2. In another window, start up Electron
 3. Optionally, you can also edit the Sass files in a third window

#### Window 1 (runs create-react-app dev-server)

    $ npm run start

#### Window 2 (runs electron in dev mode)

    $ npm run electron

#### Window 3 (Optional -- for editing SCSS files)

    $ npm run css:watch

### Publishing

    $ npm run css           # compile the scss to css
    $ npm run build         # compile the create-react-app binary
    $ npm run electron:dist # compile the Mac/Win executable

## A note about cryptography and security

I'm not a crypto programmer and because I'm not foolhardy enough to "roll my own", the AES-GCM implementation here was lifted without any substantive change from MDN's reference page on `SubtleCrypto.encrypt()` found [here](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt). This version uses AES-GCM cipher suite with the recommended 96-bit initialization vector. The [WebCrypto API](https://www.w3.org/TR/WebCryptoAPI/#SubtleCrypto-method-encrypt) is fairly straight-forward and I think their implementation is technically correct, but as I just said, I am not a crypto programmer, so use this code at your own risk.

The output of `crypto.subtle.encrypt()` is an `ArrayBuffer`, which could be stored in `indexedDB`, but I've elected to serialize it into a binary string and then convert it to Base64 string for plain-text storage in nearly any kind of store. The initialization vector array is likewise serialized and converted to Base64. AES-GCM uses an initialization vector that is generated randomly on every pass to ensure that even if the same message is encrypted using the same password, the IV and ciphertext will always be different. I've made sure to do that here.

If YOU are a crypto programmer and see any issues with the WebCrypto implementation found here (in `/src/services/Crypto.js`), please log an issue or submit a pull request.

And if you want to use this for your own private notes, I cannot over-emphasize this: please do so at your own risk.

## A note about storage

I'm using [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB), though you will see that in much earlier commits I was using WebSQL with SQLite. In my opinion, IndexedDB is an awful, awful API and WebSQL is almost infinitely superior, easier and more fun to use. Sadly, WebSQL is basically deprecated on most platforms. It is currently supported on Chromium, but I see no reason for it not to be deprecated there either at some point in the future. There are native implementations for Electron that get around this but I am not confident that they will continue to be maintained if WebSQL is eventually, inevitably removed from all platforms. It is fairly simple though to introduce any other storage engine: just write your own module that implements `init`, `notesExist`, `getNotes`, `getNoteById`, `deleteNoteById`, `updateNote`, `createNote`, `exportNotes`, `importNotes`, `updatePassword`, and `search`. Consult the JSDocs for more interface information.
