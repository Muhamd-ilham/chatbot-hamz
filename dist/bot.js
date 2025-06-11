//Chatbot by Ilhamz

function bloggerGemini({ elementContainer, config }) {
  const apiKey = config.apiKey;
  const container = document.querySelector(elementContainer);
  if (!container) return;

  container.innerHTML = `
   <div class="chat-footer">
  <input id="input" placeholder="Tulis pesan..." rows="1">
  </input>
  
<button class="sendBtn" onclick="sendMessage()" aria-label="Kirim Pesan">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M20.235 5.686c.432-1.195-.726-2.353-1.921-1.92L3.709 9.048c-1.199.434-1.344 2.07-.241 2.709l4.662 2.699l4.163-4.163a1 1 0 0 1 1.414 1.414L9.544 15.87l2.7 4.662c.638 1.103 2.274.957 2.708-.241z"></path></g></svg>
  </button>
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
