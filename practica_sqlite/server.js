// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json()); // Permite recibir JSON
app.use(express.static('public')); // Sirve los archivos estáticos de la carpeta "public"

// 1. Inicializar la base de datos SQLite
const db = new sqlite3.Database('./scores.db', (err) => {
    if (err) {
        console.error("ERROR SQLITE:", err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Crear la tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL
)`, (err) => {
    if (err) {
        console.error("ERROR AL CREAR TABLA:", err.message);
    } else {
        console.log("Tabla scores lista.");
    }
});

// 2. Ruta para guardar el puntaje
app.post('/api/save-score', (req, res) => {
    const { name, score } = req.body;

    console.log("Datos recibidos:", name, score);

    if (!name || score === undefined) {
        return res.status(400).json({
            error: "Faltan datos: nombre o puntaje."
        });
    }

    const sql = `INSERT INTO scores (name, score) VALUES (?, ?)`;

    db.run(sql, [name, score], function(err) {
        if (err) {
            console.error("ERROR SQLITE:", err.message);

            return res.status(400).json({
                error: err.message
            });
        }

        console.log("Puntaje guardado:", name, score);

        res.json({
            message: "Puntaje guardado exitosamente",
            id: this.lastID
        });
    });
});

// 3. Ruta para consultar los 3 mejores puntajes
app.get('/api/top-score', (req, res) => {

    const sql = `
        SELECT name, score
        FROM scores
        WHERE score >= 0
        ORDER BY score DESC
        LIMIT 3
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {
            console.error("ERROR AL CONSULTAR:", err.message);
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});