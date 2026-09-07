// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json()); // Permite recibir JSON
app.use(express.static('public')); // Sirve los archivos estáticos de la carpeta "public"

// 1. Inicializar la base de datos SQLite
const db = new sqlite3.Database('./scores.db', (err) => {
    if (err) console.error(err.message);
    console.log('Conectado a la base de datos SQLite.');
});

// Crear la tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL
)`);

// 2. Ruta para guardar el puntaje
app.post('/api/save-score', (req, res) => {
    const { name, score } = req.body;

    const sql = `INSERT INTO scores (name, score) VALUES (?, ?)`;
    db.run(sql, [name, score], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: "Puntaje guardado exitosamente", id: this.lastID });
    });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});