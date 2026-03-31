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
  document.getElementById("impressoras").style.display="none";
  document.getElementById("config").style.display="none";
  document.getElementById(p).style.display="block";
};


// GERAR ID GLOBAL
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

  let eq = document.getElementById("equipamento").value;
  let loc = document.getElementById("localizacao").value;
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
    idInterno: idGerado,
    equipamento: eq,
    localizacao: loc,
    cor: cor,
    data: data
  });

  alert("Criado: " + idGerado);
};


// STOCK (COM CHECKBOX)
db.collection("stock").onSnapshot(snap=>{

  let lista = document.getElementById("listaStock");
  lista.innerHTML="";

  snap.forEach(doc=>{
    let t = doc.data();

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


// 🔥 USAR VIA CHECKBOX
window.usar = async function(id){

  let ref = db.collection("stock").doc(id);
  let snap = await ref.get();

  let dados = snap.data();

  await db.collection("historico").add(dados);
  await ref.delete();
};


// HISTÓRICO
db.collection("historico").onSnapshot(snap=>{
  let lista = document.getElementById("listaHistorico");
  lista.innerHTML="";

  snap.forEach(doc=>{
    let t = doc.data();

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


// APAGAR
window.apagar = async function(id){
  await db.collection("historico").doc(id).delete();
};


// DARK MODE
window.onload = ()=>{

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

};