# CompreBem Veículos

Sistema web de gestão para uma garagem de compra e venda de veículos: cadastro de **clientes** e do **estoque de carros**, com status de venda (disponível, reservado, vendido).

Feito só com **HTML, CSS e JavaScript**, usando **Bootstrap 5.3** (grid, cartões, formulários, modais e toasts). Não há servidor: os dados ficam no navegador (`localStorage`), e o sistema já abre com clientes e veículos de exemplo.

## Problema e solução (resumo)

**Problema:** em garagens pequenas, o estoque e os interessados ficam em caderno, planilha ou WhatsApp. O vendedor não sabe na hora quais carros estão disponíveis ou reservados, nem para quem, e perde tempo procurando dados do cliente e a ficha técnica do carro.

**Solução:** um painel único com o estoque e os clientes. Cada carro tem status de venda ligado ao cliente, o endereço do cliente é preenchido pelo CEP e a ficha técnica do carro vem de uma API.

## Acesso de demonstração

- E-mail: `admin@comprebem.com`
- Senha: `123456`

## Telas

| Tela | Arquivo |
|------|---------|
| Login | `index.html` |
| Painel (indicadores) | `painel.html` |
| Lista de clientes | `clientes.html` |
| Cadastro / edição de cliente | `cliente-form.html` |
| Lista de veículos | `veiculos.html` |
| Cadastro / edição de veículo | `veiculo-form.html` |
| Configurações | `configuracoes.html` |

Todas as telas internas seguem o mesmo padrão: **cabeçalho** (logo, modo escuro, usuário), **menu lateral** (vira menu de abrir no celular), **área de conteúdo** e **rodapé**. Esse padrão é montado pelo `js/layout.js`.

## Requisitos funcionais

| RF | Descrição | Onde |
|----|-----------|------|
| RF01 | Login com validação de e-mail e senha, mensagem de erro, opção "Manter conectado" e botão Sair. Telas internas exigem login. | `index.html`, `js/paginas/login.js`, `js/layout.js` |
| RF02 | Listar clientes com quantidade de veículos de cada um. | `clientes.html` |
| RF03 | Cadastrar e editar cliente, com máscara e validação de CPF e telefone e bloqueio de CPF repetido. | `cliente-form.html` |
| RF04 | **API aberta/grátis (ViaCEP):** ao digitar o CEP, o endereço do cliente é preenchido sozinho. | `js/apis.js`, `cliente-form.html` |
| RF05 | **Ocultar/exibir senha** na tela de login (botão do olho). | `index.html` |
| RF06 | **DataTables** nas listas de clientes e veículos: busca, ordenação e paginação em português. | `js/util.js` (`montarTabela`) |
| RF07 | Cadastrar, editar e listar veículos (placa antiga ou Mercosul, marca, modelo, ano, km, combustível, câmbio, preço e status). Reservado e Vendido exigem o cliente. | `veiculos.html`, `veiculo-form.html` |
| RF08 | **API Ninjas (Cars API):** botão "Buscar ficha técnica" traz categoria, motor, cilindros, combustível, câmbio e tração do modelo. | `js/apis.js`, `veiculo-form.html` |
| RF09 | **Modo escuro persistente:** botão no topo (e na tela de login) e chave em Configurações. A escolha fica salva e vale em todas as telas. | `js/tema.js` |
| RF10 | Painel com indicadores (clientes, disponíveis, reservados, valor do estoque), últimos veículos e estoque por status. | `painel.html` |
| RF11 | Exclusão com janela de confirmação e mensagens: sucesso ao excluir, erro ao tentar excluir cliente com veículo ou veículo já vendido. | `clientes.html`, `veiculos.html` |
| RF12 | Filtro rápido de veículos por status com contador. | `veiculos.html` |
| RF13 | Configurações: chave da API Ninjas com teste de conexão, restaurar dados de exemplo e apagar tudo. | `configuracoes.html` |

Mensagens: salvar mostra aviso **verde de sucesso**; excluir mostra aviso **vermelho**; erro de formulário destaca os campos em vermelho e mostra um aviso.

## Chave da API Ninjas

1. Crie uma conta grátis em <https://api-ninjas.com/register> e copie a chave (API Key).
2. No sistema, vá em **Configurações → API Ninjas**, cole a chave, clique em **Salvar chave** e depois em **Testar conexão**.

Também é possível colocar a chave fixa em `js/config.js` (`apiNinjasKey`). Atenção: em site público, a chave fica visível para quem abrir o código. Isso é aceitável para um trabalho acadêmico, mas não para um sistema real.

## Como abrir no computador

As bibliotecas (Bootstrap, Bootstrap Icons, jQuery e DataTables) vêm de CDN, então é preciso internet.

- **VS Code:** abra a pasta e use a extensão **Live Server** (botão "Go Live").
- Abrir o `index.html` com dois cliques também funciona, mas pelo Live Server é mais garantido.

## Como hospedar (link para o professor)

É um site estático: basta enviar a pasta inteira, mantendo a estrutura de pastas.

- **Azure Static Web Apps** ou **Azure Storage (site estático):** crie o recurso e envie os arquivos; o `index.html` é a página inicial.
- **AWS S3:** crie um bucket, ative "Static website hosting" com `index.html` como documento de índice, libere leitura pública e envie os arquivos.
- **GitHub Pages / Netlify / Vercel** também funcionam. Confirme com o tutor se valem como "afins".

## Estrutura

```
index.html, painel.html, clientes.html, cliente-form.html,
veiculos.html, veiculo-form.html, configuracoes.html
css/estilo.css          tema (cores da marca, modo escuro, placa Mercosul)
img/logo.svg            logo do produto
js/tema.js              modo escuro persistente
js/config.js            chave da API Ninjas e usuário de demonstração
js/dados.js             "banco de dados" no localStorage + dados de exemplo
js/util.js              mensagens, confirmação, máscaras, validações, DataTables
js/apis.js              ViaCEP e API Ninjas
js/layout.js            cabeçalho, menu lateral, rodapé e proteção por login
js/paginas/*.js         código de cada tela
```
