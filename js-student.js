let questions = [];
let index = 0;
let correct = 0;
let wrong = 0;
let studentName = "";

function initStudent(){
  document.getElementById("teacherApp").style.display="none";
  document.getElementById("studentApp").style.display="block";
}

function startStudent(){
  const level = document.getElementById("level").value;
  studentName = document.getElementById("studentName").value;

  questions = [...QUESTION_BANK[level]];
  index = 0;
  correct = 0;
  wrong = 0;

  nextQuestion();
}

function nextQuestion(){
function wait(ms){
  return new Promise(r=>setTimeout(r,ms));
}

async function nextQuestion(){
  if(index >= questions.length){
    finishSession();
    return;
  }

  const q = questions[index];

  // 1️⃣ WORD
  await speak(q.word);

  // ⏸ jeda 0.4 detik
  await wait(400);

  // 2️⃣ SENTENCE
  await speak(q.sentence);

  // ⏸ jeda 0.4 detik
  await wait(400);

  // 3️⃣ WORD (ULANG)
  await speak(q.word);

  // 4️⃣ BARU MULAI TIMER
  startTimer(20, ()=>{});
}

  }

  const q = questions[index];
  speak(q.word);
}
function speak(text){
  return new Promise(res=>{
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;      // lebih jelas untuk anak
    u.pitch = 1;
    u.onend = res;
    speechSynthesis.speak(u);
  });
}
function submitAnswer(){
  const input = document.getElementById("answer");
  const user = input.value.trim().toLowerCase();
  const correctWord = questions[index].word.toLowerCase();

  if(user === correctWord){
    correct++;
  }else{
    wrong++;
  }

  input.value = "";
  index++;
  nextQuestion();
}

function finishSession(){
  document.getElementById("result").innerHTML = `
    <h3>Hasil Latihan</h3>
    <p>Benar: ${correct}</p>
    <p>Salah: ${wrong}</p>
    <button onclick="exportResult()">📄 Export Nilai</button>
  `;
}

