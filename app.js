// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// NAV
window.mudarPagina = function(p){

  ["impressoras","computadores","config"].forEach(id=>{
    let el = document.getElementById(id);
    if(el) el.style.display="none";
  });

  document.getElementById(p).style.display="block";

  // 🔥 força checklist aparecer
  if(p === "computadores"){
    carregarChecklist();
  }
};


// HOJE
window.hoje = function(){
  document.getElementById("data").value =
    new Date().toISOString().split("T")[0];
};


// ID GLOBAL
async function gerarID(){
  const ref = db.collection("config").doc("contador");

  return db.runTransaction(async (t)=>{
    const doc = await t.get(ref);

    let numero = 1;
    if(doc.exists){
      numero = doc.data().valor + 1;
    }

    t.set(ref, { valor: numero });

    return "TON-" + String(numero).padStart(4, '0');
  });
}


// ADICIONAR
window.disponivel = async function(){

  let eq = equipamento.value;
  let loc = localizacao.value;
  let cor = document.getElementById("cor").value;
  let data = document.getElementById("data").value;

  if(!loc) loc="Sem Localização";
  if(!data) data="Não tem Data";

  if(!eq || !cor){
    alert("Preenche equipamento e cor");
    return;
  }

  let idGerado = await gerarID();

  await db.collection("stock").add({
    idInterno:idGerado,
    equipamento:eq,
    localizacao:loc,
    cor:cor,
    data:data
  });
};


// STOCK
db.collection("stock").onSnapshot(snap=>{
  let lista=document.getElementById("listaStock");
  lista.innerHTML="";

  snap.forEach(doc=>{
    let t=doc.data();

    lista.innerHTML+=`
      <div class="card">
        <input type="checkbox" onchange="usar('${doc.id}')">
        <b>${t.idInterno}</b><br>
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}<br>
        ${t.data}
      </div>
    `;
  });
});


// USAR
window.usar = async function(id){
  let ref=db.collection("stock").doc(id);
  let snap=await ref.get();

  await db.collection("historico").add(snap.data());
  await ref.delete();
};


// HISTÓRICO
db.collection("historico").onSnapshot(snap=>{
  let lista=document.getElementById("listaHistorico");
  lista.innerHTML="";

  snap.forEach(doc=>{
    let t=doc.data();

    lista.innerHTML+=`
      <div class="card">
        <b>${t.idInterno}</b><br>
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}<br>
        ${t.data}
        <button class="delete" onclick="apagar('${doc.id}')">❌</button>
      </div>
    `;
  });
});

window.apagar = async function(id){
  await db.collection("historico").doc(id).delete();
};


// -------- CHECKLIST --------

const passos=[
"TEAMVIEWER HOST","TEAMS","DNS",
"NOME DO SISTEMA","Atribuir Dominio",
"Desinstalar MCFee","Instalar Sophos",
"MICROSOFT 365","Instalar Impressora",
"Alterar Energia","Apagar User","Criar novo user"
];

function carregarChecklist(){

  let el = document.getElementById("checklist");
  if(!el) return;

  let html="";

  passos.forEach((p,i)=>{
    html+=`
      <div class="card" style="display:flex;justify-content:space-between;align-items:center;">
        <span>${p}</span>
        <input type="checkbox" id="p${i}">
      </div>
    `;
  });

  el.innerHTML = html;
}


// GUARDAR PC
window.guardarPC = async function(){

  let nome=document.getElementById("nomePC").value;

  if(!nome){
    alert("Nome obrigatório");
    return;
  }

  let dados=[];
  passos.forEach((p,i)=>{
    dados.push({
      passo:p,
      feito:document.getElementById("p"+i).checked
    });
  });

  await db.collection("pcs").add({
    nome:nome,
    passos:dados
  });
};


// HISTÓRICO PCs
db.collection("pcs").onSnapshot(snap=>{
  let lista=document.getElementById("listaPC");
  lista.innerHTML="";

  snap.forEach(doc=>{
    let d=doc.data();

    let html="";
    d.passos.forEach(p=>{
      html+=`<div>${p.feito?"✔":"❌"} ${p.passo}</div>`;
    });

    lista.innerHTML+=`
      <div class="card">
        <b>${d.nome}</b><br>
        ${html}
        <button class="delete" onclick="apagarPC('${doc.id}')">❌</button>
      </div>
    `;
  });
});

window.apagarPC = async function(id){
  await db.collection("pcs").doc(id).delete();
};


// DARK MODE
window.onload=()=>{
  let sw=document.getElementById("darkSwitch");

  if(localStorage.getItem("modo")==="dark"){
    document.body.classList.add("dark");
    if(sw) sw.checked=true;
  }

  if(sw){
    sw.addEventListener("change",function(){
      document.body.classList.toggle("dark",this.checked);
      localStorage.setItem("modo",this.checked?"dark":"light");
    });
  }

  carregarChecklist();
};