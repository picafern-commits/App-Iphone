// CONFIG FIREBASE
const firebaseConfig = {
 apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
 authDomain: "toner-manager-756c4.firebaseapp.com",
 projectId: "toner-manager-756c4",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ---------------- NAV ----------------
function mudarPagina(p, btn){

  document.getElementById("registo").style.display="none";
  document.getElementById("stock").style.display="none";
  document.getElementById("historico").style.display="none";

  document.getElementById(p).style.display="block";

  // botão ativo
  document.querySelectorAll("nav button").forEach(b=>{
    b.classList.remove("active");
  });

  if(btn) btn.classList.add("active");

  if(p==="stock") mostrarStock();
  if(p==="historico") mostrarHistorico();
}

// ---------------- START ----------------
window.onload = ()=>{
  document.getElementById("btnRegisto").classList.add("active");
};

// ---------------- REGISTO ----------------
async function disponivel(){

  const eq = equipamento.value;
  const loc = localizacao.value;
  const cor = cor.value;

  if(!eq || !loc || !cor){
    alert("Preenche todos os campos!");
    return;
  }

  await db.collection("stock").add({
    equipamento:eq,
    localizacao:loc,
    cor:cor,
    data:new Date().toISOString()
  });

  alert("Adicionado!");

  equipamento.value="";
  localizacao.value="";
  cor.value="";
}

// ---------------- STOCK ----------------
async function mostrarStock(){

  const lista = document.getElementById("listaStock");
  lista.innerHTML="";

  const snap = await db.collection("stock").get();

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

// ---------------- USAR ----------------
async function usar(id){

  const ref = db.collection("stock").doc(id);
  const snap = await ref.get();

  const item = snap.data();

  await db.collection("historico").add({
    ...item,
    usadoEm:new Date().toISOString()
  });

  await ref.delete();

  mostrarStock();
}

// ---------------- HISTÓRICO ----------------
async function mostrarHistorico(){

  const lista = document.getElementById("listaHistorico");
  lista.innerHTML="";

  const snap = await db.collection("historico").get();

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
