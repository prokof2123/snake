# Snake — how it works & test results

Source: [index.html](index.html) (single self-contained file — HTML, CSS, and JS
are all inline; `script.js`/`style.css` are no longer used and can be deleted
from the repo).

## How it works

- **Board**: 20×20 grid of 20px cells rendered on a `<canvas id="board">`
  (400×400px).
- **State**: `snake` (array of `{x,y}` segments, head first), `dir`/`nextDir`,
  `food`, `score`, `best`, `running`, `paused`.
- **Game loop**: `setInterval(tick, tickMs)`. Each `tick()`:
  1. Commits the buffered `nextDir` to `dir`.
  2. Computes the new head cell.
  3. Checks whether the move eats the food (`willEat`); if not, the tail cell
     is excluded from the collision check (`body = snake.slice(0, -1)`) since
     the tail will move away before the head could occupy it.
  4. Checks wall collision (`x`/`y` out of `[0, COLS)` / `[0, ROWS)`) and self
     collision (new head overlapping `body`). Either ends the game.
  5. Otherwise pushes the new head; if food was eaten, grows (skips `pop()`),
     increments score, places new food, and speeds up; else pops the tail
     (normal move, length unchanged).
- **Input**: arrow keys and WASD map to direction vectors. `setDirection()`
  rejects a 180° reversal (new direction opposite the *current* `dir`), which
  also prevents instant self-collision from reversing into the neck.
  `Space` toggles pause, `Enter` restarts after game over.
- **Speed-up**: `tickMs = max(MIN_TICK_MS=60, START_TICK_MS=150 - score * SPEED_STEP_MS=5)`,
  recomputed and the interval restarted after every food eaten.
- **Persistence**: best score stored in `localStorage["snake-best"]`, updated
  only when the current run's score beats it, on game over.
- **Rendering**: `draw()` clears the canvas, draws food in red, and draws the
  snake (head in a lighter green, body in the accent green), each cell offset
  by 1px to create a visible grid gap.

## Test results

No browser-automation tooling was available in this environment
(no `chromium-cli`, no `node`/`npm`, no `playwright`), so the game could not
be driven in an actual browser/canvas. Instead I ported the exact `tick()` /
collision logic from `index.html` (lines 217–245) 1:1 into a Python
simulation and exercised it with concrete scenarios. Script:
`sim_snake.py` (kept in the session scratchpad, not part of the repo).

| Test | What it checks | Result |
|---|---|---|
| `test_basic_movement` | Head advances one cell per tick, tail follows, length unchanged when no food is eaten | PASS |
| `test_eating_grows_and_scores` | Eating food grows the snake by one segment and increments score | PASS |
| `test_wall_collision_right` | Moving past the right edge ends the game | PASS |
| `test_wall_collision_all_edges` | All four board edges (left/right/top/bottom) correctly end the game | PASS |
| `test_self_collision` | Turning into the snake's own body ends the game | PASS |
| `test_cannot_reverse_into_self` | A 180° key press (e.g. right→left while moving right) is ignored, so the snake can't instantly reverse into its neck | PASS |
| `test_speed_formula` | Tick interval decreases by 5ms per point and clamps at the 60ms floor (never goes below it or negative) | PASS |
| `test_multi_tick_survival_run` | Snake survives repeated ticks while food is unreachable, then dies exactly on the tick it crosses the wall | PASS |

**All 8 tests passed.**

### Not covered by this testing

Because this was logic-only simulation, the following were **not** verified
and would need an actual browser run:
- Canvas rendering correctness (colors, cell alignment, pixelation).
- Real keyboard event handling (`keydown` listener, `preventDefault` behavior).
- Pause/resume behavior (`paused` flag) and the restart button/overlay UI.
- `localStorage` read/write for the best score across sessions.
- Visual/UX check of the "Game Over" overlay and score HUD updates in the DOM.
