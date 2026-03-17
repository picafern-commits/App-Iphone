// 🔥 FIREBASE CONFIG (SUBSTITUI PELOS TEUS DADOS)
const firebaseConfig = {
  apiKey: "XXXX",
  authDomain: "XXXX",
  projectId: "XXXX",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// 🌙 DARK MODE
function toggleDark(){
  document.body.classList.toggle("dark");

  if(document.body.classList.contains("dark")){
    localStorage.setItem("modo","dark");
  } else {
    localStorage.setItem("modo","light");
  }
}

// carregar modo ao abrir
window.onload = () => {

  if(localStorage.getItem("modo")==="dark"){
    document.body.classList.add("dark");
  }

  carregarStock();
  carregarHistorico();
};


// 📱 NAVEGAÇÃO
function mudarPagina(pagina){
  const paginas = ["registo","stock","manutencao","historico"];

  paginas.forEach(p => {
    document.getElementById(p).style.display = "none";
  });

  document.getElementById(pagina).style.display = "block";

  document.querySelectorAll(".bottom-nav a").forEach(a=>{
    a.classList.remove("active");
  });

  event.target.classList.add("active");
}


// 🔢 GERAR ID ÚNICO
async function gerarID(){
  const snapshot = await db.collection("toners").get();
  const numero = snapshot.size + 1;
  return "TN" + String(numero).padStart(3,"0");
}


// ➕ REGISTO TONER
async function movimento(tipo){

  const equipamento = document.getElementById("equipamento").value;
  const localizacao = document.getElementById("localizacao").value;
  const cor = document.getElementById("cor").value;

  const id = await gerarID();

  await db.collection("toners").add({
    id,
    equipamento,
    localizacao,
    cor,
    data: new Date()
  });

  await db.collection("movimentos").add({
    id,
    tipo,
    equipamento,
    localizacao,
    cor,
    data: new Date()
  });

  alert("✅ Toner registado: " + id);

  carregarStock();
}


// 📦 CARREGAR STOCK
function carregarStock(){
  const lista = document.getElementById("listaStock");

  db.collection("toners").get().then(snapshot=>{
    lista.innerHTML = "";

    snapshot.forEach(doc=>{
      const d = doc.data();

      lista.innerHTML += `
        <div class="card">
          <b>${d.id}</b><br>
          ${d.equipamento}<br>
          ${d.cor}<br>
          ${d.localizacao}
        </div>
      `;
    });
  });
}


// 🔍 PESQUISA STOCK
function filtrarStock(){
  const filtro = document.getElementById("pesquisa").value.toLowerCase();
  const items = document.getElementById("listaStock").children;

  Array.from(items).forEach(el=>{
    el.style.display = el.innerText.toLowerCase().includes(filtro) ? "block" : "none";
  });
}


// 🔧 GUARDAR MANUTENÇÃO
function guardarManutencao(){

  const equipamento = document.getElementById("equipamentoM").value;
  const localizacao = document.getElementById("localizacaoM").value;
  const descricao = document.getElementById("descricaoM").value;
  const data = document.getElementById("dataM").value;

  db.collection("manutencao").add({
    equipamento,
    localizacao,
    descricao,
    data
  });

  alert("✅ Manutenção registada");

  carregarHistorico();
}


// 📜 HISTÓRICO MANUTENÇÃO
function carregarHistorico(){

  const tabela = document.getElementById("tabelaManutencao");

  db.collection("manutencao").get().then(snapshot=>{
    tabela.innerHTML = "";

    snapshot.forEach(doc=>{
      const d = doc.data();

      tabela.innerHTML += `
        <tr>
          <td>${d.equipamento}</td>
          <td>${d.localizacao}</td>
          <td>${d.descricao}</td>
          <td>${d.data}</td>
        </tr>
      `;
    });
  });
}


// 📷 SCANNER QR
let scannerAtivo = false;
let html5QrCode;

function abrirScanner(){

  const reader = document.getElementById("reader");

  if(!scannerAtivo){

    html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },

      (decodedText)=>{

        document.getElementById("localizacao").value = decodedText;

        alert("📷 Código lido: " + decodedText);

        html5QrCode.stop();
        scannerAtivo = false;
        reader.innerHTML = "";
      }
    );

    scannerAtivo = true;

  } else {

    html5QrCode.stop();
    scannerAtivo = false;
    reader.innerHTML = "";
  }
}
