// Funções de apoio usadas por todas as telas: mensagens (toasts), confirmação, máscaras,
// validações, formatação e montagem das tabelas com o DataTables.
const Util = (() => {
  'use strict';

  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

  // Escapa texto antes de colocar em innerHTML (evita injetar HTML digitado pelo usuário).
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const parametro = (nome) => new URLSearchParams(location.search).get(nome);

  // ---------- Formatação ----------
  const moeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const numero = (v) => Number(v || 0).toLocaleString('pt-BR');
  const dataBR = (iso) => (iso ? iso.split('-').reverse().join('/') : '-');
  const soDigitos = (s) => String(s || '').replace(/\D/g, '');

  // ---------- Máscaras dos campos ----------
  const mascaras = {
    cpf: (v) => soDigitos(v).slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
    telefone: (v) => {
      const d = soDigitos(v).slice(0, 11);
      if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
      return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
    },
    cep: (v) => soDigitos(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'),
    placa: (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7),
  };
  function aplicarMascara(input, tipo) {
    input.addEventListener('input', () => { input.value = mascaras[tipo](input.value); });
  }

  // ---------- Validações ----------
  function cpfValido(cpf) {
    const d = soDigitos(cpf);
    if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
    const calc = (n) => { let s = 0; for (let i = 0; i < n; i++) s += Number(d[i]) * (n + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
    return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
  }
  // Placa antiga (ABC1234) ou Mercosul (ABC1D23).
  const placaValida = (p) => /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(p);
  const placaFormatada = (p) => (p && p.length === 7 && /^[A-Z]{3}\d{4}$/.test(p) ? p.slice(0, 3) + '-' + p.slice(3) : p);

  // Marca um campo como inválido com a mensagem embaixo (padrão do Bootstrap).
  function erroCampo(input, mensagem) {
    input.setCustomValidity(mensagem || '');
    const fb = input.closest('.campo-form')?.querySelector('.invalid-feedback');
    if (fb && mensagem) fb.textContent = mensagem;
  }

  // ---------- Mensagens (toasts do Bootstrap) ----------
  const ICONES = { success: 'bi-check-circle-fill', danger: 'bi-x-octagon-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
  function toast(mensagem, tipo = 'success', titulo) {
    let area = $('#area-toasts');
    if (!area) {
      area = document.createElement('div');
      area.id = 'area-toasts';
      area.className = 'toast-container position-fixed top-0 end-0 p-3';
      document.body.appendChild(area);
    }
    const titulos = { success: 'Sucesso', danger: 'Erro', warning: 'Atenção', info: 'Informação' };
    const el = document.createElement('div');
    el.className = 'toast border-0 shadow toast-' + tipo;
    el.setAttribute('role', tipo === 'danger' ? 'alert' : 'status');
    el.setAttribute('aria-live', tipo === 'danger' ? 'assertive' : 'polite');
    el.innerHTML =
      '<div class="toast-header text-bg-' + tipo + ' border-0">' +
        '<i class="bi ' + ICONES[tipo] + ' me-2"></i><strong class="me-auto">' + esc(titulo || titulos[tipo]) + '</strong>' +
        '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Fechar"></button>' +
      '</div><div class="toast-body">' + esc(mensagem) + '</div>';
    area.appendChild(el);
    const t = bootstrap.Toast.getOrCreateInstance(el, { delay: 4000 });
    el.addEventListener('hidden.bs.toast', () => el.remove());
    t.show();
  }

  // Mensagem que aparece na próxima tela (ex.: "Cliente salvo" depois de voltar para a lista).
  function flash(mensagem, tipo = 'success') { sessionStorage.setItem('comprebem:flash', JSON.stringify({ mensagem, tipo })); }
  function mostrarFlash() {
    const txt = sessionStorage.getItem('comprebem:flash');
    if (!txt) return;
    sessionStorage.removeItem('comprebem:flash');
    try { const f = JSON.parse(txt); toast(f.mensagem, f.tipo); } catch (e) { /* ignora */ }
  }

  // ---------- Janela de confirmação (modal do Bootstrap) ----------
  function confirmar({ titulo = 'Confirmar', texto = 'Tem certeza?', botao = 'Confirmar', tipo = 'danger' } = {}) {
    return new Promise((resolver) => {
      const el = document.createElement('div');
      el.className = 'modal fade';
      el.tabIndex = -1;
      el.innerHTML =
        '<div class="modal-dialog modal-dialog-centered"><div class="modal-content">' +
          '<div class="modal-header"><h2 class="modal-title fs-5"><i class="bi bi-exclamation-triangle-fill text-' + tipo + ' me-2"></i>' + esc(titulo) + '</h2>' +
          '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button></div>' +
          '<div class="modal-body">' + esc(texto) + '</div>' +
          '<div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>' +
          '<button type="button" class="btn btn-' + tipo + '" data-ok>' + esc(botao) + '</button></div>' +
        '</div></div>';
      document.body.appendChild(el);
      const modal = new bootstrap.Modal(el);
      let ok = false;
      el.querySelector('[data-ok]').addEventListener('click', () => { ok = true; modal.hide(); });
      el.addEventListener('hidden.bs.modal', () => { el.remove(); resolver(ok); });
      modal.show();
    });
  }

  // ---------- Selo do status do veículo ----------
  const CORES_STATUS = { 'Disponível': 'success', 'Reservado': 'warning', 'Vendido': 'secondary' };
  const seloStatus = (s) => '<span class="badge rounded-pill text-bg-' + (CORES_STATUS[s] || 'light') + '">' + esc(s) + '</span>';

  // ---------- Tabelas com DataTables (RF06) ----------
  // Sempre preenche o <tbody> com HTML e só então liga o DataTables (busca, ordenação e paginação).
  // Se o DataTables não carregar (sem internet), a tabela continua aparecendo como tabela comum.
  const IDIOMA_DT = {
    search: 'Buscar:', searchPlaceholder: 'Digite para filtrar...',
    lengthMenu: 'Mostrar _MENU_ por página',
    info: 'Mostrando _START_ a _END_ de _TOTAL_ registros', infoEmpty: 'Nenhum registro', infoFiltered: '(filtrado de _MAX_)',
    zeroRecords: 'Nenhum registro encontrado', emptyTable: 'Nenhum registro cadastrado',
    paginate: { first: 'Primeira', previous: 'Anterior', next: 'Próxima', last: 'Última' },
    aria: { orderable: 'Ordenar por esta coluna', orderableReverse: 'Inverter a ordem' },
  };
  const tabelas = new Map();
  function montarTabela(seletor, linhasHtml, opcoes = {}) {
    const tabela = $(seletor);
    if (tabelas.has(seletor)) { tabelas.get(seletor).destroy(); tabelas.delete(seletor); }
    tabela.querySelector('tbody').innerHTML = linhasHtml.join('');
    if (typeof window.DataTable === 'function' && linhasHtml.length) {
      const dt = new DataTable(tabela, {
        language: IDIOMA_DT, pageLength: 10, lengthMenu: [5, 10, 25, 50], autoWidth: false,
        columnDefs: [{ targets: 'sem-ordem', orderable: false, searchable: false }],
        ...opcoes,
      });
      tabelas.set(seletor, dt);
    } else if (!linhasHtml.length) {
      const cols = tabela.querySelectorAll('thead th').length;
      tabela.querySelector('tbody').innerHTML = '<tr><td colspan="' + cols + '" class="text-center text-body-secondary py-4">Nenhum registro cadastrado.</td></tr>';
    }
  }

  // ---------- WhatsApp ----------
  // Monta o link do WhatsApp com a mensagem pronta para avisar o cliente que o carro chegou.
  function linkWhatsApp(cliente, v) {
    let fone = soDigitos(cliente.telefone);
    if (fone.length <= 11) fone = '55' + fone;
    const nome = cliente.nome.split(' ')[0];
    const texto = 'Olá, ' + nome + '! Aqui é da CompreBem Veículos. Chegou um ' + v.marca + ' ' + v.modelo + ' ' + v.ano +
      ', ' + numero(v.km) + ' km, por ' + moeda(v.preco) + ', do jeito que você procurava. Quer agendar uma visita para conhecer?';
    return 'https://wa.me/' + fone + '?text=' + encodeURIComponent(texto);
  }

  // Resumo do que o cliente procura: "Chevrolet Onix · 2019 ou mais novo · até R$ 65.000"
  function resumoInteresse(i) {
    if (!i) return '';
    return [[i.marca, i.modelo].filter(Boolean).join(' ') || 'Qualquer veículo',
      i.anoMin ? i.anoMin + ' ou mais novo' : '', i.precoMax ? 'até ' + moeda(i.precoMax).replace(/,00$/, '') : ''].filter(Boolean).join(' · ');
  }

  return {
    linkWhatsApp, resumoInteresse,
    $, $$, esc, parametro, moeda, numero, dataBR, soDigitos,
    mascaras, aplicarMascara, cpfValido, placaValida, placaFormatada, erroCampo,
    toast, flash, mostrarFlash, confirmar, seloStatus, montarTabela,
  };
})();
