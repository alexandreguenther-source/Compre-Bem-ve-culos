// Oportunidades de venda (RF16): cruza o que cada cliente procura com o estoque disponível.
// É aqui que a dor é resolvida: o vendedor vê na hora quem avisar e manda a mensagem pronta pelo WhatsApp.
(() => {
  'use strict';
  const { $, esc, moeda, numero, dataBR, toast, placaFormatada, linkWhatsApp, resumoInteresse, parametro } = Util;
  if (!Sessao.ler()) return;

  const destaque = Number(parametro('veiculo')) || null; // veio do cadastro de um carro novo
  const diasDesde = (iso) => (iso ? Math.max(0, Math.round((new Date(Dados.hoje()) - new Date(iso)) / 86400000)) : 0);
  const textoDias = (n) => (n === 0 ? 'hoje' : n === 1 ? 'há 1 dia' : 'há ' + n + ' dias');

  function cartaoAvisar(o) {
    const c = o.cliente;
    const v = o.veiculo;
    const dias = diasDesde(c.interesse.desde);
    return '<div class="col-lg-6"><article class="card cartao oportunidade h-100' + (v.id === destaque ? ' destaque' : '') + '">' +
      '<div class="card-body">' +
        '<div class="d-flex justify-content-between align-items-start gap-2 mb-3">' +
          '<div class="d-flex align-items-center gap-2 min-w-0"><span class="avatar">' + esc(c.nome.charAt(0)) + '</span>' +
          '<div class="min-w-0"><div class="fw-bold text-truncate">' + esc(c.nome) + '</div><small class="text-body-secondary">' + esc(c.telefone) + '</small></div></div>' +
          '<span class="badge rounded-pill ' + (dias > 14 ? 'text-bg-danger' : 'text-bg-warning') + '" title="Tempo desde que o cliente pediu">Procurando ' + textoDias(dias) + '</span>' +
        '</div>' +
        '<div class="procura"><small class="text-body-secondary d-block">Procura</small><span class="fw-semibold">' + esc(resumoInteresse(c.interesse)) + '</span>' +
          (c.interesse.observacao ? '<small class="d-block fst-italic text-body-secondary">"' + esc(c.interesse.observacao) + '"</small>' : '') + '</div>' +
        '<div class="seta"><i class="bi bi-arrow-down"></i> temos no estoque</div>' +
        '<div class="d-flex align-items-center gap-2 flex-wrap"><span class="placa"><span>' + esc(placaFormatada(v.placa)) + '</span></span>' +
          '<div><div class="fw-semibold">' + esc(v.marca + ' ' + v.modelo + ' ' + v.ano) + '</div>' +
          '<small class="text-body-secondary">' + numero(v.km) + ' km · <strong class="text-body">' + moeda(v.preco) + '</strong></small></div></div>' +
      '</div>' +
      '<div class="card-footer d-flex gap-2 flex-wrap">' +
        '<a class="btn btn-success flex-grow-1" href="' + esc(linkWhatsApp(c, v)) + '" target="_blank" rel="noopener" data-avisar="' + c.id + ':' + v.id + '"><i class="bi bi-whatsapp me-1"></i>Avisar no WhatsApp</a>' +
        '<button class="btn btn-outline-secondary" type="button" data-marcar="' + c.id + ':' + v.id + '" title="Já avisei por telefone ou pessoalmente">Já avisei</button>' +
      '</div></article></div>';
  }

  function desenhar() {
    const { aAvisar, avisados, aguardando } = Dados.oportunidades();
    $('#ind-avisar').textContent = aAvisar.length;
    $('#ind-avisados').textContent = avisados.length;
    $('#ind-aguardando').textContent = aguardando.length;

    // Primeiro o carro que acabou de ser cadastrado; depois quem está esperando há mais tempo.
    aAvisar.sort((a, b) => (b.veiculo.id === destaque) - (a.veiculo.id === destaque) || a.cliente.interesse.desde.localeCompare(b.cliente.interesse.desde));
    $('#lista-avisar').innerHTML = aAvisar.length ? aAvisar.map(cartaoAvisar).join('')
      : '<div class="col-12"><div class="alert alert-success mb-0"><i class="bi bi-check-circle-fill me-2"></i>Tudo em dia: nenhum cliente esperando aviso. ' +
        'Quando entrar um carro que alguém procura, ele aparece aqui.</div></div>';

    $('#lista-avisados').innerHTML = avisados.length ? avisados.map((o) =>
      '<tr><td class="text-nowrap">' + dataBR(o.aviso.data) + '</td>' +
      '<td><div class="fw-semibold">' + esc(o.cliente.nome) + '</div><small class="text-body-secondary">' + esc(o.cliente.telefone) + '</small></td>' +
      '<td><div>' + esc(o.veiculo.marca + ' ' + o.veiculo.modelo) + '</div><small class="text-body-secondary">' + esc(placaFormatada(o.veiculo.placa)) + ' · ' + moeda(o.veiculo.preco) + '</small></td>' +
      '<td class="acoes"><a class="btn btn-sm btn-outline-primary" href="veiculo-form.html?id=' + o.veiculo.id + '&reservar=' + o.cliente.id + '"><i class="bi bi-bookmark-star me-1"></i>Reservar</a></td></tr>').join('')
      : '<tr><td colspan="4" class="text-center text-body-secondary py-4">Nenhum aviso enviado ainda.</td></tr>';

    $('#lista-aguardando').innerHTML = aguardando.length ? aguardando.map((c) =>
      '<li class="list-group-item d-flex justify-content-between align-items-center gap-2">' +
        '<div class="min-w-0"><div class="fw-semibold">' + esc(c.nome) + '</div><small class="text-body-secondary">' + esc(resumoInteresse(c.interesse)) + ' · ' + textoDias(diasDesde(c.interesse.desde)) + '</small></div>' +
        '<a class="btn btn-sm btn-outline-primary" href="cliente-form.html?id=' + c.id + '" title="Editar procura" aria-label="Editar procura de ' + esc(c.nome) + '"><i class="bi bi-pencil"></i></a></li>').join('')
      : '<li class="list-group-item text-body-secondary py-4 text-center">Nenhum cliente aguardando.</li>';
  }

  function registrar(par, comoAvisou) {
    const [clienteId, veiculoId] = par.split(':').map(Number);
    Dados.registrarAviso(clienteId, veiculoId);
    const c = Dados.cliente(clienteId);
    toast('Aviso registrado para ' + c.nome + comoAvisou + '. Se o cliente quiser o carro, use "Reservar" em Já avisados.', 'success', 'Cliente avisado');
    desenhar();
    Layout.atualizarContador();
  }

  $('#lista-avisar').addEventListener('click', (e) => {
    const whats = e.target.closest('[data-avisar]');
    if (whats) { setTimeout(() => registrar(whats.dataset.avisar, ' pelo WhatsApp'), 0); return; } // o link abre o WhatsApp numa nova aba
    const marcar = e.target.closest('[data-marcar]');
    if (marcar) registrar(marcar.dataset.marcar, '');
  });

  desenhar();
})();
