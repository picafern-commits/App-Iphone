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

function setText(id, value) {
  const node = el(id);
  if (node) node.innerText = value;
}

function normalizarTexto(v) {
  return String(v || "").toLowerCase().trim();
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
    "dashboard",
    "registoPage",
    "stockPage",
    "historicoPage",
    "computadores",
    "impressorasLista",
    "manutencaoImpressoras",
    "pistolasPage",
    "portasPage",
    "usersPage",
    "config"
  ];

  paginas.forEach(id => {
    const sec = el(id);
    if (sec) sec.style.display = "none";
  });

  const atual = el(p);
  if (atual) atual.style.display = "block";

  const subtitulos = {
    dashboard: "Dashboard Toners",
    registoPage: "Registo Toners",
    stockPage: "Toners disponíveis",
    historicoPage: "Toners usados",
    computadores: "Checklist de instalação",
    impressorasLista: "Lista de impressoras",
    manutencaoImpressoras: "Pedidos de manutenção",
    pistolasPage: "Pistolas CK65",
    portasPage: "Portas de rede",
    usersPage: "Utilizadores",
    config: "Preferências"
  };

  if (el("headerSubtitle")) {
    el("headerSubtitle").innerText = subtitulos[p] || "Gestão móvel";
  }

  if (p === "computadores") carregarChecklist();
  fecharMenu();
}

function irParaPagina(p) {
  mudarPagina(p);
}

/* =========================
   DADOS IMPRESSORAS
========================= */
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

/* =========================
   DADOS PISTOLAS
========================= */
const pistolasData = [
  { num: 1, login: "BRA01", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D81B7", mac: "0C:23:69:ED:7D:05", operador: "Márcio Vilela", turno: "Dia", prontas: "2026-01-12", obs: "" },
  { num: 2, login: "BRA02", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D8148", mac: "0C:23:69:ED:92:68", operador: "Mário Roberto Gomes Monteiro", turno: "Dia", prontas: "2026-01-12", obs: "" },
  { num: 3, login: "BRA03", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D81A8", mac: "0C:23:69:ED:88:CF", operador: "Joao Abel Pacheco", turno: "Dia", prontas: "2026-01-12", obs: "" },
  { num: 30, login: "BRA30", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D80C9", mac: "0C:23:69:ED:8A:79", operador: "Diogo Vieira Costa", turno: "Dia", prontas: "2026-01-12", obs: "" },
  { num: 31, login: "BRA31", password: "123456", cn: "CK65-L0N-BSC210E", sn: "23138D820C", mac: "0C:23:69:A2:FB:F2", operador: "Dmitrii Diuldin", turno: "Dia", prontas: "2026-01-12", obs: "" },
  { num: 32, login: "BRA32", password: "123456", cn: "CK65-L0N-BSC210E", sn: "23139D8288", mac: "0C:23:69:A3:05:40", operador: "Francisco Pereira Silva", turno: "Dia", prontas: "2026-01-12", obs: "" },
  { num: 43, login: "BRA49", password: "123456", cn: "CK65-L0N-BSC210E", sn: "24075D8068", mac: "C4:EF:DA:06:15:F9", operador: "Reserva", turno: "Dia", prontas: "2026-02-24", obs: "" },
  { num: 48, login: "BRA48", password: "123456", cn: "CK65-L0N-BSC210E", sn: "23130D80C6", mac: "0C:23:69:A3:04:1A", operador: "Reserva", turno: "Dia", prontas: "2026-02-24", obs: "" }
];

/* =========================
   DADOS PORTAS
========================= */
const portasData = [
  { porta: "127", local: "Mesa 1", user: "Ilha 1", ip: "192.168.10.101" },
  { porta: "126", local: "", user: "", ip: "" },
  { porta: "125", local: "Mesa 2", user: "", ip: "192.168.10.102" },
  { porta: "123", local: "Mesa 3", user: "Ilha 2", ip: "192.168.10.103" },
  { porta: "119", local: "Mesa 5", user: "Ilha 3", ip: "192.168.10.105" },
  { porta: "115", local: "Mesa 7", user: "Ilha 4", ip: "192.168.10.107" },
  { porta: "111", local: "Mesa 9", user: "Ilha 5", ip: "192.168.10.109" },
  { porta: "106", local: "Mesa 16", user: "Machado", ip: "192.168.10.164" },
  { porta: "102", local: "Mesa 17", user: "Rafael Silva", ip: "192.168.10.117" },
  { porta: "224", local: "BRA-BAL01", user: "Jose Miguel / Gonçalo Santos", ip: "192.168.10.125" },
  { porta: "222", local: "BRA-BAL02", user: "Rafael Araujo / Fabio Silva", ip: "192.168.10.126" },
  { porta: "220", local: "BRA-BAL03", user: "Henrique Ferreira / Andre Costa", ip: "192.168.10.127" },
  { porta: "225", local: "BRA-CAL05", user: "Ricardo Fernandes", ip: "192.168.10.152" },
  { porta: "232", local: "BRA-CAL01", user: "João Carlos", ip: "192.168.10.120" },
  { porta: "234", local: "BRA-CAL02", user: "Pedro Fernandes", ip: "192.168.10.121" },
  { porta: "230", local: "BRA-CAL03", user: "Tiago Melo", ip: "192.168.10.122" },
  { porta: "228", local: "BRA-CAL04", user: "Carlos Pinto / Andre Costa", ip: "192.168.10.123" },
  { porta: "304", local: "André Veloso", user: "", ip: "192.168.10.163" },
  { porta: "306", local: "João Silva", user: "", ip: "192.168.10.162" },
  { porta: "302", local: "César Soares", user: "", ip: "192.168.10.158" }
];

/* =========================
   DADOS USERS
========================= */
const usersData = [
  {
    nome: "Pedro José Peixoto Machado",
    zona: "Resp Armazém",
    user_pc_eye: "PJPMachado",
    pass_remote: "pmachado",
    pass_eye_peak: "",
    op_pistola: "PJPMachadoP",
    pass_pistola: "123456",
    nome_pc: "PJPMachado-PT",
    teamviewer: "1719798838",
    user_mo365: "pedro-machado@autozitania.onmicrosoft.com",
    pw_mo365: "Mug97628",
    email_bragalis: "pmachado@bragalis.com",
    pass_bragalis: "Brg25lis_1!!"
  },
  {
    nome: "Rafael Gonçalves Silva",
    zona: "Armazém/Logistica",
    user_pc_eye: "RGSSilva",
    pass_remote: "RGS07",
    pass_eye_peak: "RGSSilva",
    op_pistola: "RGSilvaP",
    pass_pistola: "rgs07",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Ricardo Jorge Barbosa Fernandes",
    zona: "Informatica",
    user_pc_eye: "RJBFernandes",
    pass_remote: "",
    pass_eye_peak: "RJBFernandes03",
    op_pistola: "RJBFernandesP",
    pass_pistola: "rjbf03",
    nome_pc: "RJBFernandes-PT",
    teamviewer: "398909305",
    user_mo365: "ricardo-fernandes@autozitania.onmicrosoft.com",
    pw_mo365: "Dog83888",
    email_bragalis: "",
    pass_bragalis: ""
  }
];

/* =========================
   FIREBASE
========================= */
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
    mostrarMensagem("Preenche o equipamento e a cor.", "erro");
    return;
  }

  try {
    const id = await gerarID();

    await db.collection("stock").add({
      idInterno: id,
      equipamento: eq,
      localizacao: loc || "Sem Localização",
      cor,
      data: data || "Sem Data",
      created: new Date()
    });

    if (el("equipamento")) el("equipamento").value = "";
    if (el("localizacao")) el("localizacao").value = "";
    if (el("cor")) el("cor").value = "";
    if (el("data")) el("data").value = "";

    mostrarMensagem("Toner adicionado");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao adicionar toner", "erro");
  }
}

db.collection("stock").orderBy("created", "desc").onSnapshot(snap => {
  stockGlobal = [];
  setText("countStock", snap.size);

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
  setText("countUsados", snap.size);

  snap.forEach(doc => {
    const t = doc.data();
    t.idDoc = doc.id;
    historicoGlobal.push(t);
  });

  renderHistorico();
});

db.collection("pcs").orderBy("created", "desc").onSnapshot(snap => {
  pcsGlobal = [];
  setText("countPCs", snap.size);

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

/* =========================
   DASHBOARD / STOCK / HISTÓRICO
========================= */
function renderDashboard() {
  const dash = el("listaDashboardStock");
  if (!dash) return;

  setText("countPistolasDashboard", pistolasData.length);
  setText("countPortasDashboard", portasData.length);
  setText("countUsersDashboard", usersData.length);

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

function renderStock(lista = stockGlobal) {
  const box = el("listaStock");
  if (!box) return;

  if (!lista.length) {
    box.innerHTML = `<div class="panel empty-state"><h3>Sem toners em stock</h3><p>Quando adicionares toners, aparecem aqui.</p></div>`;
    return;
  }

  box.innerHTML = lista.map(t => `
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

function renderHistorico(lista = historicoGlobal) {
  const box = el("listaHistorico");
  if (!box) return;

  if (!lista.length) {
    box.innerHTML = `<div class="panel empty-state"><h3>Sem histórico</h3><p>Os toners usados aparecem aqui.</p></div>`;
    return;
  }

  box.innerHTML = lista.map(t => `
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
  try {
    const ref = db.collection("stock").doc(id);
    const snap = await ref.get();

    await db.collection("historico").add({
      ...snap.data(),
      created: new Date()
    });

    await ref.delete();
    mostrarMensagem("Movido para histórico");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao mover", "erro");
  }
}

async function apagar(id) {
  try {
    await db.collection("historico").doc(id).delete();
    mostrarMensagem("Apagado");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao apagar", "erro");
  }
}

function filtrar() {
  const txt = normalizarTexto(el("search")?.value || "");
  const filtrados = stockGlobal.filter(t =>
    normalizarTexto(t.localizacao).includes(txt) ||
    normalizarTexto(t.equipamento).includes(txt) ||
    normalizarTexto(t.cor).includes(txt) ||
    normalizarTexto(t.idInterno).includes(txt)
  );
  renderStock(filtrados);
}

function filtrarDashboard() {
  const txt = normalizarTexto(el("searchDashboard")?.value || "");
  const filtrados = stockGlobal.filter(t =>
    normalizarTexto(t.localizacao).includes(txt) ||
    normalizarTexto(t.equipamento).includes(txt) ||
    normalizarTexto(t.cor).includes(txt) ||
    normalizarTexto(t.idInterno).includes(txt)
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

/* =========================
   COMPUTADORES
========================= */
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
  const box = el("listaPC");
  if (!box) return;

  if (!pcsGlobal.length) {
    box.innerHTML = `<div class="panel empty-state"><h3>Sem registos de computadores</h3><p>Os computadores guardados aparecem aqui.</p></div>`;
    return;
  }

  box.innerHTML = pcsGlobal.map(d => {
    const htmlPassos = (d.passos || []).map(p => `
      <div class="meta-line">${p.feito ? "✔" : "❌"} <span class="meta-value">${p.passo}</span></div>
    `).join("");

    return `
      <div class="pc-card">
        <div class="pc-name">${d.nome}</div>
        <div class="meta-line">Data: <span class="meta-value">${d.data || "Sem Data"}</span></div>
        <div class="pc-meta" style="margin-top:12px;">${htmlPassos}</div>
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

  const dados = passos.map((p, i) => ({
    passo: p,
    feito: el("p" + i)?.checked || false
  }));

  try {
    await db.collection("pcs").add({
      nome,
      data,
      passos: dados,
      created: new Date()
    });

    if (el("nomePC")) el("nomePC").value = "";
    if (el("dataPC")) el("dataPC").value = "";
    carregarChecklist();
    mostrarMensagem("PC guardado");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao guardar PC", "erro");
  }
}

async function apagarPC(id) {
  try {
    await db.collection("pcs").doc(id).delete();
    mostrarMensagem("PC apagado");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao apagar PC", "erro");
  }
}

/* =========================
   IMPRESSORAS / MANUTENÇÃO
========================= */
function renderImpressoras() {
  const tbody = el("impressorasTableBody");
  if (!tbody) return;

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

function modelosPorArmazem(armazem) {
  const lista = !armazem
    ? impressorasData
    : impressorasData.filter(i => i.armazem === armazem);

  return [...new Set(lista.map(i => i.modelo))];
}

function preencherDropdownManutencao() {
  const armazem = el("manutencaoArmazem")?.value || "";
  const modeloSelect = el("manutencaoModelo");
  const serieSelect = el("manutencaoSerie");
  const locSelect = el("manutencaoLocalizacao");
  const ipSelect = el("manutencaoIP");

  if (!modeloSelect || !serieSelect || !locSelect || !ipSelect) return;

  const modelos = modelosPorArmazem(armazem);

  modeloSelect.innerHTML = `
    <option value="">Selecionar modelo</option>
    ${modelos.map(m => `<option value="${m}">${m}</option>`).join("")}
  `;

  serieSelect.innerHTML = `<option value="">Selecionar nº série</option>`;
  locSelect.innerHTML = `<option value="">Selecionar localização</option>`;
  ipSelect.innerHTML = `<option value="">Selecionar IP</option>`;
}

function sincronizarManutencaoPorArmazem() {
  preencherDropdownManutencao();
}

function sincronizarManutencaoPorModelo() {
  const armazem = el("manutencaoArmazem")?.value || "";
  const modelo = el("manutencaoModelo")?.value || "";
  const serieSelect = el("manutencaoSerie");
  const locSelect = el("manutencaoLocalizacao");
  const ipSelect = el("manutencaoIP");

  if (!serieSelect || !locSelect || !ipSelect) return;

  let lista = impressorasData.filter(i => i.modelo === modelo);
  if (armazem) lista = lista.filter(i => i.armazem === armazem);

  serieSelect.innerHTML = `
    <option value="">Selecionar nº série</option>
    ${lista.map(i => `<option value="${i.serie}">${i.serie}</option>`).join("")}
  `;

  locSelect.innerHTML = `
    <option value="">Selecionar localização</option>
    ${lista.map(i => `<option value="${i.localizacao}">${i.localizacao}</option>`).join("")}
  `;

  ipSelect.innerHTML = `
    <option value="">Selecionar IP</option>
    ${lista.map(i => `<option value="${i.ip}">${i.ip}</option>`).join("")}
  `;
}

function sincronizarManutencaoPorSerie() {
  const serie = el("manutencaoSerie")?.value || "";
  const item = impressorasData.find(i => i.serie === serie);
  if (!item) return;

  if (el("manutencaoArmazem")) el("manutencaoArmazem").value = item.armazem;
  if (el("manutencaoModelo")) el("manutencaoModelo").value = item.modelo;
  if (el("manutencaoLocalizacao")) el("manutencaoLocalizacao").value = item.localizacao;
  if (el("manutencaoIP")) el("manutencaoIP").value = item.ip;
}

function sincronizarManutencaoPorIP() {
  const ip = el("manutencaoIP")?.value || "";
  const item = impressorasData.find(i => i.ip === ip);
  if (!item) return;

  if (el("manutencaoArmazem")) el("manutencaoArmazem").value = item.armazem;
  if (el("manutencaoModelo")) el("manutencaoModelo").value = item.modelo;
  if (el("manutencaoSerie")) el("manutencaoSerie").value = item.serie;
  if (el("manutencaoLocalizacao")) el("manutencaoLocalizacao").value = item.localizacao;
}

async function guardarManutencao() {
  const tecnico = el("manutencaoTecnico")?.value || "";
  const armazem = el("manutencaoArmazem")?.value || "";
  const modelo = el("manutencaoModelo")?.value || "";
  const serie = el("manutencaoSerie")?.value || "";
  const localizacao = el("manutencaoLocalizacao")?.value || "";
  const ip = el("manutencaoIP")?.value || "";
  const motivo = el("manutencaoMotivo")?.value || "";
  const dataPedido = el("manutencaoPedido")?.value || "";
  const dataResolucao = el("manutencaoResolucao")?.value || "";

  if (!tecnico || !armazem || !modelo || !serie || !localizacao || !ip || !motivo || !dataPedido) {
    mostrarMensagem("Preenche os campos obrigatórios da manutenção.", "erro");
    return;
  }

  try {
    await db.collection("manutencoes").add({
      tecnico,
      armazem,
      modelo,
      serie,
      localizacao,
      ip,
      motivo,
      dataPedido,
      dataResolucao: dataResolucao || "Sem resolução",
      created: new Date()
    });

    if (el("manutencaoTecnico")) el("manutencaoTecnico").value = "";
    if (el("manutencaoArmazem")) el("manutencaoArmazem").value = "";
    if (el("manutencaoModelo")) el("manutencaoModelo").innerHTML = `<option value="">Selecionar modelo</option>`;
    if (el("manutencaoSerie")) el("manutencaoSerie").innerHTML = `<option value="">Selecionar nº série</option>`;
    if (el("manutencaoLocalizacao")) el("manutencaoLocalizacao").innerHTML = `<option value="">Selecionar localização</option>`;
    if (el("manutencaoIP")) el("manutencaoIP").innerHTML = `<option value="">Selecionar IP</option>`;
    if (el("manutencaoMotivo")) el("manutencaoMotivo").value = "";
    if (el("manutencaoPedido")) el("manutencaoPedido").value = "";
    if (el("manutencaoResolucao")) el("manutencaoResolucao").value = "";

    mostrarMensagem("Manutenção guardada");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao guardar manutenção", "erro");
  }
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
      <div class="pc-name">${item.modelo || "-"}</div>
      <div class="meta-line">Série: <span class="meta-value">${item.serie || "-"}</span></div>
      <div class="meta-line">Técnico: <span class="meta-value">${item.tecnico}</span></div>
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
  try {
    await db.collection("manutencoes").doc(id).delete();
    mostrarMensagem("Manutenção apagada");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao apagar manutenção", "erro");
  }
}

/* =========================
   PISTOLAS
========================= */
function badgePistola(p) {
  return normalizarTexto(p.operador) === "reserva"
    ? `<span class="badge reserva">Reserva</span>`
    : `<span class="badge ok">Ativa</span>`;
}

function renderPistolas(lista = pistolasData) {
  const box = el("listaPistolas");
  if (!box) return;

  setText("countPistolas", lista.length);
  setText("countPistolasDia", lista.filter(p => normalizarTexto(p.turno) === "dia").length);
  setText("countPistolasReserva", lista.filter(p => normalizarTexto(p.operador) === "reserva").length);

  box.innerHTML = lista.map(p => `
    <div class="mobile-data-card">
      <div class="mobile-data-card-top">
        <h3>Pistola ${p.num}</h3>
        ${badgePistola(p)}
      </div>
      <div class="meta-line">Login: <span class="meta-value">${p.login}</span></div>
      <div class="meta-line">Operador: <span class="meta-value">${p.operador}</span></div>
      <div class="meta-line">Turno: <span class="meta-value">${p.turno}</span></div>
      <div class="meta-line">SN: <span class="meta-value">${p.sn}</span></div>
      <div class="meta-line">MAC: <span class="meta-value">${p.mac}</span></div>
      <div class="meta-line">CN: <span class="meta-value">${p.cn}</span></div>
      <div class="meta-line">Data: <span class="meta-value">${p.prontas}</span></div>
    </div>
  `).join("");
}

function filtrarPistolas() {
  const txt = normalizarTexto(el("searchPistolas")?.value || "");
  const turno = normalizarTexto(el("filterTurnoPistolas")?.value || "");
  const tipo = normalizarTexto(el("filterTipoPistolas")?.value || "");

  const filtradas = pistolasData.filter(p => {
    const textoOk =
      normalizarTexto(p.num).includes(txt) ||
      normalizarTexto(p.login).includes(txt) ||
      normalizarTexto(p.operador).includes(txt) ||
      normalizarTexto(p.sn).includes(txt) ||
      normalizarTexto(p.mac).includes(txt);

    const turnoOk = !turno || normalizarTexto(p.turno) === turno;
    const tipoAtual = normalizarTexto(p.operador) === "reserva" ? "reserva" : "ativas";
    const tipoOk = !tipo || tipoAtual === tipo;

    return textoOk && turnoOk && tipoOk;
  });

  renderPistolas(filtradas);
}

/* =========================
   PORTAS
========================= */
function estadoPorta(p) {
  const temIP = normalizarTexto(p.ip) !== "";
  const temUser = normalizarTexto(p.user) !== "";

  if (!temIP && !temUser) return "livre";
  if (temIP && temUser) return "ocupado";
  if (temIP && !temUser) return "semuser";
  return "livre";
}

function badgePorta(estado) {
  if (estado === "ocupado") return `<span class="badge ocupado">Ocupado</span>`;
  if (estado === "livre") return `<span class="badge livre">Livre</span>`;
  if (estado === "semuser") return `<span class="badge aviso">Sem user</span>`;
  return "";
}

function renderPortas(lista = portasData) {
  const box = el("listaPortas");
  if (!box) return;

  setText("countPortas", lista.length);
  setText("countPortasUsadas", lista.filter(p => estadoPorta(p) === "ocupado").length);
  setText("countPortasLivres", lista.filter(p => estadoPorta(p) === "livre").length);

  box.innerHTML = lista.map(p => `
    <div class="mobile-data-card">
      <div class="mobile-data-card-top">
        <h3>Porta ${p.porta || "-"}</h3>
        ${badgePorta(estadoPorta(p))}
      </div>
      <div class="meta-line">Localização: <span class="meta-value">${p.local || "-"}</span></div>
      <div class="meta-line">Utilizador: <span class="meta-value">${p.user || "-"}</span></div>
      <div class="meta-line">IP: <span class="meta-value">${p.ip ? `<a href="http://${p.ip}" target="_blank">${p.ip}</a>` : "-"}</span></div>
    </div>
  `).join("");
}

function filtrarPortas() {
  const txt = normalizarTexto(el("searchPortas")?.value || "");
  const estado = normalizarTexto(el("filterEstadoPortas")?.value || "");

  const filtradas = portasData.filter(p => {
    const textoOk =
      normalizarTexto(p.porta).includes(txt) ||
      normalizarTexto(p.local).includes(txt) ||
      normalizarTexto(p.user).includes(txt) ||
      normalizarTexto(p.ip).includes(txt);

    const estadoOk = !estado || estadoPorta(p) === estado;
    return textoOk && estadoOk;
  });

  renderPortas(filtradas);
}

/* =========================
   USERS
========================= */
function temMO365(u) {
  return normalizarTexto(u.user_mo365) !== "";
}

function temPistola(u) {
  return normalizarTexto(u.op_pistola) !== "";
}

function renderUsers(lista = usersData) {
  const box = el("listaUsers");
  if (!box) return;

  setText("countUsers", lista.length);
  setText("countUsersMO365", lista.filter(temMO365).length);
  setText("countUsersPistola", lista.filter(temPistola).length);

  box.innerHTML = lista.map((u, i) => `
    <div class="mobile-data-card">
      <div class="mobile-data-card-top">
        <h3>${u.nome}</h3>
        ${temMO365(u) ? `<span class="badge ok">MO365</span>` : `<span class="badge livre">Sem MO365</span>`}
      </div>

      <div class="meta-line">Zona: <span class="meta-value">${u.zona || "-"}</span></div>
      <div class="meta-line">User PC: <span class="meta-value">${u.user_pc_eye || "-"}</span></div>
      <div class="meta-line">Pistola: <span class="meta-value">${u.op_pistola || "-"}</span></div>
      <div class="meta-line">Email Bragalis: <span class="meta-value">${u.email_bragalis || "-"}</span></div>

      <div class="card-actions">
        <button class="small-btn btn-edit" onclick="toggleUserExtra('userExtra${i}')">Ver mais</button>
      </div>

      <div id="userExtra${i}" class="user-extra-box" style="display:none;">
        <div class="meta-line">Pass Remote: <span class="meta-value">${u.pass_remote || "-"}</span></div>
        <div class="meta-line">Pass Eye Peak: <span class="meta-value">${u.pass_eye_peak || "-"}</span></div>
        <div class="meta-line">Pass Pistola: <span class="meta-value">${u.pass_pistola || "-"}</span></div>
        <div class="meta-line">Nome PC: <span class="meta-value">${u.nome_pc || "-"}</span></div>
        <div class="meta-line">TeamViewer: <span class="meta-value">${u.teamviewer || "-"}</span></div>
        <div class="meta-line">MO365: <span class="meta-value">${u.user_mo365 || "-"}</span></div>
        <div class="meta-line">Pw MO365: <span class="meta-value">${u.pw_mo365 || "-"}</span></div>
        <div class="meta-line">Pass Bragalis: <span class="meta-value">${u.pass_bragalis || "-"}</span></div>
      </div>
    </div>
  `).join("");
}

function toggleUserExtra(id) {
  const box = el(id);
  if (!box) return;
  box.style.display = box.style.display === "none" ? "block" : "none";
}

function filtrarUsers() {
  const txt = normalizarTexto(el("searchUsers")?.value || "");
  const mo365 = normalizarTexto(el("filterUsersMO365")?.value || "");
  const pistola = normalizarTexto(el("filterUsersPistola")?.value || "");

  const filtrados = usersData.filter(u => {
    const textoOk =
      normalizarTexto(u.nome).includes(txt) ||
      normalizarTexto(u.zona).includes(txt) ||
      normalizarTexto(u.user_pc_eye).includes(txt) ||
      normalizarTexto(u.op_pistola).includes(txt) ||
      normalizarTexto(u.email_bragalis).includes(txt) ||
      normalizarTexto(u.user_mo365).includes(txt);

    let mo365Ok = true;
    if (mo365 === "sim") mo365Ok = temMO365(u);
    if (mo365 === "nao") mo365Ok = !temMO365(u);

    let pistolaOk = true;
    if (pistola === "sim") pistolaOk = temPistola(u);
    if (pistola === "nao") pistolaOk = !temPistola(u);

    return textoOk && mo365Ok && pistolaOk;
  });

  renderUsers(filtrados);
}

/* =========================
   DARK MODE
========================= */
function aplicarDarkMode(ativo) {
  document.body.classList.toggle("dark", ativo);
  document.documentElement.classList.toggle("dark", ativo);
  localStorage.setItem("modo", ativo ? "dark" : "light");
  if (el("darkSwitch")) el("darkSwitch").checked = ativo;
}

/* =========================
   INIT
========================= */
window.onload = () => {
  const sw = el("darkSwitch");
  const darkAtivo = localStorage.getItem("modo") === "dark";
  aplicarDarkMode(darkAtivo);

  if (sw) {
    sw.addEventListener("change", () => aplicarDarkMode(sw.checked));
  }

  carregarChecklist();
  renderImpressoras();
  preencherDropdownManutencao();
  renderPistolas();
  renderPortas();
  renderUsers();
  mudarPagina("dashboard");
};
