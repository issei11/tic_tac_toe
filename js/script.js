const boardElement = document.getElementById('board');
const cellElements = Array.from(document.querySelectorAll('.cell'));

const currentPlayerInfo = document.getElementById(`currentPlayerInfo`);
const piecesXInfo = document.getElementById(`piecesXInfo`);
const piecesOInfo = document.getElementById(`piecesOInfo`);
const selectedPieceInfo = document.getElementById(`selectedPieceInfo`);

/**
 * 各セルはスタック構造でコマを管理
 * 上に行くほど末尾の配列要素
 * 例：board[0] = [{ player: 'x', size: 'S' }, { player: 'o', size: 'M' }]
 */
let board = Array(9).fill(null).map(() => []);

/**
 * 各プレイヤーのコマ残数
 */
let pieces = {
    'x': { 'L': 2, 'M': 2, 'S': 2},
    'o': { 'L': 2, 'M': 2, 'S': 2}
};

let currentPlayer = 'x';

/**
 * プレイヤーが「移動したい（または被せたい）コマ」を選択中かどうか。
 * {cellIndex, pieceData}のように保持
 */
let selectedPiece = null;

updateDisplay();

boardElement.addEventListener('click', (e) => {
    const cell = e.target;
    const index = parseInt(cell.dataset.index, 10);

    if (isNaN(index)) return;

    if (selectedPiece) {
        movePiece(selectedPiece, index);
        selectedPiece = null;
        selectedPieceInfo.textContent = '(なし)'
        endTurn();
        return;
    }

/* script.js: 三目並べに大中小コマを導入した例 */
const boardElement = document.getElementById('board');
const cellElements = Array.from(document.querySelectorAll('.cell'));

const currentPlayerInfo = document.getElementById('currentPlayerInfo');
const piecesXInfo = document.getElementById('piecesXInfo');
const piecesOInfo = document.getElementById('piecesOInfo');
const selectedPieceInfo = document.getElementById('selectedPieceInfo');

/**
 * 各セルはスタック構造（上に行くほど末尾の配列要素）でコマを管理
 * 例: board[0] = [{ player: '×', size: 'S' }, { player: '○', size: 'M' }]
 */
let board = Array(9).fill(null).map(() => []);

/**
 * 各プレイヤーのコマ残数(大: L, 中: M, 小: S)それぞれ2個
 */
let pieces = {
  '×': { 'L': 2, 'M': 2, 'S': 2 },
  '○': { 'L': 2, 'M': 2, 'S': 2 }
};

/**
 * 現在のプレイヤー ('×' or '○')
 */
let currentPlayer = '×';

/**
 * プレイヤーが「移動したい(または被せたい)コマ」を選択中かどうか。
 * 選択した場合、{ cellIndex, pieceData } のように保持する。
 */
let selectedPiece = null;

/**
 * 初期表示
 */
updateDisplay();

boardElement.addEventListener('click', (e) => {
  const cell = e.target;
  const index = parseInt(cell.dataset.index, 10);

  // クリック対象がセルでなければ無視
  if (isNaN(index)) return;

  // 既に"移動・被せ"したいコマを選択している場合
  if (selectedPiece) {
    // (A) 現在選択中のコマをここ(index)に置く処理
    moveOrStackPiece(selectedPiece, index);
    selectedPiece = null;
    selectedPieceInfo.textContent = '(なし)';
    // ターン終了し、勝敗判定へ
    endTurn();
    return;
  }

  // まだコマを選択していない場合、
  // 1) 新規にコマを置くか(手持ちのコマを設置)
  // 2) 既に置いてあるコマを選択(移動用)するか
  // の判断を行う

  // もしセルの一番上にあるコマが自分のものなら、それを選択して移動するモードにする
  const topPiece = getTopPiece(index);
  if (topPiece && topPiece.player === currentPlayer) {
    // 移動選択
    selectedPiece = {
      cellIndex: index,
      pieceData: topPiece
    };
    selectedPieceInfo.textContent = 
      `${index}番セルの(${topPiece.player}, ${topPiece.size})を選択中`;
  } else {
    // 手持ちのコマがあれば、新規に置くこともできる
    // ここでは仮にサイズを選ぶUIを用意していないので、強制的に小コマを置く例を示す
    // 実際はUIで選ばせたり、順番に置かせたりするなど調整してください。
    const placeSize = findAvailableSize(currentPlayer);
    if (!placeSize) {
      alert("もう置けるコマがありません。移動してください。");
      return;
    }
    // 新規配置
    placeNewPiece(currentPlayer, placeSize, index);
    // ターン終了し、勝敗判定へ
    endTurn();
  }
});

/**
 * 手持ちのコマがまだ残っているサイズを1つ返す(例としてS->M->Lの順で探す)
 */
function findAvailableSize(player) {
  if (pieces[player].S > 0) return 'S';
  if (pieces[player].M > 0) return 'M';
  if (pieces[player].L > 0) return 'L';
  return null;
}

/**
 * 新しいコマをボードに置く
 */
function placeNewPiece(player, size, index) {
  board[index].push({ player, size });
  pieces[player][size] -= 1; // 手持ちを減らす
}

/**
 * 選択中のコマを取り出して、別のセルに被せる/移動する
 */
function moveOrStackPiece(selected, newIndex) {
  const { cellIndex, pieceData } = selected;
  // 元のセルからコマを削除(最上段にあるコマしか動かせない前提)
  board[cellIndex].pop();

  // 新しいセルに積む
  board[newIndex].push(pieceData);
}

/**
 * index番目セルの一番上のコマ情報を返す (なければnull)
 */
function getTopPiece(index) {
  const stack = board[index];
  if (stack.length === 0) return null;
  return stack[stack.length - 1];
}

/**
 * ターン終了処理
 */
function endTurn() {
  renderBoard();
  if (checkWinner(currentPlayer)) {
    setTimeout(() => {
      alert(currentPlayer + 'が勝ちました！');
      resetGame();
    }, 10);
    return;
  }

  // 全セル埋まっており、かつ誰も勝っていないなら引き分け
  if (board.every(stack => stack.length > 0)) {
    setTimeout(() => {
      alert('引き分けです。');
      resetGame();
    }, 10);
    return;
  }

  // プレイヤー交代
  currentPlayer = currentPlayer === '×' ? '○' : '×';
  updateDisplay();
}

/**
 * ボードをHTMLに反映
 */
function renderBoard() {
  cellElements.forEach((cell, i) => {
    const topPiece = getTopPiece(i);
    if (topPiece) {
      cell.textContent = topPiece.player + topPiece.size;
    } else {
      cell.textContent = '';
    }
  });
}

/**
 * 画面の各種情報を更新
 */
function updateDisplay() {
  currentPlayerInfo.textContent = currentPlayer;
  piecesXInfo.textContent = 
    `L:${pieces['×'].L}, M:${pieces['×'].M}, S:${pieces['×'].S}`;
  piecesOInfo.textContent = 
    `L:${pieces['○'].L}, M:${pieces['○'].M}, S:${pieces['○'].S}`;
  renderBoard();
}

/**
 * 勝利判定。各セルの「一番上のコマのplayer」が3つ揃っているかをチェック
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
 * ゲームリセット処理(必要に応じて呼び出す)
 */
function resetGame() {
  // 初期化
  board = Array(9).fill(null).map(() => []);
  pieces = {
    '×': { 'L': 2, 'M': 2, 'S': 2 },
    '○': { 'L': 2, 'M': 2, 'S': 2 }
  };
  currentPlayer = '×';
  selectedPiece = null;
  updateDisplay();
}
