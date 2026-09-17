(() => {
  const CELL = 20;
  const COLS = 20;
  const ROWS = 20;
  const START_TICK_MS = 150;
  const MIN_TICK_MS = 60;
  const SPEED_STEP_MS = 5;

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const overlay = document.getElementById("overlay");
  const overlayText = document.getElementById("overlay-text");
  const restartBtn = document.getElementById("restart-btn");

  const DIRS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
  };

  let snake, dir, nextDir, food, score, best, running, paused, timer;

  function loadBest() {
    return Number(localStorage.getItem("snake-best") || 0);
  }

  function saveBest(value) {
    localStorage.setItem("snake-best", String(value));
  }

  function randomCell() {
    return {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  }

  function placeFood() {
    let cell;
    do {
      cell = randomCell();
    } while (snake.some((s) => s.x === cell.x && s.y === cell.y));
    return cell;
  }

  function reset() {
    snake = [
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
    ];
    dir = { x: 1, y: 0 };
    nextDir = dir;
    food = placeFood();
    score = 0;
    best = loadBest();
    running = true;
    paused = false;
    scoreEl.textContent = score;
    bestEl.textContent = best;
    overlay.classList.add("hidden");
    clearInterval(timer);
    timer = setInterval(tick, START_TICK_MS);
  }

  function speedUp() {
    const tickMs = Math.max(MIN_TICK_MS, START_TICK_MS - score * SPEED_STEP_MS);
    clearInterval(timer);
    timer = setInterval(tick, tickMs);
  }

  function endGame() {
    running = false;
    clearInterval(timer);
    if (score > best) {
      best = score;
      saveBest(best);
      bestEl.textContent = best;
    }
    overlayText.textContent = `Game Over — Score: ${score}`;
    overlay.classList.remove("hidden");
  }

  function tick() {
    if (!running || paused) return;

    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    const willEat = head.x === food.x && head.y === food.y;
    const body = willEat ? snake : snake.slice(0, -1);

    const hitsWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
    const hitsSelf = body.some((s) => s.x === head.x && s.y === head.y);
    if (hitsWall || hitsSelf) {
      endGame();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 1;
      scoreEl.textContent = score;
      food = placeFood();
      speedUp();
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    ctx.fillStyle = "#0b0e11";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#e53935";
    ctx.fillRect(food.x * CELL, food.y * CELL, CELL - 1, CELL - 1);

    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#66bb6a" : "#4caf50";
      ctx.fillRect(seg.x * CELL, seg.y * CELL, CELL - 1, CELL - 1);
    });
  }

  function setDirection(candidate) {
    const isOpposite = candidate.x === -dir.x && candidate.y === -dir.y;
    if (!isOpposite) nextDir = candidate;
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !running) {
      reset();
      draw();
      return;
    }
    if (e.key === " ") {
      e.preventDefault();
      if (running) paused = !paused;
      return;
    }
    const candidate = DIRS[e.key];
    if (candidate) {
      e.preventDefault();
      setDirection(candidate);
    }
  });

  restartBtn.addEventListener("click", () => {
    reset();
    draw();
  });

  reset();
  draw();
})();
