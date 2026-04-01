// FIREBASE
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
  ["impressoras","computadores","config"].forEach(id=>{
    let el = document.getElementById(id);
    if(el) el.style.display="none";
  });
  document.getElementById(p).style.display="block";
}


// GERAR ID
async function gerarID(){
  const ref = db.collection("config").doc("contador");

  return db.runTransaction(async (t)=>{
    const doc = await t.get(ref);
    let numero = doc.exists ? doc.data().valor + 1 : 1;
    t.set(ref,{valor:numero});
    return "TON-" + String(numero).padStart(4,"0");
  });
}


// ADICIONAR
async function disponivel(){

  let eq = document.getElementById("equipamento").value;
  let loc = document.getElementById("localizacao").value;
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
}


// STOCK
db.collection("stock").orderBy("created","desc").onSnapshot(snap=>{

  stockGlobal = [];

  document.getElementById("countStock").innerText = snap.size;

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
      </div>
    `;
  });
});


// USAR
async function usar(id){
  let ref = db.collection("stock").doc(id);
  let snap = await ref.get();

  await db.collection("historico").add(snap.data());
  await ref.delete();
}


// FILTRO LOCALIZAÇÃO
function filtrar(){

  let txt = document.getElementById("search").value.toLowerCase();

  let lista = document.getElementById("listaStock");
  lista.innerHTML="";

  stockGlobal
    .filter(t => (t.localizacao || "").toLowerCase().includes(txt))
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