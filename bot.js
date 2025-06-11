function bloggerGemini({ elementContainer, config }) {
  const apiKey = config.apiKey;
  const container = document.querySelector(elementContainer);
  if (!container) return;

  container.innerHTML = `
    <div class="chat-wrapper">
      <div id="chatbox" class="chatbox"></div>
      <div class="input-area">
        <input id="input" type="text" placeholder="Tulis pesan..." />
        <button id="sendBtn">Kirim</button>
      </div>
    </div>
  `;

  const chatbox = container.querySelector('#chatbox');
  const input = container.querySelector('#input');
  const sendBtn = container.querySelector('#sendBtn');

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  function appendTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing';
    typingDiv.id = 'typing-indicator';

    typingDiv.innerHTML = `
      <svg class="spinner" width="24" height="24" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" stroke="#4b4b4b">
        <g fill="none" stroke-width="4">
          <circle cx="22" cy="22" r="20" stroke-opacity="0.2"/>
          <path d="M42 22c0-11.046-8.954-20-20-20">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 22 22"
              to="360 22 22"
              dur="1s"
              repeatCount="indefinite"/>
          </path>
        </g>
      </svg>
    `;

    chatbox.appendChild(typingDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  function removeTypingIndicator() {
    const typingDiv = chatbox.querySelector('#typing-indicator');
    if (typingDiv) typingDiv.remove();
  }

  function typeText(text, element) {
    let i = 0;
    const speed = 20;
    function typing() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typing, speed);
      }
    }
    typing();
  }

  function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.className = 'message ' + sender;
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;

    if (sender === 'bot') {
      typeText(text, div);
    } else {
      div.textContent = text;
    }
  }

  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    input.value = '';
    appendTypingIndicator();

    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }]
          })
        }
      );

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, tidak ada balasan.';
      removeTypingIndicator();
      appendMessage(reply, 'bot');
    } catch (err) {
      removeTypingIndicator();
      appendMessage('Terjadi kesalahan saat menghubungi API.', 'bot');
      console.error(err);
    }
  }
}
