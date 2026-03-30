// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// NAV
window.mudarPagina = function(p, btn){

  ["impressoras","config"].forEach(id=>{
    document.getElementById(id).style.display="none";
  });

  document.getElementById(p).style.display="block";

  document.querySelectorAll("nav button").forEach(b=>{
    b.classList.remove("active");
  });

  if(btn) btn.classList.add("active");
};


// DARK MODE PRO (CORRIGIDO)
function aplicarDark(estado){
  document.body.classList.toggle("dark", estado);
}


// REGISTAR TONER
window.disponivel = async function(){

  let eq = equipamento.value;
  let loc = localizacao.value;
  let cor = document.getElementById("cor").value;
  let data = document.getElementById("data").value;

  if(!eq || !loc || !cor){
    alert("Preenche tudo!");
    return;
  }

  await db.collection("stock").add({
    equipamento:eq,
    localizacao:loc,
    cor:cor,
    data:data || new Date().toISOString().split("T")[0]
  });
};


// STOCK + SELECT
db.collection("stock").onSnapshot(snap=>{
  let lista = document.getElementById("listaStock");
  let select = document.getElementById("selectStock");

  lista.innerHTML="";
  select.innerHTML='<option value="">Selecionar toner do stock</option>';

  snap.forEach(doc=>{
    let t = doc.data();

    lista.innerHTML+=`
      <div class="card">
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}<br>
        ${t.data}
      </div>
    `;

    select.innerHTML+=`
      <option value="${doc.id}">
        ${t.equipamento} - ${t.cor} (${t.localizacao})
      </option>
    `;
  });
});


// USAR PELO SELECT
window.usarSelecionado = async function(){

  let id = document.getElementById("selectStock").value;

  if(!id){
    alert("Seleciona um toner!");
    return;
  }

  let ref = db.collection("stock").doc(id);
  let snap = await ref.get();

  await db.collection("historico").add(snap.data());
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
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}<br>
        ${t.data}
      </div>
    `;
  });
});


// START
window.onload = ()=>{

  let sistema = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let guardado = localStorage.getItem("modo");

  let ativo = guardado ? guardado==="dark" : sistema;

  aplicarDark(ativo);

  let sw = document.getElementById("darkSwitch");

  if(sw){
    sw.checked = ativo;

    sw.addEventListener("change", function(){
      aplicarDark(this.checked);
      localStorage.setItem("modo", this.checked ? "dark":"light");
    });
  }

  document.querySelector("nav button").classList.add("active");
};
