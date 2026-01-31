/**
 * Pet Chat Module
 * Handles updating the pet's chat/message display
 */

export function updatePetChat(message) {
  const petChat = document.getElementById("petChat");
  if (petChat) {
    petChat.textContent = message;
  }
}
