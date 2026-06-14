  const PKEY = 'sdn_products';
  let produtos = [], marcas = [], marcaAtiva = '', busca = '', sortKey = '', sortAsc = true, delId = null, nextId = 200;

  window.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) { window.location.href = '../index.html'; return; }
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    document.getElementById('userName').textContent = u.name || u.email || '';
    carregarMarcas();
    carregarProdutos();
  });

  function sair() { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '../index.html'; }

  async function carregarMarcas() {
    try { marcas = await API.getBrands(); }
    catch { marcas = ['Eudora','Natura','Boticario','Avon','MAC','Quem Disse Berenice']; }
    renderChips(marcas);
  }

  function renderChips(lista) {
    const el = document.getElementById('chips');
    el.innerHTML = `<button class="chip ${marcaAtiva===''?'active':''}" onclick="selecionarMarca('')">Todas</button>`;
    lista.forEach(m => {
      el.innerHTML += `<button class="chip ${marcaAtiva===m?'active':''}" onclick="selecionarMarca('${m}')">${m}</button>`;
    });
  }

  function filterChips(q) {
    renderChips(marcas.filter(m => m.toLowerCase().includes(q.toLowerCase())));
  }

  function selecionarMarca(m) { marcaAtiva = m; renderChips(marcas); aplicar(); }

  async function carregarProdutos() {
    try { produtos = await API.getProducts(); }
    catch {
      const s = localStorage.getItem(PKEY);
      if (s) { produtos = JSON.parse(s); nextId = Math.max(...produtos.map(p => p.id), 199) + 1; }
      else   { produtos = mockInicial(); salvarLocal(); }
    }
    aplicar();
  }

  function salvarLocal() { localStorage.setItem(PKEY, JSON.stringify(produtos)); }

  function aplicar() {
    let lista = [...produtos];
    if (marcaAtiva) lista = lista.filter(p => p.marca === marcaAtiva);
    if (busca)      lista = lista.filter(p =>
      p.nome.toLowerCase().includes(busca) ||
      (p.marca||'').toLowerCase().includes(busca) ||
      (p.categoria||'').toLowerCase().includes(busca)
    );
    if (sortKey) lista.sort((a,b) => {
      const av = a[sortKey]??'', bv = b[sortKey]??'';
      return sortAsc ? (av>bv?1:av<bv?-1:0) : (av<bv?1:av>bv?-1:0);
    });
    document.getElementById('countLabel').textContent = `${lista.length} produto(s)`;
    renderTabela(lista);
  }

  function onSearch(v) { busca = v.toLowerCase(); aplicar(); }

  function sortBy(k) { sortKey===k ? sortAsc=!sortAsc : (sortKey=k, sortAsc=true); aplicar(); }

  function renderTabela(lista) {
    const tb = document.getElementById('tbody');
    if (!lista.length) { tb.innerHTML = `<tr><td colspan="7"><div class="empty">Nenhum produto encontrado.</div></td></tr>`; return; }
    tb.innerHTML = lista.map(p => {
      const pct   = Math.min(100, p.estoque||0);
      const nivel = pct>=50?'high':pct>=20?'medium':'low';
      return `
        <tr>
          <td><strong>${p.vch_nome}</strong></td>
          <td><span class="brand-ztag">${p.vch_marca||'—'}</span></td>
          <td>${p.vch_categoria||'—'}</td>
          <td>R$ 0,00</td> <td>R$ ${fmt(p.num_preco)}</td>
          <td>
            <div class="stock-wrap">
              <div class="stock-bar"><div class="stock-fill ${nivel}" style="width:${pct}%"></div></div>
              <span>${p.estoque||0}</span>
            </div>
          </td>
          <td>
            <div class="actions">
              <button class="btn-edit" onclick="abrirEditar(${p.cod_produto})">Editar</button>
              <button class="btn-del" onclick="abrirDel(${p.cod_produto || p.id}, '${(p.vch_nome || p.nome || '').replace(/'/g,"\\'")}')">Excluir</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  // CRUD
  function abrirCriar() {
    limparForm();
    document.getElementById('formTitle').textContent = 'Novo Produto';
    document.getElementById('fId').value = '';
    abrir('formOverlay');
  }

 function abrirEditar(id) {
    const p = produtos.find(x => x.cod_produto == id); 
    if(!p) return;
    
    document.getElementById('formTitle').textContent = 'Editar Produto';
    document.getElementById('fId').value        = p.cod_produto;
    document.getElementById('fNome').value      = p.vch_nome || '';
    document.getElementById('fMarca').value     = p.vch_marca || '';
    document.getElementById('fCategoria').value = p.vch_categoria || '';
    document.getElementById('fVenda').value     = p.num_preco || '';
    document.getElementById('fEstoque').value   = p.int_quantidade || '';
    abrir('formOverlay');
  }

  async function salvar() {
  const id = document.getElementById('fId').value;
  
  const p = {
    vch_nome: document.getElementById('fNome').value.trim(),
    vch_marca: document.getElementById('fMarca').value,
    vch_categoria: document.getElementById('fCategoria').value,
    num_preco: parseFloat(document.getElementById('fVenda').value) || 0, 
    int_quantidade: parseInt(document.getElementById('fEstoque').value) || 0,
    dat_validade: '2026-12-31' 
  };

  if (!p.vch_nome) { toast('Informe o nome do produto.'); return; }

  try {
    // Tenta salvar na API oficial
    if (id) await API.updateProduct(id, p); 
    else await API.createProduct(p);
    
    await carregarProdutos();
  } catch (e) {
    console.error("Falha ao comunicar com a API:", e);
    
    if (id) { 
      // Busca pelo id antigo ou pelo cod_produto novo
      const i = produtos.findIndex(x => (x.cod_produto || x.id) == id); 
      if (i > -1) produtos[i] = { ...produtos[i], ...p }; 
    } else { 
      // Salva localmente gerando um ID novo
      produtos.push({ cod_produto: nextId++, ...p }); 
    }
    
    salvarLocal(); 
    aplicar();
  }
  
  toast(id ? 'Produto atualizado!' : 'Produto criado!');
  fechar('formOverlay');
}

  function abrirDel(id, nome) {
    delId = id;
    document.getElementById('delNome').textContent = nome;
    abrir('delOverlay');
  }

  async function confirmarDel() {
    try { await API.deleteProduct(delId); }
    catch { produtos = produtos.filter(p=>p.id!=delId); salvarLocal(); }
    toast('Produto excluído.');
    fechar('delOverlay');
    aplicar();
  }

  // ── helpers ───────────────────────────────────────────
  function abrir(id)  { document.getElementById(id).classList.add('open'); }
  function fechar(id) { document.getElementById(id).classList.remove('open'); }

  function limparForm() {
    ['fNome','fCusto','fVenda','fEstoque','fImagem'].forEach(i => document.getElementById(i).value='');
    document.getElementById('fMarca').value=''; document.getElementById('fCategoria').value='';
  }

  document.querySelectorAll('.overlay').forEach(o =>
    o.addEventListener('click', e => { if(e.target===o) o.classList.remove('open'); })
  );

  let tt;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(tt); tt = setTimeout(()=>el.classList.remove('show'), 2800);
  }

  function fmt(v) { return (v||0).toFixed(2).replace('.',','); }

 function mockInicial() {
  return [
    { cod_produto: 1, vch_nome: 'Matefix Lipstick', vch_marca: 'Eudora', vch_categoria: 'Batom / Lipstick', num_preco: 29.90, int_quantidade: 85, imagem_url: '' },
  ];
}