// Audio playback management

export function fadeOutBgMusic(targetVolume = 0.05, duration = 2000) {
  const bgMusic = document.getElementById("bg-music");
  if (!bgMusic) return;
  const startVolume = bgMusic.volume;
  const steps = 30;
  const stepTime = duration / steps;
  let currentStep = 0;
  const volumeStep = (startVolume - targetVolume) / steps;
  const fadeInterval = setInterval(() => {
    currentStep++;
    bgMusic.volume = Math.max(
      targetVolume,
      startVolume - volumeStep * currentStep
    );
    if (currentStep >= steps) {
      bgMusic.volume = targetVolume;
      clearInterval(fadeInterval);
    }
  }, stepTime);
}

export function playEvolutionSound() {
  const audio1 = document.getElementById("evolution-sound");
  const audio2 = document.getElementById("evolve_effect_2");

  if (audio1) {
    audio1.currentTime = 0;
    audio1.volume = 0.3;
    audio1
      .play()
      .then(() => {
        console.log("✅ Evolution sound 1 started.");
      })
      .catch((err) => {
        console.error("❌ Evolution sound 1 failed:", err);
      });
  }

  if (audio2) {
    setTimeout(() => {
      audio2.currentTime = 0;
      audio2.volume = 0.3;
      audio2
        .play()
        .then(() => {
          console.log("✅ Evolution sound 2 started.");
        })
        .catch((err) => {
          console.error("❌ Evolution sound 2 failed:", err);
        });
    }, 700);
  }
}

export function playSound(soundId, volume = 0.3) {
  const audio = document.getElementById(soundId);
  if (audio) {
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch((err) => {
      console.error(`❌ Sound ${soundId} failed:`, err);
    });
  }
}
