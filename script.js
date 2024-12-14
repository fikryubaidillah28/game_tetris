const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const rows = 20;
const cols = 10;

// Inisialisasi skor
let score = 0;

// Buat grid
const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
for (let i = 0; i < rows * cols; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  game.appendChild(cell);
}
const cells = Array.from(document.querySelectorAll(".cell"));

// Tetromino shapes and colors
const tetrominoes = [
  {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: "color-1",
  }, // T
  { shape: [[1, 1, 1, 1]], color: "color-2" }, // I
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "color-3",
  }, // O
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "color-4",
  }, // S
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "color-5",
  }, // Z
];

let currentTetromino;
let currentColor;
let position = { row: 0, col: 3 };

// Rotasi Tetromino
function rotateTetromino() {
  currentTetromino = currentTetromino[0].map((_, colIndex) => currentTetromino.map((row) => row[colIndex]).reverse());
  if (hasCollision(position.row, position.col)) {
    currentTetromino = currentTetromino[0].map((_, colIndex) => currentTetromino.map((row) => row[colIndex])); // Kembalikan ke posisi semula jika rotasi menyebabkan tabrakan
  }
  drawTetromino();
}

// Gambar Tetromino
function drawTetromino() {
  clearGrid();
  currentTetromino.forEach((row, i) =>
    row.forEach((value, j) => {
      if (value) {
        const index = (position.row + i) * cols + position.col + j;
        if (index >= 0 && index < cells.length) {
          cells[index].classList.add("active", currentColor);
        }
      }
    })
  );
}

// Bersihkan grid
function clearGrid() {
  cells.forEach((cell) => (cell.className = "cell"));
  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell) cells[r * cols + c].classList.add("inactive", cell);
    })
  );
}

// Tetapkan Tetromino ke posisi tetap
function fixTetromino() {
  currentTetromino.forEach((row, i) =>
    row.forEach((value, j) => {
      if (value) {
        const gridRow = position.row + i;
        const gridCol = position.col + j;
        if (gridRow >= 0 && gridRow < rows && gridCol >= 0 && gridCol < cols) {
          grid[gridRow][gridCol] = currentColor;
        }
      }
    })
  );
  clearFullRows();
}

// Periksa dan hapus baris penuh
function clearFullRows() {
  let rowsCleared = 0;

  grid.forEach((row, rowIndex) => {
    if (row.every((cell) => cell !== 0)) {
      grid.splice(rowIndex, 1);
      grid.unshift(Array(cols).fill(0));
      rowsCleared++;
    }
  });

  if (rowsCleared > 0) {
    updateScore(rowsCleared);
    drawTetromino();
  }
}

// Tambahkan skor
function updateScore(rowsCleared) {
  const points = rowsCleared * 100; // 100 poin per baris
  score += points;
  scoreDisplay.textContent = score;
}

// Cek tabrakan
function hasCollision(nextRow, nextCol) {
  return currentTetromino.some((row, i) =>
    row.some((value, j) => {
      if (value) {
        const gridRow = nextRow + i;
        const gridCol = nextCol + j;
        if (gridRow >= rows || gridCol < 0 || gridCol >= cols || grid[gridRow]?.[gridCol]) {
          return true;
        }
      }
      return false;
    })
  );
}

// Pindahkan Tetromino
function moveTetromino(direction) {
  let nextPosition = { ...position };
  if (direction === "down") nextPosition.row++;
  if (direction === "left") nextPosition.col--;
  if (direction === "right") nextPosition.col++;

  if (!hasCollision(nextPosition.row, nextPosition.col)) {
    position = nextPosition;
    drawTetromino();
  } else if (direction === "down") {
    fixTetromino();
    spawnTetromino();
  }
}

// Buat Tetromino baru
function spawnTetromino() {
  const index = Math.floor(Math.random() * tetrominoes.length);
  currentTetromino = tetrominoes[index].shape;
  currentColor = tetrominoes[index].color;
  position = { row: 0, col: Math.floor((cols - currentTetromino[0].length) / 2) };

  if (hasCollision(position.row, position.col)) {
    alert("Game Over!");
    resetGame();
  } else {
    drawTetromino();
  }
}

// Reset game
function resetGame() {
  grid.forEach((row) => row.fill(0));
  clearGrid();
  score = 0;
  scoreDisplay.textContent = score;
  spawnTetromino();
}

// Kontrol
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") moveTetromino("down");
  if (e.key === "ArrowLeft") moveTetromino("left");
  if (e.key === "ArrowRight") moveTetromino("right");
  if (e.key === "ArrowUp") rotateTetromino();
});

// Inisialisasi game
spawnTetromino();
setInterval(() => moveTetromino("down"), 1000);

// Fungsi untuk memberikan efek pecah pada baris penuh
function addBreakingEffect(rowIndex) {
  const startIndex = rowIndex * cols;
  for (let i = startIndex; i < startIndex + cols; i++) {
    cells[i].classList.add("breaking");
  }
}

// Periksa dan hapus baris penuh dengan efek pecah
function clearFullRows() {
  let rowsCleared = 0;
  const rowsToClear = [];

  // Identifikasi baris yang penuh
  grid.forEach((row, rowIndex) => {
    if (row.every((cell) => cell !== 0)) {
      rowsToClear.push(rowIndex);
    }
  });

  // Tambahkan efek pecah ke baris penuh
  rowsToClear.forEach((rowIndex) => addBreakingEffect(rowIndex));

  // Tunggu hingga animasi selesai sebelum menghapus baris
  setTimeout(() => {
    rowsToClear.forEach((rowIndex) => {
      grid.splice(rowIndex, 1); // Hapus baris penuh
      grid.unshift(Array(cols).fill(0)); // Tambahkan baris kosong di atas
    });

    rowsCleared = rowsToClear.length;

    if (rowsCleared > 0) {
      updateScore(rowsCleared);
      drawTetromino();
    }
  }, 500); // Waktu sesuai dengan durasi animasi di CSS
}
