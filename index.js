const axios = require('axios');
const fs = require('fs');
const { google } = require('googleapis');

const credentials = JSON.parse(fs.readFileSync('C:\Program Files\nodejs\node_modules\npm\credentials.json', 'utf8'));

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

async function downloadImage(url, fileName) {
    const response = await axios({
        url,
        responseType: 'stream',
    });

    response.data.pipe(fs.createWriteStream(fileName));

    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            resolve();
        });

        response.data.on('error', (err) => {
            reject(err);
        });
    });
}

async function readSheet() {
    const spreadsheetId = 12dkYpc21pAbPJGVUz8X2QnRiExpxzrSVZn94fRNwY2U
    const range = 'Sheet1!A1:A1';  // Assuming column B contains image URLs

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values;
        if (rows.length) {
            console.log('Downloading images from the sheet...');
            for (const row of rows) {
                const [name, imageUrl] = row;
                console.log(`Downloading image for ${name}: ${imageUrl}`);
                await downloadImage(imageUrl, `${name}.jpg`);
            }
            console.log('All images downloaded.');
        } else {
            console.log('No data found.');
        }
    } catch (err) {
        console.error('Error reading the Google Sheet:', err);
    }
}

readSheet();
