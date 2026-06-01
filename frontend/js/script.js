  const TEST = { email: 'teste@storedanail.com', password: 'teste123', name: 'Usuário Teste' };

  function tab(t) {
    document.querySelectorAll('.tab').forEach((b, i) =>
      b.classList.toggle('active', (i===0 && t==='login') || (i===1 && t==='cadastro')));
    document.getElementById('p-login').classList.toggle('active', t === 'login');
    document.getElementById('p-cadastro').classList.toggle('active', t === 'cadastro');
  }

  function autofill() {
    document.getElementById('lEmail').value = TEST.email;
    document.getElementById('lSenha').value = TEST.password;
  }

  async function login() {
    const email = document.getElementById('lEmail').value.trim();
    const senha = document.getElementById('lSenha').value;
    const err   = document.getElementById('loginErr');
    err.classList.remove('show');

    if (!email || !senha) { err.textContent = 'Preencha e-mail e senha.'; err.classList.add('show'); return; }

    // verifica usuário de teste e cadastros locais
    const locais = JSON.parse(localStorage.getItem('sdn_users') || '[]');
    const todos  = [TEST, ...locais];
    const match  = todos.find(u => u.email === email && u.password === senha);
    if (match) {
      localStorage.setItem('token', 'local-token');
      localStorage.setItem('user', JSON.stringify({ name: match.name, email: match.email }));
      window.location.href = 'pages/catalogo.html';
      return;
    }

    // tenta API real
    try {
      const r = await API.login(email, senha);
      localStorage.setItem('token', r.token);
      localStorage.setItem('user', JSON.stringify(r.user));
      window.location.href = 'pages/catalogo.html';
    } catch (e) {
      err.textContent = e.message || 'E-mail ou senha incorretos.';
      err.classList.add('show');
    }
  }

  async function cadastrar() {
    const nome    = document.getElementById('cNome').value.trim();
    const email   = document.getElementById('cEmail').value.trim();
    const senha   = document.getElementById('cSenha').value;
    const confirm = document.getElementById('cConfirm').value;
    const err = document.getElementById('cadErr');
    const ok  = document.getElementById('cadOk');
    err.classList.remove('show'); ok.classList.remove('show');

    // RESTRIÇOES
    if (!nome || !email || !senha || !confirm) { err.textContent = 'Preencha todos os campos.'; err.classList.add('show'); return; }
    if (senha.length < 6) { err.textContent = 'Senha deve ter ao menos 6 caracteres.'; err.classList.add('show'); return; }
    if (senha !== confirm) { err.textContent = 'As senhas não coincidem.'; err.classList.add('show'); return; }

    try {
      await API.register({ name: nome, email, password: senha });
    } catch {
      // salva local
      const users = JSON.parse(localStorage.getItem('sdn_users') || '[]');
      if (users.find(u => u.email === email) || email === TEST.email) {
        err.textContent = 'E-mail já cadastrado.'; err.classList.add('show'); return;
      }
      users.push({ name: nome, email, password: senha });
      localStorage.setItem('sdn_users', JSON.stringify(users));
    }
    ok.textContent = 'Conta criada! Faça login.'; ok.classList.add('show');
    setTimeout(() => tab('login'), 1500);
  }

  // Usabilidade
  document.addEventListener('keydown', e => { if (e.key === 'Enter') {
    if (document.getElementById('p-login').classList.contains('active')) login();
    else cadastrar();
  }});
