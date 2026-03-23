import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----------------
// NAVEGAÇÃO
// ----------------
window.mudarPagina = (p)=>{
  ["registo","stock","historico"].forEach(x=>{
    document.getElementById(x).style.display="none";
  });
  document.getElementById(p).style.display="block";

  if(p==="stock") mostrarStock();
  if(p==="historico") mostrarHistorico();
};

// ----------------
// VALIDAR + ADICIONAR
// ----------------
window.disponivel = async ()=>{

  const eq = equipamento.value;
  const loc = localizacao.value;
  const cor = cor.value;

  // 🚨 BLOQUEIO SE NÃO ESTIVER PREENCHIDO
  if(!eq || !loc || !cor){
    alert("Preenche todos os campos!");
    return;
  }

  await addDoc(collection(db,"stock"),{
    equipamento:eq,
    localizacao:loc,
    cor:cor,
    data:new Date().toISOString()
  });

  alert("Adicionado ao stock!");

  // limpar campos
  equipamento.value="";
  localizacao.value="";
  cor.value="";
};

// ----------------
// MOSTRAR STOCK
// ----------------
async function mostrarStock(){

  const lista = document.getElementById("listaStock");
  lista.innerHTML="";

  const snap = await getDocs(collection(db,"stock"));

  snap.forEach(d=>{
    const t = d.data();

    lista.innerHTML += `
      <div class="card">
        <input type="checkbox" onchange="usar('${d.id}')">
        <b>${t.equipamento}</b><br>
        ${t.cor}<br>
        ${t.localizacao}
      </div>
    `;
  });
}

// ----------------
// USAR TONER (MOVE PARA HISTÓRICO)
// ----------------
window.usar = async (id)=>{

  const ref = doc(db,"stock",id);
  const snap = await getDocs(collection(db,"stock"));

  let item;

  snap.forEach(d=>{
    if(d.id===id){
      item = d.data();
    }
  });

  // adicionar ao histórico
  await addDoc(collection(db,"historico"),{
    ...item,
    usadoEm:new Date().toISOString()
  });

  // remover do stock
  await deleteDoc(ref);

  mostrarStock();
};

// ----------------
// HISTÓRICO
// ----------------
async function mostrarHistorico(){

  const lista = document.getElementById("listaHistorico");
  lista.innerHTML="";

  const snap = await getDocs(collection(db,"historico"));

  snap.forEach(d=>{
    const t = d.data();

    lista.innerHTML += `
      <div class="card">
        <b>${t.equipamento}</b><br>
        ${t.cor}<br>
        ${t.localizacao}<br>
        <small>Usado em: ${t.usadoEm}</small>
      </div>
    `;
  });
}
