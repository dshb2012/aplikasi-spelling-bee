let questions = [];
let session = [];
let current = 0;
let score = 0;

async function loadQuestions(){
  const res = await fetch("data/questions.csv");
  const text = await res.text();

  const lines = text.trim().split("\n");
  const headers = lines.shift().split(",");

  const idxLevel = headers.indexOf("level");
  const idxWord = headers.indexOf("word");
  const idxSentence = headers.indexOf("sentence");

  questions = lines.map(l=>{
    const c = l.split(",");
    return {
      level: c[idxLevel],
      word: c[idxWord],
      sentence: c[idxSentence]
    };
  });
}
