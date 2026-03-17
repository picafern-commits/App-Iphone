import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 METE AQUI OS TEUS DADOS DO FIREBASE
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DARK MODE
function toggleDark(){
  document.body.classList.toggle("dark");
  localStorage.setItem("modo", document.body.classList.contains("dark")?"dark":"light");
}
window.toggleDark = toggleDark;

window.onload = () => {
  if(localStorage.getItem("modo")==="dark"){
    document.body.classList.add("dark");
  }
  mostrarStock();
  mostrarHistorico();
};

// PAGINAS
function mudarPagina(p){
  ["registo","stock","manutencao","historico"].forEach(x=>{
    document.getElementById(x).style.display="none";
  });
  document.getElementById(p).style.display="block";
}
window.mudarPagina = mudarPagina;

// REGISTAR TONER
async function registarToner(){
  let eq = equipamento.value;
  let loc = localizacao.value;
  let cor = cor.value;

  let id = "TN" + Date.now();

  await addDoc(collection(db, "stock"), {
    id,
    equipamento: eq,
    localizacao: loc,
    cor
  });

  alert("Toner registado!");
  mostrarStock();
}
window.registarToner = registarToner;

// MOSTRAR STOCK
async function mostrarStock(){
  let lista = document.getElementById("listaStock");
  lista.innerHTML="";

  const querySnapshot = await getDocs(collection(db, "stock"));

  querySnapshot.forEach((docSnap)=>{
    let t = docSnap.data();

    lista.innerHTML+=`
      <div class="card">
        <b>${t.id}</b><br>
        ${t.equipamento}<br>
        ${t.cor}<br>
        ${t.localizacao}<br><br>

        <button onclick="removerToner('${docSnap.id}')" style="background:red;">
          Remover
        </button>
      </div>
    `;
  });
}

// REMOVER
async function removerToner(id){
  await deleteDoc(doc(db, "stock", id));
  mostrarStock();
}
window.removerToner = removerToner;

// PESQUISA
function filtrarStock(){
  let filtro = document.getElementById("pesquisa").value.toLowerCase();
  let items = document.getElementById("listaStock").children;

  Array.from(items).forEach(el=>{
    el.style.display = el.innerText.toLowerCase().includes(filtro) ? "block":"none";
  });
}
window.filtrarStock = filtrarStock;

// MANUTENÇÃO
async function guardarManutencao(){
  let eq = equipamentoM.value;
  let loc = localizacaoM.value;
  let desc = descricaoM.value;
  let data = dataM.value;

  await addDoc(collection(db, "manutencoes"), {
    equipamento:eq,
    localizacao:loc,
    descricao:desc,
    data
  });

  alert("Manutenção registada!");
  mostrarHistorico();
}
window.guardarManutencao = guardarManutencao;

// HISTÓRICO
async function mostrarHistorico(){
  let tabela = document.getElementById("tabelaManutencao");
  tabela.innerHTML="";

  const querySnapshot = await getDocs(collection(db, "manutencoes"));

  querySnapshot.forEach(docSnap=>{
    let m = docSnap.data();

    tabela.innerHTML+=`
      <tr>
        <td>${m.equipamento}</td>
        <td>${m.localizacao}</td>
        <td>${m.descricao}</td>
        <td>${m.data}</td>
      </tr>
    `;
  });
}

// EXPORTAR STOCK
async function exportarStock(){
  const querySnapshot = await getDocs(collection(db, "stock"));
  let dados = [];

  querySnapshot.forEach(docSnap=>{
    let t = docSnap.data();

    dados.push({
      ID: t.id,
      Equipamento: t.equipamento,
      Cor: t.cor,
      Localizacao: t.localizacao
    });
  });

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock");

  XLSX.writeFile(wb, "Stock_Toners.xlsx");
}
window.exportarStock = exportarStock;

// EXPORTAR MANUTENÇÕES
async function exportarManutencoes(){
  const querySnapshot = await getDocs(collection(db, "manutencoes"));
  let dados = [];

  querySnapshot.forEach(docSnap=>{
    let m = docSnap.data();

    dados.push({
      Equipamento: m.equipamento,
      Localizacao: m.localizacao,
      Descricao: m.descricao,
      Data: m.data
    });
  });

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Manutencoes");

  XLSX.writeFile(wb, "Historico_Manutencoes.xlsx");
}
window.exportarManutencoes = exportarManutencoes;

// SCANNER
let scannerAtivo=false;
let html5QrCode;

function abrirScanner(){
  let reader=document.getElementById("reader");

  if(!scannerAtivo){
    html5QrCode=new Html5Qrcode("reader");

    html5QrCode.start(
      { facingMode:"environment" },
      { fps:10, qrbox:250 },

      txt=>{
        document.getElementById("localizacao").value = txt;
        alert("Código: "+txt);

        html5QrCode.stop();
        scannerAtivo=false;
        reader.innerHTML="";
      }
    );

    scannerAtivo=true;

  } else {
    html5QrCode.stop();
    scannerAtivo=false;
    reader.innerHTML="";
  }
}
window.abrirScanner = abrirScanner;
