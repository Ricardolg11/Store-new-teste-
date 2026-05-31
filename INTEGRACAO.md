# 🔗 Guia de Integração — Store da Nail
## Front-End ↔ Back-End (PostgreSQL + API REST)

---

## 1. Estrutura do Projeto Front-End

```
store-da-nail/
├── index.html          ← Tela de Login
├── pages/
│   └── catalogo.html   ← Catálogo (CRUD + filtros)
└── js/
    └── api.js          ← ⚠️ Toda comunicação com o back passa aqui
```

---

## 2. Configuração — Um único passo para o colega de back-end

Abra o arquivo **`js/api.js`** e altere a linha:

```js
const BASE_URL = 'http://localhost:3000/api';  // ← substitua pela URL do seu servidor
```

> Em produção: `https://api.storedanail.com/api`  
> Em desenvolvimento: `http://localhost:3000/api` ou a porta do seu Express/Flask

---

## 3. Endpoints que o Front espera

### 🔐 Autenticação

| Método | Rota           | Body                        | Retorno                        |
|--------|----------------|-----------------------------|--------------------------------|
| POST   | `/auth/login`  | `{ email, password }`       | `{ token: "JWT...", user: {} }`|

### 📦 Produtos (requer token JWT no header)

| Método | Rota               | Body / Query                                         | Retorno            |
|--------|--------------------|------------------------------------------------------|--------------------|
| GET    | `/products`        | `?brand=Eudora&search=lipstick`                      | `[ produto, … ]`   |
| POST   | `/products`        | ver campos abaixo                                    | produto criado     |
| PUT    | `/products/:id`    | ver campos abaixo                                    | produto atualizado |
| DELETE | `/products/:id`    | —                                                    | `{ success: true }`|
| GET    | `/brands`          | —                                                    | `["Natura", …]`    |

**Campos do produto:**
```json
{
  "id":          1,
  "nome":        "Matefix Lipstick",
  "marca":       "Eudora",
  "categoria":   "Batom / Lipstick",
  "preco_custo": 12.00,
  "preco_venda": 29.90,
  "estoque":     85,
  "imagem_url":  "https://..."
}
```

---

## 4. Autenticação JWT

O front envia **automaticamente** o token em todo request:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

O back-end deve:
1. Validar o token em cada rota protegida
2. Retornar **HTTP 401** quando inválido ou expirado
3. O front detecta o 401 e redireciona para o login automaticamente

---

## 5. Tabelas PostgreSQL sugeridas

```sql
-- Usuários
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) DEFAULT 'admin',
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Produtos
CREATE TABLE products (
  id           SERIAL PRIMARY KEY,
  nome         VARCHAR(200) NOT NULL,
  marca        VARCHAR(100),
  categoria    VARCHAR(100),
  preco_custo  DECIMAL(10,2) DEFAULT 0,
  preco_venda  DECIMAL(10,2) DEFAULT 0,
  estoque      INTEGER DEFAULT 0,
  imagem_url   TEXT,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Índice para filtro por marca (RF05)
CREATE INDEX idx_products_marca ON products(marca);
```

---

## 6. CORS — Configuração obrigatória

No servidor Node/Express:
```js
const cors = require('cors');
app.use(cors({ origin: '*' })); // dev
// Em produção: origin: 'https://storedanail.com'
```

No servidor Python/Flask:
```python
from flask_cors import CORS
CORS(app)
```

---

## 7. Modo mock (enquanto o back não está pronto)

O `catalogo.html` já possui dados mock embutidos. Enquanto o back-end não estiver rodando, a tela funciona normalmente com dados falsos. Quando a API estiver pronta, **remova a função `mockProducts()`** e o `catch` que a chama, em `loadProducts()`.

---

## 8. Checklist de integração

- [ ] Back-end rodando e acessível
- [ ] `BASE_URL` atualizado em `js/api.js`
- [ ] CORS habilitado no servidor
- [ ] Endpoint `POST /auth/login` retornando `{ token, user }`
- [ ] Endpoint `GET /products` retornando array no formato correto
- [ ] Endpoint `GET /brands` retornando array de strings
- [ ] Remover `mockProducts()` do `catalogo.html`
- [ ] Testar CRUD completo na aba Network do DevTools
