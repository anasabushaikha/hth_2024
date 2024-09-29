// Mouse inversion
let inverted = false;
let invertTimeout;

function invertMouse() {
  if (inverted) return; // Avoid multiple inversions

  inverted = true;
  document.addEventListener('mousemove', invertMouseMove);

  // Set a timeout to revert after 10 seconds
  invertTimeout = setTimeout(() => {
    document.removeEventListener('mousemove', invertMouseMove);
    inverted = false;
  }, 10000);
}

function invertMouseMove(event) {
  // Calculate the inverted mouse coordinates
  const invertedX = window.innerWidth - event.clientX;
  const invertedY = window.innerHeight - event.clientY;

  // Move mouse to the inverted position
  moveMouseTo(invertedX, invertedY);
}

function moveMouseTo(x, y) {
  // This part visually simulates the mouse inversion,
  // For a more complex solution, a custom cursor or UI component could follow the inverted position.
  // But you can't directly control the system's mouse position via JS due to browser security.
  console.log(`Mouse inverted to: ${x}, ${y}`);
}

// To trigger inversion (for example, when a task is failed):
invertMouse();

// Colour monochrome dull colour for 10 seconds
function applyMonochrome(duration) {
  // Apply grayscale filter to the timetable/calendar element
  const timeline = document.getElementById('timeline');
  if (timeline) {
    timeline.style.filter = 'grayscale(100%)';

    // Remove the filter after the specified duration (in milliseconds)
    setTimeout(() => {
      timeline.style.filter = 'none';
    }, duration);
  }
}

// To trigger the monochrome effect for 10 seconds (10000 milliseconds)
// applyMonochrome(10000);

// Random punishment function
export function applyRandomPunishment() {
  const punishments = [
    { func: invertMouse, name: 'mouse inversion' },
    { func: () => applyMonochrome(10000), name: 'monochrome effect' }
  ];

  const randomIndex = Math.floor(Math.random() * punishments.length);
  const selectedPunishment = punishments[randomIndex];

  selectedPunishment.func();
  alert(`You are given the "${selectedPunishment.name}" punishment for not successfully completing this event/task. Do better next time.`);
}

// To trigger a random punishment
// applyRandomPunishment();