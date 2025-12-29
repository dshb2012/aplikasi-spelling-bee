function setMode(mode){
  document.getElementById("modeOverlay").style.display="none";

  if(mode === "teacher"){
    document.getElementById("teacherApp").style.display="block";
    document.getElementById("studentApp").style.display="none";
  }else{
    initStudent();
  }
}
