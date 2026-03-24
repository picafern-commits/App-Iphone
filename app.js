// FIREBASE (OS TEUS DADOS)
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// -------- NAV --------
function mudarPagina(p){

  document.getElementById("registo").style.display="none";
  document.getElementById("stock").style.display="none";
  document.getElementById("historico").style.display="none";
  document.getElementById("settings").style.display="none";

  document.getElementById(p).style.display="block";

  if(p==="stock") mostrarStock();
  if(p==="historico") mostrarHistorico();
}
window.mudarPagina = mudarPagina;


// -------- DARK MODE --------
function toggleDark(){

  document.body.classList.toggle("dark");

  if(document.body.classList.contains("dark")){
    localStorage.setItem("modo","dark");
  } else {
    localStorage.setItem("modo","light");
  }
}
window.toggleDark = toggleDark;


// -------- START --------
window.onload = ()=>{

  // aplicar modo guardado
  if(localStorage.getItem("modo")==="dark"){
    document.body.classList.add("dark");
  }

  document.getElementById("registo").style.display="block";
};


// -------- REGISTO --------
async function disponivel(){

  let eq = document.getElementById("equipamento").value;
  let loc = document.getElementById("localizacao").value;
  let cor = document.getElementById("cor").value;
  let data = document.getElementById("data").value;

  if(!eq || !loc || !cor || !data){
    alert("Preenche tudo!");
    return;
  }

  await db.collection("stock").add({
    equipamento:eq,
    localizacao:loc,
    cor:cor,
    data:data
  });

  alert("Guardado!");

  // limpar campos
  document.getElementById("equipamento").value="";
  document.getElementById("localizacao").value="";
  document.getElementById("cor").value="";
  document.getElementById("data").value="";
}
window.disponivel = disponivel;


// -------- STOCK --------
async function mostrarStock(){

  let lista = document.getElementById("listaStock");
  lista.innerHTML="";

  let snap = await db.collection("stock").get();

  snap.forEach(doc=>{
    let t = doc.data();

    lista.innerHTML+=`
      <div class="card">
        ${t.equipamento} - ${t.cor}<br>
        📍 ${t.localizacao}<br>
        📅 ${t.data}
        <input type="checkbox" onchange="usar('${doc.id}')">
      </div>
    `;
  });
}


// -------- USAR --------
async function usar(id){

  let ref = db.collection("stock").doc(id);
  let snap = await ref.get();

  await db.collection("historico").add({
    ...snap.data(),
    usadoEm: new Date().toISOString()
  });

  await ref.delete();

  mostrarStock();
}
window.usar = usar;


// -------- HISTÓRICO --------
async function mostrarHistorico(){

  let lista = document.getElementById("listaHistorico");
  lista.innerHTML="";

  let snap = await db.collection("historico").get();

  snap.forEach(doc=>{
    let t = doc.data();

    lista.innerHTML+=`
      <div class="card">
        ${t.equipamento} - ${t.cor}<br>
        📍 ${t.localizacao}<br>
        📅 ${t.data}<br>
        ✔ Usado: ${t.usadoEm ? new Date(t.usadoEm).toLocaleDateString() : ""}
        <button onclick="apagar('${doc.id}')">❌</button>
      </div>
    `;
  });
}


// -------- APAGAR --------
async function apagar(id){
  await db.collection("historico").doc(id).delete();
  mostrarHistorico();
}
window.apagar = apagar;
