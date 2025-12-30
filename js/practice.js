/*************************
 * PRACTICE MODE - FINAL *
 *************************/

/* ===== STATE ===== */
let questions = [];
let session = [];
let current = 0;
let score = 0;
let answers = [];
let paused = false;
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

  initAudio();
  await loadQuestions();

  session = questions
    .filter(q => q.level === level)
    .sort(()=>Math.random() - 0.5)
    .slice(0,25);

  if(session.length === 0){
    alert("Soal untuk level ini belum tersedia");
    return;
  }

  current = 0;
  score = 0;
  answers = [];

  startScreen.style.display = "none";
  practiceScreen.style.display = "block";

  await readyCountdown();   // <<< TAMBAHAN
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
  if(current >= session.length){
    finishPractice();
    return;
  }

  currentQuestion = session[current];
  answerInput.value = "";
  answerInput.focus();

  questionInfo.textContent =
    `Soal ${current+1} dari ${session.length}`;

  await speak(currentQuestion.word);
  await wait(400);
  await speak(currentQuestion.sentence);
  await wait(400);
  await speak(currentQuestion.word);

  await timer20();
}

/* ===== SUBMIT ===== */
function submitAnswer(){
  if(!currentQuestion) return;

  const userAnswer = answerInput.value.trim();
  const correct =
    userAnswer.toLowerCase() ===
    currentQuestion.word.toLowerCase();

  if(correct) score++;

  answers.push({
    name: studentName.value,
    word: currentQuestion.word,
    userAnswer,
    correct
  });

  current++;
  playQuestion();
}

/* ===== FINISH ===== */
function finishPractice(){
  statusEl.innerHTML =
    `🎉 Selesai!<br>Skor: ${score} / ${session.length}`;

  exportResult();
}

/* ===== EXPORT CSV ===== */
function exportResult(){
  let csv = "nama,jawaban_siswa,jawaban_benar,skor\n";

  answers.forEach(a=>{
    csv += `${a.name},${a.userAnswer},${a.word},${a.correct?1:0}\n`;
  });

  const blob = new Blob([csv], {type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "practice_result.csv";
  a.click();
}

/* ===== ENTER KEY ===== */
answerInput?.addEventListener("keydown", e=>{
  if(e.key === "Enter") submitAnswer();
});
