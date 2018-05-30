const { app, BrowserWindow, Menu, dialog } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const url = require('url');

const browserWindowSettings = {
    backgroundColor: '#eeeeee',
    icon: path.join(__dirname, 'assets/icons/png/1024x1024.png'),
    minWidth: 800,
    minHeight: 600
};

let pageUrl;
if (isDev) {
    pageUrl = url.format({
        hostname: 'localhost',
        pathname: '/',
        port: '3000',
        protocol: 'http',
        slashes: true
    });
} else {
    pageUrl = url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        protocol: 'file'
    });
}

const createWindow = () => {
    const win = new BrowserWindow({
        ...browserWindowSettings
    });

    let platformMenu = [];

    if (process.platform === 'darwin') {
        platformMenu = [{
            label: app.getName(),
            submenu: [
                { label: `About ${app.getName()}`,
                    click: () => {
                        dialog.showMessageBox({
                            type: 'info',
                            message: app.getName(),
                            detail: `Version ${app.getVersion()}`,
                            buttons: ['Close']
                        });
                    }
                },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }];
    }

    let template = [
        ...platformMenu,
        {
            label: 'File',
            submenu: [
                {
                    label: 'Export encrypted notes',
                    click: () => win.webContents.send('export')
                },
                {
                    label: 'Import encrypted notes',
                    click: () => win.webContents.send('import')
                },
                { type: 'separator' },
                {
                    label: 'Change password',
                    click: () => win.webContents.send('change-password')
                },
                { type: 'separator' },
                {
                    label: 'Logout',
                    click: () => win.webContents.send('logout')
                },
            ]
        },
        {
            label: 'Edit',
            role: 'editMenu'
        },
        {
            label: 'View',
            role: 'windowMenu',
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    win.loadURL(pageUrl);
};

app.on('ready', createWindow);
app.on('window-all-closed', app.quit);
