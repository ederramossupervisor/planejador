// ============================================================
// CONFIGURAÇÃO
// Cole aqui a URL do seu Apps Script publicado como Web App.
// Enquanto estiver vazia, o app roda em "modo demonstração":
// os planos ficam só na memória do navegador e voltam ao ponto
// de partida se a página for recarregada.
// ============================================================
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbzZKFc08__uL3yL5u89G4g_pfEf-ZO8JG7r7e8KyDfc5nxg98D71630mIn3J-oc19WSnQ/exec", // ex: "https://script.google.com/macros/s/AKfycb.../exec"
};

const modoDemonstracao = !CONFIG.API_URL;

let planos = [
  {
    id: "demo-1",
    disciplina: "Matemática",
    turma: "7º ano B",
    data: "2026-09-02",
    habilidade: "EF07MA05",
    objetivo: "Compreender o conceito de frações equivalentes através de material concreto.",
    desenvolvimento: "1) Retomada de frações básicas (10 min)\n2) Manipulação de tiras de papel dobradas (15 min)\n3) Registro das equivalências encontradas (15 min)\n4) Correção coletiva (10 min)",
    recursos: "Tiras de papel, tesoura, régua",
    avaliacao: "Observação da participação + registro escrito no caderno",
  },
  {
    id: "demo-2",
    disciplina: "História",
    turma: "9º ano A",
    data: "2026-09-04",
    habilidade: "EF09HI08",
    objetivo: "Analisar causas da Primeira Guerra Mundial a partir de fontes primárias.",
    desenvolvimento: "1) Apresentação do contexto (10 min)\n2) Leitura em grupos de trechos de fontes da época (20 min)\n3) Debate guiado (15 min)",
    recursos: "Cópias das fontes, projetor",
    avaliacao: "Participação no debate + ficha de leitura",
  },
];

let planoAtual = null; // usado nas telas de formulário/detalhe

// ---------- Utilidades ----------

function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto || "";
  return div.innerHTML;
}

function formatarData(data) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function gerarId() {
  return "plano-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function mostrarErro(mensagem) {
  const el = document.getElementById("mensagem-erro");
  el.textContent = mensagem;
  el.hidden = !mensagem;
}

function mostrarTela(id) {
  ["tela-lista", "tela-formulario", "tela-detalhe"].forEach((telaId) => {
    document.getElementById(telaId).hidden = telaId !== id;
  });
}

// ---------- Carregar / listar ----------

async function carregarPlanos() {
  if (modoDemonstracao) {
    document.getElementById("banner-demo").hidden = false;
    renderizarLista();
    return;
  }
  try {
    const resposta = await fetch(`${CONFIG.API_URL}?acao=listar`);
    if (!resposta.ok) throw new Error("Resposta HTTP " + resposta.status);
    const dados = await resposta.json();
    planos = dados.planos || [];
    renderizarLista();
    mostrarErro("");
  } catch (erro) {
    console.error(erro);
    mostrarErro("Não foi possível carregar os planos da planilha. Veja o console (F12) para detalhes.");
  }
}

function renderizarLista() {
  atualizarFiltros();

  const termo = document.getElementById("busca").value.trim().toLowerCase();
  const disciplinaFiltro = document.getElementById("filtro-disciplina").value;
  const turmaFiltro = document.getElementById("filtro-turma").value;

  const filtrados = planos.filter((plano) => {
    if (disciplinaFiltro && plano.disciplina !== disciplinaFiltro) return false;
    if (turmaFiltro && plano.turma !== turmaFiltro) return false;
    if (termo) {
      const textoBusca = [plano.disciplina, plano.turma, plano.habilidade, plano.objetivo, plano.desenvolvimento]
        .join(" ")
        .toLowerCase();
      if (!textoBusca.includes(termo)) return false;
    }
    return true;
  });

  filtrados.sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  const container = document.getElementById("lista-planos");
  const vazio = document.getElementById("lista-vazia");
  container.innerHTML = "";

  if (!filtrados.length) {
    vazio.hidden = false;
    return;
  }
  vazio.hidden = true;

  filtrados.forEach((plano) => {
    const cartao = document.createElement("article");
    cartao.className = "cartao-plano";
    cartao.innerHTML = `
      <div class="cartao-topo">
        <span class="etiqueta">${escaparHtml(plano.disciplina)}</span>
        <span class="cartao-data">${formatarData(plano.data)}</span>
      </div>
      <h3>${escaparHtml(plano.turma)}</h3>
      <p>${escaparHtml(plano.objetivo)}</p>
    `;
    cartao.addEventListener("click", () => abrirDetalhe(plano.id));
    container.appendChild(cartao);
  });
}

function atualizarFiltros() {
  const selectDisciplina = document.getElementById("filtro-disciplina");
  const selectTurma = document.getElementById("filtro-turma");
  const valorDisciplina = selectDisciplina.value;
  const valorTurma = selectTurma.value;

  const disciplinas = [...new Set(planos.map((p) => p.disciplina).filter(Boolean))].sort();
  const turmas = [...new Set(planos.map((p) => p.turma).filter(Boolean))].sort();

  selectDisciplina.innerHTML = '<option value="">Todas as disciplinas</option>' +
    disciplinas.map((d) => `<option value="${escaparHtml(d)}">${escaparHtml(d)}</option>`).join("");
  selectTurma.innerHTML = '<option value="">Todas as turmas</option>' +
    turmas.map((t) => `<option value="${escaparHtml(t)}">${escaparHtml(t)}</option>`).join("");

  selectDisciplina.value = valorDisciplina;
  selectTurma.value = valorTurma;
}

// ---------- Formulário (criar/editar) ----------

function abrirFormulario(plano) {
  planoAtual = plano || null;
  document.getElementById("titulo-formulario").textContent = plano ? "Editar plano de aula" : "Novo plano de aula";
  document.getElementById("campo-id").value = plano ? plano.id : "";
  document.getElementById("campo-disciplina").value = plano ? plano.disciplina : "";
  document.getElementById("campo-turma").value = plano ? plano.turma : "";
  document.getElementById("campo-data").value = plano ? plano.data : "";
  document.getElementById("campo-habilidade").value = plano ? plano.habilidade : "";
  document.getElementById("campo-objetivo").value = plano ? plano.objetivo : "";
  document.getElementById("campo-desenvolvimento").value = plano ? plano.desenvolvimento : "";
  document.getElementById("campo-recursos").value = plano ? plano.recursos : "";
  document.getElementById("campo-avaliacao").value = plano ? plano.avaliacao : "";
  mostrarTela("tela-formulario");
}

async function salvarPlano(evento) {
  evento.preventDefault();

  const dados = {
    id: document.getElementById("campo-id").value || gerarId(),
    disciplina: document.getElementById("campo-disciplina").value.trim(),
    turma: document.getElementById("campo-turma").value.trim(),
    data: document.getElementById("campo-data").value,
    habilidade: document.getElementById("campo-habilidade").value.trim(),
    objetivo: document.getElementById("campo-objetivo").value.trim(),
    desenvolvimento: document.getElementById("campo-desenvolvimento").value.trim(),
    recursos: document.getElementById("campo-recursos").value.trim(),
    avaliacao: document.getElementById("campo-avaliacao").value.trim(),
  };

  const ehEdicao = Boolean(document.getElementById("campo-id").value);

  if (modoDemonstracao) {
    if (ehEdicao) {
      planos = planos.map((p) => (p.id === dados.id ? dados : p));
    } else {
      planos.push(dados);
    }
    renderizarLista();
    abrirDetalhe(dados.id);
    return;
  }

  try {
    const corpo = new URLSearchParams({
      acao: ehEdicao ? "atualizar" : "criar",
      ...dados,
    });
    const resposta = await fetch(CONFIG.API_URL, { method: "POST", body: corpo });
    if (!resposta.ok) throw new Error("Resposta HTTP " + resposta.status);
    const dadosResposta = await resposta.json();
    planos = dadosResposta.planos || [];
    renderizarLista();
    abrirDetalhe(dados.id);
    mostrarErro("");
  } catch (erro) {
    console.error(erro);
    mostrarErro("Não foi possível salvar o plano na planilha. Veja o console (F12) para detalhes.");
  }
}

// ---------- Detalhe ----------

function abrirDetalhe(id) {
  const plano = planos.find((p) => p.id === id);
  if (!plano) return;
  planoAtual = plano;

  document.getElementById("conteudo-detalhe").innerHTML = `
    <div class="cabecalho-impresso">
      <h2>${escaparHtml(plano.disciplina)} — ${escaparHtml(plano.turma)}</h2>
      <span class="meta">${formatarData(plano.data)}${plano.habilidade ? " · " + escaparHtml(plano.habilidade) : ""}</span>
    </div>
    <div class="bloco">
      <h4>Objetivo</h4>
      <p>${escaparHtml(plano.objetivo)}</p>
    </div>
    <div class="bloco">
      <h4>Desenvolvimento da aula</h4>
      <p>${escaparHtml(plano.desenvolvimento)}</p>
    </div>
    ${plano.recursos ? `<div class="bloco"><h4>Recursos necessários</h4><p>${escaparHtml(plano.recursos)}</p></div>` : ""}
    ${plano.avaliacao ? `<div class="bloco"><h4>Forma de avaliação</h4><p>${escaparHtml(plano.avaliacao)}</p></div>` : ""}
  `;
  mostrarTela("tela-detalhe");
}

async function excluirPlanoAtual() {
  if (!planoAtual) return;
  if (!confirm("Excluir este plano de aula? Essa ação não pode ser desfeita.")) return;

  if (modoDemonstracao) {
    planos = planos.filter((p) => p.id !== planoAtual.id);
    planoAtual = null;
    renderizarLista();
    mostrarTela("tela-lista");
    return;
  }

  try {
    const corpo = new URLSearchParams({ acao: "excluir", id: planoAtual.id });
    const resposta = await fetch(CONFIG.API_URL, { method: "POST", body: corpo });
    if (!resposta.ok) throw new Error("Resposta HTTP " + resposta.status);
    const dados = await resposta.json();
    planos = dados.planos || [];
    planoAtual = null;
    renderizarLista();
    mostrarTela("tela-lista");
    mostrarErro("");
  } catch (erro) {
    console.error(erro);
    mostrarErro("Não foi possível excluir o plano na planilha. Veja o console (F12) para detalhes.");
  }
}

async function duplicarPlanoAtual() {
  if (!planoAtual) return;
  const copia = { ...planoAtual, id: gerarId(), data: "" };
  abrirFormulario(copia);
  document.getElementById("campo-id").value = ""; // força criação, não edição
  document.getElementById("titulo-formulario").textContent = "Duplicar plano de aula";
}

// ---------- Eventos ----------

document.getElementById("botao-novo").addEventListener("click", () => abrirFormulario(null));
document.getElementById("botao-voltar").addEventListener("click", () => mostrarTela("tela-lista"));
document.getElementById("botao-voltar-detalhe").addEventListener("click", () => mostrarTela("tela-lista"));
document.getElementById("form-plano").addEventListener("submit", salvarPlano);
document.getElementById("botao-editar").addEventListener("click", () => abrirFormulario(planoAtual));
document.getElementById("botao-duplicar").addEventListener("click", duplicarPlanoAtual);
document.getElementById("botao-excluir").addEventListener("click", excluirPlanoAtual);
document.getElementById("botao-imprimir").addEventListener("click", () => window.print());
document.getElementById("busca").addEventListener("input", renderizarLista);
document.getElementById("filtro-disciplina").addEventListener("change", renderizarLista);
document.getElementById("filtro-turma").addEventListener("change", renderizarLista);

carregarPlanos();
