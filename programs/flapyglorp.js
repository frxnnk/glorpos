import { createWindow } from '../script.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import firebaseConfig from '../firebaseConfig.js';
window.isScoreSaved = false;

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

async function getTopScores() {
    const scoresRef = collection(db, "scores"); 
    const q = query(scoresRef, orderBy("score", "desc"), limit(3));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      score: Number(doc.data().score) // Asegurar que 'score' es un número
    }));
  }

async function saveScore(score, playerName) {
    const topScores = await getTopScores();
    if (topScores.length < 3 || score > topScores[topScores.length - 1].score) {
        await addDoc(collection(db, "scores"), {
            score: score,
            playerName: playerName,
            date: new Date().toISOString()
        });
        return true;
    }
    return false;
}

async function updateLeaderboardDisplay() {
    try {
        const topScores = await getTopScores();
        const leaderboardElement = document.querySelector('.game-leaderboard');
        if (leaderboardElement) {
            leaderboardElement.innerHTML = `
                <h3>Top 3 Global Scores</h3>
                <div class="leaderboard-list">
                    ${topScores.map((entry, index) => `
                        <div class="leaderboard-item ${index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}">
                            <span class="rank">#${index + 1}</span>
                            <span class="name">${entry.playerName}</span>
                            <span class="score">${entry.score}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error("Error updating leaderboard:", error);
    }
}

window.openGame = function() {
    const gameContent = `
        <div class="game-container">
            <div class="game-leaderboard">
                <h3>Loading scores...</h3>
            </div>
            <canvas id="gameCanvas"></canvas>
        </div>
    `;
    
    const gameWindow = createWindow('Glorpy Bird', gameContent, '800px', '600px');
    updateLeaderboardDisplay();
    const canvas = gameWindow.querySelector('#gameCanvas');
    
    // Base canvas resolution
    canvas.width = 800;
    canvas.height = 600;
    
    const resizeGame = () => {
        const container = canvas.parentElement;
        const isMaximized = gameWindow.classList.contains('maximized');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate optimal scale while maintaining aspect ratio
        const scaleX = containerWidth / canvas.width;
        const scaleY = containerHeight / canvas.height;
        const scale = Math.min(scaleX, scaleY);
        
        // Apply scaled dimensions
        canvas.style.width = `${canvas.width * scale}px`;
        canvas.style.height = `${canvas.height * scale}px`;
    };
    
    // Watch for container size changes
    const resizeObserver = new ResizeObserver(resizeGame);
    resizeObserver.observe(canvas.parentElement);
    
    // Handle maximize/restore
    const originalToggleMaximize = window.toggleMaximize;
    window.toggleMaximize = (windowId) => {
        originalToggleMaximize(windowId);
        if (windowId === gameWindow.id) {
            setTimeout(resizeGame, 0);
        }
    };
    
    initGame(canvas);
};

// Modify game over function
async function gameOverFunct(finalScore) {
    try {
        if (window.isScoreSaved) return;

        const topScores = await getTopScores();
        console.log('Current top scores:', topScores);
        console.log('New score:', finalScore);

        const isTopScore = topScores.length < 3 || finalScore > Math.min(...topScores.map(s => s.score));
        console.log('Is top score:', isTopScore);

        if (isTopScore) {
            const playerName = prompt(`¡Felicidades! Has alcanzado el Top 3 con ${finalScore} puntos.\nIngresa tu nombre:`);

            if (playerName) {
                const saved = await saveScore(finalScore, playerName);
                if (saved) {
                    console.log('Puntaje guardado exitosamente');
                    await updateLeaderboardDisplay();
                    window.isScoreSaved = true; // Marcar como guardado antes de resetear
                    resetGame();
                    return; // Salir para prevenir manejos posteriores
                }
            }
        }

        window.isScoreSaved = true; // Marcar como guardado incluso si no es top score

    } catch (error) {
        console.error("Error al manejar el final del juego:", error);
        window.isScoreSaved = true;
    }

    // Agregar manejadores por defecto si no es top score
    gameCanvas.onclick = () => { // Reemplazar 'canvas' con 'gameCanvas'
        console.log('Restarting game...');
        resetGame();
        gameLoop();
    };
    gameCanvas.ontouchstart = (e) => { // Reemplazar 'canvas' con 'gameCanvas'
        e.preventDefault();
        console.log('Restarting game...');
        resetGame();
        gameLoop();
    };
}

    function initGame(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Store high scores in localStorage instead of WebSocket
    function updateHighScores() {
        const scores = JSON.parse(localStorage.getItem('glorpy-bird-scores')) || {};
        const sortedScores = Object.entries(scores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        const scoresList = document.getElementById('scores-list');
        if(scoresList) {
            scoresList.innerHTML = sortedScores
                .map(([name, score], i) => `<div>${i+1}. ${name}: ${score}</div>`)
                .join('');
        }
    }
    
    // Update scores when game ends 
    function submitScore(finalScore) {
        const scores = JSON.parse(localStorage.getItem('glorpy-bird-scores')) || {};
        const username = 'Player'; // Could make this configurable
        
        // Only update if it's player's best score
        if(!scores[username] || finalScore > scores[username]) {
            scores[username] = finalScore;
            localStorage.setItem('glorpy-bird-scores', JSON.stringify(scores));
        }
        updateHighScores();
    }


    const glorpImage = new Image();
    glorpImage.src = 'https://raw.githubusercontent.com/frxnnk/glorpos/refs/heads/main/assets/glorphead.png';

    // Initialize high scores
    updateHighScores();

    const bird = {
      x: canvas.width / 3,
      y: canvas.height / 2,
      velocity: 0,
      gravity: 0.2,  // Reduced gravity
      jump: -5,      // Reduced jump force
      size: 40       // Increased size
    };

    const pipes = [];
    let score = 0;
    let gameOver = false;
    let gameSpeed = 1.5; // Reduced speed
    
    // Handle multiple input methods
    function jump() {
      if (!gameOver) {
        bird.velocity = bird.jump;
      }
    }

    canvas.addEventListener('click', jump);
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent default touch behavior
      jump();
    }, { passive: false }); // Add passive: false to ensure preventDefault works

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') jump();
    });

    function createPipe() {
      const gap = 180; // Increased gap
      const pipeWidth = 60; // Wider pipes
      const minHeight = 50;
      const maxHeight = canvas.height - gap - minHeight;
      const height = Math.random() * (maxHeight - minHeight) + minHeight;

      pipes.push({
        x: canvas.width,
        top: height - canvas.height,
        bottom: height + gap,
        width: pipeWidth,
        counted: false
      });
    }

    async function gameLoop() {
      if (!canvas.isConnected) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#4DC1F9');
      gradient.addColorStop(1, '#87CEEB');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bird with trail effect
      ctx.save();
      ctx.translate(bird.x + bird.size/2, bird.y + bird.size/2);
      ctx.rotate(bird.velocity * 0.02);
      
      // Draw trail
      if (!gameOver) {
        ctx.globalAlpha = 0.3;
        ctx.drawImage(glorpImage, -bird.size/2 - 10, -bird.size/2, bird.size, bird.size);
        ctx.globalAlpha = 0.2;
        ctx.drawImage(glorpImage, -bird.size/2 - 20, -bird.size/2, bird.size, bird.size);
      }
      
      ctx.globalAlpha = 1;
      ctx.drawImage(glorpImage, -bird.size/2, -bird.size/2, bird.size, bird.size);
      ctx.restore();

      if (!gameOver) {
        
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
          createPipe();
        }

        pipes.forEach((pipe, index) => {
          pipe.x -= gameSpeed;

          // Draw pipes with gradient
          const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
          pipeGradient.addColorStop(0, '#75C043');
          pipeGradient.addColorStop(1, '#4CAF50');
          
          ctx.fillStyle = pipeGradient;
          ctx.fillRect(pipe.x, 0, pipe.width, pipe.top + canvas.height);
          ctx.fillRect(pipe.x, pipe.bottom, pipe.width, canvas.height);

          // Add pipe borders
          ctx.strokeStyle = '#558B2F';
          ctx.lineWidth = 2;
          ctx.strokeRect(pipe.x, 0, pipe.width, pipe.top + canvas.height);
          ctx.strokeRect(pipe.x, pipe.bottom, pipe.width, canvas.height);

          // Collision with more forgiving hitbox
          if (bird.x + bird.size * 0.8 > pipe.x && 
              bird.x + bird.size * 0.2 < pipe.x + pipe.width &&
              (bird.y + bird.size * 0.8 < pipe.top + canvas.height || 
               bird.y + bird.size * 0.2 > pipe.bottom)) {
            gameOver = true;
          }

          // Score counting
          if (!pipe.counted && bird.x > pipe.x + pipe.width) {
            score++;
            gameSpeed = Math.min(gameSpeed + 0.1, 3); // Gradually increase speed
            pipe.counted = true;
          }

          if (pipe.x + pipe.width < 0) pipes.splice(index, 1);
        });

        // Ground/ceiling collision
        if (bird.y + bird.size > canvas.height || bird.y < 0) {
          gameOver = true;
        }
      }

      // Score display
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText(`Score: ${score}`, canvas.width/2, 40);
      ctx.fillText(`Score: ${score}`, canvas.width/2, 40);

      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Arial';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 40);
        ctx.font = 'bold 30px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 10);
        ctx.font = '20px Arial';
        ctx.fillText('Tap to play again', canvas.width/2, canvas.height/2 + 50);
        // Submit score when game ends
        await gameOverFunct(score);
        
// Definir y asignar la función de reinicio
function restartGame() {
    console.log('Restarting game...');
    resetGame();
    gameLoop(); // Reiniciar el bucle del juego
}

canvas.onclick = restartGame;
canvas.ontouchstart = (e) => {
    e.preventDefault();
    restartGame();
};

return; // Salir del ciclo actual
}

requestAnimationFrame(gameLoop);
    }

    function resetGame() {
        if (!gameCanvas || !bird) return; // Guardar contra undefined
    
        window.isScoreSaved = false; // Restablecer al iniciar un nuevo juego
        bird.y = gameCanvas.height / 2;
        bird.velocity = 0;
        pipes.length = 0;
        score = 0;
        gameSpeed = 1.5;
        gameOver = false;
    
        // Restablecer manejadores de entrada
        gameCanvas.onclick = jump;
        gameCanvas.ontouchstart = (e) => {
            e.preventDefault();
            jump();
        };
    }
      

    glorpImage.onload = () => {
      gameLoop();
    };
  }