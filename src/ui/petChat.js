let _typewriterTimer = null;

export function updatePetChat(message) {
  const petChat = document.getElementById("petChat");
  if (!petChat) return;

  if (_typewriterTimer) {
    clearInterval(_typewriterTimer);
    _typewriterTimer = null;
  }

  petChat.textContent = "";
  let i = 0;
  _typewriterTimer = setInterval(() => {
    petChat.textContent += message[i];
    i++;
    if (i >= message.length) {
      clearInterval(_typewriterTimer);
      _typewriterTimer = null;
    }
  }, 40);
}
