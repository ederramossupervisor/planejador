# Planejador de Aulas — protótipo

Terceiro exemplo para a oficina: um app de organização/administrativo, diferente
da dinâmica ao vivo do placar da gincana. Mostra como guardar, buscar e reaproveitar
planos de aula, com planilha do Google como banco de dados.

## Arquivos

- `index.html` — estrutura das 3 telas (lista, formulário, detalhe/impressão)
- `style.css` — visual (tema "caderno/agenda")
- `script.js` — lógica: listar, criar, editar, duplicar, excluir, buscar/filtrar, imprimir
- `Code.gs` — o backend (cole no Apps Script da sua planilha)

## Modo demonstração (sem configurar nada)

Abra o `index.html` direto no navegador. Ele já vem com 2 planos de exemplo
(Matemática e História) e todas as ações funcionam — criar, editar, duplicar,
excluir, buscar, imprimir. Só que nada fica salvo de verdade: se recarregar a
página, volta ao ponto de partida. Um aviso no topo avisa isso.

## Ligando à planilha de verdade

1. Crie uma planilha nova no Google Sheets.
2. Vá em **Extensões → Apps Script**.
3. Apague o conteúdo do editor e cole todo o conteúdo de `Code.gs`.
4. No menu de funções, selecione `configurarPlanilha` e clique em **Executar**
   (aceite a autorização pedida na primeira vez). Isso cria a aba **Planos**.
5. Vá em **Implantar → Nova implantação**.
   - Tipo: **Aplicativo da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
6. Copie a URL gerada (termina em `/exec`) e cole em `CONFIG.API_URL`, no
   início do arquivo `script.js`.
7. Salve e recarregue o `index.html`. O aviso de "modo demonstração" some, e
   cada plano criado, editado ou excluído passa a valer direto na planilha —
   ótimo para abrir a planilha ao lado e mostrar a linha aparecendo em tempo real.

## O que já funciona

- Criar, editar, duplicar e excluir planos.
- Busca por palavra-chave (varre disciplina, turma, habilidade, objetivo e
  desenvolvimento) e filtro por disciplina/turma.
- Tela de detalhe com botão **Imprimir / PDF**, que usa a função de impressão
  do próprio navegador (Ctrl+P / Cmd+P) já com um layout limpo, sem os botões
  da interface — no diálogo de impressão, basta escolher "Salvar como PDF".

## Ideias para usar na oficina

- Bom gancho para mostrar a diferença entre **usar a IA no chat para escrever
  o conteúdo pedagógico** (objetivo, desenvolvimento da aula) e **usar um app
  para organizar e reaproveitar** esse conteúdo ao longo do ano.
- Peça aos professores para descreverem uma aula real deles e criar o plano
  juntos, ao vivo, usando o formulário.
- Depois de ligar à planilha, mostre como um plano criado no app aparece como
  uma linha comum na planilha — reforça que a planilha continua acessível e
  editável por fora do app, igual nos seus outros sistemas.

## Ideias de próximos passos (não implementadas neste protótipo)

- Um botão "gerar rascunho com IA": o professor descreve a aula em uma frase
  e a IA preenche objetivo/desenvolvimento automaticamente. Dá pra fazer
  chamando a API do Claude a partir do Apps Script (que já roda no servidor,
  evitando expor uma chave de API no navegador).
- Exportar o plano diretamente em `.docx` (em vez de imprimir/PDF), reaproveitando
  o mesmo padrão de geração de documentos que você já usa no Sistema Supervisão.
