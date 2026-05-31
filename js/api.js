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