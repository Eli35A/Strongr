import app from './app';
import connectDB from './config/db';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

connectDB().then(() => {
    if (process.env.NODE_ENV === 'production') {
        const privateKeyPath = path.join(process.cwd(), 'certs', 'client-key.pem');
        const certificatePath = path.join(process.cwd(), 'certs', 'client-cert.pem');

        try {
            const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
            const certificate = fs.readFileSync(certificatePath, 'utf8');
            const credentials = { key: privateKey, cert: certificate };

            https.createServer(credentials, app).listen(HTTPS_PORT, () => {
                console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
            });
        } catch (error) {
            console.error("Failed to start HTTPS server. Ensure 'client-key.pem' and 'client-cert.pem' exist in the backend/certs directory.", error);
            process.exit(1);
        }
    } else {
        http.createServer(app).listen(PORT, () => {
            console.log(`HTTP Server running on port ${PORT}`);
        });
    }
});
