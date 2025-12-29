let audioCtx = null;
let questions = [];
let session = [];
let current = 0;
let score = 0;
let paused = false;
let timerInterval = null;

/* ===== AUDIO UNLOCK (WAJIB) ===== */
function initAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(" ");
  speechSynthesis.speak(u);
}

/* ===== LOAD CSV ===== */
async function loadQuestions(){
  const res = await fetch("data/questions.csv");
  const text = await res.text();
  const lines = text.trim().split("\n").slice(1);

  questions = lines.map(l=>{
    const [level,word,sentence] = l.split(",");
    return { level, word, sentence };
  });
}

/* ===== START PRACTICE ===== */
async function startPractice(){
  const name = studentName.value.trim();
  const level = document.getElementById("level").value;

  if(!name || !level){
    alert("Isi nama dan level");
    return;
  }

  initAudio();                // 🔥 INI KUNCI SUARA
  await loadQuestions();

  session = questions
    .filter(q=>q.level===level)
    .sort(()=>Math.random()-0.5)
    .slice(0,25);

  current = 0;
  score = 0;

  playQuestion();
}

/* ===== SPEAK ===== */
function speak(text){
  return new Promise(res=>{
    const u = new SpeechSynthesisUtterance(text);
    u.lang="en-US";
    u.onend=res;
    speechSynthesis.speak(u);
  });
}

/* ===== TIMER ===== */
function timer20(){
  return new Promise(res=>{
    let t = 20;
    timer.textContent = "⏱️ "+t;

    clearInterval(timerInterval);
    timerInterval = setInterval(()=>{
      if(paused) return;
      t--;
      timer.textContent = "⏱️ "+t;
      if(t<=0){
        clearInterval(timerInterval);
        res();
      }
    },1000);
  });
}

/* ===== PLAY QUESTION ===== */
async function playQuestion(){
  if(current >= session.length){
    status.textContent = `Selesai! Skor: ${score}/${session.length}`;
    exportResult();
    return;
  }

  const q = session[current];
  status.textContent = `Soal ${current+1} / ${session.length}`;

  await speak(q.word);
  await wait(400);
  await speak(q.sentence);
  await wait(400);
  await speak(q.word);
  await timer20();

  current++;
  playQuestion();
}

/* ===== WAIT ===== */
function wait(ms){
  return new Promise(r=>setTimeout(r,ms));
}

/* ===== EXPORT CSV ===== */
function exportResult(){
  let csv = "name,word,correct\n";
  session.forEach(q=>{
    csv += `${studentName.value},${q.word},1\n`;
  });

  const blob = new Blob([csv],{type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "practice_result.csv";
  a.click();
}
