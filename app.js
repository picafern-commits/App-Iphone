// 🔥 DEBUG GLOBAL (para ver erros)
window.onerror = function(msg){
  alert("Erro: " + msg);
};

// 🔥 FIREBASE
const firebaseConfig = {
 apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
 authDomain: "toner-manager-756c4.firebaseapp.com",
 projectId: "toner-manager-756c4",
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
        ${t.localizacao}<br>
        ${t.data}
        <input type="checkbox" onchange="usar('${doc.id}')">
      </div>
    `;
  });
}


// -------- USAR --------
async function usar(id){

  let ref = db.collection("stock").doc(id);
  let snap = await ref.get();

  await db.collection("historico").add(snap.data());

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
        ${t.localizacao}<br>
        ${t.data}
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


// -------- DARK --------
function toggleDark(){
  document.body.classList.toggle("dark");
}
window.toggleDark = toggleDark;
