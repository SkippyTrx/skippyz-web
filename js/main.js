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

