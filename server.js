const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Libera o CORS para o seu Front-End não ser bloqueado
app.use(cors());
app.use(express.json());

// Conexão com o banco de dados no Codespace
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'store_da_nail',
  password: 'admin',
  port: 5432,
});

// Rota 1: Buscar todas as marcas cadastradas
app.get('/brands', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT vch_marca FROM tb_produto WHERE vch_marca IS NOT NULL');
    const marcas = result.rows.map(row => row.vch_marca);
    res.json(marcas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// rota 2: Buscar todos os produtos 
app.get('/products', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.cod_produto, 
        p.vch_nome, 
        p.vch_marca, 
        p.num_preco, 
        p.vch_categoria,
        COALESCE(SUM(l.int_quantidade), 0)::integer AS int_quantidade
      FROM tb_produto p
      LEFT JOIN tb_lote l ON p.cod_produto = l.cod_produto
      GROUP BY p.cod_produto, p.vch_nome, p.vch_marca, p.num_preco, p.vch_categoria
      ORDER BY p.cod_produto;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota 3: Criar um produto novo
app.post('/products', async (req, res) => {
  try {
    const { vch_nome, vch_marca, num_preco, vch_categoria } = req.body;
    const query = `
      INSERT INTO tb_produto (vch_nome, vch_marca, num_preco, vch_categoria) 
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const values = [vch_nome, vch_marca, num_preco, vch_categoria];
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); 

// Rota 4: Deletar um produto
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Deleta todos os lotes amarrados a esse produto primeiro
    await pool.query('DELETE FROM tb_lote WHERE cod_produto = $1', [id]);
    
    //deleta o produto com segurança
    await pool.query('DELETE FROM tb_produto WHERE cod_produto = $1', [id]);
    
    res.status(200).json({ message: 'Produto e seus lotes deletados com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota 5: Atualizar um produto
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { vch_nome, vch_marca, num_preco, vch_categoria } = req.body;
    const query = `
      UPDATE tb_produto 
      SET vch_nome = $1, vch_marca = $2, num_preco = $3, vch_categoria = $4 
      WHERE cod_produto = $5 RETURNING *
    `;
    const values = [vch_nome, vch_marca, num_preco, vch_categoria, id];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor Back-End rodando na porta 3000!');
});