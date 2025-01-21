const boardElement = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
let currentPlayer = '×';
let board = Array(9).fill(null);

boardElement.addEventListener('click', (e) => {
    const target = e.target;
    const index = target.dataset.index;
    
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
    setTimeout(() => currentPlayer = currentPlayer === '×' ? '○' : '×', 5);
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