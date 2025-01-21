/* script.js */
const boardElement = document.getElementById('board');
const cellElements = Array.from(document.querySelectorAll('.cell'));

const currentPlayerInfo = document.getElementById('currentPlayerInfo');
const piecesXInfo = document.getElementById('piecesXInfo');
const piecesOInfo = document.getElementById('piecesOInfo');
const selectedPieceInfo = document.getElementById('selectedPieceInfo');
const selectedSizeDisplay = document.getElementById('selectedSizeDisplay');

// サイズボタンの要素を取得
const sizeButtons = document.querySelectorAll('.sizeButton');

/**
 * 各セル: スタック(配列)でコマを管理
 */
let board = Array(9).fill(null).map(() => []);

/**
 * 各プレイヤーが持つコマの数
 */
let pieces = {
  '×': { 'L': 2, 'M': 2, 'S': 2 },
  '○': { 'L': 2, 'M': 2, 'S': 2 }
};

/**
 * 現在のプレイヤー('×' or '○')
 */
let currentPlayer = '×';

/**
 * プレイヤーが移動したいコマを選択中の場合、その情報を保持
 * (cellIndex, pieceData)
 */
let selectedPiece = null;

/**
 * ボタンで選択したコマの大きさ (L, M, Sのいずれか or null)
 */
let selectedSize = null;

/**
 * 初期表示
 */
updateDisplay();

/**
 * 各サイズボタンにクリックイベントを登録して、selectedSizeを変更
 */
sizeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const size = button.dataset.size; // "L" / "M" / "S"
    selectedSize = size;
    selectedSizeDisplay.textContent = size;
  });
});

/**
 * ボード(セル)をクリックしたときの処理
 */
boardElement.addEventListener('click', (e) => {
  const cell = e.target;
  const index = parseInt(cell.dataset.index, 10);
  if (isNaN(index)) return;

  // もし既に「移動モード」でコマを選択しているなら、移動先にコマを置く
  if (selectedPiece) {
    moveOrStackPiece(selectedPiece, index);
    selectedPiece = null;
    selectedPieceInfo.textContent = '(なし)';
    endTurn(); // ターン終了
    return;
  }

  // 移動モードでない場合は……
  const topPiece = getTopPiece(index);

  // (1) クリックしたセルの最上段が自分のコマなら、それを選択して「移動モード」に入る
  if (topPiece && topPiece.player === currentPlayer) {
    // 移動選択
    selectedPiece = {
      cellIndex: index,
      pieceData: topPiece
    };
    selectedPieceInfo.textContent = 
      `${index}番セル(${topPiece.player}, ${topPiece.size})を選択中`;
  } else {
    // (2) 新規配置(手持ちコマがあれば置ける)
    if (!selectedSize) {
      alert("まずはコマのサイズ(L/M/S)を選択してください。");
      return;
    }

    // 手持ちが残っているか確認
    if (pieces[currentPlayer][selectedSize] <= 0) {
      alert(`大きさ「${selectedSize}」の手持ちコマはもうありません!`);
      return;
    }

    // 新規配置
    placeNewPiece(currentPlayer, selectedSize, index);
    endTurn(); // ターン終了
  }
});

/**
 * 新しいコマをボードに置く
 */
function placeNewPiece(player, size, index) {
  board[index].push({ player, size });
  pieces[player][size] -= 1; // 手持ちを1つ減らす
}

/**
 * index番セルの一番上のコマを返す(なければnull)
 */
function getTopPiece(index) {
  const stack = board[index];
  if (stack.length === 0) return null;
  return stack[stack.length - 1];
}

/**
 * 「移動モード」で選択中のコマを別のセルへ移動する
 */
function moveOrStackPiece(selected, newIndex) {
  const { cellIndex, pieceData } = selected;
  // 元セルから取り除く(最上段のみ)
  board[cellIndex].pop();
  // 新セルに追加
  board[newIndex].push(pieceData);
}

/**
 * ターン終了処理: 画面更新, 勝敗チェック, プレイヤー交代
 */
function endTurn() {
  renderBoard();
  if (checkWinner(currentPlayer)) {
    setTimeout(() => {
      alert(currentPlayer + 'が勝ちました!');
      resetGame();
    }, 10);
    return;
  }

  // 全セルが埋まっていて勝者なし→引き分け
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
 * 盤面の表示更新
 */
function renderBoard() {
  cellElements.forEach((cell, i) => {
    const topPiece = getTopPiece(i);
    cell.textContent = topPiece ? (topPiece.player + topPiece.size) : '';
  });
}

/**
 * スコア等の表示更新
 */
function updateDisplay() {
  currentPlayerInfo.textContent = currentPlayer;
  piecesXInfo.textContent = 
    `L:${pieces['×'].L}, M:${pieces['×'].M}, S:${pieces['×'].S}`;
  piecesOInfo.textContent = 
    `L:${pieces['○'].L}, M:${pieces['○'].M}, S:${pieces['○'].S}`;
  selectedPieceInfo.textContent = '(なし)';
  selectedSizeDisplay.textContent = selectedSize ? selectedSize : '(なし)';
  renderBoard();
}

/**
 * 勝利判定
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
