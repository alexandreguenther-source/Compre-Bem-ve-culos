// Padrão de interface de todas as telas internas: cabeçalho, menu lateral, área de conteúdo e rodapé.
// Cada página tem só o <main id="conteudo">; este arquivo monta o resto em volta.
// Também protege as telas: sem login, volta para a tela de entrada (index.html).
const Sessao = (() => {
  const CHAVE = 'comprebem:sessao';
  const ler = () => {
    try { return JSON.parse(sessionStorage.getItem(CHAVE) || localStorage.getItem(CHAVE) || 'null'); } catch (e) { return null; }
  };
  function entrar(usuario, lembrar) {
    const txt = JSON.stringify({ nome: usuario.nome, email: usuario.email, desde: new Date().toISOString() });
    sessionStorage.setItem(CHAVE, txt);
    if (lembrar) localStorage.setItem(CHAVE, txt); else localStorage.removeItem(CHAVE);
  }
  function sair() { sessionStorage.removeItem(CHAVE); localStorage.removeItem(CHAVE); }
  return { ler, entrar, sair };
})();

(() => {
  'use strict';
  const pagina = document.body.dataset.pagina;
  if (pagina === 'login') return;

  const usuario = Sessao.ler();
  if (!usuario) { location.replace('index.html'); return; }

  const MENU = [
    { id: 'painel', href: 'painel.html', icone: 'bi-speedometer2', texto: 'Painel' },
    { id: 'clientes', href: 'clientes.html', icone: 'bi-people-fill', texto: 'Clientes' },
    { id: 'veiculos', href: 'veiculos.html', icone: 'bi-car-front-fill', texto: 'Veículos' },
    { id: 'oportunidades', href: 'oportunidades.html', icone: 'bi-bell-fill', texto: 'Oportunidades', contador: true },
    { id: 'configuracoes', href: 'configuracoes.html', icone: 'bi-gear-fill', texto: 'Configurações' },
  ];
  const ativo = document.body.dataset.menu || pagina;
  const esc = Util.esc;

  const links = MENU.map((m) =>
    '<li class="nav-item"><a class="nav-link' + (m.id === ativo ? ' active" aria-current="page' : '') + '" href="' + m.href + '">' +
    '<i class="bi ' + m.icone + '"></i><span>' + m.texto + '</span>' +
    (m.contador ? '<span class="badge rounded-pill text-bg-warning ms-auto" id="contador-oportunidades" title="Clientes para avisar" hidden></span>' : '') +
    '</a></li>').join('');

  const cabecalho = document.createElement('header');
  cabecalho.className = 'navbar navbar-expand topo sticky-top';
  cabecalho.innerHTML =
    '<div class="container-fluid gap-2">' +
      '<button class="btn btn-link text-white d-lg-none p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#menu-lateral" aria-controls="menu-lateral" aria-label="Abrir menu">' +
        '<i class="bi bi-list fs-2"></i></button>' +
      '<a class="navbar-brand marca" href="painel.html"><img src="img/logo.svg" alt="" width="38" height="38"><span>CompreBem <b>Veículos</b></span></a>' +
      '<div class="ms-auto d-flex align-items-center gap-1">' +
        '<button type="button" class="btn btn-link text-white" data-alternar-tema><i class="bi bi-moon-stars-fill fs-5"></i></button>' +
        '<div class="dropdown">' +
          '<button class="btn btn-link text-white text-decoration-none dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">' +
            '<span class="avatar">' + esc(usuario.nome.charAt(0)) + '</span><span class="d-none d-sm-inline">' + esc(usuario.nome) + '</span></button>' +
          '<ul class="dropdown-menu dropdown-menu-end shadow">' +
            '<li><h6 class="dropdown-header">' + esc(usuario.email) + '</h6></li>' +
            '<li><a class="dropdown-item" href="configuracoes.html"><i class="bi bi-gear me-2"></i>Configurações</a></li>' +
            '<li><hr class="dropdown-divider"></li>' +
            '<li><button class="dropdown-item text-danger" type="button" id="btn-sair"><i class="bi bi-box-arrow-right me-2"></i>Sair</button></li>' +
          '</ul></div>' +
      '</div></div>';

  // offcanvas-lg: no celular o menu abre por cima; no computador fica fixo do lado esquerdo.
  const lateral = document.createElement('aside');
  lateral.id = 'menu-lateral';
  lateral.className = 'offcanvas-lg offcanvas-start menu-lateral';
  lateral.tabIndex = -1;
  lateral.setAttribute('aria-label', 'Menu principal');
  lateral.innerHTML =
    '<div class="offcanvas-header"><span class="fw-bold">Menu</span>' +
      '<button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#menu-lateral" aria-label="Fechar"></button></div>' +
    '<nav class="offcanvas-body"><ul class="nav nav-pills flex-column w-100 gap-1">' + links + '</ul></nav>';

  const rodape = document.createElement('footer');
  rodape.className = 'rodape';
  rodape.innerHTML = '<span>© ' + new Date().getFullYear() + ' CompreBem Veículos · Gestão de clientes e estoque</span>' +
    '<span class="d-none d-md-inline">Blumenau – SC</span>';

  const main = document.getElementById('conteudo');
  main.classList.add('conteudo');
  const corpo = document.createElement('div');
  corpo.className = 'app-corpo';
  main.replaceWith(corpo);
  const coluna = document.createElement('div');
  coluna.className = 'app-coluna';
  coluna.append(main, rodape);
  corpo.append(lateral, coluna);
  document.body.prepend(cabecalho);

  document.getElementById('btn-sair').addEventListener('click', async () => {
    const ok = await Util.confirmar({ titulo: 'Sair do sistema', texto: 'Deseja encerrar a sessão?', botao: 'Sair', tipo: 'primary' });
    if (!ok) return;
    Sessao.sair();
    sessionStorage.setItem('comprebem:flash', JSON.stringify({ mensagem: 'Você saiu do sistema.', tipo: 'info' }));
    location.href = 'index.html';
  });

  // Quantos clientes estão esperando aviso (aparece no menu, em todas as telas).
  function atualizarContador() {
    const el = document.getElementById('contador-oportunidades');
    if (!el || typeof Dados === 'undefined') return;
    const n = Dados.oportunidades().aAvisar.length;
    el.textContent = n;
    el.hidden = !n;
  }
  window.Layout = { atualizarContador };
  atualizarContador();

  if (window.Tema) Tema.aplicar(Tema.atual());
  Util.mostrarFlash();
})();
