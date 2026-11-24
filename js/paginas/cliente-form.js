// Cadastro e edição de cliente (RF03), com endereço pelo CEP via ViaCEP (RF04).
(() => {
  'use strict';
  const { $, esc, moeda, numero, parametro, aplicarMascara, cpfValido, erroCampo, toast, flash, placaFormatada } = Util;
  if (!Sessao.ler()) return;

  const CAMPOS = ['nome', 'cpf', 'telefone', 'email', 'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'uf'];
  const form = $('#form-cliente');
  const id = parametro('id');
  let atual = null;

  aplicarMascara($('#cpf'), 'cpf');
  aplicarMascara($('#telefone'), 'telefone');
  aplicarMascara($('#cep'), 'cep');
  $('#cpf').addEventListener('input', () => erroCampo($('#cpf'), ''));
  Object.values({ a: '#int-marca', b: '#int-modelo', c: '#int-ano', d: '#int-preco' }).forEach((sel) => $(sel).addEventListener('input', () => erroCampo($('#int-modelo'), '')));

  if (id) {
    const c = Dados.cliente(id);
    if (!c) { flash('Cliente não encontrado.', 'danger'); location.replace('clientes.html'); return; }
    atual = c;
    CAMPOS.forEach((k) => { $('#' + k).value = c[k] || ''; });
    $('#titulo').textContent = 'Editar cliente';
    $('#migalha').textContent = c.nome;
    document.title = c.nome + ' · CompreBem Veículos';
  }

  // ---------- O que o cliente procura (RF14) ----------
  const INT = { marca: '#int-marca', modelo: '#int-modelo', anoMin: '#int-ano', precoMax: '#int-preco', observacao: '#int-obs' };
  $('#int-ano').max = new Date().getFullYear() + 1;

  function lerInteresse() {
    const i = { ativo: $('#procura').checked };
    Object.entries(INT).forEach(([k, sel]) => { i[k] = $(sel).value.trim(); });
    i.anoMin = i.anoMin ? Number(i.anoMin) : null;
    i.precoMax = i.precoMax ? Number(i.precoMax) : null;
    return i;
  }

  // Mostra, enquanto o vendedor digita, os carros do estoque que já atendem a procura.
  function desenharCombinacoes() {
    const area = $('#combinacoes');
    const i = lerInteresse();
    if (!i.ativo || (!i.marca && !i.modelo && !i.anoMin && !i.precoMax)) { area.innerHTML = ''; return; }
    const lista = Dados.veiculos().filter((v) => Dados.combina(i, v));
    if (!lista.length) {
      area.innerHTML = '<div class="alert alert-secondary mb-0"><i class="bi bi-hourglass-split me-2"></i>Nenhum carro do estoque atende agora. ' +
        'O cliente fica em <strong>aguardando</strong> e o sistema avisa quando entrar um.</div>';
      return;
    }
    area.innerHTML = '<div class="alert alert-success mb-0"><div class="fw-bold mb-2"><i class="bi bi-stars me-2"></i>' + lista.length +
      ' carro(s) do estoque já atende(m) esta procura:</div>' + lista.map((v) =>
        '<div class="d-flex flex-wrap align-items-center gap-2 mt-1"><span class="placa"><span>' + esc(placaFormatada(v.placa)) + '</span></span>' +
        '<span class="fw-semibold">' + esc(v.marca + ' ' + v.modelo + ' ' + v.ano) + '</span><span>· ' + numero(v.km) + ' km · ' + moeda(v.preco) + '</span></div>').join('') +
      '<div class="small mt-2">Depois de salvar, avise o cliente pela tela <strong>Oportunidades</strong>.</div></div>';
  }

  function mostrarInteresse() {
    $('#campos-interesse').hidden = !$('#procura').checked;
    desenharCombinacoes();
  }
  $('#procura').addEventListener('change', mostrarInteresse);
  Object.values(INT).forEach((sel) => $(sel).addEventListener('input', desenharCombinacoes));

  if (atual && atual.interesse) {
    const i = atual.interesse;
    Object.entries(INT).forEach(([k, sel]) => { $(sel).value = i[k] ?? ''; });
    $('#procura').checked = !!i.ativo;
    if (!i.ativo && i.atendidoEm) {
      const v = Dados.veiculo(i.atendidoVeiculoId);
      $('#ajuda-interesse').innerHTML = '<span class="badge text-bg-success me-1">Atendida</span>A procura anterior foi atendida em ' + Util.dataBR(i.atendidoEm) +
        (v ? ' com o ' + esc(v.marca + ' ' + v.modelo) + ' (' + esc(placaFormatada(v.placa)) + ')' : '') + '. Ative de novo se o cliente procurar outro carro.';
    }
  }
  mostrarInteresse();

  // ---------- ViaCEP ----------
  let ultimoCep = $('#cep').value;
  async function consultarCep() {
    const cep = $('#cep');
    erroCampo(cep, '');
    cep.classList.remove('is-invalid', 'is-valid');
    if (Util.soDigitos(cep.value).length !== 8) return;
    const btn = $('#btn-cep');
    btn.disabled = true;
    btn.querySelector('.spinner-border').hidden = false;
    btn.querySelector('i').hidden = true;
    try {
      const end = await Apis.buscarCep(cep.value);
      $('#logradouro').value = end.logradouro;
      $('#bairro').value = end.bairro;
      $('#cidade').value = end.cidade;
      $('#uf').value = end.uf;
      cep.classList.add('is-valid');
      ultimoCep = cep.value;
      $('#numero').focus();
      toast('Endereço encontrado: ' + [end.logradouro, end.cidade + '/' + end.uf].filter(Boolean).join(', ') + '.', 'info', 'CEP');
    } catch (e) {
      cep.closest('.campo-form').querySelector('.invalid-feedback').textContent = e.message;
      cep.classList.add('is-invalid');
    } finally {
      btn.disabled = false;
      btn.querySelector('.spinner-border').hidden = true;
      btn.querySelector('i').hidden = false;
    }
  }
  $('#btn-cep').addEventListener('click', consultarCep);
  $('#cep').addEventListener('input', () => {
    if (Util.soDigitos($('#cep').value).length === 8 && $('#cep').value !== ultimoCep) consultarCep();
  });

  // ---------- Salvar ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cpf = $('#cpf');
    if (!cpfValido(cpf.value)) erroCampo(cpf, 'CPF inválido. Confira os números.');
    else if (Dados.cpfEmUso(cpf.value, id)) erroCampo(cpf, 'Já existe um cliente com este CPF.');
    else erroCampo(cpf, '');
    $('#cep').classList.remove('is-invalid');
    const interesse = lerInteresse();
    // Procura ativa precisa de pelo menos um critério, senão combinaria com qualquer carro.
    const semCriterio = interesse.ativo && !interesse.marca && !interesse.modelo && !interesse.anoMin && !interesse.precoMax;
    erroCampo($('#int-modelo'), semCriterio ? 'Informe pelo menos um critério da procura.' : '');

    form.classList.add('was-validated');
    if (semCriterio) {
      toast('Informe pelo menos a marca, o modelo, o ano mínimo ou o valor máximo que o cliente procura.', 'danger', 'Não foi possível salvar');
      $('#int-modelo').focus();
      return;
    }
    if (!form.checkValidity()) {
      toast('Confira os campos destacados em vermelho.', 'danger', 'Não foi possível salvar');
      form.querySelector(':invalid')?.focus();
      return;
    }
    const dados = {};
    CAMPOS.forEach((k) => { dados[k] = $('#' + k).value.trim(); });
    dados.uf = dados.uf.toUpperCase();
    if (id) dados.id = Number(id);
    const anterior = atual && atual.interesse;
    if (interesse.ativo) dados.interesse = { ...interesse, desde: anterior && anterior.ativo ? anterior.desde : Dados.hoje() };
    else if (anterior) dados.interesse = { ...anterior, ...interesse, ativo: false };
    const salvo = Dados.salvarCliente(dados);
    const achados = salvo.interesse && salvo.interesse.ativo ? Dados.veiculosParaCliente(salvo).length : 0;
    if (achados) {
      flash('Cliente "' + salvo.nome + '" salvo. Já temos ' + achados + ' carro(s) que atende(m) a procura: avise o cliente!', 'success');
      location.href = 'oportunidades.html';
    } else {
      flash('Cliente "' + salvo.nome + '" salvo com sucesso!' + (salvo.interesse && salvo.interesse.ativo ? ' Ele será lembrado quando entrar um carro como o que procura.' : ''), 'success');
      location.href = 'clientes.html';
    }
  });
})();
