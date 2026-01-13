import { google } from 'googleapis';

export const getGoogleSheets = async () => {
    try {
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!clientEmail || !privateKey) {
            throw new Error('Missing Google Service Account Credentials');
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const client = await auth.getClient();
        return google.sheets({ version: 'v4', auth: client as any });
    } catch (error: any) {
        console.error('Google Auth Setup Error:', error);
        if (error.response) {
            console.error('API Error Details:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
};
