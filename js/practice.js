/*************************
 * PRACTICE MODE - FINAL *
 *************************/

/* ===== STATE ===== */
let questions = [];
let session = [];
let currentIndex = 0;
let score = 0;
let answers = [];
let isQuestionActive = false;
let timerInterval = null;
let audioCtx = null;
let currentQuestion = null;

/* ===== ELEMENTS ===== */
const startScreen = document.getElementById("startScreen");
const practiceScreen = document.getElementById("practiceScreen");
const studentName = document.getElementById("studentName");
const levelSelect = document.getElementById("level");
const questionInfo = document.getElementById("questionInfo");
const answerInput = document.getElementById("answerInput");
const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("status");

/* ===== AUDIO ===== */
function initAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function speak(text){
  return new Promise(resolve=>{
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    u.onend = resolve;
    speechSynthesis.speak(u);
  });
}
function unlockAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if(audioCtx.state === "suspended"){
    audioCtx.resume();
  }

  // trigger dummy speech (wajib untuk iOS)
  const u = new SpeechSynthesisUtterance(" ");
  speechSynthesis.speak(u);
}

/* ===== TIMER SOUND ===== */
function tickSound(){
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.frequency.value = 700;
  g.gain.value = 0.04;
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.08);
}

function endBell(){
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.frequency.setValueAtTime(880, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 1);
  g.gain.setValueAtTime(0.2, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 1);
}

function clearTimer(){
  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function timer20(){
  return new Promise(resolve=>{
    clearTimer();
    let t = 20;
    timerEl.textContent = `⏱️ ${t}`;
    tickSound();

    timerInterval = setInterval(()=>{
      if(paused) return;
      t--;
      timerEl.textContent = `⏱️ ${t}`;
      if(t > 0) tickSound();
      if(t === 0){
        clearTimer();
        endBell();
        setTimeout(resolve, 800);
      }
    },1000);
  });
}
function startTimer(){
  clearInterval(timerInterval);

  let timeLeft = 20;
  timerEl.textContent = `⏱️ ${timeLeft}`;

  timerInterval = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = `⏱️ ${timeLeft}`;
    tickSound();

    if(timeLeft <= 0){
      clearInterval(timerInterval);
      handleTimeOut();
    }
  },1000);
}
function handleTimeOut(){
  isQuestionActive = false;

  answers.push({
    word: currentQuestion.word,
    userAnswer: "",
    correct: false
  });

  goToNextQuestion();
}

function stopTimer(){
  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval = null;
  }
  stopTickSound();
}
function stopTimer(){
  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval = null;
  }
  stopTickSound();
}

/* ===== UTILS ===== */
function wait(ms){
  return new Promise(r=>setTimeout(r, ms));
}

/* ===== LOAD CSV ===== */
async function loadQuestions(){
  const res = await fetch("data/questions.csv");
  const text = await res.text();

  const lines = text.trim().split("\n").slice(1);
  questions = lines.map(l=>{
    const [level, word, sentence] = l.split(",");
    return {
      level: level.trim(),
      word: word.trim(),
      sentence: sentence.trim()
    };
  });
}

/* ===== START PRACTICE ===== */
async function startPractice(){
  unlockAudio();

  const name = studentName.value.trim();
  const level = levelSelect.value;

  if(!name || !level){
    alert("Isi nama dan pilih level");
    return;
  }

  await loadQuestions();

  session = questions
    .filter(q => q.level === level)
    .sort(() => Math.random() - 0.5)
    .slice(0,25);

  if(session.length === 0){
    alert("Soal belum tersedia");
    return;
  }

  currentIndex = 0;
  score = 0;
  answers = [];

  startScreen.style.display = "none";
  practiceScreen.style.display = "block";

  await readyCountdown();
  playQuestion();
}

/*=====COUNTDOWN SEBELUM SOAL DIBACAKAN======*/
async function readyCountdown(){
  statusEl.textContent = "Siap ya... soal akan dimulai";

  for(let i=3; i>0; i--){
    statusEl.textContent = `Mulai dalam ${i}...`;
    tickSound();
    await wait(1000);
  }

  statusEl.textContent = "Soal dimulai!";
  endBell();
  await wait(500);
}

/* ===== PLAY QUESTION ===== */
async function playQuestion(){
  isQuestionActive = true;

  currentQuestion = session[currentIndex];

  answerInput.value = "";
  answerInput.focus();

  await speak(currentQuestion.word);
  await wait(400);
  await speak(currentQuestion.sentence);
  await wait(400);
  await speak(currentQuestion.word);

  startTimer();
}

/* ===== SUBMIT ===== */
function submitAnswer(){
  if(!isQuestionActive) return;

  isQuestionActive = false;

  stopTimer(); // ⛔ STOP TIMER + SUARA

  const userAns = answerInput.value.trim().toLowerCase();
  const correctAns = currentQuestion.word.toLowerCase();

  const isCorrect = userAns === correctAns;
  if(isCorrect) score++;

  answers.push({
    word: currentQuestion.word,
    userAnswer: userAns,
    correct: isCorrect
  });

  goToNextQuestion();
}
function goToNextQuestion(){
  stopTimer();
  currentIndex++;

  if(currentIndex >= session.length){
    finishPractice();
    return;
  }

  setTimeout(()=>{
    playQuestion();
  }, 500);
}
submitBtn.addEventListener("click", submitAnswer);

answerInput.addEventListener("keydown", e=>{
  if(e.key === "Enter"){
    submitAnswer();
  }
});

/* ===== FINISH ===== */
function finishPractice(){
  practiceScreen.style.display = "none";
  reviewSection.style.display = "block";
  statusEl.innerHTML = `
    🎉 Latihan selesai!<br>
    Skor kamu <b>${score}</b> dari <b>${session.length}</b>
    <br><br>
    📄 Hasil latihan sudah otomatis diunduh.<br>
    Silakan cek file PDF untuk melihat jawaban dan hasil latihanmu 😊
  `;

  exportResultPDF();
}
 stopTimer();

  document.getElementById("practiceSection").classList.add("hidden");
  document.getElementById("reviewSection").classList.remove("hidden");

  renderReview();
}
function renderReview(){
  const list = document.getElementById("reviewList");
  list.innerHTML = "";

  answers.forEach((a, i)=>{
    const div = document.createElement("div");
    div.className = `review-item ${a.correct ? "correct" : "wrong"}`;

    div.innerHTML = `
      <strong>${i+1}. ${a.word}</strong><br>
      Jawaban kamu: <em>${a.userAnswer || "(kosong)"}</em><br>
      Status: ${a.correct ? "✔ Benar" : "✖ Salah"}
    `;

    list.appendChild(div);
  });
}

/* ===== EXPORT PDF ===== */
function exportResultPDF(){
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  let y = 20;
  pdf.setFontSize(16);
  pdf.text("HASIL LATIHAN SPELLING BEE", 20, y);

  y += 10;
  pdf.setFontSize(12);
  pdf.text(`Nama: ${studentName.value}`, 20, y);

  y += 8;
  pdf.text(`Skor: ${score} / ${session.length}`, 20, y);

  y += 12;
  pdf.setFontSize(11);

  answers.forEach((a, i)=>{
    if(y > 270){
      pdf.addPage();
      y = 20;
    }
    pdf.text(
      `${i+1}. Jawaban: ${a.userAnswer || "-"} | Benar: ${a.word}`,
      20,
      y
    );
    y += 8;
  });

  pdf.save("hasil-latihan-spelling-bee.pdf");
}


/* ===== ENTER KEY ===== */
answerInput?.addEventListener("keydown", e=>{
  if(e.key === "Enter") submitAnswer();
});
