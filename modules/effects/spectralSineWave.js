// Spectral Sine Wave Background Animation (modularized)
export function drawSpectralSineWave() {
  const canvas = document.getElementById("spectralSineWaveBg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  // Set canvas size to fill window (clientWidth already excludes scrollbar)
  canvas.width = document.documentElement.clientWidth;
  canvas.height = window.innerHeight;
  const w = canvas.width;
  const h = canvas.height;
  const yCenter = h * 0.5;
  const offset1 = h * 0.0; // First line above center
  const offset2 = h * 0.2; // Second line at center
  const offset3 = h * 0.011; // Third line below center
  const now = Date.now() / 1000;
  const speed1 = now * 100; // Smooth continuous movement right
  const speed2 = -now * 100; // Smooth continuous movement left
  const speed3 = now * -100; // Third line moving right
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 6;

  // Create repeating gradient pattern for continuous flow
  const gradientWidth = w * 0.4;
  const repeatCount = Math.ceil(w / gradientWidth) + 2;

  const spectralColors = [
    "#ff00ccb9",
    "#8e00ff",
    "#3333ff",
    "#00bfff",
    "#00fff7",
    "#03eda3",
    "#00ff00",
    "#66ff00", // Add intermediate yellow-green
    "#aaff00",
    "#ddff00", // Add intermediate yellow
    "#ffff00",
    "#ffcc00", // Add intermediate orange-yellow
    "#ff8800d9",
    "#ff5500", // Add intermediate red-orange
    "#ff3300",
    "#ff0000",
    "#ff00bfbc",
  ];

  // First line - moving right with smooth repeating gradient
  ctx.save();
  ctx.filter = "blur(3px)";
  for (let i = -1; i < repeatCount; i++) {
    const offsetX =
      ((speed1 + i * gradientWidth) % (w + gradientWidth * 2)) - gradientWidth;
    const grad1 = ctx.createLinearGradient(
      offsetX,
      yCenter - offset1,
      offsetX + gradientWidth,
      yCenter - offset1
    );

    // Create smoother color distribution with more gradient stops
    const colorCount = spectralColors.length;
    for (let c = 0; c < colorCount; c++) {
      const position = c / (colorCount - 1);
      grad1.addColorStop(position, spectralColors[c]);
    }

    ctx.strokeStyle = grad1;
    ctx.beginPath();
    ctx.moveTo(Math.max(0, offsetX), yCenter - offset1);
    ctx.lineTo(Math.min(w, offsetX + gradientWidth), yCenter - offset1);
    ctx.shadowColor = "#4397f89c";
    ctx.shadowBlur = 20;
    ctx.stroke();
  }
  ctx.restore();

  // Second line - moving left with smooth repeating gradient
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 3;
  ctx.filter = "blur(1px)";
  for (let i = -1; i < repeatCount; i++) {
    const offsetX =
      ((speed2 + i * gradientWidth) % (w + gradientWidth * 2)) - gradientWidth;
    const grad2 = ctx.createLinearGradient(
      offsetX,
      yCenter + offset2,
      offsetX + gradientWidth,
      yCenter + offset2
    );

    // Create smoother color distribution
    const colorCount = spectralColors.length;
    for (let c = 0; c < colorCount; c++) {
      const position = c / (colorCount - 1);
      grad2.addColorStop(position, spectralColors[c]);
    }

    ctx.strokeStyle = grad2;
    ctx.beginPath();
    ctx.moveTo(Math.max(0, offsetX), yCenter + offset2);
    ctx.lineTo(Math.min(w, offsetX + gradientWidth), yCenter + offset2);
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 20;
    ctx.stroke();
  }
  ctx.restore();

  // Third line - moving right with smooth repeating gradient
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 3;
  ctx.filter = "blur(3px)";
  for (let i = -1; i < repeatCount; i++) {
    const offsetX =
      ((speed3 + i * gradientWidth) % (w + gradientWidth * 2)) - gradientWidth;
    const grad3 = ctx.createLinearGradient(
      offsetX,
      yCenter + offset3,
      offsetX + gradientWidth,
      yCenter + offset3
    );

    // Create smoother color distribution
    const colorCount = spectralColors.length;
    for (let c = 0; c < colorCount; c++) {
      const position = c / (colorCount - 1);
      grad3.addColorStop(position, spectralColors[c]);
    }

    ctx.strokeStyle = grad3;
    ctx.beginPath();
    ctx.moveTo(Math.max(4, offsetX), yCenter + offset3);
    ctx.lineTo(Math.min(w, offsetX + gradientWidth), yCenter + offset3);
    ctx.shadowColor = "#fff";
   
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
  requestAnimationFrame(drawSpectralSineWave);
}
