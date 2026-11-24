// Painel (RF10): indicadores, últimos veículos e estoque por status.
(() => {
  'use strict';
  const { $, esc, moeda, seloStatus, placaFormatada } = Util;
  const sessao = Sessao.ler();
  if (!sessao) return;

  const veiculos = Dados.veiculos();
  const contar = (s) => veiculos.filter((v) => v.status === s).length;
  const hora = new Date().getHours();
  $('#saudacao').textContent = (hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite') + ', ' + sessao.nome + '. Este é o resumo da garagem hoje.';

  $('#ind-clientes').textContent = Dados.clientes().length;
  $('#ind-disponiveis').textContent = contar('Disponível');
  $('#ind-reservados').textContent = contar('Reservado');
  const valor = veiculos.filter((v) => v.status === 'Disponível').reduce((t, v) => t + Number(v.preco || 0), 0);
  $('#ind-valor').textContent = moeda(valor).replace(/,00$/, '');

  const op = Dados.oportunidades();
  if (op.aAvisar.length) {
    const nomes = [...new Set(op.aAvisar.map((o) => o.cliente.nome.split(' ')[0]))];
    $('#alerta-titulo').textContent = op.aAvisar.length === 1 ? '1 cliente precisa ser avisado!' : op.aAvisar.length + ' avisos pendentes para clientes!';
    $('#alerta-texto').textContent = nomes.join(', ') + (nomes.length === 1 ? ' procura' : ' procuram') + ' um carro que já está no estoque. Avise antes que comprem em outro lugar.';
    $('#alerta-oportunidades').hidden = false;
  }

  const ultimos = veiculos.slice(0, 5);
  $('#ultimos').innerHTML = ultimos.length
    ? ultimos.map((v) =>
      '<tr role="button" onclick="location.href=\'veiculo-form.html?id=' + v.id + '\'">' +
        '<td><span class="placa"><span>' + esc(placaFormatada(v.placa)) + '</span></span></td>' +
        '<td><div class="fw-semibold">' + esc(v.marca + ' ' + v.modelo) + '</div><small class="text-body-secondary">' + esc(v.ano) + ' · ' + Util.numero(v.km) + ' km</small></td>' +
        '<td class="fw-semibold">' + moeda(v.preco) + '</td>' +
        '<td>' + seloStatus(v.status) + '</td></tr>').join('')
    : '<tr><td colspan="4" class="text-center text-body-secondary py-4">Nenhum veículo cadastrado ainda.</td></tr>';

  const total = veiculos.length || 1;
  const barras = [['Disponível', 'success'], ['Reservado', 'warning'], ['Vendido', 'secondary']];
  $('#por-status').innerHTML = barras.map(([s, cor]) => {
    const n = contar(s);
    const pct = Math.round((n / total) * 100);
    return '<div class="mb-3"><div class="d-flex justify-content-between mb-1"><span>' + s + '</span><strong>' + n + '</strong></div>' +
      '<div class="progress" role="progressbar" aria-label="' + s + '" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" style="height:10px">' +
      '<div class="progress-bar bg-' + cor + '" style="width:' + pct + '%"></div></div></div>';
  }).join('') + '<p class="text-body-secondary small mb-0">Total de ' + veiculos.length + ' veículo(s) cadastrado(s).</p>';
})();
