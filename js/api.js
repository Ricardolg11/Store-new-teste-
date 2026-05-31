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
 *w
 *  5. Banco PostgreSQL — tabelas mínimas sugeridas:
 *
 *     users(id, name, email, password_hash, role, created_at)
 *     products(id, nome, marca, categoria, preco_custo, preco_venda,
 *              estoque, imagem_url, created_at, updated_at)
 * ============================================================
 */

// ── Altere esta URL quando o back-end estiver pronto ──
const BASE_URL = 'http://localhost:3000/api';

function getToken() { return localStorage.getItem('token') || ''; }

async function req(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE_URL + path, opts);
  if (res.status === 401) { localStorage.clear(); window.location.href = '/index.html'; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro ' + res.status);
  return data;
}

const API = {
  login:         (email, password)  => req('POST', '/auth/login',    { email, password }),
  register:      (data)             => req('POST', '/auth/register',  data),
  getProducts:   (brand='',search='') => req('GET', `/products?brand=${brand}&search=${search}`),
  createProduct: (p)                => req('POST', '/products',       p),
  updateProduct: (id, p)            => req('PUT',  `/products/${id}`, p),
  deleteProduct: (id)               => req('DELETE',`/products/${id}`),
  getBrands:     ()                 => req('GET',  '/brands'),
};