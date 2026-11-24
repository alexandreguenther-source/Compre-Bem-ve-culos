// Lista de veículos (RF07) com DataTables (RF06), filtro por status e exclusão com confirmação.
(() => {
  'use strict';
  const { $, $$, esc, moeda, numero, toast, confirmar, montarTabela, seloStatus, placaFormatada } = Util;
  if (!Sessao.ler()) return;

  let filtro = '';

  function desenhar() {
    const todos = Dados.veiculos();
    $$('[data-qtd]').forEach((b) => { b.textContent = todos.filter((v) => !b.dataset.qtd || v.status === b.dataset.qtd).length; });
    const linhas = todos.filter((v) => !filtro || v.status === filtro).map((v) => {
      const c = v.clienteId ? Dados.cliente(v.clienteId) : null;
      const interessados = Dados.interessadosNoVeiculo(v).length;
      return '<tr>' +
        '<td data-order="' + esc(v.placa) + '"><span class="placa"><span>' + esc(placaFormatada(v.placa)) + '</span></span></td>' +
        '<td><div class="fw-semibold">' + esc(v.marca + ' ' + v.modelo) + '</div><small class="text-body-secondary">' + esc([v.cor, v.combustivel, v.cambio].filter(Boolean).join(' · ')) + '</small>' +
          (interessados ? '<br><a class="chip-interessados" href="oportunidades.html?veiculo=' + v.id + '"><i class="bi bi-people-fill me-1"></i>' + interessados + ' cliente(s) procurando</a>' : '') + '</td>' +
        '<td class="d-none d-md-table-cell">' + esc(v.ano) + '</td>' +
        '<td data-order="' + (v.km || 0) + '" class="text-nowrap d-none d-md-table-cell">' + numero(v.km) + ' km</td>' +
        '<td data-order="' + (v.preco || 0) + '" class="fw-semibold text-nowrap">' + moeda(v.preco) + '</td>' +
        '<td>' + seloStatus(v.status) + '</td>' +
        '<td class="d-none d-lg-table-cell">' + (c ? '<a href="cliente-form.html?id=' + c.id + '">' + esc(c.nome) + '</a>' : '<span class="text-body-secondary">-</span>') + '</td>' +
        '<td class="acoes">' +
          '<a class="btn btn-sm btn-outline-primary" href="veiculo-form.html?id=' + v.id + '" title="Editar" aria-label="Editar ' + esc(v.placa) + '"><i class="bi bi-pencil"></i></a> ' +
          '<button class="btn btn-sm btn-outline-danger" data-excluir="' + v.id + '" title="Excluir" aria-label="Excluir ' + esc(v.placa) + '"><i class="bi bi-trash"></i></button>' +
        '</td></tr>';
    });
    montarTabela('#tabela-veiculos', linhas, { order: [] });
  }

  $('#filtros').addEventListener('change', (e) => { filtro = e.target.value; desenhar(); });

  $('#tabela-veiculos').addEventListener('click', async (e) => {
    const botao = e.target.closest('[data-excluir]');
    if (!botao) return;
    const v = Dados.veiculo(botao.dataset.excluir);
    if (!v) return;
    if (v.status === 'Vendido') {
      toast('O veículo ' + placaFormatada(v.placa) + ' já foi vendido e faz parte do histórico de vendas. Não pode ser excluído.', 'danger', 'Exclusão bloqueada');
      return;
    }
    const ok = await confirmar({ titulo: 'Excluir veículo', texto: 'Excluir ' + v.marca + ' ' + v.modelo + ' (' + placaFormatada(v.placa) + ') do estoque? Esta ação não pode ser desfeita.', botao: 'Excluir' });
    if (!ok) return;
    Dados.excluirVeiculo(v.id);
    desenhar();
    toast('Veículo ' + placaFormatada(v.placa) + ' excluído do estoque.', 'danger', 'Registro excluído');
  });

  desenhar();
})();
