// script.js
const boardElement = document.getElementById('board');
const cellElements = Array.from(document.querySelectorAll('.cell'));

const currentPlayerInfo = document.getElementById('currentPlayerInfo');
const piecesXInfo = document.getElementById('piecesXInfo');
const piecesOInfo = document.getElementById('piecesOInfo');
const selectedPieceInfo = document.getElementById('selectedPieceInfo');
const selectedSizeDisplay = document.getElementById('selectedSizeDisplay');

// サイズボタン
const sizeButtons = document.querySelectorAll('.sizeButton');

/**
 * 各セル：スタック(配列)でコマを管理。
 * board[i] = [ { player: '×' or '○', size: 'L'/'M'/'S' }, ... ]
 */
let board = Array(9).fill(null).map(() => []);

/**
 * 各プレイヤーが持つコマ数
 */
let pieces = {
  '×': { 'L': 2, 'M': 2, 'S': 2 },
  '○': { 'L': 2, 'M': 2, 'S': 2 }
};

/**
 * 現在のプレイヤー ( '×' or '○' )
 */
let currentPlayer = '×';

/**
 * 移動モード：プレイヤーが既存コマを選択している状態
 */
let selectedPiece = null;

/**
 * ボタンで選択中のコマサイズ ( 'L'/'M'/'S' or null )
 */
let selectedSize = null;

/** 初期表示 */
updateDisplay();

/** サイズボタンで選択時 */
sizeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const size = button.dataset.size; // "L" / "M" / "S"
    selectedSize = size;
    selectedSizeDisplay.textContent = size;
  });
});

/** 盤面クリック時 */
boardElement.addEventListener('click', e => {
  const cell = e.target;
  const index = parseInt(cell.dataset.index, 10);
  if (isNaN(index)) return;

  // すでに「移動モード」でコマを選択済みの場合:
  if (selectedPiece) {
    moveOrStackPiece(selectedPiece, index);
    selectedPiece = null;
    selectedPieceInfo.textContent = '(なし)';
    endTurn();
    return;
  }

  // 移動モードでない場合 → クリックしたセルの最上段が自分のコマなら選択、なければ新規配置
  const topPiece = getTopPiece(index);

  // 自分のコマがあれば選択して移動モードに
  if (topPiece && topPiece.player === currentPlayer) {
    selectedPiece = {
      cellIndex: index,
      pieceData: topPiece
    };
    selectedPieceInfo.textContent =
      `${index}番セル(${topPiece.player}, ${topPiece.size})を選択中`;
  } else {
    // 新規配置 → まずサイズが選択されているか確認
    if (!selectedSize) {
      alert("先にコマのサイズ(L/M/S)を選択してください。");
      return;
    }

    // 手持ちコマが残っているか
    if (pieces[currentPlayer][selectedSize] <= 0) {
      alert(`「${selectedSize}」はもう残っていません。`);
      return;
    }

    // 新規に置く
    placeNewPiece(currentPlayer, selectedSize, index);
    endTurn();
  }
});

/**
 * 新しいコマを置く
 */
function placeNewPiece(player, size, index) {
  board[index].push({ player, size });
  pieces[player][size] -= 1;
}

/**
 * 移動モードで選択しているコマを newIndex のセルへ移動
 */
function moveOrStackPiece(selected, newIndex) {
  const { cellIndex, pieceData } = selected;
  board[cellIndex].pop(); // 元セルから取り除く(最上段のみ想定)
  board[newIndex].push(pieceData);
}

/**
 * 指定セルの一番上のコマを取得(なければ null)
 */
function getTopPiece(index) {
  const stack = board[index];
  if (!stack.length) return null;
  return stack[stack.length - 1];
}

/**
 * ターン終了処理
 */
function endTurn() {
  renderBoard();
  if (checkWinner(currentPlayer)) {
    setTimeout(() => {
      alert(currentPlayer + 'が勝ちました');
      resetGame();
    }, 10);
    return;
  }
  
  // 盤面が全て埋まっていて勝者なし → 引き分け
  if (board.every(stack => stack.length > 0)) {
    setTimeout(() => {
      alert('引き分けです。');
      resetGame();
    }, 10);
    return;
  }

  // プレイヤー交代
  currentPlayer = (currentPlayer === '×') ? '○' : '×';
  updateDisplay();
}

/**
 * ボード描画
 * 各セルに「●」のみ表示し、
 *   - x側は水色、o側はオレンジ
 *   - L/M/Sに応じてフォントサイズを変える
 */
function renderBoard() {
  cellElements.forEach((cell, i) => {
    const topPiece = getTopPiece(i);
    if (!topPiece) {
      // コマがない場合、空表示+スタイルリセット
      cell.textContent = '';
      cell.style.color = '';
      cell.style.fontSize = '';
      return;
    }
    
    // ●を表示
    cell.textContent = '●';

    // 色分け: '×' → 水色 / '○' → オレンジ
    if (topPiece.player === '×') {
      cell.style.color = 'lightblue';
    } else {
      cell.style.color = 'orange';
    }

    // サイズ分け: L, M, Sによってフォントサイズを変更
    switch (topPiece.size) {
      case 'L':
        cell.style.fontSize = '48px';
        break;
      case 'M':
        cell.style.fontSize = '32px';
        break;
      case 'S':
        cell.style.fontSize = '20px';
        break;
      default:
        cell.style.fontSize = '24px';
    }
  });
}

/**
 * 画面上の各種表示を更新
 */
function updateDisplay() {
  currentPlayerInfo.textContent = currentPlayer;
  piecesXInfo.textContent =
    `L:${pieces['×'].L}, M:${pieces['×'].M}, S:${pieces['×'].S}`;
  piecesOInfo.textContent =
    `L:${pieces['○'].L}, M:${pieces['○'].M}, S:${pieces['○'].S}`;
  selectedPieceInfo.textContent = '(なし)';
  selectedSizeDisplay.textContent = selectedSize || '(なし)';
  renderBoard();
}

/**
 * 勝利判定
 * 盤面の最上段コマが同じplayerで3つ並んだら勝利
 */
function checkWinner(player) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // columns
    [0,4,8],[2,4,6]          // diagonals
  ];
  return winPatterns.some(pattern => {
    return pattern.every(idx => {
      const topPiece = getTopPiece(idx);
      return topPiece && topPiece.player === player;
    });
  });
}

/**
 * ゲームリセット
 */
function resetGame() {
  board = Array(9).fill(null).map(() => []);
  pieces = {
    '×': { 'L': 2, 'M': 2, 'S': 2 },
    '○': { 'L': 2, 'M': 2, 'S': 2 }
  };
  currentPlayer = '×';
  selectedPiece = null;
  selectedSize = null;
  updateDisplay();
}
