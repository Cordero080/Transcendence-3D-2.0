




window.addEventListener('scroll', function() {
  const scrolled = window.pageYOffset;
  document.getElementById('pet-parent').style.transform = `translateY(${scrolled * 0.3}px)`;
});


window.addEventListener("DOMContentLoaded", function () {
  const bgMusic = document.getElementById("bg-music");
  if (!bgMusic) return;

  function tryPlayMusic() {
    bgMusic.play().catch(() => {
      // Autoplay blocked, play on first user interaction
      const playOnUserAction = () => {
        bgMusic.play();
        window.removeEventListener("click", playOnUserAction);
        window.removeEventListener("keydown", playOnUserAction);
      };
      window.addEventListener("click", playOnUserAction);
      window.addEventListener("keydown", playOnUserAction);
      console.log(
        "Autoplay was blocked by browser. Click or press any key to start music."
      );
    });
  }

  tryPlayMusic();

  // Resume music when unmuted
  bgMusic.addEventListener("volumechange", function () {
    if (!bgMusic.muted && bgMusic.paused) {
      bgMusic.play();
    }
  });

  // Resume music when page regains focus
  window.addEventListener("focus", function () {
    if (!bgMusic.muted && bgMusic.paused) {
      bgMusic.play();
    }
  });
});
