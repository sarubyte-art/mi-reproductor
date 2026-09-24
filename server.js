const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});

app.use(express.static(__dirname));

app.get('/api/canciones', (req, res) => {
  const cancionesFolder = path.join(__dirname, 'canciones');

  fs.readdir(cancionesFolder, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer la carpeta canciones' });
    }

    const mp3Files = files.filter(file => file.toLowerCase().endsWith('.mp3'));

    const songs = mp3Files.map(file => ({
      title: file.replace(/\.[^/.]+$/, ""),
      artist: 'Biblioteca Local',
      src: `/canciones/${encodeURI(file)}`
    }));

    res.json(songs);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});