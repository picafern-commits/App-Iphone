const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let stockGlobal = [];
let historicoGlobal = [];
let pcsGlobal = [];
let manutencoesGlobal = [];

function el(id) {
  return document.getElementById(id);
}

function mostrarMensagem(texto, tipo = "sucesso") {
  let toast = el("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast-app";
    document.body.appendChild(toast);
  }

  toast.className = `toast-app ${tipo}`;
  toast.innerText = texto;
  toast.style.display = "block";

  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.style.display = "none";
  }, 2200);
}

function msg(texto, tipo = "sucesso") {
  mostrarMensagem(texto, tipo);
}

function abrirMenu() {
  el("mobileSidebar")?.classList.add("open");
  el("mobileOverlay")?.classList.add("show");
}

function fecharMenu() {
  el("mobileSidebar")?.classList.remove("open");
  el("mobileOverlay")?.classList.remove("show");
}

function mudarPagina(p) {
  const paginas = [
    "impressoras",
    "stockPage",
    "historicoPage",
    "computadores",
    "impressorasLista",
    "manutencaoImpressoras",
    "config"
  ];

  paginas.forEach(id => {
    const sec = el(id);
    if (sec) sec.style.display = "none";
  });

  const atual = el(p);
  if (atual) atual.style.display = "block";

  if (p === "computadores") {
    carregarChecklist();
  }
}

function irParaPagina(p) {
  mudarPagina(p);
  fecharMenu();
}

const impressorasData = [
  { modelo: "Kyocera P3155dn", serie: "R4B2229805", armazem: "Braga", localizacao: "Ilha 01", ip: "192.168.10.178" },
  { modelo: "Ecosys PA5500x", serie: "WD44336210", armazem: "Braga", localizacao: "Ilha 02", ip: "192.168.10.179" },
  { modelo: "Kyocera P3155dn", serie: "R4B1395508", armazem: "Braga", localizacao: "Ilha 03", ip: "192.168.10.180" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293179", armazem: "Braga", localizacao: "Ilha 04", ip: "192.168.10.181" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293180", armazem: "Braga", localizacao: "Ilha 05", ip: "192.168.10.182" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293183", armazem: "Braga", localizacao: "Balcão 01", ip: "192.168.10.183" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293184", armazem: "Braga", localizacao: "Balcão 02", ip: "192.168.10.184" },
  { modelo: "Kyocera P3155dn", serie: "R4B2230012", armazem: "Braga", localizacao: "Dep. Logistica", ip: "192.168.10.185" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293173", armazem: "Braga", localizacao: "G/Encomendas", ip: "192.168.10.186" },
  { modelo: "Kyocera P3155dn", serie: "R4B1395261", armazem: "Braga", localizacao: "Devoluções", ip: "192.168.10.187" },
  { modelo: "TASKalfa 2554ci", serie: "RVP0Z03770", armazem: "Braga", localizacao: "Escritorio", ip: "192.168.10.197" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293169", armazem: "Vila Real", localizacao: "Ilha 01", ip: "192.168.11.110" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293174", armazem: "Vila Real", localizacao: "Ilha 02", ip: "192.168.11.108" },
  { modelo: "TASKalfa 2554ci", serie: "RVP0Z03715", armazem: "Vila Real", localizacao: "Ilha 03", ip: "192.168.11.201" }
];

const manutencaoLocais = [
  "Ilha 01",
  "Ilha 02",
  "Ilha 03",
  "Ilha 04",
  "Ilha 05",
  "Balcão 01",
  "Balcão 02",
  "Dep. Logistica",
  "G/Encomendas",
  "Devoluções",
  "Escritorio"
];

function renderImpressoras() {
  const tbody = el("impressorasTableBody");
  if (tbody) {
    tbody.innerHTML = impressorasData.map(item => `
      <tr>
        <td>${item.modelo}</td>
        <td>${item.serie}</td>
        <td>${item.armazem}</td>
        <td>${item.localizacao}</td>
        <td><a href="http://${item.ip}" target="_blank" rel="noopener noreferrer">${item.ip}</a></td>
      </tr>
    `).join("");
  }

  const selectIP = el("manutencaoIP");
  if (selectIP) {
    selectIP.innerHTML = `
      <option value="">Selecionar IP</option>
      ${impressorasData.map(item => `
        <option value="${item.ip}">
          ${item.ip} - ${item.localizacao} (${item.armazem})
        </option>
      `).join("")}
    `;
  }
}

function preencherLocaisManutencao() {
  const select = el("manutencaoLocalizacao");
  if (!select) return;

  select.innerHTML = `
    <option value="">Selecionar localização</option>
    ${manutencaoLocais.map(loc => `<option value="${loc}">${loc}</option>`).join("")}
  `;
}

async function gerarID() {
  const ref = db.collection("config").doc("contador");

  return db.runTransaction(async t => {
    const doc = await t.get(ref);
    const n = doc.exists ? doc.data().valor + 1 : 1;
    t.set(ref, { valor: n });
    return "TON-" + String(n).padStart(4, "0");
  });
}

async function disponivel() {
  const eq = el("equipamento")?.value;
  const loc = el("localizacao")?.value;
  const cor = el("cor")?.value;
  const data = el("data")?.value;

  if (!eq || !cor) {
    mostrarMensagem("Preenche tudo", "erro");
    return;
  }

  const id = await gerarID();

  await db.collection("stock").add({
    idInterno: id,
    equipamento: eq,
    localizacao: loc || "Sem Localização",
    cor: cor,
    data: data || "Sem Data",
    created: new Date()
  });

  mostrarMensagem("Toner adicionado");
}

db.collection("stock").orderBy("created", "desc").onSnapshot(snap => {
  stockGlobal = [];
  const countStock = el("countStock");
  if (countStock) countStock.innerText = snap.size;

  snap.forEach(doc => {
    const t = doc.data();
    t.idDoc = doc.id;
    stockGlobal.push(t);
  });

  renderStock();
  renderDashboard();
});

db.collection("historico").orderBy("created", "desc").onSnapshot(snap => {
  historicoGlobal = [];
  const countUsados = el("countUsados");
  if (countUsados) countUsados.innerText = snap.size;

  snap.forEach(doc => {
    const t = doc.data();
    t.idDoc = doc.id;
    historicoGlobal.push(t);
  });

  renderHistorico();
});

db.collection("pcs").orderBy("created", "desc").onSnapshot(snap => {
  pcsGlobal = [];
  const countPCs = el("countPCs");
  if (countPCs) countPCs.innerText = snap.size;

  snap.forEach(doc => {
    const d = doc.data();
    d.idDoc = doc.id;
    pcsGlobal.push(d);
  });

  renderPC();
});

db.collection("manutencoes").orderBy("created", "desc").onSnapshot(snap => {
  manutencoesGlobal = [];

  snap.forEach(doc => {
    const d = doc.data();
    d.idDoc = doc.id;
    manutencoesGlobal.push(d);
  });

  renderManutencoes(manutencoesGlobal);
});

function renderDashboard() {
  const dash = el("listaDashboardStock");
  if (!dash) return;

  if (!stockGlobal.length) {
    dash.innerHTML = `<div class="panel empty-state"><h3>Sem toners recentes</h3><p>Adiciona toners para os veres aqui.</p></div>`;
    return;
  }

  dash.innerHTML = stockGlobal.slice(0, 5).map(t => `
    <div class="dashboard-card">
      <div class="stock-id">${t.idInterno}</div>
      <div class="meta-line">Equipamento: <span class="meta-value">${t.equipamento}</span></div>
      <div class="meta-line">Cor: <span class="meta-value">${t.cor}</span></div>
      <div class="meta-line">Local: <span class="meta-value">${t.localizacao}</span></div>
    </div>
  `).join("");
}

function renderStock() {
  const lista = el("listaStock");
  if (!lista) return;

  if (!stockGlobal.length) {
    lista.innerHTML = `<div class="panel empty-state"><h3>Sem toners em stock</h3><p>Quando adicionares toners, aparecem aqui.</p></div>`;
    return;
  }

  lista.innerHTML = stockGlobal.map(t => `
    <div class="stock-card">
      <div class="stock-id">${t.idInterno}</div>
      <div class="meta-line">Equipamento: <span class="meta-value">${t.equipamento}</span></div>
      <div class="meta-line">Cor: <span class="meta-value">${t.cor}</span></div>
      <div class="meta-line">Localização: <span class="meta-value">${t.localizacao}</span></div>
      <div class="meta-line">Data: <span class="meta-value">${t.data || "Sem Data"}</span></div>

      <div class="card-actions">
        <button class="small-btn btn-use" onclick="usar('${t.idDoc}')">Usado</button>
      </div>
    </div>
  `).join("");
}

function renderHistorico() {
  const lista = el("listaHistorico");
  if (!lista) return;

  if (!historicoGlobal.length) {
    lista.innerHTML = `<div class="panel empty-state"><h3>Sem histórico</h3><p>Os toners usados aparecem aqui.</p></div>`;
    return;
  }

  lista.innerHTML = historicoGlobal.map(t => `
    <div class="history-card">
      <div class="history-id">${t.idInterno}</div>
      <div class="meta-line">Equipamento: <span class="meta-value">${t.equipamento}</span></div>
      <div class="meta-line">Cor: <span class="meta-value">${t.cor || "-"}</span></div>
      <div class="meta-line">Localização: <span class="meta-value">${t.localizacao || "Sem Localização"}</span></div>
      <div class="meta-line">Data: <span class="meta-value">${t.data || "Sem Data"}</span></div>

      <div class="card-actions">
        <button class="small-btn btn-delete" onclick="apagar('${t.idDoc}')">Apagar</button>
      </div>
    </div>
  `).join("");
}

async function usar(id) {
  const ref = db.collection("stock").doc(id);
  const snap = await ref.get();

  await db.collection("historico").add({
    ...snap.data(),
    created: new Date()
  });

  await ref.delete();
  mostrarMensagem("Movido para histórico");
}

async function apagar(id) {
  await db.collection("historico").doc(id).delete();
  mostrarMensagem("Apagado");
}

function filtrar() {
  const input = el("search");
  if (!input) return;

  const txt = input.value.toLowerCase();
  const filtrados = stockGlobal.filter(t =>
    (t.localizacao || "").toLowerCase().includes(txt) ||
    (t.equipamento || "").toLowerCase().includes(txt) ||
    (t.cor || "").toLowerCase().includes(txt) ||
    (t.idInterno || "").toLowerCase().includes(txt)
  );

  const lista = el("listaStock");
  if (!lista) return;

  lista.innerHTML = filtrados.map(t => `
    <div class="stock-card">
      <div class="stock-id">${t.idInterno}</div>
      <div class="meta-line">Equipamento: <span class="meta-value">${t.equipamento}</span></div>
      <div class="meta-line">Cor: <span class="meta-value">${t.cor}</span></div>
      <div class="meta-line">Localização: <span class="meta-value">${t.localizacao}</span></div>
      <div class="card-actions">
        <button class="small-btn btn-use" onclick="usar('${t.idDoc}')">Usado</button>
      </div>
    </div>
  `).join("");
}

function filtrarDashboard() {
  const input = el("searchDashboard");
  if (!input) return;

  const txt = input.value.toLowerCase();
  const filtrados = stockGlobal.filter(t =>
    (t.localizacao || "").toLowerCase().includes(txt) ||
    (t.equipamento || "").toLowerCase().includes(txt) ||
    (t.cor || "").toLowerCase().includes(txt) ||
    (t.idInterno || "").toLowerCase().includes(txt)
  );

  const dash = el("listaDashboardStock");
  if (!dash) return;

  dash.innerHTML = filtrados.map(t => `
    <div class="dashboard-card">
      <div class="stock-id">${t.idInterno}</div>
      <div class="meta-line">Equipamento: <span class="meta-value">${t.equipamento}</span></div>
      <div class="meta-line">Cor: <span class="meta-value">${t.cor}</span></div>
      <div class="meta-line">Local: <span class="meta-value">${t.localizacao}</span></div>
    </div>
  `).join("");
}

const passos = [
  "TEAMVIEWER HOST",
  "TEAMS",
  "DNS",
  "NOME DO SISTEMA",
  "Atribuir Dominio",
  "Desinstalar MCFee",
  "Instalar Sophos",
  "MICROSOFT 365",
  "Instalar Impressora",
  "Alterar Energia",
  "Apagar User",
  "Criar novo user"
];

function carregarChecklist() {
  const check = el("checklist");
  if (!check) return;

  check.innerHTML = passos.map((p, i) => `
    <label class="checkItem">
      <input type="checkbox" id="p${i}">
      <span>${p}</span>
    </label>
  `).join("");
}

function renderPC() {
  const lista = el("listaPC");
  if (!lista) return;

  if (!pcsGlobal.length) {
    lista.innerHTML = `<div class="panel empty-state"><h3>Sem registos de computadores</h3><p>Os computadores guardados aparecem aqui.</p></div>`;
    return;
  }

  lista.innerHTML = pcsGlobal.map(d => {
    const htmlPassos = (d.passos || []).map(p => `
      <div class="meta-line">${p.feito ? "✔" : "❌"} <span class="meta-value">${p.passo}</span></div>
    `).join("");

    return `
      <div class="pc-card">
        <div class="pc-name">${d.nome}</div>
        <div class="meta-line">Data: <span class="meta-value">${d.data || "Sem Data"}</span></div>
        <div class="pc-meta" style="margin-top:12px;">
          ${htmlPassos}
        </div>
        <div class="card-actions">
          <button class="small-btn btn-delete" onclick="apagarPC('${d.idDoc}')">Apagar</button>
        </div>
      </div>
    `;
  }).join("");
}

async function guardarPC() {
  const nome = el("nomePC")?.value;
  let data = el("dataPC")?.value;

  if (!nome) {
    mostrarMensagem("Nome obrigatório", "erro");
    return;
  }

  if (!data) data = "Sem Data";

  const dados = [];
  passos.forEach((p, i) => {
    dados.push({
      passo: p,
      feito: el("p" + i)?.checked || false
    });
  });

  await db.collection("pcs").add({
    nome,
    data,
    passos: dados,
    created: new Date()
  });

  el("nomePC").value = "";
  if (el("dataPC")) el("dataPC").value = "";
  carregarChecklist();
  mostrarMensagem("PC guardado");
}

async function apagarPC(id) {
  await db.collection("pcs").doc(id).delete();
  mostrarMensagem("PC apagado");
}

async function guardarManutencao() {
  const tecnico = el("manutencaoTecnico")?.value || "";
  const armazem = el("manutencaoArmazem")?.value || "";
  const localizacao = el("manutencaoLocalizacao")?.value || "";
  const ip = el("manutencaoIP")?.value || "";
  const motivo = el("manutencaoMotivo")?.value || "";
  const dataPedido = el("manutencaoPedido")?.value || "";
  const dataResolucao = el("manutencaoResolucao")?.value || "";

  if (!tecnico || !armazem || !localizacao || !ip || !motivo || !dataPedido) {
    mostrarMensagem("Preenche os campos obrigatórios da manutenção.", "erro");
    return;
  }

  await db.collection("manutencoes").add({
    tecnico,
    armazem,
    localizacao,
    ip,
    motivo,
    dataPedido,
    dataResolucao: dataResolucao || "Sem resolução",
    created: new Date()
  });

  if (el("manutencaoMotivo")) el("manutencaoMotivo").value = "";
  if (el("manutencaoPedido")) el("manutencaoPedido").value = "";
  if (el("manutencaoResolucao")) el("manutencaoResolucao").value = "";

  mostrarMensagem("Manutenção guardada");
}

function renderManutencoes(items) {
  const lista = el("listaManutencoes");
  if (!lista) return;

  if (!items.length) {
    lista.innerHTML = `<div class="panel empty-state"><h3>Sem pedidos de manutenção</h3><p>Os pedidos vão aparecer aqui.</p></div>`;
    return;
  }

  lista.innerHTML = items.map(item => `
    <div class="pc-card">
      <div class="pc-name">${item.tecnico}</div>
      <div class="meta-line">Armazém: <span class="meta-value">${item.armazem}</span></div>
      <div class="meta-line">Localização: <span class="meta-value">${item.localizacao}</span></div>
      <div class="meta-line">IP: <span class="meta-value"><a href="http://${item.ip}" target="_blank" rel="noopener noreferrer">${item.ip}</a></span></div>
      <div class="meta-line">Motivo: <span class="meta-value">${item.motivo}</span></div>
      <div class="meta-line">Pedido: <span class="meta-value">${item.dataPedido}</span></div>
      <div class="meta-line">Reparação/Resolução: <span class="meta-value">${item.dataResolucao || "Sem resolução"}</span></div>
      <div class="card-actions">
        <button class="small-btn btn-delete" onclick="apagarManutencao('${item.idDoc}')">Apagar</button>
      </div>
    </div>
  `).join("");
}

async function apagarManutencao(id) {
  await db.collection("manutencoes").doc(id).delete();
  mostrarMensagem("Manutenção apagada");
}

window.onload = () => {
  const sw = el("darkSwitch");

  if (localStorage.getItem("modo") === "dark") {
    document.body.classList.add("dark");
    document.documentElement.classList.add("dark");
    if (sw) sw.checked = true;
  }

  if (sw) {
    sw.addEventListener("change", () => {
      document.body.classList.toggle("dark", sw.checked);
      document.documentElement.classList.toggle("dark", sw.checked);
      localStorage.setItem("modo", sw.checked ? "dark" : "light");
    });
  }

  carregarChecklist();
  renderImpressoras();
  preencherLocaisManutencao();
  mudarPagina("impressoras");
};
