// ============================================
// QUEM SOBROU FC - PÁGINA INICIAL
// VERSÃO: 1.0.0 - SIMPLES E FUNCIONAL
// ============================================
// ✅ Menu mobile
// ✅ Modal de login
// ✅ Autenticação via Auth.js
// ✅ Redirecionamento para admin.html
// ✅ Carregar estatísticas reais do localStorage
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // ELEMENTOS DOM
    // ========================================
    
    // Navegação
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Modal de login
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const footerAdminBtn = document.getElementById('footer-admin-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const errorMessage = document.getElementById('error-message');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('remember-me');

    // ========================================
    // 1. MENU MOBILE
    // ========================================
    
    function setupMobileMenu() {
        if (!navToggle || !navMenu) return;
        
        // Abrir/fechar menu
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });
        
        // Fechar ao clicar fora
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
        
        // Fechar ao clicar em um link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }

    // ========================================
    // 2. MODAL DE LOGIN
    // ========================================
    
    function setupModal() {
        if (!loginModal) return;
        
        // Abrir modal
        window.openLoginModal = function() {
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focar no campo de usuário
            setTimeout(() => {
                if (usernameInput) usernameInput.focus();
            }, 100);
            
            // Carregar último usuário
            carregarUltimoUsuario();
        };
        
        // Fechar modal
        window.closeLoginModal = function() {
            loginModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            if (loginForm) loginForm.reset();
            if (loginError) loginError.classList.remove('show');
        };
        
        // Event listeners para abrir modal
        if (adminLoginBtn) {
            adminLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.openLoginModal();
            });
        }
        
        if (footerAdminBtn) {
            footerAdminBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.openLoginModal();
            });
        }
        
        // Fechar modal
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', window.closeLoginModal);
        }
        
        // Fechar ao clicar fora
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                window.closeLoginModal();
            }
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && loginModal.classList.contains('active')) {
                window.closeLoginModal();
            }
        });
    }
    
    // Carregar último usuário
    function carregarUltimoUsuario() {
        if (!usernameInput) return;
        
        try {
            const lastUser = Auth.getLastUser();
            if (lastUser) {
                usernameInput.value = lastUser;
                if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
            }
        } catch (e) {
            console.log('Erro ao carregar último usuário:', e);
        }
    }

    // ========================================
    // 3. FORMULÁRIO DE LOGIN
    // ========================================
    
    function setupLoginForm() {
        if (!loginForm) return;
        
        // Remover listeners antigos (evitar duplicação)
        const newLoginForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newLoginForm, loginForm);
        
        newLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username')?.value.trim().toLowerCase() || '';
            const password = document.getElementById('password')?.value || '';
            const rememberMe = document.getElementById('remember-me')?.checked || false;
            
            // Validação básica
            if (!username || !password) {
                mostrarErro('Preencha todos os campos');
                return;
            }
            
            // Desabilitar botão
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            
            try {
                // Chamar Auth.login()
                const result = await Auth.login(username, password, rememberMe);
                
                if (result.success) {
                    console.log('✅ Login bem sucedido:', username);
                    window.closeLoginModal();
                    
                    // Redirecionar para o painel admin
                    window.location.href = 'admin.html';
                } else {
                    mostrarErro(result.message);
                }
            } catch (error) {
                console.error('❌ Erro no login:', error);
                mostrarErro('Erro ao processar login');
            } finally {
                // Reabilitar botão
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
    
    // Mostrar mensagem de erro no modal
    function mostrarErro(mensagem) {
        if (errorMessage) errorMessage.textContent = mensagem;
        if (loginError) {
            loginError.classList.add('show');
            setTimeout(() => {
                loginError.classList.remove('show');
            }, 5000);
        }
    }

    // ========================================
    // 4. BOTÃO ADMIN (LOGADO VS NÃO LOGADO)
    // ========================================
    
    function atualizarBotaoAdmin() {
        if (!adminLoginBtn) return;
        
        try {
            const user = Auth.checkSession();
            
            if (user) {
                // Usuário logado - mostrar "Painel"
                adminLoginBtn.innerHTML = '<i class="fas fa-tachometer-alt"></i> Painel';
                adminLoginBtn.onclick = function(e) {
                    e.preventDefault();
                    window.location.href = 'admin.html';
                };
                adminLoginBtn.classList.add('logged-in');
            } else {
                // Usuário não logado - mostrar "Admin"
                adminLoginBtn.innerHTML = '<i class="fas fa-user-shield"></i> Admin';
                adminLoginBtn.onclick = function(e) {
                    e.preventDefault();
                    window.openLoginModal();
                };
                adminLoginBtn.classList.remove('logged-in');
            }
        } catch (e) {
            console.log('Erro ao verificar sessão:', e);
        }
    }

    // ========================================
    // 5. CARREGAR ESTATÍSTICAS REAIS
    // ========================================
    
    function carregarEstatisticas() {
        try {
            // Carregar dados do localStorage
            const dados = carregarDadosLocalStorage();
            
            if (dados.players && dados.players.length > 0) {
                atualizarDestaques(dados);
            } else {
                mostrarDadosVazios();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
            mostrarDadosVazios();
        }
    }
    
    // Carregar dados do localStorage
    function carregarDadosLocalStorage() {
        try {
            const saved = localStorage.getItem('quemSobrouFC');
            return saved ? JSON.parse(saved) : { players: [], matches: [], tournaments: [] };
        } catch (e) {
            console.error('Erro ao ler localStorage:', e);
            return { players: [], matches: [], tournaments: [] };
        }
    }
    
    // Atualizar cards de destaque
    function atualizarDestaques(dados) {
        // Encontrar artilheiro (mais gols)
        let artilheiro = null;
        let maxGols = 0;
        
        
        let assistente = null;
        let maxAssists = 0;
        
        
        let mvp = null;
        let maxRating = 0;
        
        dados.players.forEach(player => {
            const gols = player.totalGoals || 0;
            const assists = player.totalAssists || 0;
            const rating = player.totalRating || 0;
            const jogos = player.matches || 1;
            
            if (gols > maxGols) {
                maxGols = gols;
                artilheiro = player;
            }
            
            if (assists > maxAssists) {
                maxAssists = assists;
                assistente = player;
            }
            
            const mediaRating = rating / jogos;
            if (mediaRating > maxRating) {
                maxRating = mediaRating;
                mvp = player;
            }
        });
        
        
        const scorerName = document.querySelector('.stat-card:nth-child(1) .player-name');
        const scorerGoals = document.querySelector('.stat-card:nth-child(1) .stat-value');
        
        if (scorerName) scorerName.textContent = artilheiro?.name || '---';
        if (scorerGoals) scorerGoals.textContent = artilheiro ? `${artilheiro.totalGoals} gols` : '0 gols';
        
        
        const assisterName = document.querySelector('.stat-card:nth-child(2) .player-name');
        const assisterAssists = document.querySelector('.stat-card:nth-child(2) .stat-value');
        
        if (assisterName) assisterName.textContent = assistente?.name || '---';
        if (assisterAssists) assisterAssists.textContent = assistente ? `${assistente.totalAssists} assistências` : '0 assistências';
        
        
        const mvpName = document.querySelector('.stat-card:nth-child(3) .player-name');
        const mvpRating = document.querySelector('.stat-card:nth-child(3) .stat-value');
        
        if (mvpName) mvpName.textContent = mvp?.name || '---';
        if (mvpRating) mvpRating.textContent = mvp ? `⭐ ${maxRating.toFixed(1)}` : '⭐ 0.0';
    }
    
    
    function mostrarDadosVazios() {
        const scorerName = document.querySelector('.stat-card:nth-child(1) .player-name');
        const scorerGoals = document.querySelector('.stat-card:nth-child(1) .stat-value');
        
        if (scorerName) scorerName.textContent = '---';
        if (scorerGoals) scorerGoals.textContent = '0 gols';
        
        const assisterName = document.querySelector('.stat-card:nth-child(2) .player-name');
        const assisterAssists = document.querySelector('.stat-card:nth-child(2) .stat-value');
        
        if (assisterName) assisterName.textContent = '---';
        if (assisterAssists) assisterAssists.textContent = '0 assistências';
        
        const mvpName = document.querySelector('.stat-card:nth-child(3) .player-name');
        const mvpRating = document.querySelector('.stat-card:nth-child(3) .stat-value');
        
        if (mvpName) mvpName.textContent = '---';
        if (mvpRating) mvpRating.textContent = '⭐ 0.0';
    }

    // ========================================
    // 6. INICIALIZAÇÃO
    // ========================================
    
    function init() {
        console.log('🚀 Inicializando página inicial');
        
        // Configurar componentes
        setupMobileMenu();
        setupModal();
        setupLoginForm();
        
        // Atualizar botão admin
        atualizarBotaoAdmin();
        
        // Carregar estatísticas
        carregarEstatisticas();
        
        // Verificar autenticação a cada 30 segundos
        setInterval(atualizarBotaoAdmin, 30000);
    }
    
    // Iniciar tudo
    init();
});