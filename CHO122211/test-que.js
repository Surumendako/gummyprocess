const params = new URLSearchParams(location.search);

let stageNumber = parseInt(params.get("stage"));

if (!stageNumber || stageNumber < 1) {
  stageNumber = parseInt(localStorage.getItem("POPI_CH_STAGE")) || 1;
}

const mode =
  params.get("mode") ||
  localStorage.getItem("POPI_CH_MODE") ||
  "textbook";

localStorage.setItem("POPI_CH_STAGE", stageNumber);
localStorage.setItem("POPI_CH_MODE", mode);

if (
  !window.WORD_DATA ||
  !WORD_DATA[mode] ||
  !WORD_DATA[mode]["stage" + stageNumber]
) {
  alert("単語データが見つかりません");
  location.href = "index.html";
}

let questions = [...WORD_DATA[mode]["stage" + stageNumber]];
shuffle(questions);

let results      = [];
let currentIndex = 0;
let currentInput = "";   // プレーン文字列（ロジック用）
let hintCount    = 0;    // 自動入力されたヒント文字数
let incorrectCount = 0;
let assistMode   = 0;

const jpWordEl    = document.getElementById("jpWord");
const answerEl    = document.getElementById("answer");   // div
const revealEl    = document.getElementById("answerReveal");
const progressBar = document.getElementById("progressBar");
const keyboard    = document.getElementById("keyboard");

/* ---- 表示更新 ---- */
function renderAnswer() {
  // ヒント部分（水色）＋通常入力部分（デフォルト色）をspanで分ける
  const hintPart   = currentInput.slice(0, hintCount);
  const normalPart = currentInput.slice(hintCount);

  answerEl.innerHTML =
    (hintPart   ? `<span class="hint-chars">${escHtml(hintPart)}</span>`   : "") +
    (normalPart ? `<span class="normal-chars">${escHtml(normalPart)}</span>` : "") +
    (currentInput === "" ? "" : ""); // 空のときは空表示（プレースホルダはCSSで）
}

function escHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

/* ---- 入力操作 ---- */
function add(char) {
  currentInput += char;
  renderAnswer();
}

function del() {
  // ヒント文字は消せない
  if (currentInput.length <= hintCount) return;
  currentInput = currentInput.slice(0, -1);
  renderAnswer();
}

function clearAll() {
  // ヒント文字は残す
  currentInput = currentInput.slice(0, hintCount);
  renderAnswer();
}

/* ---- ヒント自動入力 ---- */
function autoFillHint(n) {
  const correct = questions[currentIndex].english;
  hintCount     = n;
  currentInput  = correct.slice(0, n);
  renderAnswer();
}

/* ---- 問題表示 ---- */
function showNextQuestion() {
  if (currentIndex >= questions.length) return finishStage();

  const currentQ = questions[currentIndex];
  jpWordEl.textContent = `「${currentQ.japanese}」`;

  currentInput   = "";
  hintCount      = 0;
  incorrectCount = 0;
  assistMode     = 0;

  answerEl.innerHTML = "";
  revealEl.textContent = "";
  revealEl.classList.remove("show");

  updateAssistKeys();
  updateProgress();
}

/* ---- 答え合わせ ---- */
function check() {
  if (!currentInput) return;

  const correct  = questions[currentIndex].english;
  const isCorrect =
    currentInput.trim().toLowerCase() ===
    correct.trim().toLowerCase();

  if (isCorrect) {
    showJudge("correct");

    results.push({
      japanese:   questions[currentIndex].japanese,
      correct:    correct,
      userAnswer: currentInput,
      isCorrect:  true
    });

    setTimeout(() => {
      currentIndex++;
      showNextQuestion();
    }, 600);

  } else {
    showJudge("wrong");
    incorrectCount++;

    if (incorrectCount >= 5) {
      // 5回目：答えを表示して次へ
      showAnswerText();

      results.push({
        japanese:   questions[currentIndex].japanese,
        correct:    correct,
        userAnswer: currentInput,
        isCorrect:  false
      });

      setTimeout(() => {
        currentIndex++;
        showNextQuestion();
      }, 1500);

    } else if (incorrectCount === 4) {
      // 4回目：先頭2文字を水色で自動入力
      setTimeout(() => autoFillHint(2), 400);

    } else if (incorrectCount === 3) {
      // 3回目：先頭1文字を水色で自動入力
      setTimeout(() => autoFillHint(1), 400);

    } else {
      // 1〜2回目：クリア
      setTimeout(clearAll, 400);
    }
  }
}

function showAnswerText() {
  revealEl.textContent = questions[currentIndex].english;
  revealEl.classList.add("show");
}

/* ---- ヒントボタン ---- */
function useAssist() {
  assistMode = (assistMode + 1) % 2;
  updateAssistKeys();
}

function updateAssistKeys() {
  const correctChars =
    (questions[currentIndex]?.english || "").split("");

  const keys = document.querySelectorAll(".keyboard img");

  keys.forEach(img => {
    const keyChar =
      img.getAttribute("onclick")?.match(/'(.+)'/)?.[1];
    if (!keyChar) return;
    const isCorrectChar = correctChars.includes(keyChar);
    img.style.opacity =
      assistMode === 0 || isCorrectChar ? "1" : "0.25";
  });
}

/* ---- ステージ終了 ---- */
function finishStage() {
  keyboard.style.display = "none";
  progressBar.style.width = "100%";

  const stageEndArea = document.getElementById("stageEndArea");
  stageEndArea.style.display = "block";

  // test-ch.js で使うデータを保存
  // 全単語（元の順序で）
  localStorage.setItem(
    "POPI_CH_DATA",
    JSON.stringify(WORD_DATA[mode]["stage" + stageNumber])
  );
  // 間違えた単語だけ
  const wrongList = results
    .filter(r => !r.isCorrect)
    .map(r => ({ japanese: r.japanese, english: r.correct }));
  localStorage.setItem("POPI_WRONG_WORDS", JSON.stringify(wrongList));

  showResultList();

  const nextStageNum = stageNumber + 1;
  const nextBtn = document.getElementById("nextStageBtn");

  if (WORD_DATA[mode]["stage" + nextStageNum]) {
    nextBtn.style.display = "inline";
    nextBtn.onclick = () => {
      localStorage.setItem("POPI_CH_STAGE", nextStageNum);
      location.href =
        location.pathname +
        "?mode=" + mode +
        "&stage=" + nextStageNum;
    };
  } else {
    nextBtn.style.display = "none";
  }
}

function showResultList() {
  const container = document.createElement("div");
  container.className = "result-list";

  results.forEach(r => {
    const item = document.createElement("div");
    item.className = "result-item";

    const icon = document.createElement("img");
    icon.src = r.isCorrect ? "pic/poo.png" : "pic/buu.png";
    icon.style.width = "24px";
    icon.style.verticalAlign = "middle";
    icon.style.marginRight = "8px";

    item.appendChild(icon);
    item.innerHTML += `
      <strong>${r.japanese}</strong><br>
      正解: ${r.correct}<br>
      あなた: ${r.userAnswer}
    `;

    container.appendChild(item);
  });

  document.getElementById("stageEndArea").appendChild(container);
}

/* ---- ユーティリティ ---- */
function updateProgress() {
  progressBar.style.width =
    (currentIndex / questions.length) * 100 + "%";
}

function showJudge(type) {
  const el = document.getElementById(type);
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* ---- キーボード ---- */
window.addEventListener("keydown", e => {
  if (currentIndex >= questions.length || e.repeat) return;
  if (e.key === "Enter")          check();
  else if (e.key === "Backspace") del();
  else if (/^[a-z-]$/i.test(e.key)) add(e.key.toLowerCase());
});

document.getElementById("retryBtn").onclick = () => location.reload();
document.getElementById("quitBtn").onclick  = () => location.href = "test-ser.html";

showNextQuestion();