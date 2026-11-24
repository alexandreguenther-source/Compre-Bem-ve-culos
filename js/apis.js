// Integrações com APIs externas.
//  - ViaCEP (aberta e grátis, sem chave): preenche o endereço do cliente pelo CEP (RF04).
//  - API Ninjas, Cars API (precisa de chave grátis): busca a ficha técnica do veículo pela marca e modelo (RF08).
const Apis = (() => {
  'use strict';
  const TEMPO_LIMITE = 8000;

  async function buscarJson(url, opcoes = {}) {
    const controle = new AbortController();
    const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE);
    try {
      const resp = await fetch(url, { ...opcoes, signal: controle.signal });
      let corpo = null;
      try { corpo = await resp.json(); } catch (e) { /* sem JSON */ }
      return { status: resp.status, corpo };
    } finally {
      clearTimeout(timer);
    }
  }

  // ---------- ViaCEP ----------
  // Devolve { logradouro, bairro, cidade, uf } ou lança erro com mensagem para o usuário.
  async function buscarCep(cep) {
    const d = String(cep).replace(/\D/g, '');
    if (d.length !== 8) throw new Error('O CEP precisa ter 8 dígitos.');
    let r;
    try { r = await buscarJson('https://viacep.com.br/ws/' + d + '/json/'); } catch (e) { throw new Error('Não foi possível consultar o CEP agora. Verifique a internet e preencha o endereço manualmente.'); }
    if (r.status !== 200 || !r.corpo) throw new Error('O serviço de CEP não respondeu. Preencha o endereço manualmente.');
    if (r.corpo.erro) throw new Error('CEP não encontrado.');
    return { logradouro: r.corpo.logradouro || '', bairro: r.corpo.bairro || '', cidade: r.corpo.localidade || '', uf: r.corpo.uf || '' };
  }

  // ---------- API Ninjas: Cars API ----------
  const chaveNinjas = () => localStorage.getItem('comprebem:apiNinjasKey') || (window.CONFIG && CONFIG.apiNinjasKey) || '';

  // Nomes de marcas em português que a API conhece em inglês.
  const MARCAS = { 'volkswagen': 'volkswagen', 'vw': 'volkswagen', 'chevrolet': 'chevrolet', 'gm': 'chevrolet', 'citroën': 'citroen', 'mercedes': 'mercedes-benz' };

  async function buscarFicha(marca, modelo) {
    const chave = chaveNinjas();
    if (!chave) throw Object.assign(new Error('Informe a sua chave da API Ninjas na tela Configurações.'), { semChave: true });
    const m = MARCAS[marca.trim().toLowerCase()] || marca.trim().toLowerCase();
    // A API procura pelo nome base do modelo (ex.: "Corolla XEi" vira "corolla").
    const mod = modelo.trim().split(/\s+/)[0].toLowerCase();
    const url = 'https://api.api-ninjas.com/v1/cars?make=' + encodeURIComponent(m) + '&model=' + encodeURIComponent(mod);
    let r;
    try { r = await buscarJson(url, { headers: { 'X-Api-Key': chave } }); } catch (e) { throw new Error('Não foi possível falar com a API Ninjas. Verifique a internet.'); }
    if (r.status === 401 || r.status === 403) throw new Error('A chave da API Ninjas foi recusada. Confira a chave na tela Configurações.');
    if (r.status !== 200 || !Array.isArray(r.corpo)) throw new Error((r.corpo && r.corpo.error) || 'A API Ninjas respondeu com erro ' + r.status + '.');
    return r.corpo;
  }

  async function testarChaveNinjas(chave) {
    const r = await buscarJson('https://api.api-ninjas.com/v1/cars?make=toyota&model=corolla', { headers: { 'X-Api-Key': chave } });
    return r.status === 200;
  }

  return { buscarCep, buscarFicha, testarChaveNinjas, chaveNinjas };
})();
