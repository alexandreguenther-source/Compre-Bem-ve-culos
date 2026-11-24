// "Banco de dados" do CompreBem Veículos, guardado no localStorage do navegador.
// O trabalho pede só HTML, CSS e JavaScript, então não há servidor: este arquivo simula o back-end.
// Na primeira visita, cria clientes e veículos de exemplo.
const Dados = (() => {
  'use strict';
  const CHAVE = 'comprebem:dados';
  const VERSAO = 2; // 2 = com interesse do cliente e avisos

  const pad = (n) => String(n).padStart(2, '0');
  function hoje(dias = 0) {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  // Gera um CPF válido a partir de 9 dígitos (só para os dados de exemplo).
  function cpfComDigitos(base9) {
    const n = base9.split('').map(Number);
    const dv = (arr, peso) => { const s = arr.reduce((t, x, i) => t + x * (peso - i), 0); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
    n.push(dv(n, 10));
    n.push(dv(n, 11));
    const c = n.join('');
    return c.slice(0, 3) + '.' + c.slice(3, 6) + '.' + c.slice(6, 9) + '-' + c.slice(9);
  }

  function semente() {
    const end = (logradouro, numero, bairro, cep) => ({ cep, logradouro, numero, bairro, cidade: 'Blumenau', uf: 'SC' });
    const clientes = [
      { nome: 'Mariana Krüger', cpf: cpfComDigitos('418273650'), telefone: '(47) 99812-4410', email: 'mariana.kruger@email.com', ...end('Rua XV de Novembro', '1200', 'Centro', '89010-001') },
      { nome: 'João Pedro Schmitt', cpf: cpfComDigitos('305918274'), telefone: '(47) 98877-1023', email: 'jp.schmitt@email.com', ...end('Rua Bahia', '455', 'Salto', '89031-001') },
      { nome: 'Carla Hoffmann', cpf: cpfComDigitos('527364819'), telefone: '(47) 99654-3321', email: 'carla.h@email.com', ...end('Rua Itajaí', '88', 'Vorstadt', '89015-200') },
      { nome: 'Rafael Weber', cpf: cpfComDigitos('612843975'), telefone: '(47) 99120-7788', email: 'rafael.weber@email.com', ...end('Rua Amazonas', '2301', 'Garcia', '89020-000') },
      { nome: 'Luciana Moser', cpf: cpfComDigitos('734162598'), telefone: '(47) 98433-6650', email: 'lu.moser@email.com', ...end('Rua São Paulo', '1550', 'Victor Konder', '89012-000'),
        interesse: { ativo: true, marca: 'Chevrolet', modelo: 'Onix', anoMin: 2019, precoMax: 65000, observacao: 'Prefere cor clara. Paga à vista.', desde: hoje(-21) } },
      { nome: 'Bruno Zimmermann', cpf: cpfComDigitos('256184937'), telefone: '(47) 99701-5582', email: 'bruno.z@email.com', ...end('Rua Antônio da Veiga', '140', 'Itoupava Seca', '89030-000'),
        interesse: { ativo: true, marca: 'Toyota', modelo: 'Corolla', anoMin: 2018, precoMax: 110000, observacao: 'Quer câmbio automático.', desde: hoje(-9) } },
      { nome: 'Patrícia Lenzi', cpf: cpfComDigitos('963528417'), telefone: '(47) 98822-4096', email: 'patricia.lenzi@email.com', ...end('Rua Sete de Setembro', '980', 'Centro', '89010-200'),
        interesse: { ativo: true, marca: 'Jeep', modelo: 'Compass', anoMin: 2019, precoMax: 135000, observacao: '', desde: hoje(-30) } },
    ].map((c, i) => ({ id: i + 1, criadoEm: hoje(-120 + i * 15), ...c }));
    // Mariana já comprou com a garagem e agora procura um segundo carro, para o filho.
    clientes[0].interesse = { ativo: true, marca: 'Hyundai', modelo: 'HB20', anoMin: 2020, precoMax: 75000, observacao: 'Primeiro carro do filho.', desde: hoje(-14) };

    const veiculos = [
      { placa: 'QJR4F21', marca: 'Toyota', modelo: 'Corolla XEi', ano: 2019, cor: 'Prata', km: 68400, combustivel: 'Flex', cambio: 'Automático', preco: 104900, status: 'Disponível', clienteId: null },
      { placa: 'MKT8B07', marca: 'Volkswagen', modelo: 'Gol 1.0', ano: 2015, cor: 'Branco', km: 132900, combustivel: 'Flex', cambio: 'Manual', preco: 34900, status: 'Vendido', clienteId: 2 },
      { placa: 'RXA2C55', marca: 'Chevrolet', modelo: 'Onix LT', ano: 2020, cor: 'Vermelho', km: 51200, combustivel: 'Flex', cambio: 'Manual', preco: 62500, status: 'Reservado', clienteId: 3 },
      { placa: 'QHN7D90', marca: 'Honda', modelo: 'Civic EXL', ano: 2018, cor: 'Preto', km: 88750, combustivel: 'Gasolina', cambio: 'Automático', preco: 109000, status: 'Disponível', clienteId: null },
      { placa: 'SBE1H34', marca: 'Hyundai', modelo: 'HB20 Comfort', ano: 2022, cor: 'Azul', km: 23100, combustivel: 'Flex', cambio: 'Manual', preco: 72900, status: 'Disponível', clienteId: null },
      { placa: 'RLU5J12', marca: 'Fiat', modelo: 'Strada Freedom', ano: 2021, cor: 'Branco', km: 47300, combustivel: 'Flex', cambio: 'Manual', preco: 89900, status: 'Vendido', clienteId: 4 },
      { placa: 'TCA9K48', marca: 'Renault', modelo: 'Kwid Zen', ano: 2023, cor: 'Laranja', km: 9800, combustivel: 'Flex', cambio: 'Manual', preco: 58900, status: 'Disponível', clienteId: null },
      { placa: 'PZO3E66', marca: 'Jeep', modelo: 'Compass Longitude', ano: 2020, cor: 'Cinza', km: 61000, combustivel: 'Flex', cambio: 'Automático', preco: 129900, status: 'Disponível', clienteId: null },
    ].map((v, i) => ({ id: i + 1, cadastradoEm: hoje(-90 + i * 10), ...v }));

    // Aviso já enviado: Patrícia foi avisada do Compass há 2 dias (aparece em "Já avisados").
    const avisos = [{ id: 1, clienteId: 7, veiculoId: 8, data: hoje(-2) }];
    return { versao: VERSAO, clientes, veiculos, avisos, seq: { clientes: clientes.length, veiculos: veiculos.length, avisos: avisos.length } };
  }

  function carregar() {
    try {
      const txt = localStorage.getItem(CHAVE);
      if (txt) {
        const d = JSON.parse(txt);
        if (d && Array.isArray(d.clientes) && Array.isArray(d.veiculos)) {
          // Dados da versão anterior: ganham a lista de avisos (os clientes ficam sem interesse até alguém preencher).
          if (!Array.isArray(d.avisos)) { d.avisos = []; d.seq = d.seq || {}; d.seq.avisos = 0; }
          d.versao = VERSAO;
          return d;
        }
      }
    } catch (e) { /* dado corrompido: recomeça com os exemplos */ }
    return null;
  }
  let db = carregar() || semente();
  function gravar() { try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch (e) { /* sem localStorage: vale até fechar a aba */ } }
  gravar();

  const porId = (lista, id) => lista.find((x) => x.id === Number(id)) || null;
  function salvarEm(nome, obj) {
    const lista = db[nome];
    if (obj.id) {
      const i = lista.findIndex((x) => x.id === Number(obj.id));
      if (i >= 0) { lista[i] = { ...lista[i], ...obj, id: Number(obj.id) }; gravar(); return lista[i]; }
    }
    db.seq[nome] = (db.seq[nome] || 0) + 1;
    const novo = { ...obj, id: db.seq[nome] };
    lista.push(novo);
    gravar();
    return novo;
  }

  // ---------- Clientes ----------
  const clientes = () => [...db.clientes].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const cliente = (id) => porId(db.clientes, id);
  function salvarCliente(c) { if (!c.id) c.criadoEm = hoje(); return salvarEm('clientes', c); }
  function excluirCliente(id) {
    db.clientes = db.clientes.filter((c) => c.id !== Number(id));
    db.avisos = db.avisos.filter((a) => a.clienteId !== Number(id));
    gravar();
  }
  const cpfEmUso = (cpf, ignorarId) => db.clientes.some((c) => c.cpf === cpf && c.id !== Number(ignorarId));
  const veiculosDoCliente = (id) => db.veiculos.filter((v) => v.clienteId === Number(id));

  // ---------- Veículos ----------
  const veiculos = () => [...db.veiculos].sort((a, b) => b.id - a.id);
  const veiculo = (id) => porId(db.veiculos, id);
  function salvarVeiculo(v) {
    if (!v.id) v.cadastradoEm = hoje();
    const salvo = salvarEm('veiculos', v);
    // Reservou ou comprou com a garagem: a procura desse cliente foi atendida.
    const c = salvo.clienteId ? cliente(salvo.clienteId) : null;
    if (c && c.interesse && c.interesse.ativo) {
      c.interesse = { ...c.interesse, ativo: false, atendidoEm: hoje(), atendidoVeiculoId: salvo.id };
      gravar();
    }
    return salvo;
  }
  function excluirVeiculo(id) {
    db.veiculos = db.veiculos.filter((v) => v.id !== Number(id));
    db.avisos = db.avisos.filter((a) => a.veiculoId !== Number(id));
    gravar();
  }
  const placaEmUso = (placa, ignorarId) => db.veiculos.some((v) => v.placa === placa && v.id !== Number(ignorarId));

  // ---------- Interesse do cliente x estoque (a dor: venda perdida por falta de retorno) ----------
  // Compara sem diferenciar maiúsculas e acentos: "Onix" combina com "ONIX LT", "Citroën" com "citroen".
  const normalizar = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  // O veículo atende ao que o cliente procura? (só veículos disponíveis contam)
  function combina(interesse, v) {
    if (!interesse || !interesse.ativo || !v || v.status !== 'Disponível') return false;
    if (interesse.marca && normalizar(v.marca) !== normalizar(interesse.marca)) return false;
    if (interesse.modelo) {
      const palavras = normalizar(interesse.modelo).split(/\s+/);
      const modelo = normalizar(v.modelo);
      if (!palavras.every((p) => modelo.includes(p))) return false;
    }
    if (interesse.anoMin && Number(v.ano) < Number(interesse.anoMin)) return false;
    if (interesse.precoMax && Number(v.preco) > Number(interesse.precoMax)) return false;
    return true;
  }
  const comInteresse = () => db.clientes.filter((c) => c.interesse && c.interesse.ativo);
  const interessadosNoVeiculo = (v) => comInteresse().filter((c) => combina(c.interesse, v));
  const veiculosParaCliente = (c) => db.veiculos.filter((v) => combina(c.interesse, v));

  const avisoDe = (clienteId, veiculoId) => db.avisos.find((a) => a.clienteId === Number(clienteId) && a.veiculoId === Number(veiculoId)) || null;
  function registrarAviso(clienteId, veiculoId) {
    if (avisoDe(clienteId, veiculoId)) return;
    db.seq.avisos = (db.seq.avisos || 0) + 1;
    db.avisos.push({ id: db.seq.avisos, clienteId: Number(clienteId), veiculoId: Number(veiculoId), data: hoje() });
    gravar();
  }

  // Todas as combinações cliente x carro, separadas entre "a avisar" e "já avisados".
  function oportunidades() {
    const lista = [];
    comInteresse().forEach((c) => veiculosParaCliente(c).forEach((v) => lista.push({ cliente: c, veiculo: v, aviso: avisoDe(c.id, v.id) })));
    return {
      aAvisar: lista.filter((o) => !o.aviso),
      avisados: lista.filter((o) => o.aviso).sort((a, b) => b.aviso.data.localeCompare(a.aviso.data)),
      aguardando: comInteresse().filter((c) => !veiculosParaCliente(c).length),
    };
  }

  function restaurarExemplos() { db = semente(); gravar(); }
  function apagarTudo() { db = { versao: VERSAO, clientes: [], veiculos: [], avisos: [], seq: {} }; gravar(); }

  return {
    hoje,
    clientes, cliente, salvarCliente, excluirCliente, cpfEmUso, veiculosDoCliente,
    veiculos, veiculo, salvarVeiculo, excluirVeiculo, placaEmUso,
    combina, interessadosNoVeiculo, veiculosParaCliente, avisoDe, registrarAviso, oportunidades,
    restaurarExemplos, apagarTudo,
  };
})();
