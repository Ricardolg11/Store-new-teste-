 /* ── usuário de teste embutido ────────────────────────── */
  const TEST_USER = {
    email:    'teste@storedanail.com',
    password: 'teste123',
    name:     'Usuário Teste',
  };

  /* ── trocar aba ──────────────────────────────────────── */
  function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach((b,i) =>
      b.classList.toggle('active', (i===0 && tab==='login') || (i===1 && tab==='cadastro'))
    );
    document.getElementById('panel-login').classList.toggle('active',    tab==='login');
    document.getElementById('panel-cadastro').classList.toggle('active', tab==='cadastro');
  }

  /* ── toggle senha ────────────────────────────────────── */
  function toggleVis(id) {
    const el = document.getElementById(id);
    el.type = el.type === 'password' ? 'text' : 'password';
  }

  /* ── preencher automático ────────────────────────────── */
  function autofill() {
    document.getElementById('loginEmail').value    = TEST_USER.email;
    document.getElementById('loginPassword').value = TEST_USER.password;
  }

  /* ── login ───────────────────────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (document.getElementById('panel-login').classList.contains('active')) handleLogin();
      else handleCadastro();
    }
  });

  async function handleLogin() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn      = document.getElementById('btnLogin');
    const errEl    = document.getElementById('loginError');

    errEl.classList.remove('show');

    if (!email || !password) {
      errEl.textContent = 'Preencha e-mail e senha.';
      errEl.classList.add('show'); return;
    }

    btn.textContent = 'Entrando…';
    btn.classList.add('loading');

    /* ── verifica usuário de teste primeiro ── */
    const registrados = JSON.parse(localStorage.getItem('users') || '[]');
    const todos = [TEST_USER, ...registrados];
    const match = todos.find(u => u.email === email && u.password === password);

    if (match) {
      localStorage.setItem('token', 'mock-token-local');
      localStorage.setItem('user', JSON.stringify({ name: match.name, email: match.email }));
      window.location.href = 'pages/catalogo.html';
      return;
    }

    /* ── tenta API real ── */
    try {
      const result = await API.login(email, password);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      window.location.href = 'pages/catalogo.html';
    } catch (err) {
      errEl.textContent = err.message || 'E-mail ou senha incorretos.';
      errEl.classList.add('show');
      btn.textContent = 'Entrar';
      btn.classList.remove('loading');
    }
  }

  /* ── cadastro ────────────────────────────────────────── */
  async function handleCadastro() {
    const nome     = document.getElementById('cadNome').value.trim();
    const email    = document.getElementById('cadEmail').value.trim();
    const senha    = document.getElementById('cadPassword').value;
    const confirm  = document.getElementById('cadConfirm').value;
    const btn      = document.getElementById('btnCadastro');
    const errEl    = document.getElementById('cadastroError');
    const okEl     = document.getElementById('cadastroSuccess');

    errEl.classList.remove('show');
    okEl.classList.remove('show');

    if (!nome || !email || !senha || !confirm) {
      errEl.textContent = 'Preencha todos os campos.';
      errEl.classList.add('show'); return;
    }
    if (senha.length < 6) {
      errEl.textContent = 'A senha deve ter no mínimo 6 caracteres.';
      errEl.classList.add('show'); return;
    }
    if (senha !== confirm) {
      errEl.textContent = 'As senhas não coincidem.';
      errEl.classList.add('show'); return;
    }

    btn.textContent = 'Cadastrando…';
    btn.classList.add('loading');

    /* ── tenta API real; se falhar, salva local ── */
    try {
      await API.register({ name: nome, email, password: senha });
      okEl.textContent = 'Conta criada! Faça login para continuar.';
      okEl.classList.add('show');
      setTimeout(() => switchTab('login'), 1800);
    } catch {
      /* salva localmente como fallback */
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.find(u => u.email === email) || email === TEST_USER.email) {
        errEl.textContent = 'Este e-mail já está cadastrado.';
        errEl.classList.add('show');
      } else {
        users.push({ name: nome, email, password: senha });
        localStorage.setItem('users', JSON.stringify(users));
        okEl.textContent = '✅ Conta criada localmente! Agora faça login.';
        okEl.classList.add('show');
        setTimeout(() => switchTab('login'), 1800);
      }
    }

    btn.textContent = 'Criar conta';
    btn.classList.remove('loading');
  }
