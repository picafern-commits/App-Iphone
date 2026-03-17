// 🔥 FIREBASE CONFIG
const firebaseConfig={apiKey:"XXXX",authDomain:"XXXX",projectId:"XXXX"};
firebase.initializeApp(firebaseConfig);
const db=firebase.firestore();

// NAV
function mudarPagina(p){
["registo","stock","manutencao","historico"].forEach(x=>document.getElementById(x).style.display="none");
document.getElementById(p).style.display="block";
document.querySelectorAll(".bottom-nav a").forEach(a=>a.classList.remove("active"));
event.target.classList.add("active");
}

// GERAR ID
async function gerarID(){
let snap=await db.collection("toners").get();
return "TN"+String(snap.size+1).padStart(3,"0");
}

// MOVIMENTO TONER
async function movimento(tipo){
let eq=document.getElementById("equipamento").value;
let loc=document.getElementById("localizacao").value;
let cor=document.getElementById("cor").value;
let id=await gerarID();
await db.collection("toners").add({id,equipamento:eq,localizacao:loc,cor});
await db.collection("movimentos").add({id,tipo,equipamento:eq,localizacao:loc,cor,data:new Date()});
alert("✅ Registado com sucesso!");
carregarStock();
}

// CARREGAR STOCK
function carregarStock(){
let lista=document.getElementById("listaStock");
db.collection("toners").get().then(snap=>{
lista.innerHTML="";
snap.forEach(doc=>{
let d=doc.data();
lista.innerHTML+=`<div>${d.id} - ${d.equipamento} - ${d.cor} - ${d.localizacao}</div>`;
});
});
}
carregarStock();

// FILTRAR STOCK
function filtrarStock(){
let filtro=document.getElementById("pesquisa").value.toLowerCase();
let lista=document.getElementById("listaStock").children;
Array.from(lista).forEach(div=>{
div.style.display=div.innerText.toLowerCase().includes(filtro)?"block":"none";
});

// HISTÓRICO MANUTENÇÕES
function guardarManutencao(){
let eq=document.getElementById("equipamentoM").value;
let loc=document.getElementById("localizacaoM").value;
let desc=document.getElementById("descricaoM").value;
let data=document.getElementById("dataM").value;
db.collection("manutencao").add({equipamento:eq,localizacao:loc,descricao:desc,data:data});
alert("✅ Manutenção registada!");
carregarHistorico();
}

function carregarHistorico(){
let t=document.getElementById("tabelaManutencao");
db.collection("manutencao").get().then(snap=>{
t.innerHTML="";
snap.forEach(doc=>{
let d=doc.data();
t.innerHTML+=`<tr><td>${d.equipamento}</td><td>${d.localizacao}</td><td>${d.descricao}</td><td>${d.data}</td></tr>`;
});
});
}
carregarHistorico();

// SCANNER
let scannerAtivo=false;
let html5QrCode;
function abrirScanner(){
const reader=document.getElementById("reader");
if(!scannerAtivo){
html5QrCode=new Html5Qrcode("reader");
html5QrCode.start({facingMode:"environment"},{fps:10,qrbox:250},
decodedText=>{
document.getElementById("localizacao").value=decodedText;
alert("Código lido: "+decodedText);
html5QrCode.stop();
scannerAtivo=false;
reader.innerHTML="";
});
scannerAtivo=true;
}else{
html5QrCode.stop();
scannerAtivo=false;
reader.innerHTML="";
}
}