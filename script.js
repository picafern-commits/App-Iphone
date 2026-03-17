const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// NAV
function mudarPagina(p){
document.querySelectorAll(".card").forEach(el=>el.style.display="none");
document.getElementById(p).style.display="block";
}

// ID
async function gerarID(){
let snap = await db.collection("toners").get();
return "TN" + String(snap.size+1).padStart(3,"0");
}

// REGISTO
async function registar(){

let eq = equipamento.value;
let loc = localizacao.value;
let cor = cor.value;
let dataRecebimento = dataRecebimento.value;

let id = await gerarID();

await db.collection("toners").add({
id, eq, loc, cor, dataRecebimento
});

alert("✅ Registado!");
carregarStock();
}

// STOCK
function carregarStock(){
let lista = document.getElementById("listaStock");

db.collection("toners").get().then(snap=>{
lista.innerHTML="";
snap.forEach(doc=>{
let d = doc.data();

lista.innerHTML += `
<div class="card">
${d.id} - ${d.eq} - ${d.cor}<br>
📍 ${d.loc}<br>
📅 ${d.dataRecebimento || "-"}
<button onclick="removerToner('${doc.id}')" style="background:#ff3b30;">Remover</button>
</div>`;
});
});
}
carregarStock();

// REMOVER
function removerToner(id){
db.collection("toners").doc(id).delete();
carregarStock();
}

// PESQUISA
function filtrar(){
let f = pesquisa.value.toLowerCase();
Array.from(listaStock.children).forEach(el=>{
el.style.display = el.innerText.toLowerCase().includes(f) ? "block":"none";
});
}

// EXCEL
function exportarExcel(){

db.collection("toners").get().then(snapshot=>{
let csv = "ID,Equipamento,Local,Cor,Data\n";

snapshot.forEach(doc=>{
let d = doc.data();
csv += `${d.id},${d.eq},${d.loc},${d.cor},${d.dataRecebimento}\n`;
});

let blob = new Blob([csv], {type:"text/csv"});
let a = document.createElement("a");
a.href = URL.createObjectURL(blob);
a.download = "stock.csv";
a.click();
});
}

// MANUTENÇÃO
function guardarManutencao(){
db.collection("manutencao").add({
eq: equipamentoM.value,
loc: localizacaoM.value,
desc: descricao.value,
data: data.value
});
alert("Guardado!");
carregarHistorico();
}

// HISTÓRICO
function carregarHistorico(){
let t = document.getElementById("tabela");

db.collection("manutencao").get().then(snap=>{
t.innerHTML="";
snap.forEach(doc=>{
let d = doc.data();
t.innerHTML += `<tr><td>${d.eq}</td><td>${d.loc}</td><td>${d.desc}</td><td>${d.data}</td></tr>`;
});
});
}
carregarHistorico();

// SCANNER
let scanner;
function abrirScanner(){
scanner = new Html5Qrcode("reader");
scanner.start(
{ facingMode: "environment" },
{ fps: 10, qrbox: 250 },
(txt)=>{
localizacao.value = txt;
alert("Código: " + txt);
scanner.stop();
});
}

// DARK MODE
function toggleDark(){
document.body.classList.toggle("dark");
localStorage.setItem("dark", document.body.classList.contains("dark"));
}

if(localStorage.getItem("dark") === "true"){
document.body.classList.add("dark");
}
