/************************************************
グローバル変数
************************************************/
let board = Array(9)
  .fill(null)
  .map(() => []);
let pieces = {
  x: { L: 2, M: 2, S: 2 },
  o: { L: 2, M: 2, S: 2 },
};

// 現在の手番 ('x' or 'o')
let currentPlayer = "x";

/************************************************
サイズを数値化 (L=3, M=2, S=1)
************************************************/
function getSizeValue(size) {
  switch (size) {
    case "L":
      return 3;
    case "M":
      return 2;
    case "S":
      return 1;
    default:
      return 0;
  }
}

/************************************************
ページロード後
************************************************/
window.addEventListener("DOMContentLoaded", () => {
  renderBoard();
  renderRemaining();
  updateCurrentPlayerDisplay();
  setupDragAndDrop();
});

/************************************************
ボード再描画: 最上段のみ表示
自分のコマならセルをドラッグ可に
************************************************/
function renderBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    let index = +cell.dataset.index;
    let stack = board[index];

    // 表示をクリア
    cell.textContent = "";
    cell.style.fontSize = "";
    cell.style.color = "";
    cell.draggable = false;

    // コマなしならスキップ
    if (!stack.length) return;

    // 最上段
    let topPiece = stack[stack.length - 1];
    cell.textContent = "●";
    cell.style.color = topPiece.player === "x" ? "lightblue" : "orange";
    switch (topPiece.size) {
      case "L":
        cell.style.fontSize = "160px";
        break;
      case "M":
        cell.style.fontSize = "80px";
        break;
      case "S":
        cell.style.fontSize = "40px";
        break;
    }

    // 自分のコマならドラッグ可
    if (topPiece.player === currentPlayer) {
      cell.draggable = true;
    }
  });
}

/************************************************
手元コマの描画
************************************************/
function renderRemaining() {
  const pieceContainerX = document.getElementById("pieceContainerX");
  pieceContainerX.innerHTML = "";
  Object.keys(pieces.x).forEach((size) => {
    for (let i = 0; i < pieces.x[size]; i++) {
      let div = createHandPiece("x", size);
      pieceContainerX.appendChild(div);
    }
  });

  const pieceContainerO = document.getElementById("pieceContainerO");
  pieceContainerO.innerHTML = "";
  Object.keys(pieces.o).forEach((size) => {
    for (let i = 0; i < pieces.o[size]; i++) {
      let div = createHandPiece("o", size);
      pieceContainerO.appendChild(div);
    }
  });
}

/************************************************
手元コマ(●)生成
************************************************/
function createHandPiece(player, size) {
  let div = document.createElement("div");
  div.classList.add("piece", `${player}-${size}`);
  div.draggable = true;
  div.dataset.player = player;
  div.dataset.size = size;
  div.textContent = "●";
  // ドラッグ開始
  div.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ from: "hand", player, size })
    );
    e.dataTransfer.effectAllowed = "move";
  });

  return div;
}

/************************************************
ボード(セル)のドラッグ&ドロップ設定
************************************************/
function setupDragAndDrop() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    // dragover: ドロップを許可
    cell.addEventListener("dragover", (e) => e.preventDefault());
    // dropイベント
    cell.addEventListener("drop", onDropCell);
    // セルドラックstart(最上段が自分のコマなら)
    cell.addEventListener("dragstart", (e) => {
      let index = +cell.dataset.index;
      let stack = board[index];
      if (!stack.length) {
        e.preventDefault();
        return;
      }
      let topPiece = stack[stack.length - 1];
      if (topPiece.player !== currentPlayer) {
        e.preventDefault();
        return;
      }
      // ボード上コマ移動
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          from: "board",
          cellIndex: index,
          player: topPiece.player,
          size: topPiece.size,
        })
      );
      e.dataTransfer.effectAllowed = "move";
    });
  });
}
/************************************************
drop時の処理
************************************************/
function onDropCell(e) {
  e.preventDefault();
  const raw = e.dataTransfer.getData("text/plain");
  if (!raw) return;
  const data = JSON.parse(raw);

  let targetIndex = +this.dataset.index; // ドロップ先セル

  // 1) プレイヤー判定
  if (data.player !== currentPlayer) {
    alert("現在のプレイヤーではありません。");
    return;
  }
  // 2) サイズルール: 同サイズ以上が最上段→NG
  if (board[targetIndex].length) {
    let topPiece = board[targetIndex][board[targetIndex].length - 1];
    if (getSizeValue(topPiece.size) >= getSizeValue(data.size)) {
      alert("同サイズ以上のコマが置かれているため、置けません。");
      return;
    }
  }

  // 3) 手元→ボード or ボード→ボード
  if (data.from === "hand") {
    // 手元コマが残っているか
    if (pieces[data.player][data.size] <= 0) {
      alert("そのコマはもう残っていません。");
      return;
    }
    pieces[data.player][data.size] -= 1;
    board[targetIndex].push({ player: data.player, size: data.size });
  } else if (data.from === "board") {
    // ボード上コマの移動
    let fromStack = board[data.cellIndex];
    if (!fromStack.length) return;
    let top = fromStack[fromStack.length - 1];
    if (top.player !== data.player || top.size !== data.size) {
      alert("移動しようとしたコマが見つかりません。");
      return;
    }
    // 移動元→ドロップ先へ
    fromStack.pop();
    board[targetIndex].push({ player: data.player, size: data.size });
  }

  // 再描画 & ターン終了
  renderBoard();
  renderRemaining();
  endTurn();
}

/************************************************
現在のプレイヤーを表示する関数
************************************************/
function updateCurrentPlayerDisplay() {
  const playerDisplay = document.getElementById("current-player");
  playerDisplay.textContent = `現在のプレイヤー: ${
    currentPlayer === "x" ? "水色" : "オレンジ"
  }`;
}

/************************************************
ターン終了処理 
************************************************/
function endTurn() {
  // 勝敗判定
  if (checkWinner(currentPlayer)) {
    setTimeout(() => {
      alert((currentPlayer === "x" ? "水色" : "オレンジ") + "の勝ち！");
      resetGame();
    }, 50);
    return;
  }
  const opponent = currentPlayer === "x" ? "o" : "x";
  if (checkWinner(opponent)) {
    setTimeout(() => {
      alert((opponent === "x" ? "水色" : "オレンジ") + "の勝ち！");
      resetGame();
    }, 50);
    return;
  }
  // プレイヤー交代
  currentPlayer = currentPlayer === "x" ? "o" : "x";
  renderBoard();
  updateCurrentPlayerDisplay();
}
/************************************************
勝利判定 
************************************************/
function checkWinner(player) {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  return wins.some((pattern) => {
    return pattern.every((idx) => {
      let stack = board[idx];
      if (!stack.length) return false;
      let top = stack[stack.length - 1];
      return top.player === player;
    });
  });
}
/************************************************
リセット 
************************************************/
function resetGame() {
  board = Array(9)
    .fill(null)
    .map(() => []);
  pieces = {
    x: { L: 2, M: 2, S: 2 },
    o: { L: 2, M: 2, S: 2 },
  };
  currentPlayer = "x";
  renderBoard();
  renderRemaining();
}
