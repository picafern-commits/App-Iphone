// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4",
};
 
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ---------------- NAV ----------------
function mudarPagina(p, btn){

  document.getElementById("registo").style.display="none";
  document.getElementById("stock").style.display="none";
  document.getElementById("historico").style.display="none";

  document.getElementById(p).style.display="block";

  document.querySelectorAll("nav button").forEach(b=>{
    b.classList.remove("active");
  });

  if(btn) btn.classList.add("active");

  if(p==="stock") mostrarStock();
  if(p==="historico") mostrarHistorico();
}

window.mudarPagina = mudarPagina;


// ---------------- REGISTO ----------------
async function disponivel(){

  let eq = document.getElementById("equipamento").value;
  let loc = document.getElementById("localizacao").value;
  let c = document.getElementById("cor").value;
  let data = document.getElementById("data").value;

  if(!eq || !loc || !c || !data){
    alert("Preenche tudo!");
    return;
  }

  await db.collection("stock").add({
    equipamento:eq,
    localizacao:loc,
    cor:c,
    data:data
  });

  alert("Guardado!");

  equipamento.value="";
  localizacao.value="";
  cor.value="";
  document.getElementById("data").value="";
}

window.disponivel = disponivel;


// ---------------- STOCK ----------------
async function mostrarStock(){

  let lista = document.getElementById("listaStock");
  lista.innerHTML="";

  let snap = await db.collection("stock").get();

  snap.forEach(doc=>{
    let t = doc.data();

    lista.innerHTML+=`
      <div class="card">
        <div class="card-top">
          <b>${t.equipamento} - ${t.cor}</b>
          <input type="checkbox" onchange="usar('${doc.id}')">
        </div>
        <small>📍 ${t.localizacao}</small>
        <small>📅 ${t.data}</small>
      </div>
    `;
  });
}


// ---------------- USAR ----------------
async function usar(id){

  let ref = db.collection("stock").doc(id);
  let snap = await ref.get();

  let item = snap.data();

  await db.collection("historico").add({
    ...item,
    usadoEm: new Date().toISOString()
  });

  await ref.delete();

  mostrarStock();
}

window.usar = usar;


// ---------------- HISTÓRICO ----------------
async function mostrarHistorico(){

  let lista = document.getElementById("listaHistorico");
  lista.innerHTML="";

  let snap = await db.collection("historico").get();

  snap.forEach(doc=>{
    let t = doc.data();

    lista.innerHTML+=`
      <div class="card">
        <b>${t.equipamento} - ${t.cor}</b>
        <small>📍 ${t.localizacao}</small>
        <small>📅 Registo: ${t.data}</small>
        <small>✔ Usado: ${new Date(t.usadoEm).toLocaleDateString()}</small>
      </div>
    `;
  });
}


// ---------------- START ----------------
window.onload = ()=>{
  document.querySelector("nav button").classList.add("active");
}; 1
