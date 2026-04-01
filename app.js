const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let stockGlobal = [];


// NAV
function mudarPagina(p){
  ["impressoras","config"].forEach(id=>{
    document.getElementById(id).style.display="none";
  });
  document.getElementById(p).style.display="block";
}


// ID
async function gerarID(){
  const ref = db.collection("config").doc("contador");

  return db.runTransaction(async (t)=>{
    const doc = await t.get(ref);
    let numero = doc.exists ? doc.data().valor + 1 : 1;
    t.set(ref,{valor:numero});
    return "TON-" + String(numero).padStart(4,"0");
  });
}


// ADD
async function disponivel(){

  let eq = equipamento.value;
  let loc = localizacao.value;
  let cor = document.getElementById("cor").value;
  let data = document.getElementById("data").value;

  if(!eq || !cor){
    alert("Preenche tudo");
    return;
  }

  let id = await gerarID();

  await db.collection("stock").add({
    idInterno:id,
    equipamento:eq,
    localizacao:loc || "Sem Localização",
    cor:cor,
    data:data || "Sem Data",
    created:new Date()
  });

  // limpar campos
  equipamento.value="";
  localizacao.value="";
  cor.value="";
  data.value="";
}


// STOCK
db.collection("stock").orderBy("created","desc").onSnapshot(snap=>{

  stockGlobal = [];

  let count = snap.size;
  let el = document.getElementById("countStock");

  el.innerText = count;
  el.style.color = count < 5 ? "red" : "green";

  let lista = document.getElementById("listaStock");
  lista.innerHTML="";

  snap.forEach(doc=>{
    let t = doc.data();
    t.idDoc = doc.id;
    stockGlobal.push(t);

    lista.innerHTML+=`
      <div class="card">
        <input type="checkbox" onchange="usar('${doc.id}')">
        <b>${t.idInterno}</b><br>
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}
      </div>
    `;
  });
});


// HISTÓRICO
db.collection("historico").onSnapshot(snap=>{

  document.getElementById("countUsados").innerText = snap.size;

  let lista = document.getElementById("listaHistorico");
  lista.innerHTML="";

  snap.forEach(doc=>{
    let t=doc.data();

    lista.innerHTML+=`
      <div class="card">
        <b>${t.idInterno}</b><br>
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}
        <button class="delete" onclick="apagar('${doc.id}')">❌</button>
      </div>
    `;
  });
});


// USAR
async function usar(id){

  if(!confirm("Marcar como usado?")) return;

  let ref = db.collection("stock").doc(id);
  let snap = await ref.get();

  await db.collection("historico").add(snap.data());
  await ref.delete();
}


// APAGAR
async function apagar(id){
  await db.collection("historico").doc(id).delete();
}


// FILTRO INTELIGENTE
function filtrar(){

  let txt = document.getElementById("search").value.toLowerCase();

  let lista = document.getElementById("listaStock");
  lista.innerHTML="";

  stockGlobal
    .filter(t =>
      (t.localizacao || "").toLowerCase().includes(txt) ||
      (t.equipamento || "").toLowerCase().includes(txt) ||
      (t.cor || "").toLowerCase().includes(txt)
    )
    .forEach(t=>{
      lista.innerHTML+=`
        <div class="card">
          <b>${t.idInterno}</b><br>
          ${t.equipamento} - ${t.cor}<br>
          ${t.localizacao}
        </div>
      `;
    });
}


// DARK MODE
window.onload=()=>{
  let sw=document.getElementById("darkSwitch");

  if(localStorage.getItem("modo")==="dark"){
    document.body.classList.add("dark");
    sw.checked=true;
  }

  sw.addEventListener("change",function(){
    document.body.classList.toggle("dark",this.checked);
    localStorage.setItem("modo",this.checked?"dark":"light");
  });
};