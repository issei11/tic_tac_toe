/**********************************************
 * グローバル変数
 **********************************************/
let board = Array(9).fill(null).map(() => []);
let pieces = {
  x: { L: 2, M: 2, S: 2 },
  o: { L: 2, M: 2, S: 2 },
};
let currentPlayer = 'x'; // 'x' or 'o'

/**********************************************
 * ヘルパー: サイズを数値化 (L=3, M=2, S=1)
 **********************************************/
function getSizeValue(size) {
  switch (size) {
    case 'L': return 3;
    case 'M': return 2;
    case 'S': return 1;
    default:  return 0;
  }
}

/**********************************************
 * ページロード時
 **********************************************/
window.addEventListener('DOMContentLoaded', () => {
  renderBoard();
  renderRemainingPieces();
  setupDragAndDrop();
});

/**********************************************
 * ボード描画
 **********************************************/
function renderBoard() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    let index = +cell.dataset.index;
    let stack = board[index];
    // 最上段のみ表示
    if (!stack.length) {
      cell.textContent = '';
      cell.style.fontSize = '';
      cell.style.color = '';
    } else {
      let topPiece = stack[stack.length - 1];
      cell.textContent = '●';
      cell.style.color = (topPiece.player === 'x') ? 'lightblue' : 'orange';
      switch (topPiece.size) {
        case 'L': cell.style.fontSize = '160px'; break;
        case 'M': cell.style.fontSize = '80px';  break;
        case 'S': cell.style.fontSize = '40px';  break;
      }
    }
  });
}

/**********************************************
 * 残りコマ(手元)の描画
 **********************************************/
function renderRemainingPieces() {
  // x側
  const pieceContainerX = document.getElementById('pieceContainerX');
  pieceContainerX.innerHTML = '';
  Object.keys(pieces.x).forEach(size => {
    for (let i = 0; i < pieces.x[size]; i++) {
      let div = createPieceElement('x', size);
      pieceContainerX.appendChild(div);
    }
  });

  // o側
  const pieceContainerO = document.getElementById('pieceContainerO');
  pieceContainerO.innerHTML = '';
  Object.keys(pieces.o).forEach(size => {
    for (let i = 0; i < pieces.o[size]; i++) {
      let div = createPieceElement('o', size);
      pieceContainerO.appendChild(div);
    }
  });
}

/**********************************************
 * 手元コマのDOM要素を生成
 * ドラッグ開始時に (player, size) を渡す
 **********************************************/
function createPieceElement(player, size) {
  let div = document.createElement('div');
  div.classList.add('piece', `${player}-${size}`);
  div.draggable = true;
  div.dataset.player = player;
  div.dataset.size = size;
  div.textContent = '●';

  // ドラッグ開始イベント
  div.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      player: e.target.dataset.player,
      size: e.target.dataset.size
    }));
    e.dataTransfer.effectAllowed = 'move';
  });

  return div;
}

/**********************************************
 * ボード(セル)側のドラッグ&ドロップ設定
 **********************************************/
function setupDragAndDrop() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.addEventListener('dragover', e => {
      e.preventDefault();
    });

    cell.addEventListener('drop', e => {
      e.preventDefault();
      let data = e.dataTransfer.getData('text/plain');
      if (!data) return;
      let pieceData = JSON.parse(data);
      let index = +cell.dataset.index;

      // 現在のプレイヤーと一致しているかチェック
      if (pieceData.player !== currentPlayer) {
        alert('現在のプレイヤーではありません。');
        return;
      }
      // 手持ちコマが残っているか
      if (pieces[pieceData.player][pieceData.size] <= 0) {
        alert('そのコマはもう残っていません。');
        return;
      }
      // 「自分と同サイズ or 大きいコマの上には置けない」ルール
      if (board[index].length > 0) {
        let topPiece = board[index][board[index].length - 1];
        if (getSizeValue(topPiece.size) >= getSizeValue(pieceData.size)) {
          alert('そのマスのトップは同サイズ以上なので置けません。');
          return;
        }
      }

      // 置ける場合:
      pieces[pieceData.player][pieceData.size] -= 1;
      board[index].push({ player: pieceData.player, size: pieceData.size });
      renderBoard();
      renderRemainingPieces();
      endTurn();
    });
  });
}

/**********************************************
 * ターン終了処理 (勝敗判定, 引き分け判定)
 **********************************************/
function endTurn() {
  if (checkWinner(currentPlayer)) {
    setTimeout(() => {
      alert((currentPlayer === 'x' ? '×' : '○') + 'の勝ち！');
      resetGame();
    }, 50);
    return;
  }
  // すべてのセルが埋まったかチェック
  if (board.every(stack => stack.length > 0)) {
    alert('引き分けです。');
    resetGame();
    return;
  }
  // プレイヤー交代
  currentPlayer = (currentPlayer === 'x') ? 'o' : 'x';
}

/**********************************************
 * 勝利判定
 **********************************************/
function checkWinner(player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(pattern => {
    return pattern.every(idx => {
      let stack = board[idx];
      if (!stack.length) return false;
      let top = stack[stack.length - 1];
      return top.player === player;
    });
  });
}

/**********************************************
 * リセット
 **********************************************/
function resetGame() {
  board = Array(9).fill(null).map(() => []);
  pieces = {
    x: { L: 2, M: 2, S: 2 },
    o: { L: 2, M: 2, S: 2 },
  };
  currentPlayer = 'x';
  renderBoard();
  renderRemainingPieces();
}
