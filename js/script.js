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

    // まだコマを選択していない場合
    // 1. 新規にコマを置くか（手持ちのコマを設置）
    // 2. 既に置いてあるコマを選択するか

    //もしセルの一番上にあるコマが自分のものならそれを選択して移動モード
    const topPiece = getTopPiece(index);
    if (topPiece && topPiece.player === currentPlayer) {
        selectedPiece = {
            cellIndex: index,
            pieceData: topPiece
        };
        
    }
    
    if (index !== undefined && board[index] === null) {
        board[index] = currentPlayer;
        target.textContent = currentPlayer;
        if (checWinner(currentPlayer)) {
            setTimeout(() => alert(currentPlayer + 'が勝ちました。'), 1);
            boardElement.style.pointerEvents = 'none';
        } else if (board.every(cell => cell !== null)) {
            setTimeout(() => alert('引き分けです。'), 1)
        }
    }
    setTimeout(() => currentPlayer = currentPlayer === 'x' ? 'o' : 'x', 5);
});

function checWinner(player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
        ];
    return winPatterns.some(pattern =>
        pattern.every(index => board[index] === player)
    );
}