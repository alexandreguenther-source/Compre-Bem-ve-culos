// Cadastro e edição de veículo (RF07), com ficha técnica pela API Ninjas (RF08).
(() => {
  'use strict';
  const { $, esc, parametro, aplicarMascara, placaValida, erroCampo, toast, flash } = Util;
  if (!Sessao.ler()) return;

  const CAMPOS = ['placa', 'marca', 'modelo', 'ano', 'cor', 'km', 'combustivel', 'cambio', 'preco', 'status'];
  const form = $('#form-veiculo');
  const id = parametro('id');
  let ficha = null;

  $('#ano').max = new Date().getFullYear() + 1;
  aplicarMascara($('#placa'), 'placa');
  $('#placa').addEventListener('input', () => erroCampo($('#placa'), ''));

  // Clientes para reserva/venda
  const sel = $('#cliente');
  Dados.clientes().forEach((c) => sel.add(new Option(c.nome + ' — ' + c.cpf, c.id)));

  function mostrarCliente() {
    const precisa = $('#status').value !== 'Disponível';
    $('#grupo-cliente').hidden = !precisa;
    sel.required = precisa;
  }
  $('#status').addEventListener('change', mostrarCliente);

  if (id) {
    const v = Dados.veiculo(id);
    if (!v) { flash('Veículo não encontrado.', 'danger'); location.replace('veiculos.html'); return; }
    CAMPOS.forEach((k) => { $('#' + k).value = v[k] ?? ''; });
    sel.value = v.clienteId || '';
    ficha = v.ficha || null;
    $('#titulo').textContent = 'Editar veículo';
    $('#migalha').textContent = v.marca + ' ' + v.modelo;
    document.title = v.placa + ' · CompreBem Veículos';
  }
  // Veio de Oportunidades > Reservar: já deixa o carro reservado para o cliente avisado.
  const reservar = Dados.cliente(parametro('reservar'));
  if (id && reservar) {
    $('#status').value = 'Reservado';
    sel.value = reservar.id;
    toast('Confira os dados e clique em Salvar para reservar o carro para ' + reservar.nome + '.', 'info', 'Reserva');
  }
  mostrarCliente();

  // ---------- Clientes procurando este carro (RF15) ----------
  function veiculoDoFormulario() {
    return { marca: $('#marca').value.trim(), modelo: $('#modelo').value.trim(), ano: Number($('#ano').value), preco: Number($('#preco').value), status: $('#status').value };
  }
  function desenharInteressados() {
    const v = veiculoDoFormulario();
    const area = $('#interessados');
    const badge = $('#qtd-interessados');
    const cartao = $('#cartao-interessados');
    badge.hidden = true;
    cartao.classList.remove('com-interessados');
    if (!v.marca || !v.modelo) { area.innerHTML = '<p class="small text-body-secondary mb-0">Preencha marca, modelo, ano e preço para ver quem está procurando.</p>'; return; }
    if (v.status !== 'Disponível') { area.innerHTML = '<p class="small text-body-secondary mb-0">Só carros disponíveis são oferecidos aos clientes que estão procurando.</p>'; return; }
    const lista = Dados.interessadosNoVeiculo({ ...v, ano: v.ano || 9999, preco: v.preco || 0 });
    if (!lista.length) { area.innerHTML = '<p class="small text-body-secondary mb-0">Nenhum cliente cadastrado procura um carro assim no momento.</p>'; return; }
    badge.textContent = lista.length;
    badge.hidden = false;
    cartao.classList.add('com-interessados');
    area.innerHTML = '<p class="small mb-2"><strong>' + lista.length + ' cliente(s)</strong> procuram um carro assim. Depois de salvar, avise pela tela Oportunidades.</p>' +
      lista.map((c) => '<div class="interessado"><div class="avatar avatar-sm">' + esc(c.nome.charAt(0)) + '</div><div class="min-w-0">' +
        '<div class="fw-semibold text-truncate">' + esc(c.nome) + '</div><small class="text-body-secondary">' + esc(Util.resumoInteresse(c.interesse)) + '</small></div></div>').join('');
  }
  ['#marca', '#modelo', '#ano', '#preco'].forEach((sel) => $(sel).addEventListener('input', desenharInteressados));
  $('#status').addEventListener('change', desenharInteressados);

  // ---------- Ficha técnica (API Ninjas) ----------
  const ROTULOS = { year: 'Ano', class: 'Categoria', cylinders: 'Cilindros', displacement: 'Motor (litros)', fuel_type: 'Combustível', transmission: 'Câmbio', drive: 'Tração', city_mpg: 'Consumo cidade (mpg)', highway_mpg: 'Consumo estrada (mpg)' };
  const TRADUCAO = { a: 'Automático', m: 'Manual', fwd: 'Dianteira', rwd: 'Traseira', awd: 'Integral', '4wd': '4x4', gas: 'Gasolina', diesel: 'Diesel', electricity: 'Elétrico',
    'compact car': 'Compacto', 'subcompact car': 'Subcompacto', 'midsize car': 'Médio', 'large car': 'Grande', 'small sport utility vehicle': 'SUV compacto',
    'standard sport utility vehicle': 'SUV', 'small pickup truck': 'Picape pequena', 'standard pickup truck': 'Picape', 'minicompact car': 'Minicompacto', 'two seater': 'Dois lugares', 'minivan': 'Minivan', 'small station wagon': 'Perua' };
  const valido = (x) => x !== null && x !== undefined && x !== '' && !/premium/i.test(String(x));
  const traduzir = (x) => TRADUCAO[String(x).toLowerCase()] || x;

  function itensFicha(f) {
    return Object.keys(ROTULOS).filter((k) => valido(f[k])).map((k) => [ROTULOS[k], traduzir(f[k])]);
  }

  function desenharFichaAtual() {
    const area = $('#ficha-atual');
    if (!ficha) { area.innerHTML = '<p class="small text-body-secondary mb-0">Nenhuma ficha técnica vinculada.</p>'; return; }
    area.innerHTML = '<div class="border rounded p-3"><div class="d-flex justify-content-between align-items-start mb-2">' +
      '<strong class="text-capitalize">' + esc(ficha.make + ' ' + ficha.model) + '</strong>' +
      '<button type="button" class="btn btn-sm btn-link text-danger p-0" id="btn-remover-ficha">Remover</button></div>' +
      '<dl class="row ficha mb-0">' + itensFicha(ficha).map(([r, v]) => '<dt class="col-6">' + esc(r) + '</dt><dd class="col-6">' + esc(v) + '</dd>').join('') + '</dl></div>';
    $('#btn-remover-ficha').addEventListener('click', () => { ficha = null; desenharFichaAtual(); toast('Ficha técnica removida. Salve o veículo para confirmar.', 'warning'); });
  }

  $('#btn-ficha').addEventListener('click', async () => {
    const marca = $('#marca').value.trim();
    const modelo = $('#modelo').value.trim();
    const area = $('#resultados-ficha');
    if (!marca || !modelo) { toast('Preencha a marca e o modelo antes de buscar a ficha técnica.', 'warning'); return; }
    const btn = $('#btn-ficha');
    btn.disabled = true;
    btn.querySelector('.spinner-border').hidden = false;
    area.innerHTML = '';
    try {
      const lista = (await Apis.buscarFicha(marca, modelo)).slice(0, 5);
      if (!lista.length) {
        area.innerHTML = '<div class="alert alert-warning small">Nenhum modelo encontrado na API Ninjas para "' + esc(marca + ' ' + modelo) + '". Tente o nome do modelo sem a versão.</div>';
        return;
      }
      area.innerHTML = '<p class="small fw-semibold mb-2">Escolha o modelo correspondente:</p>' + lista.map((f, i) =>
        '<button type="button" class="resultado-ficha btn w-100 text-start border rounded p-2 mb-2" data-i="' + i + '">' +
          '<strong class="text-capitalize">' + esc(f.make + ' ' + f.model) + '</strong>' + (valido(f.year) ? ' · ' + esc(f.year) : '') +
          '<br><small class="text-body-secondary">' + esc(itensFicha(f).filter(([r]) => r !== 'Ano').slice(0, 3).map(([r, v]) => r + ': ' + v).join(' · ')) + '</small>' +
        '</button>').join('');
      area.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => {
        ficha = lista[Number(b.dataset.i)];
        area.innerHTML = '';
        desenharFichaAtual();
        toast('Ficha técnica vinculada. Salve o veículo para gravar.', 'info');
      }));
    } catch (e) {
      area.innerHTML = '<div class="alert alert-' + (e.semChave ? 'warning' : 'danger') + ' small">' + esc(e.message) +
        (e.semChave ? ' <a href="configuracoes.html">Ir para Configurações</a>' : '') + '</div>';
    } finally {
      btn.disabled = false;
      btn.querySelector('.spinner-border').hidden = true;
    }
  });
  desenharFichaAtual();
  desenharInteressados();

  // ---------- Salvar ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const placa = $('#placa');
    if (!placaValida(placa.value)) erroCampo(placa, 'Placa inválida (ABC1234 ou ABC1D23).');
    else if (Dados.placaEmUso(placa.value, id)) erroCampo(placa, 'Já existe um veículo com esta placa.');
    else erroCampo(placa, '');

    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      toast('Confira os campos destacados em vermelho.', 'danger', 'Não foi possível salvar');
      form.querySelector(':invalid')?.focus();
      return;
    }
    const dados = {};
    CAMPOS.forEach((k) => { dados[k] = $('#' + k).value.trim(); });
    dados.ano = Number(dados.ano);
    dados.km = Number(dados.km);
    dados.preco = Number(dados.preco);
    dados.clienteId = dados.status === 'Disponível' ? null : Number(sel.value);
    dados.ficha = ficha;
    if (id) dados.id = Number(id);
    const salvo = Dados.salvarVeiculo(dados);
    const aAvisar = Dados.interessadosNoVeiculo(salvo).filter((c) => !Dados.avisoDe(c.id, salvo.id));
    if (aAvisar.length) {
      flash('Veículo ' + Util.placaFormatada(salvo.placa) + ' salvo. ' + aAvisar.length + ' cliente(s) procuram este carro: avise agora!', 'success');
      location.href = 'oportunidades.html?veiculo=' + salvo.id;
    } else {
      flash('Veículo ' + Util.placaFormatada(salvo.placa) + ' salvo com sucesso!', 'success');
      location.href = 'veiculos.html';
    }
  });
})();
