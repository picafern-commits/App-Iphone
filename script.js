// 🌙 DARK MODE
function toggleDark(){
  document.body.classList.toggle("dark");
  localStorage.setItem("modo", document.body.classList.contains("dark")?"dark":"light");
}

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

// DADOS
let stock = [];
let manutencoes = [];

// ID
function gerarID(){
  return "TN" + String(stock.length).padStart(3,"0");
}

// REGISTO
function registarToner(){
  let eq = equipamento.value;
  let loc = localizacao.value;
  let cor = document.getElementById("cor").value;

  let id = gerarID();

  stock.push({id,equipamento:eq,localizacao:loc,cor});

  alert("Toner registado: " + id);
  mostrarStock();
}

// STOCK
function mostrarStock(){
  let lista = document.getElementById("listaStock");
  lista.innerHTML="";

  stock.forEach((t,i)=>{
    lista.innerHTML+=`
      <div class="card">
        <b>${t.id}</b><br>
        ${t.equipamento}<br>
        ${t.cor}<br>
        ${t.localizacao}<br><br>

        <button onclick="removerToner(${i})" style="background:red;">
          Remover
        </button>
      </div>
    `;
  });
}

// PESQUISA
function filtrarStock(){
  let filtro = document.getElementById("pesquisa").value.toLowerCase();
  let items = document.getElementById("listaStock").children;

  Array.from(items).forEach(el=>{
    el.style.display = el.innerText.toLowerCase().includes(filtro) ? "block":"none";
  });
}

// REMOVER
function removerToner(i){
  stock.splice(i,1);
  mostrarStock();
}

// MANUTENÇÃO
function guardarManutencao(){
  let eq = equipamentoM.value;
  let loc = localizacaoM.value;
  let desc = descricaoM.value;
  let data = dataM.value;

  manutencoes.push({equipamento:eq,localizacao:loc,descricao:desc,data});

  alert("Manutenção registada");
  mostrarHistorico();
}

// HISTÓRICO
function mostrarHistorico(){
  let tabela = document.getElementById("tabelaManutencao");
  tabela.innerHTML="";

  manutencoes.forEach(m=>{
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
