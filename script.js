// Initialize score
let score = 0;
const scoreCounter = document.querySelector('.score-counter');

// Function to create a star
function createStar() {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.left = `${Math.random() * 100}vw`; // Random horizontal position
    star.style.top = `${Math.random() * 100}vh`; // Random vertical position
    star.style.animationDuration = `${Math.random() * 2 + 1}s`; // Random animation speed
    document.querySelector('.star-background').appendChild(star);
  
    // Remove the star after it finishes its animation
    setTimeout(() => {
      star.remove();
    }, 3000); // Adjust the timeout to match the animation duration
  }
  
  // Generate stars continuously
  function generateStars() {
    setInterval(createStar, 100); // Adjust the interval for more/less stars
  }
  
  // Start generating stars
  generateStars();

// Function to create a shooting star
function createShootingStar() {
    const shootingStar = document.createElement('div');
    shootingStar.classList.add('shooting-star');
  
    // Randomize starting position (top-left corner)
    shootingStar.style.left = `${Math.random() * 100}vw`;
    shootingStar.style.top = `${Math.random() * 100}vh`;
  
    // Randomize animation duration (slower)
    shootingStar.style.animationDuration = `${Math.random() * 5 + 3}s`;
  
    // Add the shooting star to the background
    document.querySelector('.star-background').appendChild(shootingStar);
  
    // Remove the shooting star after it finishes its animation
    setTimeout(() => {
      shootingStar.remove();
    }, 8000); // Adjust the timeout to match the animation duration
  }
  
  // Generate shooting stars at random intervals (less frequent)
  function generateShootingStars() {
    setInterval(createShootingStar, Math.random() * 10000 + 5000); // Adjust the interval for more/less shooting stars
  }
  
  // Start generating shooting stars
  generateShootingStars();

// Track fallen letters
let fallenLetters = 0;
const totalLetters = 6; // Total number of letters in the cube

// Add event listeners to cube faces
document.querySelectorAll('.face').forEach(face => {
    face.addEventListener('click', () => {
        if (!face.classList.contains('fall')) {
            face.classList.add('fall');
            fallenLetters++;

            // Increment the score
            score++;
            scoreCounter.textContent = `Score: ${score}`;

            // Check if all letters have fallen
            if (fallenLetters === totalLetters) {
                setTimeout(() => {
                    document.querySelectorAll('.face').forEach(face => {
                        face.classList.remove('fall');
                        face.classList.add('fly-back');

                        // Remove the fly-back class after the animation completes
                        setTimeout(() => {
                            face.classList.remove('fly-back');
                        }, 1000); // Match the duration of the fly-back animation
                    });
                    fallenLetters = 0; // Reset the counter
                }, 1000); // Wait for the last letter to finish falling
            }
        }
    });
});