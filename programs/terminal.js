import { createWindow } from '../script.js';
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