/**
 * ============================================================
 *  api.js — Camada de conexão Front-End ↔ Back-End
 *  Store da Nail
 * ============================================================
 *
 *  INSTRUÇÕES PARA O COLEGA DE BACK-END
 *  ─────────────────────────────────────────────────────────
 *  1. Defina a variável BASE_URL abaixo com a URL do servidor
 *     Express/FastAPI/Django que expõe a API REST.
 *     Exemplo local:  http://localhost:3000/api
 *     Exemplo prod:   https://api.storedanail.com/api
 *
 *  2. Endpoints esperados pelo front-end:
 *
 *     POST   /auth/login          { email, password }  → { token, user }
 *     GET    /products            ?brand=&search=       → [ produto, … ]
 *     POST   /products            { nome,marca,categoria,preco_custo,preco_venda,estoque,imagem_url }
 *     PUT    /products/:id        (mesmo body do POST)
 *     DELETE /products/:id        → { success: true }
 *     GET    /brands              → [ "Natura", "Eudora", … ]
 *
 *  3. Autenticação: Bearer Token JWT
 *     O front envia o header:  Authorization: Bearer <token>
 *     O back deve validar e retornar 401 quando expirado.
 *
 *  4. CORS: habilite o domínio do front (ou * em dev) no servidor.
 *
 *  5. Banco PostgreSQL — tabelas mínimas sugeridas:
 *
 *     users(id, name, email, password_hash, role, created_at)
 *     products(id, nome, marca, categoria, preco_custo, preco_venda,
 *              estoque, imagem_url, created_at, updated_at)
 * ============================================================
 */

const BASE_URL = 'http://localhost:3000/api';   // ← altere aqui

// ── helpers ────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('token') || '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: authHeaders(),
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(BASE_URL + path, opts);

  // token expirado → redireciona para login
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/index.html';
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Erro ${res.status}`);
  }

  return data;
}

// ── API pública ─────────────────────────────────────────────
const API = {

  /** RF01 — Login */
  login(email, password) {
    return request('POST', '/auth/login', { email, password });
  },

  /** RF01 — Cadastro de novo usuário */
  register(data) {
    return request('POST', '/auth/register', data);
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
  },

  /** RF02 + RF05 — Busca produtos (com filtros opcionais) */
  getProducts({ brand = '', search = '' } = {}) {
    const params = new URLSearchParams();
    if (brand)  params.set('brand',  brand);
    if (search) params.set('search', search);
    const qs = params.toString() ? '?' + params.toString() : '';
    return request('GET', `/products${qs}`);
  },

  /** RF02 — Criar produto */
  createProduct(product) {
    return request('POST', '/products', product);
  },

  /** RF02 — Editar produto */
  updateProduct(id, product) {
    return request('PUT', `/products/${id}`, product);
  },

  /** RF02 — Excluir produto */
  deleteProduct(id) {
    return request('DELETE', `/products/${id}`);
  },

  /** RF05 — Lista de marcas */
  getBrands() {
    return request('GET', '/brands');
  },
};
