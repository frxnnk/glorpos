import { createWindow } from '../script.js';
window.openMusic = function() {
    const musicContent = `
      <div style="padding: 20px; height: calc(100% - 40px); display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(45deg, #1DB954, #191414);">
        <h2 style="color: white; margin-bottom: 20px;">GlorpCat Music</h2>
        <iframe 
          style="border-radius:12px" 
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DX5trt9i14X7j?utm_source=generator" 
          width="100%" 
          height="352" 
          frameBorder="0" 
          allowfullscreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy">
        </iframe>
        <div style="margin-top: 20px; color: white; text-align: center;">
          <p>🎵 Powered by Spotify</p>
          <p>Listen to the best glorping tunes!</p>
        </div>
      </div>
    `;
    createWindow('Music Player', musicContent, '400px', '600px');
  };