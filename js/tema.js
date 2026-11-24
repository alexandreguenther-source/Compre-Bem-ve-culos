// Tema claro/escuro persistente (RF09).
// Carregado no <head>, antes do CSS, para a página já abrir no tema certo (sem "piscar" branco).
// A escolha fica salva no localStorage e vale para todas as telas, inclusive depois de fechar o navegador.
(function () {
  'use strict';
  var CHAVE = 'comprebem:tema';

  function temaSalvo() {
    try { return localStorage.getItem(CHAVE); } catch (e) { return null; }
  }

  function temaInicial() {
    var salvo = temaSalvo();
    if (salvo === 'dark' || salvo === 'light') return salvo;
    // Sem escolha salva: segue a preferência do sistema operacional.
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function aplicar(tema) {
    document.documentElement.setAttribute('data-bs-theme', tema);
    // Atualiza ícone e texto dos botões de alternar e o switch da tela de configurações.
    document.querySelectorAll('[data-alternar-tema]').forEach(function (b) {
      var icone = b.querySelector('i');
      if (icone) icone.className = tema === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
      b.setAttribute('title', tema === 'dark' ? 'Mudar para o modo claro' : 'Mudar para o modo escuro');
      b.setAttribute('aria-label', b.getAttribute('title'));
    });
    var sw = document.getElementById('switch-tema');
    if (sw) sw.checked = tema === 'dark';
  }

  function definir(tema) {
    try { localStorage.setItem(CHAVE, tema); } catch (e) { /* navegador sem localStorage: vale só nesta página */ }
    aplicar(tema);
  }

  function atual() { return document.documentElement.getAttribute('data-bs-theme') || 'light'; }

  function alternar() { definir(atual() === 'dark' ? 'light' : 'dark'); }

  aplicar(temaInicial());

  document.addEventListener('DOMContentLoaded', function () {
    aplicar(atual());
    document.addEventListener('click', function (ev) {
      var botao = ev.target.closest('[data-alternar-tema]');
      if (botao) alternar();
    });
  });

  window.Tema = { definir: definir, alternar: alternar, atual: atual, aplicar: aplicar };
})();
