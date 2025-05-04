import { google } from 'googleapis';
import * as readline from 'readline';

// Configura tu cliente OAuth2
const oauth2Client = new google.auth.OAuth2(
    'YOUR_CLIENT_ID', // Sustituye con tu Client ID
    'YOUR_CLIENT_SECRET', // Sustituye con tu Client Secret
    'YOUR_REDIRECT_URI' // El URI de redirección, por ejemplo, 'http://localhost:3000'
);

// Crea el URL de autorización para que el usuario inicie sesión
const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.readonly'], // Permiso solo de lectura para Google Drive
});

// Solicita al usuario que autorice el acceso
console.log('Authorize this app by visiting this url:', authUrl);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the code from that page here: ', async (code) => {
    try {
        // Cambia el código de autorización por un token de acceso
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        console.log('Successfully authenticated!');

        // Ahora que tienes acceso, puedes hacer peticiones a la API de Google Drive
        listFiles(oauth2Client);
    } catch (error) {
        console.error('Error while exchanging code for tokens', error);
    }
    rl.close();
});

// Función para listar archivos en Google Drive
async function listFiles(auth: any) {
    const drive = google.drive({ version: 'v3', auth });

    try {
        const res = await drive.files.list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name)',
        });
        const files = res.data.files;
        if (files.length) {
            console.log('Files:');
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
    } catch (error) {
        console.error('The API returned an error: ' + error);
    }
}
