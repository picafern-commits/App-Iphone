import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DARK MODE
window.toggleDark=()=>{
  document.body.classList.toggle("dark");
};

// PÁGINAS
window.mudarPagina=(p)=>{
["dashboard","registo","stock","manutencao","historico","historicoCompleto"].forEach(x=>{
document.getElementById(x).style.display="none";
});
document.getElementById(p).style.display="block";

if(p==="historicoCompleto") carregarHistoricoCompleto();
};

// REGISTO
window.registarToner=async()=>{
let eq=equipamento.value;
let loc=localizacao.value;
let cor=cor.value;

await addDoc(collection(db,"stock"),{equipamento:eq,localizacao:loc,cor});
mostrarStock();
};

// STOCK
async function mostrarStock(){
listaStock.innerHTML="";
const snap=await getDocs(collection(db,"stock"));

snap.forEach(d=>{
let t=d.data();

listaStock.innerHTML+=`
<div class="card">
${t.equipamento}<br>${t.localizacao}<br>${t.cor}
<button onclick="remover('${d.id}')">X</button>
</div>`;
});
}

window.remover=async(id)=>{
await deleteDoc(doc(db,"stock",id));
mostrarStock();
};

// PESQUISA
window.filtrarStock=()=>{
let f=pesquisa.value.toLowerCase();
Array.from(listaStock.children).forEach(el=>{
el.style.display=el.innerText.toLowerCase().includes(f)?"block":"none";
});
};

// MANUTENÇÃO
window.guardarManutencao=async()=>{
await addDoc(collection(db,"manutencoes"),{
equipamento:equipamentoM.value,
localizacao:localizacaoM.value,
descricao:descricaoM.value,
concluido:false
});
mostrarHistorico();
};

// PENDENTES
async function mostrarHistorico(){
tabelaManutencao.innerHTML="";
const snap=await getDocs(collection(db,"manutencoes"));

snap.forEach(d=>{
let m=d.data();
if(m.concluido) return;

tabelaManutencao.innerHTML+=`
<tr style="background:#ef444420">
<td>${m.equipamento}</td>
<td>${m.localizacao}</td>
<td>${m.descricao}</td>
<td>-</td>
<td><input type="checkbox" onchange="concluir('${d.id}')"></td>
</tr>`;
});
}

window.concluir=async(id)=>{
let data=new Date().toISOString().split("T")[0];

await updateDoc(doc(db,"manutencoes",id),{
concluido:true,
data
});

mostrarHistorico();
};

// HISTÓRICO COMPLETO
async function carregarHistoricoCompleto(){
tabelaCompleta.innerHTML="";
const snap=await getDocs(collection(db,"manutencoes"));

snap.forEach(d=>{
let m=d.data();

let cor=m.concluido?"#22c55e20":"#ef444420";

tabelaCompleta.innerHTML+=`
<tr style="background:${cor}">
<td>${m.equipamento}</td>
<td>${m.localizacao}</td>
<td>${m.descricao}</td>
<td>${m.data||"-"}</td>
<td>${m.concluido?"Concluído":"Pendente"}</td>
<td>
${m.concluido
? `<button onclick="reabrir('${d.id}')">Reabrir</button>`
: `<button onclick="concluir('${d.id}')">Concluir</button>`}
</td>
</tr>`;
});
}

// FILTRO
window.filtrarHistorico=async()=>{
let eq=filtroEquip.value.toLowerCase();
let loc=filtroLocal.value.toLowerCase();
let est=filtroEstado.value;

tabelaCompleta.innerHTML="";

const snap=await getDocs(collection(db,"manutencoes"));

snap.forEach(d=>{
let m=d.data();

if(eq && !m.equipamento.toLowerCase().includes(eq)) return;
if(loc && !m.localizacao.toLowerCase().includes(loc)) return;
if(est==="pendente" && m.concluido) return;
if(est==="concluido" && !m.concluido) return;

let cor=m.concluido?"#22c55e20":"#ef444420";

tabelaCompleta.innerHTML+=`
<tr style="background:${cor}">
<td>${m.equipamento}</td>
<td>${m.localizacao}</td>
<td>${m.descricao}</td>
<td>${m.data||"-"}</td>
<td>${m.concluido?"Concluído":"Pendente"}</td>
<td>
${m.concluido
? `<button onclick="reabrir('${d.id}')">Reabrir</button>`
: `<button onclick="concluir('${d.id}')">Concluir</button>`}
</td>
</tr>`;
});
};

// REABRIR
window.reabrir=async(id)=>{
await updateDoc(doc(db,"manutencoes",id),{
concluido:false,
data:null
});
carregarHistoricoCompleto();
mostrarHistorico();
};

// EXPORT
window.exportarStock=async()=>{
const snap=await getDocs(collection(db,"stock"));
let dados=[];
snap.forEach(d=>dados.push(d.data()));

let ws=XLSX.utils.json_to_sheet(dados);
let wb=XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb,ws,"Stock");
XLSX.writeFile(wb,"stock.xlsx");
};

// INIT
window.onload=()=>{
mostrarStock();
mostrarHistorico();
};
