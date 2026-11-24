// Lista de clientes (RF02) com DataTables (RF06) e exclusão com confirmação.
(() => {
  'use strict';
  const { $, esc, toast, confirmar, montarTabela } = Util;
  if (!Sessao.ler()) return;

  function desenhar() {
    const linhas = Dados.clientes().map((c) => {
      const qtd = Dados.veiculosDoCliente(c.id).length;
      return '<tr>' +
        '<td><div class="fw-semibold">' + esc(c.nome) + '</div><small class="text-body-secondary">' + esc(c.email) + '</small>' +
          (c.interesse && c.interesse.ativo ? '<br><span class="chip-procura"><i class="bi bi-search me-1"></i>Procura: ' + esc(Util.resumoInteresse(c.interesse)) + '</span>' : '') + '</td>' +
        '<td class="text-nowrap d-none d-md-table-cell">' + esc(c.cpf) + '</td>' +
        '<td class="text-nowrap">' + esc(c.telefone) + '</td>' +
        '<td class="d-none d-lg-table-cell">' + esc(c.cidade ? c.cidade + '/' + c.uf : '-') + '</td>' +
        '<td data-order="' + qtd + '">' + (qtd ? '<span class="badge text-bg-primary rounded-pill">' + qtd + '</span>' : '<span class="text-body-secondary">-</span>') + '</td>' +
        '<td class="acoes">' +
          '<a class="btn btn-sm btn-outline-primary" href="cliente-form.html?id=' + c.id + '" title="Editar" aria-label="Editar ' + esc(c.nome) + '"><i class="bi bi-pencil"></i></a> ' +
          '<button class="btn btn-sm btn-outline-danger" data-excluir="' + c.id + '" title="Excluir" aria-label="Excluir ' + esc(c.nome) + '"><i class="bi bi-trash"></i></button>' +
        '</td></tr>';
    });
    montarTabela('#tabela-clientes', linhas, { order: [[0, 'asc']] });
  }

  $('#tabela-clientes').addEventListener('click', async (e) => {
    const botao = e.target.closest('[data-excluir]');
    if (!botao) return;
    const c = Dados.cliente(botao.dataset.excluir);
    if (!c) return;
    const veiculos = Dados.veiculosDoCliente(c.id);
    if (veiculos.length) {
      toast('Não é possível excluir ' + c.nome + ': há ' + veiculos.length + ' veículo(s) vendido(s) ou reservado(s) para este cliente.', 'danger', 'Exclusão bloqueada');
      return;
    }
    const ok = await confirmar({ titulo: 'Excluir cliente', texto: 'Excluir "' + c.nome + '"? Esta ação não pode ser desfeita.', botao: 'Excluir' });
    if (!ok) return;
    Dados.excluirCliente(c.id);
    desenhar();
    toast('Cliente "' + c.nome + '" excluído.', 'danger', 'Registro excluído');
  });

  desenhar();
})();
