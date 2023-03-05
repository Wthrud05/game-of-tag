// Create HTML Elements =========================

const wrapper = document.createElement('div');
wrapper.className = 'wrapper';

const container = document.createElement('div');
container.classList.add('container');

const gameControls = document.createElement('div');
gameControls.classList.add('game-controls');

const gameInfo = document.createElement('div');
gameInfo.classList.add('game-info');

const score = document.createElement('span');
score.textContent = `Moves: 0`;
score.classList.add('score');

const gameTime = document.createElement('span');
gameTime.textContent = `Time: 00:00`;
gameTime.classList.add('game-time');

const winText = document.createElement('span');
winText.classList.add('win-text');

const info = document.createElement('div');
info.textContent = 'The puzzle must be solved!';
info.className = 'save-info';

// Buttons =======================

const shuffleBtn = document.createElement('button');
shuffleBtn.className = 'game-controls-button';
shuffleBtn.textContent = 'Shuffle and start';

const stopBtn = document.createElement('button');
stopBtn.className = 'game-controls-button';
stopBtn.classList.add('stop');
stopBtn.textContent = 'Stop';

const saveBtn = document.createElement('button');
saveBtn.className = 'game-controls-button';
saveBtn.textContent = 'Save';

const resultsBtn = document.createElement('button');
resultsBtn.className = 'game-controls-button';
resultsBtn.textContent = 'Results';

const soundBtn = document.createElement('button');
soundBtn.className = 'sound-btn';

// Buttons =======================

// Modal ==========

const modalLayout = document.createElement('div');
modalLayout.className = 'modal-layout';

const modal = document.createElement('div');
modal.className = 'modal';

const closeModalBtn = document.createElement('button');
closeModalBtn.className = 'close-modal';
closeModalBtn.innerHTML = '&times;';

const modalHeader = document.createElement('h3');
modalHeader.textContent = 'Top 10 results';

const resultsUl = document.createElement('ul');
resultsUl.className = 'results-ul';

// Modal ==========

// Create HTML Elements =========================

// Audio for game ===============================

const puzzleSound = new Audio('./assets/move-sound.wav');
const buttonSound = new Audio('./assets/button-sound.wav');
const shuffleSound = new Audio('./assets/shuffle-sound.wav');

// Audio for game ===============================

// Variables =====================================

let countOfElements = 4;
let timer;
let timeout;
let isGameInProccess = true;
const voidSpace = 16;
let counter = 0;
let soundOn = true;
const time = {
  min: 0,
  sec: 0,
};
const maxShuffleCount = 50;
let shuffleTimer;
let shuffleCount = 0;
let blockedCoords = null;
let arrRes = [];

// Variables =====================================

// Append HTML Elements on page =================

document.body.append(wrapper);
wrapper.append(container);

wrapper.append(winText);

gameInfo.append(score, gameTime, soundBtn);
wrapper.prepend(gameInfo);

gameControls.append(shuffleBtn, stopBtn, saveBtn, resultsBtn, info);
wrapper.prepend(gameControls);

document.body.prepend(modalLayout);
modalLayout.append(modal);
modal.append(closeModalBtn, modalHeader, resultsUl);

// Append HTML Elements on page =================

// Modal functional ===================

resultsBtn.addEventListener('click', function () {
  openModal();
  get('res');
});

closeModalBtn.addEventListener('click', function () {
  closeModal();
  resultsUl.innerHTML = '';
});

modalLayout.addEventListener('click', function (e) {
  resultsUl.innerHTML = '';
  if (e.target !== modalLayout) return;
  else closeModal();
});

// Modal functional ===================

// Header Button functional ===========

saveBtn.addEventListener('click', function () {
  buttonSound.play();
  if (isUserWin(matrix)) {
    const data = pushRes(counter, { min: time.min, sec: time.sec });
    console.log(data);
    set('res', data);
  } else {
    if (info) {
      info.style.opacity = '1';
      timeout = setTimeout(() => (info.style.opacity = '0'), 3000);
    } else {
      clearTimeout(timeout);
    }
  }
});

soundBtn.addEventListener('click', function () {
  if (soundOn) {
    buttonSound.volume = 0;
    puzzleSound.volume = 0;
    shuffleSound.volume = 0;
    soundOn = false;
    soundBtn.style.backgroundImage = 'url(/assets/soundsOff.png)';
  } else {
    buttonSound.volume = 1;
    puzzleSound.volume = 1;
    shuffleSound.volume = 1;
    soundOn = true;
    soundBtn.style.backgroundImage = 'url(/assets/soundsOn.png)';
  }
});

shuffleBtn.addEventListener('click', shuffle);

stopBtn.addEventListener('click', function () {
  if (timer) {
    timer = clearInterval(timer);
    stopBtn.textContent = 'Start';
    stopBtn.style.background = 'green';

    isGameInProccess = false;

    shuffleBtn.style.background = 'grey';
    shuffleBtn.style.pointerEvents = 'none';
    shuffleBtn.setAttribute('disabled', 'true');
  } else {
    timer = startTimer();
    stopBtn.textContent = 'Stop';
    stopBtn.style.background = 'red';

    isGameInProccess = true;

    shuffleBtn.style.background = 'black';
    shuffleBtn.style.pointerEvents = 'auto';
    shuffleBtn.removeAttribute('disabled');
  }
  buttonSound.play();
});

// Header Button functional ===========

// Game functional ============

const buttons = [];

for (let i = 0; i < 16; i++) {
  const button = document.createElement('button');
  button.textContent = i + 1;
  button.className = 'button';

  buttons.push(button);
}

buttons.forEach((el) => container.append(el));

buttons[buttons.length - 1].style.display = 'none';

let matrix = getMatrix(buttons.map((item) => Number(item.textContent)));

setPositionItems(matrix);

window.addEventListener('load', shuffle);

container.addEventListener('click', (e) => {
  if (isGameInProccess) {
    const buttonEl = e.target.closest('button');
    if (!buttonEl) return;

    const buttonNumber = Number(buttonEl.textContent);

    const coordsOfBtn = findBtnCoords(buttonNumber, matrix);
    const coordsOfVoidSpace = findBtnCoords(voidSpace, matrix);

    const isSwapElemsValid = isSwapValid(coordsOfBtn, coordsOfVoidSpace);

    if (isSwapElemsValid && isGameInProccess) {
      swapElems(coordsOfBtn, coordsOfVoidSpace, matrix);
      score.textContent = `Moves: ${setCounter()}`;
      puzzleSound.play();

      if (!timer) {
        timer = startTimer();
        stopBtn.style.background = 'red';
        stopBtn.style.pointerEvents = 'auto';
      } else return;
    }
  } else return;
});

// Game functional ============

// helpers

function shuffle() {
  shuffleSound.play();
  isGameInProccess = false;
  let shuffleCount = 0;
  shuffleTimer = clearInterval(shuffleTimer);
  shuffleBtn.setAttribute('disabled', 'true');
  shuffleBtn.style.background = 'grey';
  stopBtn.style.background = 'grey';
  gameTime.textContent = `Time: 00:00`;
  time.min = 0;
  time.sec = 0;

  counter = 0;
  score.textContent = `Moves: 0`;
  winText.textContent = '';

  if (timer) {
    timer = clearInterval(timer);
    gameTime.textContent = `Time: 00:00`;
    time.min = 0;
    time.sec = 0;
  }

  if (shuffleCount === 0) {
    shuffleTimer = setInterval(() => {
      randomSwapElements(matrix);
      setPositionItems(matrix);
      shuffleCount += 1;

      if (shuffleCount >= maxShuffleCount) {
        shuffleTimer = clearInterval(shuffleTimer);
        isGameInProccess = true;
        shuffleBtn.removeAttribute('disabled');
        shuffleBtn.style.background = 'black';
      }
    }, 20);
  }
}

function randomSwapElements(matrix) {
  const coordsOfVoidSpace = findBtnCoords(voidSpace, matrix);
  const validCoords = findValidCoords({
    coordsOfVoidSpace,
    matrix,
    blockedCoords,
  });

  const swapCoords = validCoords[Math.floor(Math.random() * validCoords.length)];
  swapElems(coordsOfVoidSpace, swapCoords, matrix);
  blockedCoords = coordsOfVoidSpace;
}

function findValidCoords({ coordsOfVoidSpace, matrix, blockedCoords }) {
  const validCoords = [];
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (isSwapValid({ x, y }, coordsOfVoidSpace)) {
        if (!blockedCoords || !(blockedCoords.x === x && blockedCoords.y === y)) {
          validCoords.push({ x, y });
        }
      }
    }
  }
  return validCoords;
}

function getMatrix(arr) {
  const matrix = [];
  for (let i = 0; i < countOfElements; i++) {
    matrix.push([]);
  }

  let y = 0;
  let x = 0;

  for (let i = 0; i < arr.length; i++) {
    if (x >= countOfElements) {
      y++;
      x = 0;
    }
    matrix[y][x] = arr[i];
    x++;
  }
  return matrix;
}

function setPositionItems(matrix) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      const value = matrix[y][x];
      const el = buttons[value - 1];
      setStyles(el, x, y);
    }
  }
}

function setStyles(el, x, y) {
  const trans = 100;
  el.style.transform = `translate3D(${x * trans}%, ${y * trans}%, 0)`;
}

function shuffleArr(arr) {
  return arr
    .map((el) => ({ el, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ el }) => el);
}

function findBtnCoords(num, matrix) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] === num) {
        return { x, y };
      }
    }
  }
  throw new Error('Unexpected function');
}

function isSwapValid(coords1, coords2) {
  const diffX = Math.abs(coords1.x - coords2.x);
  const diffY = Math.abs(coords1.y - coords2.y);

  return (diffX === 1 || diffY === 1) && (coords1.x === coords2.x || coords1.y === coords2.y);
}

function swapElems(coords1, coords2, matrix) {
  const coords1Num = matrix[coords1.y][coords1.x];
  matrix[coords1.y][coords1.x] = matrix[coords2.y][coords2.x];
  matrix[coords2.y][coords2.x] = coords1Num;
  setPositionItems(matrix);

  if (isUserWin(matrix)) {
    showWin();
  }
}

const arr = new Array(16).fill(0).map((_, i) => i + 1);

function isUserWin(matrix) {
  const flatMatrix = matrix.flat();
  for (let i = 0; i < arr.length; i++) {
    if (flatMatrix[i] !== arr[i]) {
      return false;
    }
  }
  return true;
}

function showWin() {
  setTimeout(function () {
    timer = clearTimeout(timer);
    winText.textContent = `Hooray! You solved the puzzle in ${addZero(time.min)}:${addZero(
      time.sec,
    )} and ${counter} moves!`;
    isGameInProccess = false;
    stopBtn.setAttribute('disabled', true);
    stopBtn.style.background = 'grey';
  }, 0);
}

function setCounter() {
  return (counter += 1);
}

function startTimer() {
  return setInterval(function () {
    time.sec += 1;
    if (time.sec > 59) {
      time.sec = 0;
      time.min += 1;
    }

    gameTime.textContent = `Time: ${addZero(time.min)}:${addZero(time.sec)}`;
  }, 1000);
}

function addZero(num) {
  return num < 10 ? '0' + num : num;
}

function closeModal() {
  buttonSound.play();
  setTimeout(() => (modalLayout.style.display = 'none'), 300);
  modal.style.transform = 'scale(0)';
}

function openModal() {
  buttonSound.play();
  modalLayout.style.display = 'flex';
  setTimeout(() => (modal.style.transform = 'scale(100%)'), 0);
}

function pushRes(moves, time) {
  arrRes.push({ moves, time });
  return arrRes;
}

function set(name, data) {
  localStorage.setItem(name, JSON.stringify(data));
}

function get(name) {
  let arr = JSON.parse(localStorage.getItem(name));
  arr.length = 10;
  arr.sort((a, b) => a.moves - b.moves);
  arr
    .map(
      (el, id) =>
        `${id + 1}.Moves: ${el.moves} - Time: ${addZero(el.time.min)}:${addZero(el.time.sec)}`,
    )
    .map(function (el) {
      const listItem = document.createElement('li');
      listItem.innerHTML = `${el}`;
      resultsUl.append(listItem);
    });
}
