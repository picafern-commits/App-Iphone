// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// NAV
window.mudarPagina = function(p, btn){
  ["impressoras","computadores","config"].forEach(id=>{
    document.getElementById(id).style.display="none";
  });

  document.getElementById(p).style.display="block";

  document.querySelectorAll("nav button").forEach(b=>{
    b.classList.remove("active");
  });

  btn.classList.add("active");
};


// TONER
window.disponivel = async function(){

  let eq = equipamento.value;
  let loc = localizacao.value;
  let cor = document.getElementById("cor").value;
  let data = document.getElementById("data").value;

  if(!eq || !loc || !cor){
    alert("Preenche tudo!");
    return;
  }

  await db.collection("stock").add({
    equipamento:eq,
    localizacao:loc,
    cor:cor,
    data:data || new Date().toISOString().split("T")[0]
  });
};


// STOCK + SELECT
db.collection("stock").onSnapshot(snap=>{
  let lista = document.getElementById("listaStock");
  let select = document.getElementById("selectStock");

  lista.innerHTML="";
  select.innerHTML="<option value=''>Selecionar toner</option>";

  snap.forEach(doc=>{
    let t = doc.data();

    lista.innerHTML+=`
      <div class="card">
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}<br>
        ${t.data}
      </div>
    `;

    select.innerHTML+=`
      <option value="${doc.id}">
        ${t.equipamento} - ${t.cor}
      </option>
    `;
  });
});


// USAR TONER
window.usarSelecionado = async function(){

  let id = document.getElementById("selectStock").value;

  if(!id){
    alert("Seleciona um toner");
    return;
  }

  let ref = db.collection("stock").doc(id);
  let snap = await ref.get();

  await db.collection("historico").add(snap.data());
  await ref.delete();
};


// HISTÓRICO IMPRESSORAS
db.collection("historico").onSnapshot(snap=>{
  let lista = document.getElementById("listaHistorico");
  lista.innerHTML="";

  snap.forEach(doc=>{
    let t = doc.data();

    lista.innerHTML+=`
      <div class="card">
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}<br>
        ${t.data}
        <button class="delete" onclick="apagarHistorico('${doc.id}')">❌</button>
      </div>
    `;
  });
});

window.apagarHistorico = async function(id){
  await db.collection("historico").doc(id).delete();
};


// COMPUTADORES
const passos = [
"TEAMVIEWER HOST",
"TEAMS",
"DNS (192.168.0.204 & 192.168.0.205)",
"NOME DO SISTEMA",
"Atribuir Dominio",
"Desinstalar MCFee",
"Instalar Sophos",
"MICROSOFT 365",
"Instalar Impressora",
"Alterar Energia",
"Apagar User",
"Criar novo user"
];

function carregarChecklist(){
  let html="";
  passos.forEach((p,i)=>{
    html+=`
      <div class="card" style="display:flex;justify-content:space-between;">
        <span>${p}</span>
        <input type="checkbox" id="p${i}">
      </div>
    `;
  });
  document.getElementById("checklist").innerHTML=html;
}


// GUARDAR PC
window.guardarPC = async function(){

  let nome = document.getElementById("nomePC").value;

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
    passos:dados,
    data:new Date().toLocaleDateString()
  });

  alert("Guardado!");
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
window.onload = ()=>{

  let sw = document.getElementById("darkSwitch");

  if(localStorage.getItem("modo")==="dark"){
    document.body.classList.add("dark");
