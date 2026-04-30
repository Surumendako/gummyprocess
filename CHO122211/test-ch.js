const params = new URLSearchParams(location.search);
const stage  = Number(params.get("stage") || localStorage.getItem("POPI_CH_STAGE") || 1);
const mode   = params.get("mode") || localStorage.getItem("POPI_CH_MODE") || "textbook";

localStorage.setItem("POPI_CH_STAGE", stage);
localStorage.setItem("POPI_CH_MODE", mode);

const allWords   = JSON.parse(localStorage.getItem("POPI_CH_DATA")    || "[]");
const wrongWords = JSON.parse(localStorage.getItem("POPI_WRONG_WORDS") || "[]");

if (!allWords.length) {
  alert("先にステージを開始してください");
  location.href = `test-que.html?mode=${mode}&stage=${stage}`;
}

let showWrongOnly = false;
let words = allWords.slice();
let index = 0;

/* --- DOM --- */
const stageBadge    = document.getElementById("stageBadge");
const wordJp        = document.getElementById("wordJp");
const wordEn        = document.getElementById("wordEn");
const card          = document.getElementById("card");
const prevBtn       = document.getElementById("prevBtn");
const nextBtn       = document.getElementById("nextBtn");
const toggleBtn     = document.getElementById("toggleBtn");
const progressFill  = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");

/* --- 描画 --- */
function render() {
  stageBadge.textContent = `STAGE ${stage}`;

  if (!words.length) {
    wordJp.textContent = "単語なし";
    wordEn.textContent = "";
    prevBtn.disabled = nextBtn.disabled = true;
    updateProgress();
    return;
  }

  wordJp.textContent = words[index].japanese;
  wordEn.textContent = words[index].english;

  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === words.length - 1;

  updateProgress();
}

function updateProgress() {
  const total   = words.length;
  const current = total ? index + 1 : 0;
  progressFill.style.width = total ? (current / total * 100) + "%" : "0%";
  progressLabel.textContent = total ? `${current} / ${total}` : "0 / 0";
}

/* --- 移動 --- */
function goNext() {
  if (index >= words.length - 1) return;
  animateSwipe("left", () => { index++; render(); });
}
function goPrev() {
  if (index <= 0) return;
  animateSwipe("right", () => { index--; render(); });
}

function animateSwipe(dir, cb) {
  const cls = dir === "left" ? "swipe-left" : "swipe-right";
  card.classList.add(cls);
  card.addEventListener("animationend", () => {
    card.classList.remove(cls);
    cb();
  }, { once: true });
}

prevBtn.addEventListener("click", goPrev);
nextBtn.addEventListener("click", goNext);

/* --- スワイプ --- */
let touchStartX = 0;
let touchStartY = 0;

card.addEventListener("touchstart", e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

card.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    if (dx < 0) goNext();
    else         goPrev();
  }
}, { passive: true });

/* --- キーボード --- */
window.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") goNext();
  else if (e.key === "ArrowLeft") goPrev();
});

/* --- 間違えた単語トグル --- */
toggleBtn.addEventListener("click", () => {
  showWrongOnly = !showWrongOnly;
  words = showWrongOnly ? wrongWords.slice() : allWords.slice();
  toggleBtn.textContent = showWrongOnly ? "全単語を見る" : "間違えた単語のみ";
  toggleBtn.classList.toggle("active", showWrongOnly);
  index = 0;
  render();
});

/* --- 初期描画 --- */
render();