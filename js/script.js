  /*****************************************************************
     * ゲーム管理用の変数や初期値
     *****************************************************************/
    // 各セルはスタック(配列)でコマ管理: [{player:'x' or 'o', size:'L/M/S'}, ...]
    let board = Array(9).fill(null).map(() => []);

    // 各プレイヤーが持つコマ(L, M, S 各2個)
    let pieces = {
      x: { L: 2, M: 2, S: 2 },
      o: { L: 2, M: 2, S: 2 },
    };

    // 現在のプレイヤー('x' or 'o')
    let currentPlayer = 'x';

    /*****************************************************************
     * ページ読み込み完了時の処理
     *****************************************************************/
    window.addEventListener('DOMContentLoaded', () => {
      renderBoard();
      renderRemainingPieces();
      setupDragAndDrop();
    });


    /*****************************************************************
     * 1. ボード描画
     *****************************************************************/
    function renderBoard() {
      // 各セルに、最上段のコマがあれば●を表示(今回のサンプルではあまり見せずに、先頭だけ)
      const cells = document.querySelectorAll('.cell');
      cells.forEach((cell) => {
        let index = parseInt(cell.dataset.index, 10);
        let stack = board[index];
        if (!stack.length) {
          cell.textContent = '';
        } else {
          // 最上段のみ表示 (stackの末尾がトップ)
          let topPiece = stack[stack.length - 1];
          cell.textContent = '●';
          // 水色 or オレンジ
          cell.style.color = (topPiece.player === 'x') ? 'lightblue' : 'orange';

          // 大きさ調整(L, M, S)
          switch(topPiece.size) {
            case 'L':
              cell.style.fontSize = '160px'; // セル200のうち、大きめの値
              break;
            case 'M':
              cell.style.fontSize = '80px';
              break;
            case 'S':
              cell.style.fontSize = '40px';
              break;
          }
        }
      });
    }

    /*****************************************************************
     * 2. 残りコマ描画 (手元でドラッグ可能な●を並べる)
     *****************************************************************/
    function renderRemainingPieces() {
      // x側のコマ一覧
      const pieceContainerX = document.getElementById('pieceContainerX');
      pieceContainerX.innerHTML = ''; // 初期化
      Object.keys(pieces.x).forEach((size) => {
        for (let i = 0; i < pieces.x[size]; i++) {
          let div = createPieceElement('x', size);
          pieceContainerX.appendChild(div);
        }
      });

      // o側のコマ一覧
      const pieceContainerO = document.getElementById('pieceContainerO');
      pieceContainerO.innerHTML = ''; // 初期化
      Object.keys(pieces.o).forEach((size) => {
        for (let i = 0; i < pieces.o[size]; i++) {
          let div = createPieceElement('o', size);
          pieceContainerO.appendChild(div);
        }
      });
    }

    /*****************************************************************
     * 3. コマのDOM要素を作り、ドラッグ可能にする
     *****************************************************************/
    function createPieceElement(player, size) {
      // <div class="piece x-L" draggable="true">●</div> のような要素を生成
      const div = document.createElement('div');
      div.classList.add('piece', `${player}-${size}`);
      // 「x-L」「o-L」などのクラスで色と大きさをCSS制御
      div.setAttribute('draggable', 'true');
      // data属性で保持
      div.dataset.player = player;
      div.dataset.size = size;
      div.textContent = '●';

      // ドラッグ開始イベント
      div.addEventListener('dragstart', onDragStartPiece);

      return div;
    }

    function onDragStartPiece(e) {
      // ドラッグ情報としてプレイヤー/サイズを渡す
      let player = e.target.dataset.player;
      let size = e.target.dataset.size;
      // DataTransferにプレイヤーとサイズを保存
      e.dataTransfer.setData('text/plain', JSON.stringify({ player, size }));
      // ドラッグ元要素を記憶(後で削除するかどうか)
      e.dataTransfer.effectAllowed = 'move';
    }

    /*****************************************************************
     * 4. セル(ボード)側でのドラッグ&ドロップ設定
     *****************************************************************/
    function setupDragAndDrop() {
      const cells = document.querySelectorAll('.cell');
      cells.forEach((cell) => {
        // ドラッグオーバーしたとき、ドロップ可能にする
        cell.addEventListener('dragover', (e) => {
          e.preventDefault();
        });

        // ドロップ時
        cell.addEventListener('drop', (e) => {
          e.preventDefault();
          // DataTransferからplayerとsizeを受け取る
          let data = e.dataTransfer.getData('text/plain');
          if (!data) return;
          let pieceData = JSON.parse(data);  // { player, size }

          // そのコマをセルに置けるか確認し、置く
          let index = parseInt(cell.dataset.index, 10);

          // 例: "現在のプレイヤー以外の駒は置けない" 等、ルールがあればチェック
          if (pieceData.player !== currentPlayer) {
            alert('現在のプレイヤーとは違う駒です。');
            return;
          }

          // 手持ちコマを 1つ 減らす
          if (!pieces[pieceData.player][pieceData.size] ||
              pieces[pieceData.player][pieceData.size] <= 0) {
            alert('そのコマは残っていません。');
            return;
          }
          pieces[pieceData.player][pieceData.size] -= 1;

          // board配列に追加（スタック）
          board[index].push({ player: pieceData.player, size: pieceData.size });

          // ボード描画更新、残コマ描画更新
          renderBoard();
          renderRemainingPieces();

          // (オプション) 勝敗判定やターン交代など
          endTurn();
        });
      });
    }

    /*****************************************************************
     * 5. ターン終了→勝利判定など (簡易実装例)
     *****************************************************************/
    function endTurn() {
      // 簡単な勝利判定
      if (checkWinner(currentPlayer)) {
        setTimeout(() => {
          alert((currentPlayer === 'x' ? '×' : '○') + ' が勝ちです!');
          resetGame();
        }, 50);
        return;
      }

      // 盤が埋まり切ったかどうか
      if (board.every(stack => stack.length > 0)) {
        alert('引き分けです');
        resetGame();
        return;
      }

      // プレイヤー交代
      currentPlayer = (currentPlayer === 'x') ? 'o' : 'x';
    }

    function checkWinner(player) {
      const lines = [
        [0,1,2],[3,4,5],[6,7,8], // rows
        [0,3,6],[1,4,7],[2,5,8], // cols
        [0,4,8],[2,4,6]          // diagonals
      ];
      return lines.some(pattern => {
        return pattern.every(idx => {
          let stack = board[idx];
          // 最上段がplayerの駒ならOK
          if (!stack.length) return false;
          let top = stack[stack.length - 1];
          return top.player === player;
        });
      });
    }

    function resetGame() {
      // 初期化
      board = Array(9).fill(null).map(() => []);
      pieces = {
        x: { L: 2, M: 2, S: 2 },
        o: { L: 2, M: 2, S: 2 },
      };
      currentPlayer = 'x';
      renderBoard();
      renderRemainingPieces();
    }
