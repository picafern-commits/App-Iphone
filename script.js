import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// NAV
window.mudarPagina = (p)=>{
  ["registo","stock","historico"].forEach(x=>{
    document.getElementById(x).style.display="none";
  });

  document.getElementById(p).style.display="block";

  if(p==="stock") mostrarStock();
  if(p==="historico") mostrarHistorico();
};

// DARK MODE
window.toggleDark = ()=>{
  document.body.classList.toggle("dark");
};

// REGISTO
window.disponivel = async ()=>{

  const eq = equipamento.value;
  const loc = localizacao.value;
  const cor = cor.value;

  if(!eq || !loc || !cor){
    alert("Preenche tudo!");
    return;
  }

  await addDoc(collection(db,"stock"),{
    equipamento:eq,
    localizacao:loc,
    cor:cor,
    data:new Date().toISOString()
  });

  alert("Adicionado ao stock!");

  equipamento.value="";
  localizacao.value="";
  cor.value="";
};

// STOCK
async function mostrarStock(){

  const lista = document.getElementById("listaStock");
  lista.innerHTML="";

  const snap = await getDocs(collection(db,"stock"));

  snap.forEach(d=>{
    const t = d.data();

    lista.innerHTML += `
      <div class="card">
        <div>
          <b>${t.equipamento}</b><br>
          ${t.cor}<br>
          <small>${t.localizacao}</small>
        </div>

        <input type="checkbox" onchange="usar('${d.id}')">
      </div>
    `;
  });
}

// USAR TONER
window.usar = async (id)=>{

  const snap = await getDocs(collection(db,"stock"));

  let item;

  snap.forEach(d=>{
    if(d.id===id){
      item = d.data();
    }
  });

  await addDoc(collection(db,"historico"),{
    ...item,
    usadoEm:new Date().toISOString()
  });

  await deleteDoc(doc(db,"stock",id));

  mostrarStock();
};

// HISTÓRICO
async function mostrarHistorico(){

  const lista = document.getElementById("listaHistorico");
  lista.innerHTML="";

  const snap = await getDocs(collection(db,"historico"));

  snap.forEach(d=>{
    const t = d.data();

    lista.innerHTML += `
      <div class="card">
        <div>
          <b>${t.equipamento}</b><br>
          ${t.cor}<br>
          <small>${t.localizacao}</small><br>
          <small>✔ ${new Date(t.usadoEm).toLocaleDateString()}</small>
        </div>
      </div>
    `;
  });
}

// INIT
window.onload = ()=>{
  mostrarStock();
};
