// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// -------- NAV --------
function mudarPagina(p, btn){

  ["registo","stock","historico","settings"].forEach(x=>{
    document.getElementById(x).style.display="none";
  });

  document.getElementById(p).style.display="block";

  document.querySelectorAll("nav button").forEach(b=>{
    b.classList.remove("active");
  });

  if(btn) btn.classList.add("active");

  if(p==="stock") mostrarStock();
  if(p==="historico") mostrarHistorico();
}
window.m
