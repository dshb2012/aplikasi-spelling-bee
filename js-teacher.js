<script>
let rows=[], current=0, playing=false, paused=false;
let timerInterval=null;
const audioCtx=new (window.AudioContext||webkitAudioContext)();

function clearTimer(){ if(timerInterval){clearInterval(timerInterval);timerInterval=null;} }
async function wait(ms){
  let t=0;
  while(t<ms){
    if(!paused)t+=100;
    await new Promise(r=>setTimeout(r,100));
  }
}
function speak(text){
  return new Promise(res=>{
    const u=new SpeechSynthesisUtterance(text);
    u.lang="en-US";
    u.onend=res;
    speechSynthesis.speak(u);
  });
}

/* TIMER SOUND */
function tick(){
  const o=audioCtx.createOscillator();
  const g=audioCtx.createGain();
  o.frequency.value=700;
  g.gain.value=0.03;
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime+0.07);
}
function endBell(){
  const o=audioCtx.createOscillator();
  const g=audioCtx.createGain();
  o.frequency.setValueAtTime(880,audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(440,audioCtx.currentTime+1);
  g.gain.setValueAtTime(0.2,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+1);
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime+1);
}

function timer20(){
  return new Promise(res=>{
    clearTimer();
    let t=20;
    timer.textContent=t;
    tick();
    timerInterval=setInterval(()=>{
      if(paused) return;
      t--;
      timer.textContent=t;
      if(t>0) tick();
      if(t===0){
        clearTimer();
        endBell();
        setTimeout(res,1000);
      }
    },1000);
  });
}

/* CSV */
function loadCSV(e){
// 🔴 RESET DATA SEBELUM LOAD FILE BARU
  stopAll();
  rows = [];
  current = 0;
  tbody.innerHTML = "";
  
  const r=new FileReader();
  r.onload=()=>{
    const lines=r.result.trim().split("\n").map(l=>l.split(","));

    // VALIDASI CSV
    if(lines.length < 2 || lines[0].length < 3){
      document.getElementById("csvError").style.display="block";
      return;
    }

    document.getElementById("csvError").style.display="none";
    
    lines.shift();
    rows=lines;
    render();

    document.getElementById("startMessage").style.display = "none";
    
    // TAMPILKAN UPLOAD BAWAH
    document.getElementById("bottomUpload").style.display = "flex";

    // TAMPILKAN TIMER & INSTRUCTION
    document.getElementById("timer").style.display = "flex";
    document.getElementById("instructionBtn").style.display = "flex";
    
    // TAMPILKAN TOMBOL ATAS SETELAH UPLOAD
    document.getElementById("topBtns").classList.remove("hiddenTop");

    //TAMPILKAN HEADER TABEL
    document.getElementById("tableHead").style.display = "table-header-group";
  };
  r.readAsText(e.target.files[0]);
}

function render(){
  tbody.innerHTML="";
  rows.forEach((r,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td>${r[0]}</td>
      <td class="word">${r[1]}</td>
      <td class="sentence">${r[2]}</td>
      <td>
        <button class="spellBtn" onclick="speakRow(${i})">🔊</button>
        <button class="spellBtn" onclick="spell(${i})">🔠</button>
      </td>`;
    tbody.appendChild(tr);
  });
}
function focusRow(i){
  [...tbody.children].forEach(r=>r.classList.remove("active"));
  tbody.children[i].classList.add("active");
  tbody.children[i].scrollIntoView({behavior:"smooth",block:"center"});
}

/* PLAY */
async function playRow(i){
  focusRow(i);
  const w=rows[i][1], s=rows[i][2];
  await speak(w); await wait(500);
  await speak(s); await wait(500);
  await speak(w);
  await timer20();
}
async function playAll(){
  stopAll();
  current=0; playing=true;
  for(;current<rows.length && playing;current++){
    while(paused) await wait(200);
    await playRow(current);
  }
}
async function playFromRow(){
  stopAll();
  current=Math.max(0,startRow.value-1);
  playing=true;
  for(;current<rows.length && playing;current++){
    while(paused) await wait(200);
    await playRow(current);
  }
}
async function speakRow(i){
  stopAll();
  focusRow(i);
  const w=rows[i][1], s=rows[i][2];
  await speak(w); await wait(500);
  await speak(s); await wait(500);
  await speak(w);
}
async function spell(i){
  stopAll();
  focusRow(i);
  const w=rows[i][1];
  await speak(w); await wait(400);
  for(const c of w){
    await speak(c);
    await wait(400);
  }
  await speak(w);
}

/* CONTROL */
function pauseResume(){
  paused = !paused;

  const icon = pauseBtn.querySelector(".icon");
  const text = pauseBtn.querySelector(".text");

  if(paused){
    speechSynthesis.pause();
    icon.textContent = "⏸▶";
    text.textContent = "RESUME";
  }else{
    speechSynthesis.resume();
    icon.textContent = "⏸";
    text.textContent = "PAUSE";
  }
}
function stopAll(){
  playing=false; paused=false;
  speechSynthesis.cancel();
  clearTimer();
  timer.textContent="⏱️ 20";
  
  const icon = pauseBtn.querySelector(".icon");
  const text = pauseBtn.querySelector(".text");
  icon.textContent = "⏸";
  text.textContent = "PAUSE";
}

/* POPUP */
function openHelp(){
  helpOverlay.style.display="flex";
}
function closeHelp(e){
  if(!e || e.target.id==="helpOverlay"){
    helpOverlay.style.display="none";
  }
}
document.addEventListener("click", function(e){
  const btn = e.target.closest("button");
  if(!btn) return;

  btn.classList.add("ripple");

  const circle = document.createElement("span");
  circle.classList.add("ripple-circle");

  const d = Math.max(btn.clientWidth, btn.clientHeight);
  circle.style.width = circle.style.height = d + "px";
  circle.style.left = e.offsetX - d / 2 + "px";
  circle.style.top = e.offsetY - d / 2 + "px";

  btn.appendChild(circle);

  setTimeout(()=>circle.remove(),600);
});
  
</script>