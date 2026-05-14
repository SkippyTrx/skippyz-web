const canvas = document.getElementById("stars");

const ctx = canvas.getContext("2d");

let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

/* RESIZE */

window.addEventListener("resize", () => {

  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;

  createStars();
});

/* STARS */

const STAR_COUNT = 240;

let stars = [];

function createStars() {

  stars = [];

  for (let i = 0; i < STAR_COUNT; i++) {

    stars.push({

      x: Math.random() * w,
      y: Math.random() * h,

      radius: 0.7 + Math.random() * 1.3,

      alpha: 0.4 + Math.random() * 0.4,

      speed: 0.02 + Math.random() * 0.08,

      drift: (Math.random() - 0.5) * 0.15
    });
  }
}

createStars();

/* DRAW */

function drawStars() {

  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  stars.forEach((star) => {

    star.y += star.speed;
    star.x += star.drift;

    if (star.y > h) {

      star.y = 0;
      star.x = Math.random() * w;
    }

    /* TWINKLE */

    star.alpha += (Math.random() - 0.5) * 0.02;

    if (star.alpha < 0.05) star.alpha = 0.05;
    if (star.alpha > 0.6) star.alpha = 0.6;

    ctx.beginPath();

    ctx.arc(
      star.x,
      star.y,
      star.radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;

    ctx.shadowBlur = 8;
    ctx.shadowColor = "white";

    ctx.fill();
  });

  requestAnimationFrame(drawStars);
}

drawStars();

const letterNodes = Array.from(document.querySelectorAll('.letter'));

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function triggerDistortion() {
  if (!letterNodes.length) {
    setTimeout(triggerDistortion, 2500);
    return;
  }

  const selected = letterNodes[randomInt(0, letterNodes.length - 1)];

  // Randomize distortion filter
  const jitterFilter = document.getElementById('jitter');
  if (jitterFilter) {
    const turbulence = jitterFilter.querySelector('feTurbulence');
    const displacement = jitterFilter.querySelector('feDisplacementMap');
    if (turbulence && displacement) {
      const randBase = 0.03 + Math.random() * 0.05;
      const randScale = 12 + Math.random() * 12;
      turbulence.setAttribute('baseFrequency', randBase);
      displacement.setAttribute('scale', randScale);
    }
  }

  selected.classList.add('volatile');

  setTimeout(() => {
    selected.classList.remove('volatile');
  }, 1000 + Math.random() * 2000); // Last 1-3 seconds

  setTimeout(triggerDistortion, 2000 + Math.random() * 3000); // Every 2-5 seconds
}

function triggerFlicker() {
  if (!letterNodes.length) {
    setTimeout(triggerFlicker, 1000);
    return;
  }

  const selected = letterNodes[randomInt(0, letterNodes.length - 1)];

  selected.classList.add('flicker');

  const handler = () => {
    selected.classList.remove('flicker');
    selected.removeEventListener('animationend', handler);
  };

  selected.addEventListener('animationend', handler);

  setTimeout(triggerFlicker, 500 + Math.random() * 1000); // Every 0.5-1.5 seconds
}

setTimeout(triggerDistortion, 1000 + Math.random() * 2000);
setTimeout(triggerFlicker, 200 + Math.random() * 500);
