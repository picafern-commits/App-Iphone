// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// NAV FIX
window.mudarPagina = function(p, btn){

  document.getElementById("impressoras").style.display="none";
  document.getElementById("instalacao").style.display="none";
  document.getElementById("config").style.display="none";

  document.getElementById(p).style.display="block";

  document.querySelectorAll("nav button").forEach(b=>{
    b.classList.remove("active");
  });

  if(btn) btn.classList.add("active");
};


// DARK MODE
window.toggleDark = function(){
  document.body.classList.toggle("dark");
};


// TONERS
window.disponivel = async function(){

  let eq = equipamento.value;
  let loc = localizacao.value;
  let cor = document.getElementById("cor").value;
  let data = document.getElementById("data").value;

  if(!eq || !loc || !cor){
    alert("Preenche tudo!");
    return;
  }

  await db.collection("stock").add({equipamento:eq,localizacao:loc,cor:cor,data:data});
};


// STOCK
db.collection("stock").onSnapshot(snap=>{
  let lista=document.getElementById("listaStock");
  lista.innerHTML="";

  snap.forEach(doc=>{
    let t=doc.data();

    lista.innerHTML+=`
      <div class="card">
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}<br>
        ${t.data}
      </div>
    `;
  });
});


// START
window.onload = ()=>{
  document.querySelector("nav button").classList.add("active");
};
