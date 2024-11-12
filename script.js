function createWindow(title, content, width = '800px', height = '600px') {
  const windowId = 'window-' + Date.now();
  const newWindow = document.createElement('div');
  newWindow.className = 'window';
  newWindow.id = windowId;

  // Calculate dimensions based on viewport
  const maxWidth = window.innerWidth - 20;
  const maxHeight = window.innerHeight - 80;
  const requestedWidth = parseInt(width);
  const requestedHeight = parseInt(height);
  
  const finalWidth = Math.min(requestedWidth, maxWidth);
  const finalHeight = Math.min(requestedHeight, maxHeight);

  // Center the window
  const left = Math.max(10, (window.innerWidth - finalWidth) / 2);
  const top = Math.max(10, (window.innerHeight - finalHeight - 60) / 2);

  newWindow.style.width = finalWidth + 'px';
  newWindow.style.height = finalHeight + 'px';
  newWindow.style.top = top + 'px';
  newWindow.style.left = left + 'px';

  newWindow.innerHTML = `
    <div class="window-header ${title.toLowerCase() === 'terminal' ? 'terminal-header' : ''}">
      <span>${title}</span>
      <div class="window-controls">
        <button class="window-control maximize" onclick="toggleMaximize('${windowId}')" aria-label="Maximize">
          <svg width="12" height="12" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>
          </svg>
        </button>
        <button class="window-control minimize" onclick="minimizeWindow('${windowId}')" aria-label="Minimize">
          <svg width="12" height="12" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4 12h16v2H4z"/>
          </svg>
        </button>
        <button class="window-control close" onclick="closeWindow('${windowId}')" aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 24 24">
            <path fill="currentColor" d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
    ${content}
  `;

  const minimizeBtn = newWindow.querySelector('.window-control.minimize');
  if (minimizeBtn) {
    // Add touch event handling
    minimizeBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      minimizeWindow(windowId);
    });
  }

  document.querySelector('.desktop').appendChild(newWindow);
  makeDraggable(newWindow);
  addTaskbarItem(windowId, title);

  // Add event listeners for touch devices
  const closeButton = newWindow.querySelector('.window-control.close');
  closeButton.addEventListener('touchstart', (e) => {
    closeWindow(windowId);
    e.preventDefault();
  });

  return newWindow;
}

function addTaskbarItem(windowId, title) {
  const taskbarItem = document.createElement('div');
  taskbarItem.className = 'open-program-item';
  taskbarItem.textContent = title;
  taskbarItem.setAttribute('data-window', windowId);
  
  taskbarItem.onclick = () => {
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
      // Remove active class from all items
      document.querySelectorAll('.open-program-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Remove active class from all windows and lower their z-index
      document.querySelectorAll('.window').forEach(win => {
        win.style.zIndex = '1';
      });
      
      // Add active class to clicked item
      taskbarItem.classList.add('active');
      
      if (windowElement.classList.contains('minimized')) {
        maximizeWindow(windowId);
      }
      
      // Bring window to front
      windowElement.style.zIndex = '1000';
      windowElement.focus();
    }
  };
  
  document.querySelector('.taskbar-open-programs').appendChild(taskbarItem);
}

function makeDraggable(element) {
  let isDragging = false;
  let offsetX, offsetY;

  const header = element.querySelector('.window-header');

  // Mouse Events
  header.addEventListener('mousedown', (e) => {
    if (element.classList.contains('fullscreen')) return; // Disable dragging in fullscreen
    isDragging = true;
    offsetX = e.clientX - element.getBoundingClientRect().left;
    offsetY = e.clientY - element.getBoundingClientRect().top;
    element.classList.add('moving');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const desktopHeight = document.querySelector('.desktop').clientHeight;
    let left = e.clientX - offsetX;
    let top = e.clientY - offsetY;

    // Limits to prevent window from moving out of desktop bounds
    left = Math.max(0, Math.min(left, window.innerWidth - element.offsetWidth));
    top = Math.max(0, Math.min(top, desktopHeight - element.offsetHeight));

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    element.classList.remove('moving');
  });

  // Touch Events for Mobile
  header.addEventListener('touchstart', (e) => {
    if (element.classList.contains('fullscreen')) return; // Disable dragging in fullscreen
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - element.getBoundingClientRect().left;
    offsetY = touch.clientY - element.getBoundingClientRect().top;
    element.classList.add('moving');
    e.preventDefault();
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const desktopHeight = document.querySelector('.desktop').clientHeight;
    let left = touch.clientX - offsetX;
    let top = touch.clientY - offsetY;

    // Limits to prevent window from moving out of desktop bounds
    left = Math.max(0, Math.min(left, window.innerWidth - element.offsetWidth));
    top = Math.max(0, Math.min(top, desktopHeight - element.offsetHeight));

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }, { passive: false });

  document.addEventListener('touchend', () => {
    isDragging = false;
    element.classList.remove('moving');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const bootScreen = document.querySelector('.boot-screen');
  setTimeout(() => {
    bootScreen.style.opacity = 0;
    setTimeout(() => bootScreen.remove(), 500);
  }, 3000);

  let chatSimulationInterval;

  function updateClock() {
    const now = new Date();
    document.getElementById('clock').textContent = 
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  setInterval(updateClock, 1000);
  updateClock();

  window.minimizeWindow = function(windowId) {
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
      windowElement.classList.add('minimized');
      windowElement.style.display = 'none'; // Force hide on mobile
      
      // Update taskbar
      const taskbarItem = document.querySelector(`[data-window="${windowId}"]`);
      if (taskbarItem) {
        taskbarItem.classList.add('minimized');
        taskbarItem.classList.remove('active');
      }
    }
  };

  window.maximizeWindow = function(windowId) {
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
      windowElement.classList.remove('minimized');
      windowElement.style.display = 'block'; // Force show on mobile
      
      // Update taskbar
      const taskbarItem = document.querySelector(`[data-window="${windowId}"]`);
      if (taskbarItem) {
        taskbarItem.classList.remove('minimized');
        taskbarItem.classList.add('active');
      }
    }
  };

  window.toggleMaximize = function(windowId) {
    const windowElement = document.getElementById(windowId);
    windowElement.classList.toggle('fullscreen');
    
    // Ensure maximized window isn't resizable
    if (windowElement.classList.contains('fullscreen')) {
      windowElement.style.resize = 'none';
    } else {
      windowElement.style.resize = 'both';
    }
  };

  window.closeWindow = function(windowId) {
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
      if (windowElement.querySelector('.chat-window')) {
        clearInterval(chatSimulationInterval);
      }
      windowElement.remove();
      const taskbarItem = document.querySelector(`[data-window="${windowId}"]`);
      if (taskbarItem) {
        taskbarItem.remove();
      }
    }
  };

  window.openGenerator = function() {
    createWindow('Glorp Generator', '<iframe src="https://glorp-meme.netlify.app/" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>');
  };

  window.openHome = function() {
    createWindow('Web', '<iframe src="https://www.glorpcat.lol" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>');
  };

  window.openGlorpWallet = function() {
    createWindow('GlorpWallet', '<iframe src="https://jup.ag/swap/SOL-FkBF9u1upwEMUPxnXjcydxxVSxgr8f3k1YXbz7G7bmtA" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>');
  };

  window.openChart = function() {
    createWindow('Chart', '<iframe src="https://chart.glorpcat.lol" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>');
  };

  window.openMagicEden = function() {
    createWindow('Magic Eden', '<iframe src="https://magiceden.io/marketplace/glorp" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>');
  };

  window.openTerminal = function() {
    const terminalWindow = createWindow('Terminal', '', '600px', '400px');
    
    const terminalContent = `
      <div class="terminal">
        <div class="terminal-output">Welcome to GlorpCat Terminal v1.0
Type 'help' for a list of commands.</div>
        <div class="terminal-input-line">
          <span class="terminal-prompt">$</span>
          <input type="text" class="terminal-input" onkeypress="if(event.key === 'Enter') executeCommand(this)">
        </div>
        <button class="terminal-close-button" onclick="closeWindow('${terminalWindow.id}')" aria-label="Close Terminal">
          ✖️
        </button>
      </div>
    `;
    
    terminalWindow.innerHTML += terminalContent;
    
    // Enfocar el campo de entrada del terminal
    const input = terminalWindow.querySelector('.terminal-input');
    input.focus();

    window.executeCommand = function(input) {
      const command = input.value.trim().toLowerCase();
      const output = terminalWindow.querySelector('.terminal-output');
      
      const commands = {
        help: "Available commands:\n- help: Show this help\n- clear: Clear terminal\n- date: Show current date\n- whoami: Show current user\n- glorp: Show glorp info",
        clear: () => output.innerHTML = '',
        date: () => new Date().toLocaleString(),
        whoami: "glorpcat",
        glorp: "GLORP TO THE MOON! 🚀"
      };

      output.innerHTML += `\n$ ${command}`;
      
      if (command in commands) {
        const response = typeof commands[command] === 'function' ? 
          commands[command]() : 
          commands[command];
        if (response) output.innerHTML += `\n${response}`;
      } else if (command) {
        output.innerHTML += `\nCommand not found: ${command}`;
      }

      output.innerHTML += '\n';
      input.value = '';
      output.scrollTop = output.scrollHeight;
    };
  };

  window.openGame = function() {
    const gameContent = `
      <div id="game-container" style="width: 100%; height: calc(100% - 40px); background: #4DC1F9; overflow: hidden;">
        <canvas id="gameCanvas" style="width: 100%; height: 100%;"></canvas>
        <div id="highscores" style="position: absolute; top: 120px; right: 10px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 8px; color: white;">
          <h3 style="margin: 0 0 5px 0">High Scores</h3>
          <div id="scores-list"></div>
        </div>
      </div>
    `;
    const gameWindow = createWindow('Glorpy Bird', gameContent, '400px', '600px');
    
    // Initialize game after window creation
    setTimeout(() => {
      initGame(gameWindow.querySelector('#gameCanvas'));
    }, 100);
  };

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

    function gameLoop() {
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
        submitScore(score);
        
        canvas.onclick = resetGame;
        canvas.ontouchstart = (e) => {
          e.preventDefault();
          resetGame();
        };
      }

      requestAnimationFrame(gameLoop);
    }

    function resetGame() {
      bird.y = canvas.height / 2;
      bird.velocity = 0;
      pipes.length = 0;
      score = 0;
      gameSpeed = 1.5;
      gameOver = false;
      canvas.onclick = jump;
      canvas.ontouchstart = (e) => {
        e.preventDefault();
        jump();
      };
    }

    glorpImage.onload = () => {
      gameLoop();
    };
  }

  window.initChat = function() {
    const spamMessages = [
      "im glorping so hard rn",
      "GLOOOOORP",
      "glorp to the moon guys",
      "cmon guys dont sell",
      "jeeters out!",
      "holding my glorp forever", 
      "who's still glorping?",
      "cant stop glorping",
      "glorp is life",
      "imagine not glorping in 2024"
    ];
    
    function simulateSpam() {
      const messagesDiv = document.querySelector('.chat-messages');
      if (!messagesDiv) {
        clearInterval(chatSimulationInterval);
        return;
      }

      const messageContent = spamMessages[Math.floor(Math.random() * spamMessages.length)];
      displayMessage({
        type: 'text',
        content: messageContent,
        isSelf: false
      });
    }

    // Intervalo más frecuente para simular spam constante
    chatSimulationInterval = setInterval(simulateSpam, 3000);
  };

  window.sendMessage = function() {
    const input = document.querySelector('.chat-input input');
    const message = input.value.trim();
    if (message) {
      displayMessage({
        type: 'text',
        content: message,
        isSelf: true
      });
      input.value = '';
    }
  };

  function displayMessage(message) {
    const messagesDiv = document.querySelector('.chat-messages');
    if (!messagesDiv) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.isSelf ? 'sent' : 'received'}`;
    
    // Avatar using glorp image
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.style.background = `url('https://raw.githubusercontent.com/frxnnk/glorpos/refs/heads/main/assets/glorphead.png') center/cover`;
    avatar.style.width = '40px';
    avatar.style.height = '40px';

    // Message content
    const content = document.createElement('div');
    content.className = 'content';
    content.textContent = message.content;
    
    // Timestamp
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    const now = new Date();
    timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (message.isSelf) {
      messageEl.appendChild(content);
      messageEl.appendChild(avatar);
    } else {
      messageEl.appendChild(avatar);
      messageEl.appendChild(content);
    }
    messageEl.appendChild(timestamp);
    
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  const bootMessages = [
    "Initializing GlorpCat OS v1.0...",
    "Loading Glorp Modules...",
    "Calculating Glorp Trajectories...", 
    "Preparing Glorp Launch Sequence...",
    "Syncing with Glorp Network...",
    "Creating Glorp Systems...",
    "Starting GlorpCat Services...",
    "Welcome to GlorpCat OS!"
  ];

  function showBootMessages() {
    const messageDiv = document.getElementById('boot-messages');
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootMessages.length) {
        messageDiv.innerHTML = bootMessages[i];
        i++;
      } else {
        clearInterval(interval);
      }
    }, 400);
  }

  showBootMessages();
  window.setTheme('forest'); // Set forest theme as default
});

document.querySelectorAll('.window').forEach(makeDraggable);

window.toggleStartMenu = function() {
  const startMenu = document.querySelector('.start-menu');
  startMenu.classList.toggle('active');
  
  const closeMenu = (e) => {
    if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
      startMenu.classList.remove('active');
      document.removeEventListener('click', closeMenu);
    }
  }
  
  if (startMenu.classList.contains('active')) {
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 0);
  }
}

window.openChat = function() {
  const chatContent = `
    <div class="chat-window">
      <div class="chat-messages"></div>
      <div class="chat-input">
        <input type="text" placeholder="Type your message..." onkeypress="if(event.key === 'Enter') sendMessage()">
        <button onclick="sendMessage()">Send</button>
      </div>
    </div>
  `;
  const chatWindow = createWindow('GlorpChat', chatContent, '400px', '600px');
  initChat();
};

window.openHelp = function() {
  const helpContent = `
    <div class="help-content">
      <h2>GlorpCat OS Help</h2>
      <p>Created with 💚 by frxn</p>
      <a href="https://t.me/frxnco" target="_blank">
        <i>Visit Developer on Telegram</i>
      </a>
      <p style="margin-top: 20px;">Version 1.0</p>
      <p style="font-size: 0.9em; opacity: 0.7;">© 2024 GlorpCat OS</p>
    </div>
  `;
  createWindow('Help', helpContent, '400px', '300px');
};

window.lockSystem = function() {
  const lockScreen = document.createElement('div');
  lockScreen.className = 'lock-screen';
  lockScreen.innerHTML = `
    <div class="lock-content">
      <img src="https://raw.githubusercontent.com/frxnnk/glorpos/refs/heads/main/assets/glorphead.png" alt="GlorpCat Logo" class="lock-logo">
      <h2 style="margin-bottom: 20px;">GlorpCat OS</h2>
      <input type="password" placeholder="Enter password to unlock" class="lock-input" onkeypress="if(event.key === 'Enter') unlockSystem()">
      <button onclick="unlockSystem()" class="unlock-button">Unlock System</button>
      <p style="margin-top: 20px; font-size: 0.8em; opacity: 0.7;">Hint: The password is 'glorp'</p>
    </div>
  `;
  document.body.appendChild(lockScreen);
};

window.unlockSystem = function() {
  const password = document.querySelector('.lock-input').value;
  if(password === 'glorp') {
    document.querySelector('.lock-screen').remove();
  } else {
    alert('Incorrect password!');
  }
}

window.powerOff = function() {
  const powerScreen = document.createElement('div');
  powerScreen.className = 'power-screen';
  powerScreen.innerHTML = `
    <div class="power-content">
      <img src="https://raw.githubusercontent.com/frxnnk/glorpos/refs/heads/main/assets/glorphead.png" alt="GlorpCat Logo" class="power-logo">
      <div class="power-text">Shutting down GlorpCat OS...</div>
      <p style="margin: 20px 0;">Your system is now safe to turn off</p>
      <button onclick="location.reload()" class="power-button">Power On</button>
    </div>
  `;
  document.body.appendChild(powerScreen);

  // Add shutdown animation
  setTimeout(() => {
    document.body.style.transition = 'opacity 1s';
    document.body.style.opacity = '0';
  }, 1000);
};

window.openDonate = function() {
  const donateContent = `
    <div class="donate-content" style="
      padding: 30px;
      height: calc(100% - 60px);
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
    ">
      <img src="https://raw.githubusercontent.com/frxnnk/glorpos/refs/heads/main/assets/glorphead.png" alt="GlorpCat Logo" style="
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-bottom: 10px;
        box-shadow: 0 0 20px rgba(255,255,255,0.3);
        animation: pulse 2s infinite;
      ">
      
      <h2 style="
        font-size: 28px;
        margin: 0;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      ">Support GlorpCat OS</h2>
      
      <p style="
        font-size: 18px;
        opacity: 0.9;
        max-width: 80%;
        line-height: 1.5;
      ">Your donations help keep GlorpCat OS free and open for everyone! Help us continue developing new features and improvements.</p>
      
      <div style="
        background: rgba(255,255,255,0.1);
        padding: 20px;
        border-radius: 12px;
        backdrop-filter: blur(5px);
        width: 80%;
        margin: 20px 0;
      ">
        <h3 style="margin: 0 0 15px 0;">Donation Address</h3>
        <div style="
          background: rgba(0,0,0,0.2);
          padding: 15px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
          word-break: break-all;
        ">
          <p style="margin: 0 0 10px 0;">
            <strong style="color: #ffd700;">frxnDev.sol</strong>
          </p>
          <p style="margin: 0;">
            4g49ZPzQHVeQNzxnuBnTyH74iwqVvVzRvqYBjoWqbK5K
          </p>
        </div>
      </div>

      <div style="
        display: flex;
        gap: 15px;
        margin-top: 20px;
      ">
        <a href="https://t.me/frxnco" target="_blank" style="
          text-decoration: none;
          color: white;
          background: rgba(255,255,255,0.2);
          padding: 10px 20px;
          border-radius: 25px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        ">
          <span>💬</span> Contact Developer
        </a>
      </div>

      <p style="
        margin-top: 20px;
        font-size: 14px;
        opacity: 0.7;
      ">Thank you for supporting independent development! 🚀</p>
    </div>
  `;
  createWindow('Donate', donateContent, '500px', '700px');
};

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

window.openSettings = function() {
  const settingsContent = `
    <div class="settings-window">
      <div class="settings-section">
        <h2>Theme Settings</h2>
        <div class="color-themes">
          <div class="theme-option ${getCurrentTheme() === 'default' ? 'active' : ''}" onclick="setTheme('default')">
            <div class="theme-preview" style="background: linear-gradient(45deg, #ff69b4, #ffbd44)"></div>
            <span>Default</span>
          </div>
          <div class="theme-option ${getCurrentTheme() === 'dark' ? 'active' : ''}" onclick="setTheme('dark')">
            <div class="theme-preview" style="background: linear-gradient(45deg, #2c3e50, #3498db)"></div>
            <span>Dark</span>
          </div>
          <div class="theme-option ${getCurrentTheme() === 'forest' ? 'active' : ''}" onclick="setTheme('forest')">
            <div class="theme-preview" style="background: linear-gradient(45deg, #27ae60, #2ecc71)"></div>
            <span>Forest</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2>Display Settings</h2>
        <div class="settings-control">
          <label for="window-opacity">Window Opacity</label>
          <input type="range" id="window-opacity" class="settings-slider" min="0.5" max="1" step="0.1" value="${getWindowOpacity()}" 
            onchange="setWindowOpacity(this.value)">
        </div>
        <div class="settings-control">
          <label>
            <input type="checkbox" onchange="toggleBlur(this.checked)" ${isBlurEnabled() ? 'checked' : ''}>
            Enable Blur Effects
          </label>
        </div>
      </div>

      <div class="settings-section">
        <h2>Sound Settings</h2>
        <div class="settings-control">
          <label>
            <input type="checkbox" onchange="toggleSystemSounds(this.checked)" ${areSystemSoundsEnabled() ? 'checked' : ''}>
            Enable System Sounds
          </label>
        </div>
      </div>
    </div>
  `;
  
  const settingsWindow = createWindow('Settings', settingsContent, '400px', '600px');
  return settingsWindow;
};

// Add these helper functions
function getCurrentTheme() {
  // Get current theme from localStorage or default to 'forest'
  return localStorage.getItem('theme') || 'forest';
}

function getWindowOpacity() {
  return localStorage.getItem('windowOpacity') || 0.9;
}

function setWindowOpacity(value) {
  localStorage.setItem('windowOpacity', value);
  document.querySelectorAll('.window').forEach(window => {
    window.style.opacity = value;
  });
}

function isBlurEnabled() {
  return localStorage.getItem('blurEffects') !== 'false';
}

function toggleBlur(enabled) {
  localStorage.setItem('blurEffects', enabled);
  document.documentElement.style.setProperty('--blur-amount', enabled ? '10px' : '0px');
}

function areSystemSoundsEnabled() {
  return localStorage.getItem('systemSounds') !== 'false';
}

function toggleSystemSounds(enabled) {
  localStorage.setItem('systemSounds', enabled);
}

const themes = {
  default: {
    primary: '#ff69b4',
    primaryRGB: '255, 105, 180',
    secondary: '#ffbd44', 
    secondaryRGB: '255, 189, 68'
  },
  dark: {
    primary: '#2c3e50',
    primaryRGB: '44, 62, 80',
    secondary: '#3498db',
    secondaryRGB: '52, 152, 219'
  },
  forest: {
    primary: '#27ae60',
    primaryRGB: '39, 174, 96',
    secondary: '#2ecc71',
    secondaryRGB: '46, 204, 113'
  }
};
// Update setTheme to save the selection
window.setTheme = function(theme) {
  localStorage.setItem('theme', theme);
  const root = document.documentElement;
  root.style.setProperty('--primary', themes[theme].primary);
  root.style.setProperty('--primary-rgb', themes[theme].primaryRGB);
  root.style.setProperty('--secondary', themes[theme].secondary);
  root.style.setProperty('--secondary-rgb', themes[theme].secondaryRGB);

  // Update SVG icon colors
  const desktopIcons = document.querySelectorAll('.desktop-icon .icon-img rect');
  desktopIcons.forEach(icon => {
    icon.setAttribute('fill', themes[theme].primary);
  });
  
  // Update active state in settings window if open
  document.querySelectorAll('.theme-option').forEach(option => {
    option.classList.toggle('active', option.textContent.toLowerCase().includes(theme));
  });
}