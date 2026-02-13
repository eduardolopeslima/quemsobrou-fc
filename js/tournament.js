// ============================================
// QUEM SOBROU FC - CAMPEONATOS PÚBLICOS
// VERSÃO: 2.0.0 - APENAS ANUAL (SEM TEMPORADA)
// ============================================
// ✅ Exibição de campeonatos mata-mata
// ✅ Filtro apenas por ano
// ✅ Apenas dados reais do localStorage
// ✅ SEM dados de exemplo
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // ELEMENTOS DOM
    // ========================================
    
    // Navegação
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    
    // Modal de login (reutilizado)
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const errorMessage = document.getElementById('error-message');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Filtro de ano (removido temporada)
    const yearFilter = document.getElementById('year-filter');
    
    // Lista de campeonatos
    const tournamentsGrid = document.getElementById('tournaments-grid');
    const noTournamentsMessage = document.getElementById('noTournamentsMessage');

    // ========================================
    // ESTADO DA APLICAÇÃO
    // ========================================
    
    let appData = {
        tournaments: []
    };

    // ========================================
    // 1. CARREGAR DADOS DO LOCALSTORAGE
    // ========================================
    
    function carregarDados() {
        try {
            const saved = localStorage.getItem('quemSobrouFC');
            if (saved) {
                appData = JSON.parse(saved);
                if (!appData.tournaments) appData.tournaments = [];
                console.log('🏆 Campeonatos carregados:', appData.tournaments.length);
            }
        } catch (e) {
            console.error('❌ Erro ao carregar dados:', e);
        }
    }

    // ========================================
    // 2. MENU MOBILE
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
    // 3. BOTÃO ADMIN (LOGADO VS NÃO LOGADO)
    // ========================================
    
    function atualizarBotaoAdmin() {
        if (!adminLoginBtn) return;
        
        try {
            const user = Auth?.checkSession();
            
            if (user) {
                adminLoginBtn.innerHTML = '<i class="fas fa-tachometer-alt"></i> Painel';
                adminLoginBtn.onclick = function(e) {
                    e.preventDefault();
                    window.location.href = 'admin.html';
                };
                adminLoginBtn.classList.add('logged-in');
            } else {
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
    // 4. MODAL DE LOGIN (REUTILIZADO)
    // ========================================
    
    function setupLoginModal() {
        if (!loginModal) return;
        
        // Garantir que as funções do modal existam
        if (!window.openLoginModal) {
            window.openLoginModal = function() {
                loginModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                setTimeout(() => {
                    if (usernameInput) usernameInput.focus();
                }, 100);
                
                // Carregar último usuário
                try {
                    const lastUser = Auth?.getLastUser();
                    if (lastUser && usernameInput) {
                        usernameInput.value = lastUser;
                        if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
                    }
                } catch (e) {
                    console.log('Erro ao carregar último usuário:', e);
                }
            };
        }
        
        if (!window.closeLoginModal) {
            window.closeLoginModal = function() {
                loginModal.classList.remove('active');
                document.body.style.overflow = 'auto';
                if (loginForm) loginForm.reset();
                if (loginError) loginError.classList.remove('show');
            };
        }
        
        // Event listeners do modal
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', window.closeLoginModal);
        }
        
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                window.closeLoginModal();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && loginModal.classList.contains('active')) {
                window.closeLoginModal();
            }
        });
        
        // Configurar formulário de login
        setupLoginForm();
    }
    
    function setupLoginForm() {
        if (!loginForm) return;
        
        // Remover listeners antigos
        const newLoginForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newLoginForm, loginForm);
        
        newLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username')?.value.trim().toLowerCase() || '';
            const password = document.getElementById('password')?.value || '';
            const rememberMe = document.getElementById('remember-me')?.checked || false;
            
            if (!username || !password) {
                mostrarErroLogin('Preencha todos os campos');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            
            try {
                const result = await Auth.login(username, password, rememberMe);
                
                if (result.success) {
                    console.log('✅ Login bem sucedido:', username);
                    window.closeLoginModal();
                    window.location.href = 'admin.html';
                } else {
                    mostrarErroLogin(result.message);
                }
            } catch (error) {
                console.error('❌ Erro no login:', error);
                mostrarErroLogin('Erro ao processar login');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
    
    function mostrarErroLogin(mensagem) {
        if (errorMessage) errorMessage.textContent = mensagem;
        if (loginError) {
            loginError.classList.add('show');
            setTimeout(() => {
                loginError.classList.remove('show');
            }, 5000);
        }
    }

    // ========================================
    // 5. CONFIGURAR FILTRO DE ANO (SEM TEMPORADA)
    // ========================================
    
    function setupFilters() {
        // Preencher seletor de anos
        preencherAnos();
        
        // Event listener do filtro de ano
        if (yearFilter) {
            yearFilter.addEventListener('change', function() {
                renderizarCampeonatos();
            });
        }
    }
    
    function preencherAnos() {
        if (!yearFilter) return;
        
        const anoAtual = new Date().getFullYear();
        
        // Limpar opções existentes
        yearFilter.innerHTML = '';
        
        // Adicionar opção "Todos"
        const optionAll = document.createElement('option');
        optionAll.value = 'all';
        optionAll.textContent = 'Todos os anos';
        yearFilter.appendChild(optionAll);
        
        // Coletar anos dos campeonatos
        const anos = new Set();
        appData.tournaments.forEach(t => {
            if (t.ano) anos.add(t.ano);
        });
        
        // Se não houver campeonatos, adicionar ano atual
        if (anos.size === 0) {
            anos.add(anoAtual);
        }
        
        // Ordenar anos do mais recente para o mais antigo
        const anosArray = Array.from(anos).sort((a, b) => b - a);
        
        // Adicionar anos ao seletor
        anosArray.forEach(ano => {
            const option = document.createElement('option');
            option.value = ano;
            option.textContent = ano;
            if (ano === anoAtual) option.selected = true;
            yearFilter.appendChild(option);
        });
    }

    // ========================================
    // 6. FILTRAR CAMPEONATOS (APENAS POR ANO)
    // ========================================
    
    function filtrarCampeonatos() {
        let filtrados = [...appData.tournaments];
        
        // Filtrar apenas por ano (removido temporada)
        const ano = yearFilter?.value;
        if (ano && ano !== 'all') {
            filtrados = filtrados.filter(t => t.ano === parseInt(ano));
        }
        
        // Ordenar: ativos primeiro, depois por ano (mais recente), depois por id (mais novo)
        return filtrados.sort((a, b) => {
            // Ativos primeiro
            if (a.status === 'ativo' && b.status !== 'ativo') return -1;
            if (a.status !== 'ativo' && b.status === 'ativo') return 1;
            
            // Depois por ano (mais recente)
            if (a.ano !== b.ano) return b.ano - a.ano;
            
            // Depois por id (mais novo)
            return b.id - a.id;
        });
    }

    // ========================================
    // 7. RENDERIZAR CAMPEONATOS (SEM TEMPORADA)
    // ========================================
    
    function renderizarCampeonatos() {
        if (!tournamentsGrid) return;
        
        const campeonatosFiltrados = filtrarCampeonatos();
        
        if (campeonatosFiltrados.length > 0) {
            tournamentsGrid.style.display = 'grid';
            if (noTournamentsMessage) noTournamentsMessage.style.display = 'none';
            
            tournamentsGrid.innerHTML = campeonatosFiltrados.map(t => {
                const statusClass = t.status === 'ativo' ? 'status-active' : 'status-finished';
                const statusText = t.status === 'ativo' ? '⚔️ Em andamento' : '🏁 Finalizado';
                
                // Formatar data de criação
                let dataCriacao = '';
                if (t.criado) {
                    const data = new Date(t.criado);
                    dataCriacao = data.toLocaleDateString('pt-BR');
                }
                
                return `
                    <div class="tournament-card ${t.status}">
                        <div class="tournament-header">
                            <span class="tournament-year">
                                <i class="fas fa-calendar-alt"></i> ${t.ano}
                            </span>
                            <span class="tournament-status ${statusClass}">${statusText}</span>
                        </div>
                        
                        <div class="tournament-body">
                            <h3 class="tournament-name">
                                <i class="fas fa-trophy"></i> ${t.nome}
                            </h3>
                            
                            <div class="tournament-meta">
                                <div class="meta-item">
                                    <i class="fas fa-diagram-project"></i>
                                    <span>Mata-mata</span>
                                </div>
                                
                                ${dataCriacao ? `
                                    <div class="meta-item">
                                        <i class="fas fa-clock"></i>
                                        <span>Criado em: ${dataCriacao}</span>
                                    </div>
                                ` : ''}
                                
                                <div class="meta-item">
                                    <i class="fas fa-hashtag"></i>
                                    <span>ID: #${t.id}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tournament-footer">
                            <button class="btn btn-primary" onclick="verDetalhesCampeonato(${t.id})">
                                <i class="fas fa-diagram-project"></i> Ver Chaveamento
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            tournamentsGrid.style.display = 'none';
            if (noTournamentsMessage) {
                noTournamentsMessage.style.display = 'block';
                
                // Mensagem personalizada baseada no filtro de ano
                const ano = yearFilter?.value;
                
                let mensagem = 'Nenhum campeonato encontrado';
                
                if (ano && ano !== 'all') {
                    mensagem = `Nenhum campeonato em ${ano}`;
                }
                
                noTournamentsMessage.innerHTML = `
                    <i class="fas fa-trophy"></i>
                    <h3>${mensagem}</h3>
                    <p>Os campeonatos aparecerão aqui quando forem criados no painel administrativo.</p>
                `;
            }
        }
    }

    // ========================================
    // 8. VER DETALHES DO CAMPEONATO
    // ========================================
    
    window.verDetalhesCampeonato = function(id) {
        const campeonato = appData.tournaments.find(t => t.id === id);
        
        if (campeonato) {
            // Aqui você pode implementar um modal de detalhes
            // Por enquanto, apenas um alert com informações básicas
            const status = campeonato.status === 'ativo' ? 'Em andamento' : 'Finalizado';
            
            alert(`
🏆 ${campeonato.nome}
📅 Ano: ${campeonato.ano}
📊 Status: ${status}

⚔️ Campeonato no formato MATA-MATA.
                
Os detalhes completos do chaveamento estarão disponíveis em breve!
            `);
        }
    };

    // ========================================
    // 9. ATUALIZAR TUDO
    // ========================================
    
    function atualizarTudo() {
        carregarDados();
        preencherAnos();
        renderizarCampeonatos();
        atualizarBotaoAdmin();
    }

    // ========================================
    // 10. INICIALIZAÇÃO
    // ========================================
    
    function init() {
        console.log('🏆 Inicializando página de campeonatos (anual)');
        
        // Carregar dados
        carregarDados();
        
        // Configurar componentes
        setupMobileMenu();
        setupLoginModal();
        setupFilters();
        
        // Atualizar botão admin
        atualizarBotaoAdmin();
        
        // Renderizar campeonatos
        renderizarCampeonatos();
        
        // Atualizar a cada 30 segundos (para ver novos campeonatos)
        setInterval(() => {
            atualizarTudo();
        }, 30000);
        
        // Atualizar quando a janela ganhar foco
        window.addEventListener('focus', function() {
            atualizarTudo();
        });
    }
    
    // Iniciar
    init();
});