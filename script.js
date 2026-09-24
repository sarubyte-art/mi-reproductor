const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const progress = document.getElementById('progress');
const playlist = document.getElementById('playlist');

let songs = [];
let songIndex = 0;

async function loadSongsFromBackend() {
  try {
    const res = await fetch('/api/canciones', {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!res.ok) throw new Error('Error en el servidor');
    
    songs = await res.json();

    if (songs.length > 0) {
      songIndex = 0;
      loadSong(songs[0]);
      renderPlaylist();
    } else {
      title.innerText = "Sin canciones";
      artist.innerText = "La carpeta 'canciones' está vacía";
    }
  } catch (err) {
    console.error("Error al conectar con la API:", err);
    title.innerText = "Error de conexión";
    artist.innerText = "No se pudo cargar la lista de reproducción";
  }
}

function loadSong(song) {
  if (!song) {
    title.innerText = "Sin canciones";
    artist.innerText = "Agrega archivos MP3 a /canciones";
    return;
  }
  title.innerText = song.title;
  artist.innerText = song.artist;
  audio.src = song.src;
}

function playSong() {
  if (!audio.src) return;
  audio.play()
    .then(() => { playBtn.innerText = '⏸'; })
    .catch(() => { playBtn.innerText = '▶'; });
}

function pauseSong() {
  audio.pause();
  playBtn.innerText = '▶';
}

function renderPlaylist() {
  playlist.innerHTML = '';
  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.innerText = `${index + 1}. ${song.title}`;
    if (index === songIndex) li.classList.add('active');

    li.addEventListener('click', () => {
      songIndex = index;
      loadSong(songs[songIndex]);
      playSong();
      updatePlaylistUI();

      // Desplaza la vista suavemente hacia la parte superior del reproductor
      document.querySelector('.player-container').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    });

    playlist.appendChild(li);
  });
}

function updatePlaylistUI() {
  const items = playlist.querySelectorAll('li');
  items.forEach((item, index) => {
    if (index === songIndex) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

playBtn.addEventListener('click', () => {
  if (!audio.src) return;
  if (audio.paused) playSong();
  else pauseSong();
});

prevBtn.addEventListener('click', () => {
  if (songs.length === 0) return;
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  loadSong(songs[songIndex]);
  playSong();
  updatePlaylistUI();
});

nextBtn.addEventListener('click', () => {
  if (songs.length === 0) return;
  songIndex = (songIndex + 1) % songs.length;
  loadSong(songs[songIndex]);
  playSong();
  updatePlaylistUI();
});

audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    progress.value = (audio.currentTime / audio.duration) * 100;
  }
});

progress.addEventListener('input', () => {
  if (audio.duration) {
    audio.currentTime = (progress.value / 100) * audio.duration;
  }
});

audio.addEventListener('ended', () => {
  if (songs.length === 0) return;
  songIndex = (songIndex + 1) % songs.length;
  loadSong(songs[songIndex]);
  playSong();
  updatePlaylistUI();
});

// Cargar la lista al abrir la app
loadSongsFromBackend();