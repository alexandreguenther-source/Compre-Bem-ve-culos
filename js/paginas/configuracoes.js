// Configurações: modo escuro (RF09), chave da API Ninjas e manutenção dos dados de demonstração.
(() => {
  'use strict';
  const { $, toast, confirmar } = Util;
  if (!Sessao.ler()) return;
  const CHAVE_API = 'comprebem:apiNinjasKey';

  // ---------- Modo escuro ----------
  const sw = $('#switch-tema');
  sw.checked = Tema.atual() === 'dark';
  sw.addEventListener('change', () => {
    Tema.definir(sw.checked ? 'dark' : 'light');
    toast('Modo ' + (sw.checked ? 'escuro' : 'claro') + ' ativado e salvo.', 'success');
  });

  // ---------- Chave da API Ninjas ----------
  const chave = $('#chave');
  chave.value = localStorage.getItem(CHAVE_API) || '';
  $('#btn-ver-chave').addEventListener('click', (e) => {
    const mostrar = chave.type === 'password';
    chave.type = mostrar ? 'text' : 'password';
    e.currentTarget.querySelector('i').className = mostrar ? 'bi bi-eye-slash' : 'bi bi-eye';
  });
  $('#form-chave').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = chave.value.trim();
    if (v) localStorage.setItem(CHAVE_API, v); else localStorage.removeItem(CHAVE_API);
    toast(v ? 'Chave da API Ninjas salva.' : 'Chave removida.', v ? 'success' : 'warning');
  });
  $('#btn-testar').addEventListener('click', async (e) => {
    const v = chave.value.trim() || Apis.chaveNinjas();
    if (!v) { toast('Informe a chave antes de testar.', 'warning'); return; }
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.querySelector('.spinner-border').hidden = false;
    try {
      const ok = await Apis.testarChaveNinjas(v);
      toast(ok ? 'Conexão com a API Ninjas funcionando.' : 'A API Ninjas recusou a chave.', ok ? 'success' : 'danger');
    } catch (err) {
      toast('Não foi possível falar com a API Ninjas. Verifique a internet.', 'danger');
    } finally {
      btn.disabled = false;
      btn.querySelector('.spinner-border').hidden = true;
    }
  });

  // ---------- Dados ----------
  $('#btn-restaurar').addEventListener('click', async () => {
    const ok = await confirmar({ titulo: 'Restaurar exemplos', texto: 'Os cadastros atuais serão substituídos pelos dados de exemplo. Continuar?', botao: 'Restaurar', tipo: 'primary' });
    if (!ok) return;
    Dados.restaurarExemplos();
    toast('Dados de exemplo restaurados.', 'success');
  });
  $('#btn-apagar').addEventListener('click', async () => {
    const ok = await confirmar({ titulo: 'Apagar tudo', texto: 'Todos os clientes e veículos serão apagados. Esta ação não pode ser desfeita.', botao: 'Apagar tudo' });
    if (!ok) return;
    Dados.apagarTudo();
    toast('Todos os cadastros foram apagados.', 'danger', 'Dados apagados');
  });
})();
