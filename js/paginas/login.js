// Tela de login (RF01) com ocultar/exibir senha (RF05).
// O login é simulado: confere com o usuário de demonstração do js/config.js.
(() => {
  'use strict';
  const { $, toast, mostrarFlash } = Util;
  const demo = CONFIG.usuarioDemo;

  if (Sessao.ler()) { location.replace('painel.html'); return; }
  mostrarFlash();
  $('#dica-login').textContent = demo.email + ' / ' + demo.senha;

  // ---------- Ocultar / exibir senha ----------
  const senha = $('#senha');
  const btnVer = $('#btn-ver-senha');
  btnVer.addEventListener('click', () => {
    const mostrar = senha.type === 'password';
    senha.type = mostrar ? 'text' : 'password';
    btnVer.querySelector('i').className = mostrar ? 'bi bi-eye-slash' : 'bi bi-eye';
    const texto = mostrar ? 'Ocultar senha' : 'Mostrar senha';
    btnVer.title = texto;
    btnVer.setAttribute('aria-label', texto);
    btnVer.setAttribute('aria-pressed', String(mostrar));
    senha.focus();
  });

  $('#link-esqueci').addEventListener('click', (e) => {
    e.preventDefault();
    toast('Um link para criar uma nova senha seria enviado para o seu e-mail.', 'info', 'Recuperar senha');
  });

  // ---------- Entrar ----------
  const form = $('#form-login');
  const erro = $('#erro-login');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    erro.hidden = true;
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    const botao = $('#btn-entrar');
    botao.disabled = true;
    botao.querySelector('.spinner-border').hidden = false;

    // Pequena espera para parecer uma consulta ao servidor.
    setTimeout(() => {
      const email = $('#email').value.trim().toLowerCase();
      if (email === demo.email && senha.value === demo.senha) {
        Sessao.entrar(demo, $('#lembrar').checked);
        Util.flash('Bem-vindo, ' + demo.nome + '!', 'success');
        location.href = 'painel.html';
        return;
      }
      botao.disabled = false;
      botao.querySelector('.spinner-border').hidden = true;
      erro.querySelector('span').textContent = 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
      erro.hidden = false;
      const caixa = $('.login-caixa');
      caixa.classList.remove('balancar');
      void caixa.offsetWidth; // reinicia a animação
      caixa.classList.add('balancar');
      senha.select();
    }, 600);
  });
})();
