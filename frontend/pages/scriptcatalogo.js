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
          <td><span class="brand-ztag">${p.marca||'—'}</span></td>
          <td>${p.categoria||'—'}</td>
          <td>R$ ${fmt(p.preco_custo)}</td>
          <td>R$ ${fmt(p.num_preco)}</td>
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
    const p = produtos.find(x => x.id===id); if(!p) return;
    document.getElementById('formTitle').textContent = 'Editar Produto';
    document.getElementById('fId').value      = p.id;
    document.getElementById('fNome').value    = p.nome;
    document.getElementById('fMarca').value   = p.marca||'';
    document.getElementById('fCategoria').value = p.categoria||'';
    document.getElementById('fCusto').value   = p.preco_custo||'';
    document.getElementById('fVenda').value   = p.preco_venda||'';
    document.getElementById('fEstoque').value = p.estoque||'';
    document.getElementById('fImagem').value  = p.imagem_url||'';
    abrir('formOverlay');
  }

  async function salvar() {
  const id = document.getElementById('fId').value; // 
  
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
    if (id) await API.updateProduct(id, p); 
    else await API.createProduct(p);
    
    await carregarProdutos();
  } catch (e) {
    console.error("Falha ao comunicar com a API:", e);
    toast('Erro ao salvar. Verifique se o back-end está rodando.');
    return;
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
      { id:1, nome:'Matefix Lipstick',      marca:'Eudora',    categoria:'Batom / Lipstick',      preco_custo:12, preco_venda:29.90, estoque:85, imagem_url:'' },
      { id:2, nome:'Chronos Firming Cream', marca:'Natura',    categoria:'Creme / Cosmetics',     preco_custo:35, preco_venda:89.90, estoque:42, imagem_url:'' },
      { id:3, nome:'Floratta Red',          marca:'Boticario', categoria:'Perfume',               preco_custo:55, preco_venda:129,   estoque:18, imagem_url:'' },
      { id:4, nome:'Esmalte Glamour',       marca:'Eudora',    categoria:'Esmalte / Nail polish', preco_custo:6,  preco_venda:15.90, estoque:7,  imagem_url:'' },
      { id:5, nome:'Batom Matte Ruby',      marca:'Avon',      categoria:'Batom / Lipstick',      preco_custo:9,  preco_venda:22.90, estoque:55, imagem_url:'' },
      { id:6, nome:'Perfume Humor',         marca:'Natura',    categoria:'Perfume',               preco_custo:48, preco_venda:110,   estoque:30, imagem_url:'' },
    ];
  }