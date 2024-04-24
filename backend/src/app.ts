import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'ws';
import { WebSocket } from 'ws';
import { RowDataPacket } from 'mysql2';

const app = express();
const port = process.env.PORT || 1535;

const server = createServer(app);
const wss = new Server({ server });

app.use(cors());

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database!');

    const createTableSql = `
        CREATE TABLE IF NOT EXISTS oce (
            id INT AUTO_INCREMENT PRIMARY KEY,
            uid VARCHAR(255) NOT NULL,
            data LONGTEXT NOT NULL
        )
    `;

    db.query(createTableSql, function(err, results, fields) {
        if (err) throw err;
        console.log('Table created!');

        const alterTableSql = `
            ALTER TABLE oce ADD UNIQUE (uid);
        `;

        db.query(alterTableSql, function(err, results, fields) {
            if (err) throw err;
            console.log('Table altered!');
        });
    });
});

app.get('/v1/:uid', (req, res) => {
    const uid = req.params.uid;

    const sql = 'SELECT data FROM oce WHERE uid = ?';
    db.query(sql, [uid], (err, results: RowDataPacket[]) => {
        if (err) throw err;

        if (Array.isArray(results) && results.length > 0) {
            res.json(JSON.parse(results[0].data));
        } else {
            res.status(404).send('User not found');
        }
    });
});

wss.on('connection', (ws, req) => {
    const uid = req.url?.split('/')[2];
    console.log(`Request URL: ${req.url}, Extracted UID: ${uid}`);

    const sendData = () => {
        const sql = 'SELECT data FROM oce WHERE uid = ?';
        db.query(sql, [uid], (err, results: RowDataPacket[]) => {
            if (err) {
                throw err;
            }

            if (Array.isArray(results) && results.length > 0) {
                ws.send(JSON.stringify(JSON.parse(results[0].data)));
            } else {
                ws.send('User not found');
            }
        });
    };

    const intervalId = setInterval(sendData, 1000);

    ws.on('close', () => {
        clearInterval(intervalId);
    });
});

server.listen(port, () => {
    console.log(`HTTP and WebSocket server running at http://localhost:${port}`);
});

// what are comments?