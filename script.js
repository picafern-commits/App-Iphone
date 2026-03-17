import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// LOGIN
window.registarUser = async ()=>{
  await createUserWithEmailAndPassword(auth,
    document.getElementById("email").value,
    document.getElementById("password").value
  );
};

window.loginUser = async ()=>{
  await signInWithEmailAndPassword(auth,
    document.getElementById("email").value,
    document.getElementById("password").value
  );
};

// AUTH
onAuthStateChanged(auth, user=>{
  if(user){
    document.getElementById("loginBox").style.display="none";
    document.getElementById("appUI").style.display="block";

    mostrarStock();
    mostrarHistorico();
    atualizarDashboard();
  }
});

// DARK
window.toggleDark = ()=>{
  document.body.classList.toggle("dark");
};

// NAV
window.mudarPagina = (p)=>{
  ["dashboard","registo","stock","manutencao","historico"].forEach(x=>{
    document.getElementById(x).style.display="none";
  });
  document.getElementById(p).style.display="block";
};

// REGISTO TONER
window.registarToner = async ()=>{
  await addDoc(collection(db,"stock"),{
    equipamento: document.getElementById("equipamento").value,
    localizacao: document.getElementById("localizacao").value,
    cor: document.getElementById("cor").value
  });

  mostrarStock();
  atualizarDashboard();
};

// STOCK
async function mostrarStock(){
  const lista = document.getElementById("listaStock");
  lista.innerHTML="";

  const snap = await getDocs(collection(db,"stock"));

  snap.forEach(d=>{
    let t = d.data();

    lista.innerHTML+=`
      <div class="card">
        ${t.equipamento}<br>
        ${t.cor}<br>
        ${t.localizacao}
        <button onclick="remover('${d.id}')">X</button>
      </div>
    `;
  });
}

// REMOVER
window.remover = async (id)=>{
  await deleteDoc(doc(db,"stock",id));
  mostrarStock();
  atualizarDashboard();
};

// PESQUISA
window.filtrarStock = ()=>{
  let f = document.getElementById("pesquisa").value.toLowerCase();
  let items = document.getElementById("listaStock").children;

  Array.from(items).forEach(el=>{
    el.style.display = el.innerText.toLowerCase().includes(f) ? "block":"none";
  });
};

// GUARDAR MANUTENÇÃO
window.guardarManutencao = async ()=>{

  const descricao = document.getElementById("descricaoM").value;

  if(!descricao){
    alert("Escreve a descrição!");
    return;
  }

  await addDoc(collection(db,"manutencoes"),{
    equipamento: document.getElementById("equipamentoM").value,
    localizacao: document.getElementById("localizacaoM").value,
    descricao,
    concluido:false,
    data:null
  });

  mostrarHistorico();
  atualizarDashboard();
};

// HISTÓRICO COM CHECKBOX
async function mostrarHistorico(){
  const tabela = document.getElementById("tabelaManutencao");
  tabela.innerHTML="";

  const snap = await getDocs(collection(db,"manutencoes"));

  snap.forEach(d=>{
    let m = d.data();

    tabela.innerHTML+=`
      <tr style="background:${m.concluido ? '#22c55e20' : '#ef444420'}">
        <td>${m.equipamento}</td>
        <td>${m.localizacao}</td>
        <td>${m.descricao}</td>
        <td>${m.data || "-"}</td>
        <td>
          <input type="checkbox"
            ${m.concluido ? "checked":""}
            onchange="concluirManutencao('${d.id}', this.checked)">
        </td>
      </tr>
    `;
  });
}

// CONCLUIR MANUTENÇÃO
window.concluirManutencao = async (id, estado)=>{

  let data = estado ? new Date().toISOString().split("T")[0] : null;

  await updateDoc(doc(db,"manutencoes",id),{
    concluido: estado,
    data
  });

  mostrarHistorico();
  atualizarDashboard();
};

// DASHBOARD
async function atualizarDashboard(){
  const s = await getDocs(collection(db,"stock"));
  const m = await getDocs(collection(db,"manutencoes"));

  document.getElementById("totalStock").innerText = s.size;
  document.getElementById("totalMan").innerText = m.size;

  let pendentes = 0;
  m.forEach(d=>{
    if(!d.data().concluido) pendentes++;
  });

  document.getElementById("pendentes").innerText = pendentes;
}

// EXPORT
window.exportarStock = async ()=>{
  const snap = await getDocs(collection(db,"stock"));
  let dados = [];
  snap.forEach(d=>dados.push(d.data()));

  let ws = XLSX.utils.json_to_sheet(dados);
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock");
  XLSX.writeFile(wb, "stock.xlsx");
};

window.exportarManutencoes = async ()=>{
  const snap = await getDocs(collection(db,"manutencoes"));
  let dados = [];
  snap.forEach(d=>dados.push(d.data()));

  let ws = XLSX.utils.json_to_sheet(dados);
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Manutencoes");
  XLSX.writeFile(wb, "manutencoes.xlsx");
};
