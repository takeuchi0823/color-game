document.addEventListener('DOMContentLoaded', () => {
    const redSlider = document.getElementById('red-slider');
    const greenSlider = document.getElementById('green-slider');
    const blueSlider = document.getElementById('blue-slider');

    const redValueDec = document.getElementById('red-value-dec');
    const redValueBin = document.getElementById('red-value-bin');
    const redValueHex = document.getElementById('red-value-hex');
    const greenValueDec = document.getElementById('green-value-dec');
    const greenValueBin = document.getElementById('green-value-bin');
    const greenValueHex = document.getElementById('green-value-hex');
    const blueValueDec = document.getElementById('blue-value-dec');
    const blueValueBin = document.getElementById('blue-value-bin');
    const blueValueHex = document.getElementById('blue-value-hex');

    const playerColorBox = document.getElementById('player-color-box');
    const targetColorBox = document.getElementById('target-color-box');
    const currentHexCode = document.getElementById('current-hex-code');
    const decideButton = document.getElementById('decide-button');
    const nextQuestionButton = document.getElementById('next-question-button');

    const gameArea = document.querySelector('.game-area');
    const resultArea = document.querySelector('.result-area');
    const resultPlayerColor = document.getElementById('result-player-color');
    const resultPlayerCode = document.getElementById('result-player-code');
    const resultTargetColor = document.getElementById('result-target-color');
    const resultTargetCode = document.getElementById('result-target-code');
    const scoreDisplay = document.getElementById('score-display');
    const scoreList = document.getElementById('score-list');
    const timerDisplay = document.getElementById('timer-display'); // タイマー表示要素

    let targetRed, targetGreen, targetBlue;
    let scoreHistory = [];
    const MAX_SCORE_HISTORY = 10;
    const TIME_LIMIT = 30; // 制限時間（秒）
    let timeLeft = TIME_LIMIT;
    let timerInterval; // タイマーを管理する変数

    // ヘルパー関数: 数値を2桁の16進数に変換
    function toHex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    // ヘルパー関数: 数値を8桁の2進数に変換 (左ゼロ埋め)
    function toBinary(c) {
        return c.toString(2).padStart(8, '0');
    }

    // 現在のスライダー値に基づいてプレイヤーの色を更新
    function updatePlayerColor() {
        const r = parseInt(redSlider.value);
        const g = parseInt(greenSlider.value);
        const b = parseInt(blueSlider.value);

        playerColorBox.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        currentHexCode.textContent = `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();

        redValueDec.textContent = r;
        redValueBin.textContent = toBinary(r);
        redValueHex.textContent = toHex(r).toUpperCase();

        greenValueDec.textContent = g;
        greenValueBin.textContent = toBinary(g);
        greenValueHex.textContent = toHex(g).toUpperCase();

        blueValueDec.textContent = b;
        blueValueBin.textContent = toBinary(b);
        blueValueHex.textContent = toHex(b).toUpperCase();
    }

    // タイマーの開始
    function startTimer() {
        clearInterval(timerInterval); // 既存のタイマーをクリア
        timeLeft = TIME_LIMIT;
        timerDisplay.textContent = `残り時間: ${timeLeft}秒`;
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `残り時間: ${timeLeft}秒`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                decideButton.click(); // 時間切れで自動的に決定ボタンをクリック
            }
        }, 1000);
    }

    // 新しい問題を設定
    function setNewQuestion() {
        targetRed = Math.floor(Math.random() * 256);
        targetGreen = Math.floor(Math.random() * 256);
        targetBlue = Math.floor(Math.random() * 256);

        targetColorBox.style.backgroundColor = `rgb(${targetRed}, ${targetGreen}, ${targetBlue})`;

        // スライダーを初期位置に戻す（任意だが、新しい問題感が出る）
        redSlider.value = 128;
        greenSlider.value = 128;
        blueSlider.value = 128;
        updatePlayerColor(); // プレイヤーの色と数値を初期値で更新

        gameArea.classList.remove('hidden');
        resultArea.classList.add('hidden');
        decideButton.disabled = false; // 決定ボタンを有効にする
        
        startTimer(); // 新しい問題でタイマーを開始
    }

    // スコア計算
    function calculateScore(r1, g1, b1, r2, g2, b2) {
        // 色差の計算 (ユークリッド距離)
        const dr = r1 - r2;
        const dg = g1 - g2;
        const db = b1 - b2;
        const distance = Math.sqrt(dr * dr + dg * dg + db * db);

        // 最大距離 (255,0,0 と 0,255,255 のような対極の色)
        // sqrt(255^2 + 255^2 + 255^2) = sqrt(3 * 255^2) = 255 * sqrt(3) 約 441.67
        const maxDistance = Math.sqrt(3 * 255 * 255);

        // スコアは距離が近いほど高くなるように調整
        // 距離が0なら100点、最大距離なら0点
        const score = Math.max(0, 100 - (distance / maxDistance) * 100);
        return Math.round(score);
    }

    // スコア履歴を更新し、表示を更新
    function updateScoreHistory(score, playerHex, targetHex) {
        scoreHistory.unshift({
            score: score,
            player: playerHex,
            target: targetHex
        }); // 先頭に追加

        if (scoreHistory.length > MAX_SCORE_HISTORY) {
            scoreHistory.pop(); // 最新10件に制限
        }

        renderScoreHistory();
    }

    // スコア履歴の表示をレンダリング
    function renderScoreHistory() {
        scoreList.innerHTML = ''; // 一度クリア
        scoreHistory.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="score-item-details">
                    ${index + 1}回目: スコア <span>${item.score}</span>点
                </span>
                <span class="score-item-details">
                    あなたの色: ${item.player}
                </span>
                <span class="score-item-details">
                    正解の色: ${item.target}
                </span>
            `;
            scoreList.appendChild(li);
        });
    }

    // イベントリスナー
    redSlider.addEventListener('input', updatePlayerColor);
    greenSlider.addEventListener('input', updatePlayerColor);
    blueSlider.addEventListener('input', updatePlayerColor);

    decideButton.addEventListener('click', () => {
        clearInterval(timerInterval); // 決定ボタンが押されたらタイマーを停止

        const playerR = parseInt(redSlider.value);
        const playerG = parseInt(greenSlider.value);
        const playerB = parseInt(blueSlider.value);

        const score = calculateScore(playerR, playerG, playerB, targetRed, targetGreen, targetBlue);

        // 結果表示エリアの更新
        resultPlayerColor.style.backgroundColor = `rgb(${playerR}, ${playerG}, ${playerB})`;
        resultPlayerCode.textContent = `#${toHex(playerR)}${toHex(playerG)}${toHex(playerB)}`.toUpperCase();
        resultTargetColor.style.backgroundColor = `rgb(${targetRed}, ${targetGreen}, ${targetBlue})`;
        resultTargetCode.textContent = `#${toHex(targetRed)}${toHex(targetGreen)}${toHex(targetBlue)}`.toUpperCase();
        scoreDisplay.textContent = `スコア: ${score}点`;

        // スコア履歴の保存と表示更新
        updateScoreHistory(score, resultPlayerCode.textContent, resultTargetCode.textContent);

        gameArea.classList.add('hidden');
        resultArea.classList.remove('hidden');
        decideButton.disabled = true; // 決定ボタンを無効にする
    });

    nextQuestionButton.addEventListener('click', setNewQuestion);

    // 初期化
    setNewQuestion();
    updatePlayerColor(); // スライダーの初期値で表示を更新
    renderScoreHistory(); // スコア履歴の初期表示 (空)
});