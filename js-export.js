function exportResult(){
  const score = Math.round((correct / (correct + wrong)) * 100);

  const csv =
`Nama,Tanggal,Benar,Salah,Nilai
${studentName},${new Date().toLocaleDateString()},${correct},${wrong},${score}`;

  const blob = new Blob([csv], {type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "hasil-spelling-bee.csv";
  a.click();
}
