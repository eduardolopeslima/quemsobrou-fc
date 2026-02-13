// ============================================
// QUEM SOBROU FC - PÁGINA INICIAL
// VERSÃO: 2.0.0 - LOGIN CORRIGIDO
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
    // VERIFICAR SE AUTH ESTÁ CARREGADO
    // ========================================
    
    if (typeof Auth === 'undefined') {
        console.error('❌ ERRO: Auth não carregado! Verifique a ordem dos scripts.');
        alert('Erro no sistema de autenticação. Recarregue a página.');
        return;
    }

    // ========================================
    // 1. MENU MOBILE
    // ========================================
    
    function setupMobileMenu() {
        if (!navToggle || !navMenu) return;
        
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
        
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
        
        // Função para abrir modal
        window.openLoginModal = function() {
            console.log('🔓 Abrindo modal de login');
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                if (usernameInput) usernameInput.focus();
            }, 100);
            
            // Carregar último usuário
            try {
                const lastUser = Auth.getLastUser();
                if (lastUser && usernameInput) {
                    usernameInput.value = lastUser;
                    if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
                }
            } catch (e) {
                console.log('Erro ao carregar último usuário:', e);
            }
        };
        
        // Função para fechar modal
        window.closeLoginModal = function() {
            console.log('🔒 Fechando modal de login');
            loginModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            if (loginForm) loginForm.reset();
            if (loginError) loginError.classList.remove('show');
        };
        
        // Botão admin na navbar
        if (adminLoginBtn) {
            adminLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.openLoginModal();
            });
        }
        
        // Botão admin no footer (se existir)
        if (footerAdminBtn) {
            footerAdminBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.openLoginModal();
            });
        }
        
        // Botão fechar
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', window.closeLoginModal);
        }
        
        // Clique fora do modal
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                window.closeLoginModal();
            }
        });
        
        // Tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && loginModal.classList.contains('active')) {
                window.closeLoginModal();
            }
        });
    }

    // ========================================
    // 3. FORMULÁRIO DE LOGIN (CORRIGIDO)
    // ========================================
    
    function setupLoginForm() {
        if (!loginForm) return;
        
        // REMOVER LISTENERS ANTIGOS (clonando o formulário)
        const newLoginForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newLoginForm, loginForm);
        
        // Atualizar referências
        const newUsernameInput = document.getElementById('username');
        const newPasswordInput = document.getElementById('password');
        const newRememberMe = document.getElementById('remember-me');
        const newLoginError = document.getElementById('login-error');
        const newErrorMessage = document.getElementById('error-message');
        
        newLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = newUsernameInput?.value.trim().toLowerCase() || '';
            const password = newPasswordInput?.value || '';
            const rememberMe = newRememberMe?.checked || false;
            
            console.log('🔐 Tentando login com:', username);
            
            // Validação básica
            if (!username || !password) {
                mostrarErro('Preencha todos os campos', newErrorMessage, newLoginError);
                return;
            }
            
            // Desabilitar botão durante a requisição
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            
            try {
                // Chamar Auth.login()
                const result = await Auth.login(username, password, rememberMe);
                
                console.log('📥 Resposta do login:', result);
                
                if (result && result.success) {
                    console.log('✅ Login bem sucedido! Redirecionando...');
                    
                    // Fechar modal
                    window.closeLoginModal();
                    
                    // REDIRECIONAR PARA ADMIN (CORRIGIDO)
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 100); // Pequeno delay para garantir que a sessão foi salva
                    
                } else {
                    // Login falhou
                    const mensagem = result?.message || 'Usuário ou senha incorretos';
                    console.log('❌ Login falhou:', mensagem);
                    mostrarErro(mensagem, newErrorMessage, newLoginError);
                }
            } catch (error) {
                console.error('❌ Erro no login:', error);
                mostrarErro('Erro ao processar login', newErrorMessage, newLoginError);
            } finally {
                // Reabilitar botão
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
    
    // Função auxiliar para mostrar erro
    function mostrarErro(mensagem, errorMsgEl, errorContainerEl) {
        if (errorMsgEl) errorMsgEl.textContent = mensagem;
        if (errorContainerEl) {
            errorContainerEl.classList.add('show');
            setTimeout(() => {
                errorContainerEl.classList.remove('show');
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
                // Usuário já está logado - mostrar "Painel"
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
            // Em caso de erro, manter como Admin
            adminLoginBtn.innerHTML = '<i class="fas fa-user-shield"></i> Admin';
            adminLoginBtn.onclick = function(e) {
                e.preventDefault();
                window.openLoginModal();
            };
        }
    }

    // ========================================
    // 5. CARREGAR ESTATÍSTICAS (SEU CÓDIGO EXISTENTE)
    // ========================================
    
    // Mantenha aqui suas funções de carregar estatísticas
    // ...

    // ========================================
    // 6. INICIALIZAÇÃO
    // ========================================
    
    function init() {
        console.log('🚀 Inicializando página inicial');
        
        // Configurar componentes
        setupMobileMenu();
        setupModal();
        setupLoginForm();
        
        // Atualizar botão admin baseado na sessão
        atualizarBotaoAdmin();
        
        // Carregar estatísticas (seu código existente)
        // carregarEstatisticas();
        
        // Verificar sessão a cada 30 segundos
        setInterval(atualizarBotaoAdmin, 30000);
    }
    
    // Iniciar tudo
    init();
});