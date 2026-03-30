// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// NAV
function mudarPagina(p){
  ["impressoras","instalacao","historicoPC"].forEach(x=>{
    document.getElementById(x).style.display="none";
  });
  document.getElementById(p).style.display="block";
}
window.mudarPagina = mudarPagina;


// -------- TONERS --------
async function disponivel(){

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
    data:data
  });
}
window.disponivel = disponivel;


// STOCK
function mostrarStock(){

  db.collection("stock").onSnapshot(snapshot=>{
    let lista = document.getElementById("listaStock");
    lista.innerHTML="";

    snapshot.forEach(doc=>{
      let t = doc.data();

      lista.innerHTML+=`
        <div class="card">
          ${t.equipamento} - ${t.cor}
          <br>${t.localizacao}
          <br>${t.data}
          <input type="checkbox" onchange="usar('${doc.id}')">
        </div>
      `;
    });
  });
}


// USAR
async function usar(id){
  let ref = db.collection("stock").doc(id);
  let snap = await ref.get();

  await db.collection("historico").add(snap.data());
  await ref.delete();
}


// HISTÓRICO TONERS
function mostrarHistorico(){
  db.collection("historico").onSnapshot(snapshot=>{
    let lista = document.getElementById("listaHistorico");
    lista.innerHTML="";

    snapshot.forEach(doc=>{
      let t = doc.data();

      lista.innerHTML+=`
        <div class="card">
          ${t.equipamento} - ${t.cor}
          <br>${t.localizacao}
          <br>${t.data}
        </div>
      `;
    });
  });
}


// -------- INSTALAÇÃO PC --------

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
"Alterar Definições de Energia",
"Apagar User",
"Criar novo user"
];

function carregarChecklist(){
  let html="";

  passos.forEach((p,i)=>{
    html+=`
      <div class="check">
        <input type="checkbox" id="p${i}">
        ${p}
      </div>
    `;
  });

  document.getElementById("checklist").innerHTML = html;
}


// GUARDAR PC
async function guardarInstalacao(){

  let nome = document.getElementById("nomePC").value;

  if(!nome){
    alert("Nome do PC obrigatório");
    return;
  }

  let dados = [];

  passos.forEach((p,i)=>{
    dados.push({
      passo:p,
      feito:document.getElementById("p"+i).checked
    });
  });

  await db.collection("instalacoes").add({
    nome:nome,
    passos:dados,
    data:new Date().toLocaleDateString()
  });

  alert("Guardado!");
}
window.guardarInstalacao = guardarInstalacao;


// HISTÓRICO PC
function mostrarHistoricoPC(){

  db.collection("instalacoes").onSnapshot(snapshot=>{
    let lista = document.getElementById("listaPC");
    lista.innerHTML="";

    snapshot.forEach(doc=>{
      let d = doc.data();

      let passosHTML="";
      d.passos.forEach(p=>{
        passosHTML += `<small>${p.feito ? "✔" : "❌"} ${p.passo}</small>`;
      });

      lista.innerHTML+=`
        <div class="card">
          <b>${d.nome}</b><br>
          ${passosHTML}
        </div>
      `;
    });
  });
}


// START
window.onload = ()=>{
  mostrarStock();
  mostrarHistorico();
  mostrarHistoricoPC();
  carregarChecklist();
};
