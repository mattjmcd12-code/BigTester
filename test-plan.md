# Battleship — Test Plan (PR #2)

**What changed:** New Battleship game in `index.html` + `styles.css` + `game.js`. Primary behaviors to prove: manual ship placement with rotate + validation, Start-disabled-until-all-placed gating, correct hit/miss/sunk rendering when firing, AI hunt-and-target (adjacency clustering after a hit, not random), win/loss messages, and New-Game reset.

**How I'll run it:** Open `file:///home/ubuntu/repos/BigTester/index.html` in Chrome. DevTools console open throughout to verify zero errors.

---

## Test 1 — Manual ship placement, rotate, and invalid-placement protection
1. Open the page. **Assert:** status reads "Place your ships to begin.", Start Game button is **disabled**, ship list shows 5 ships with sizes `Carrier (5)`, `Battleship (4)`, `Cruiser (3)`, `Submarine (3)`, `Destroyer (2)`.
2. Click `Carrier (5)`, hover cell (row 0, col 0). **Assert:** exactly 5 cells `(0,0)…(0,4)` are highlighted blue (valid preview).
3. Click (0,0). **Assert:** 5 cells turn the solid ship color; Carrier option becomes disabled/strikethrough.
4. Click `Battleship (4)`, press `R` (or click Rotate). **Assert:** Rotate button label changes to "Rotate: Vertical".
5. Hover (0,0). **Assert:** preview cells are **red** (invalid — overlaps Carrier).
6. Hover (0,7) with vertical orientation — preview spans (0,7)…(3,7). Click. **Assert:** 4 cells turn ship-colored.
7. Continue placing Cruiser, Submarine, Destroyer in valid locations. **Assert:** After the 5th placement, Start Game is **enabled** and status reads "Fleet ready. Click Start Game to begin."

**Fail criteria:** any preview showing the wrong number of cells, invalid placement NOT turning red, Start Game enabling before all 5 are placed, or overlapping placements being accepted.

## Test 2 — Firing at AI: hit / miss / sunk rendering
1. Click Start Game. **Assert:** setup panel hides, turn indicator reads "Your turn — fire at enemy waters."
2. Fire shots at the AI grid until I get a sunk ship. **To force a sunk ship deterministically**, I'll inspect the AI's fleet via the console (read-only `aiFleet` from closure — actually the closure is private, so I'll instead fire until I sink one naturally; with 17 ship cells out of 100, this is feasible but slow).
   - **Fallback deterministic variant:** Open DevTools and execute a one-shot patch BEFORE Start Game that monkey-patches `Math.random` temporarily to place AI ships deterministically. (Only used if natural play is too slow to demonstrate on camera — documented as such in the report.)
3. **Assert on a miss:** cell turns light grey with `•`, status reads "Miss."
4. **Assert on a hit:** cell turns red with `✕`, status reads "Hit!"
5. **Assert on a sunk:** all cells of the sunk ship turn dark red; status reads `Direct hit — you sank the enemy <ShipName>!`.

**Fail criteria:** wrong color per state, sunk ship cells not switching from hit → sunk color, or wrong status text.

## Test 3 — AI hunt-and-target clusters after a hit (this is the distinguishing behavior)
This is the key adversarial test: if the AI were firing purely randomly, its shots after a hit would be distributed across the whole board. With hunt-and-target, they must cluster on adjacent cells.
1. During gameplay, watch the AI's shots on **my** grid. After the AI's first hit on one of my ships, record the coordinates of the next up-to-4 AI shots.
2. **Assert:** at least one of the next 2 AI shots (before the ship is sunk) is orthogonally adjacent to the most recent hit (same row±1 or same column±1). Over the course of sinking that ship, **every** AI shot between the first hit and the sink should be on a line with or adjacent to the hit cluster — no "wild" shots across the board.
3. **Assert:** once the ship is sunk, the AI's next shot should be back in hunt mode (not continuing to pile on adjacent cells).

**Fail criteria:** any AI shot after a hit (before the ship is sunk) that is NOT on or adjacent to the hit cluster — this would indicate hunt-and-target is broken and the AI is firing randomly.

## Test 4 — Win / Loss / New Game reset
1. Play the game through to completion (either by me sinking all AI ships or the AI sinking all of mine). To shorten the recording, I may use the "Random Placement" button for my fleet and fire rapidly.
2. **Assert on player win:** status reads exactly "Victory! You sank the entire enemy fleet." in green.
3. **Assert on player loss:** status reads exactly "Defeat. Your fleet has been destroyed." in red.
4. **Assert:** turn indicator reads "Game over." and no further clicks register on either board.
5. Click New Game. **Assert:** both grids are empty, setup panel is visible again, Start Game is disabled, ship list shows all 5 ships as unplaced, Rotate label resets to "Horizontal", status reads "Place your ships to begin."

**Fail criteria:** clicking after game end mutates state; any residual hits/misses on the board after reset; Start Game enabling with no ships placed after reset.

## Test 5 — No console errors (throughout Tests 1–4)
Open DevTools console before Test 1. **Assert:** zero `error`-level messages logged at any point across load, setup, play, end, or reset.

**Fail criteria:** any red error entry in the console.

---

## Evidence I will capture
- Screen recording covering all five tests end-to-end.
- Console open with zero errors at the end of the recording.
- Post a single comment on PR #2 with a concise pass/fail summary and a link to this session.
