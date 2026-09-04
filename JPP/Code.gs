/**
 * PLANEJADOR DE AULAS — backend em Google Apps Script
 *
 * Como usar:
 * 1. Crie uma planilha nova no Google Sheets.
 * 2. Nela, vá em Extensões → Apps Script.
 * 3. Apague o conteúdo do arquivo Code.gs e cole todo este arquivo no lugar.
 * 4. Rode a função "configurarPlanilha" uma vez (menu Executar), para criar
 *    a aba "Planos" automaticamente. Na primeira vez, o Google vai pedir
 *    autorização — aceite.
 * 5. Vá em Implantar → Nova implantação → tipo "Aplicativo da Web".
 *    - Executar como: Eu (sua conta)
 *    - Quem pode acessar: Qualquer pessoa
 * 6. Copie a URL gerada (termina em /exec) e cole em CONFIG.API_URL
 *    no arquivo script.js do front-end.
 *
 * Sempre que editar este código, gere uma NOVA implantação (ou uma
 * nova versão da implantação existente) para a mudança valer no app.
 */

const ABA_PLANOS = "Planos";
const COLUNAS = ["ID", "Disciplina", "Turma", "Data", "Habilidade", "Objetivo", "Desenvolvimento", "Recursos", "Avaliacao"];

function configurarPlanilha() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(ABA_PLANOS);
  if (!aba) {
    aba = planilha.insertSheet(ABA_PLANOS);
    aba.appendRow(COLUNAS);
  }
}

function doGet(e) {
  return responderComPlanos();
}

function doPost(e) {
  const acao = e.parameter.acao;

  if (acao === "criar") {
    criarPlano(e.parameter);
  } else if (acao === "atualizar") {
    atualizarPlano(e.parameter);
  } else if (acao === "excluir") {
    excluirPlano(e.parameter.id);
  }

  return responderComPlanos();
}

function criarPlano(dados) {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_PLANOS);
  aba.appendRow([
    dados.id,
    dados.disciplina,
    dados.turma,
    dados.data,
    dados.habilidade,
    dados.objetivo,
    dados.desenvolvimento,
    dados.recursos,
    dados.avaliacao,
  ]);
}

function atualizarPlano(dados) {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_PLANOS);
  const valores = aba.getDataRange().getValues();

  for (let linha = 1; linha < valores.length; linha++) {
    if (valores[linha][0] === dados.id) {
      aba.getRange(linha + 1, 1, 1, COLUNAS.length).setValues([[
        dados.id,
        dados.disciplina,
        dados.turma,
        dados.data,
        dados.habilidade,
        dados.objetivo,
        dados.desenvolvimento,
        dados.recursos,
        dados.avaliacao,
      ]]);
      break;
    }
  }
}

function excluirPlano(id) {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_PLANOS);
  const valores = aba.getDataRange().getValues();

  for (let linha = 1; linha < valores.length; linha++) {
    if (valores[linha][0] === id) {
      aba.deleteRow(linha + 1);
      break;
    }
  }
}

function responderComPlanos() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_PLANOS);
  const valores = aba.getDataRange().getValues();

  const planos = valores.slice(1).map((linha) => ({
    id: linha[0],
    disciplina: linha[1],
    turma: linha[2],
    data: linha[3] instanceof Date ? Utilities.formatDate(linha[3], Session.getScriptTimeZone(), "yyyy-MM-dd") : linha[3],
    habilidade: linha[4],
    objetivo: linha[5],
    desenvolvimento: linha[6],
    recursos: linha[7],
    avaliacao: linha[8],
  }));

  return ContentService
    .createTextOutput(JSON.stringify({ planos }))
    .setMimeType(ContentService.MimeType.JSON);
}
