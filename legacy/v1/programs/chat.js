import { createWindow } from '../script.js';
let chatSimulationInterval;
window.initChat = function() {
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