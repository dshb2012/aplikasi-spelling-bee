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
  if(index >= questions.length){
    finishSession();
    return;
  }

  const q = questions[index];
  speak(q.word);
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
