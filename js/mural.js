// ============================================
// QUEM SOBROU FC - MURAL DE ESTATÍSTICAS (PÚBLICO)
// VERSÃO: 1.0.0 - DADOS REAIS
// ============================================
// ✅ Estatísticas por ano/mês
// ✅ Ranking de jogadores
// ✅ Histórico de partidas
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
    
    // Modal de login (reutiliza do main.js, mas precisa estar disponível)
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const errorMessage = document.getElementById('error-message');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Período
    const currentPeriodEl = document.getElementById('currentPeriod');
    const prevPeriodBtn = document.querySelector('.prev-period');
    const nextPeriodBtn = document.querySelector('.next-period');
    const periodTabs = document.querySelectorAll('.period-tab');
    const monthSelector = document.getElementById('monthSelector');
    
    // Estatísticas
    const periodStats = document.getElementById('periodStats');
    const playerStatsGrid = document.getElementById('playerStatsGrid');
    const matchesList = document.getElementById('matchesList');
    const noMatchesMessage = document.getElementById('noMatchesMessage');
    const noPlayersMessage = document.getElementById('noPlayersMessage');

    // ========================================
    // ESTADO DA APLICAÇÃO
    // ========================================
    
    let appData = {
        players: [],
        matches: []
    };
    
    let currentView = {
        periodType: 'year',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    };

    // ========================================
    // 1. CARREGAR DADOS DO LOCALSTORAGE
    // ========================================
    
    function carregarDados() {
        try {
            const saved = localStorage.getItem('quemSobrouFC');
            if (saved) {
                appData = JSON.parse(saved);
                if (!appData.players) appData.players = [];
                if (!appData.matches) appData.matches = [];
                console.log('📊 Dados carregados:', appData.matches.length, 'partidas');
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
            } else {
                adminLoginBtn.innerHTML = '<i class="fas fa-user-shield"></i> Admin';
                adminLoginBtn.onclick = function(e) {
                    e.preventDefault();
                    window.openLoginModal();
                };
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
    // 5. SELETOR DE PERÍODO
    // ========================================
    
    function setupPeriodListeners() {
        if (prevPeriodBtn) {
            prevPeriodBtn.addEventListener('click', function() {
                if (currentView.periodType === 'year') {
                    currentView.year--;
                } else {
                    currentView.month--;
                    if (currentView.month < 1) {
                        currentView.month = 12;
                        currentView.year--;
                    }
                }
                atualizarMural();
            });
        }
        
        if (nextPeriodBtn) {
            nextPeriodBtn.addEventListener('click', function() {
                if (currentView.periodType === 'year') {
                    currentView.year++;
                } else {
                    currentView.month++;
                    if (currentView.month > 12) {
                        currentView.month = 1;
                        currentView.year++;
                    }
                }
                atualizarMural();
            });
        }
        
        if (periodTabs) {
            periodTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    periodTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    currentView.periodType = this.dataset.periodType;
                    
                    if (monthSelector) {
                        monthSelector.style.display = currentView.periodType === 'month' ? 'grid' : 'none';
                    }
                    
                    atualizarMural();
                });
            });
        }
    }
    
    function renderizarSeletorMeses() {
        if (!monthSelector) return;
        
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        monthSelector.innerHTML = meses.map((mes, i) => `
            <button class="month-btn ${currentView.month === i + 1 ? 'active' : ''}" data-month="${i + 1}">
                ${mes}
            </button>
        `).join('');
        
        monthSelector.querySelectorAll('.month-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                currentView.month = parseInt(this.dataset.month);
                monthSelector.querySelectorAll('.month-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                atualizarMural();
            });
        });
    }

    // ========================================
    // 6. ATUALIZAR TÍTULO DO PERÍODO
    // ========================================
    
    function atualizarTituloPeriodo() {
        if (!currentPeriodEl) return;
        
        if (currentView.periodType === 'year') {
            currentPeriodEl.textContent = currentView.year;
        } else {
            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            currentPeriodEl.textContent = `${meses[currentView.month - 1]}/${currentView.year}`;
        }
    }

    // ========================================
    // 7. FILTRAR PARTIDAS POR PERÍODO
    // ========================================
    
    function filtrarPartidasPorPeriodo() {
        return appData.matches.filter(match => {
            const data = new Date(match.data);
            const ano = data.getFullYear();
            const mes = data.getMonth() + 1;
            
            if (currentView.periodType === 'year') {
                return ano === currentView.year;
            } else {
                return ano === currentView.year && mes === currentView.month;
            }
        });
    }

    // ========================================
    // 8. CALCULAR ESTATÍSTICAS DO PERÍODO
    // ========================================
    
    function calcularEstatisticas(partidas) {
        const stats = {
            totalPartidas: partidas.length,
            totalGols: 0,
            totalAssists: 0,
            jogadores: {}
        };
        
        // Inicializar jogadores
        appData.players.forEach(jogador => {
            stats.jogadores[jogador.id] = {
                id: jogador.id,
                nome: jogador.nome,
                partidas: 0,
                gols: 0,
                assists: 0,
                rating: 0
            };
        });
        
        // Calcular estatísticas das partidas
        partidas.forEach(partida => {
            stats.totalGols += partida.estatisticas.reduce((sum, e) => sum + (e.gols || 0), 0);
            stats.totalAssists += partida.estatisticas.reduce((sum, e) => sum + (e.assists || 0), 0);
            
            partida.estatisticas.forEach(est => {
                if (stats.jogadores[est.jogadorId]) {
                    stats.jogadores[est.jogadorId].partidas++;
                    stats.jogadores[est.jogadorId].gols += est.gols || 0;
                    stats.jogadores[est.jogadorId].assists += est.assists || 0;
                    stats.jogadores[est.jogadorId].rating += est.rating || 0;
                }
            });
        });
        
        return stats;
    }

    // ========================================
    // 9. ATUALIZAR ESTATÍSTICAS GERAIS
    // ========================================
    
    function atualizarStatsGerais(stats) {
        if (!periodStats) return;
        
        const jogadoresAtivos = Object.values(stats.jogadores).filter(j => j.partidas > 0).length;
        
        if (stats.totalPartidas > 0) {
            periodStats.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-futbol"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.totalPartidas}</h3>
                        <p>Partidas</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${jogadoresAtivos}</h3>
                        <p>Jogadores</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-futbol"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.totalGols}</h3>
                        <p>Gols</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-handshake"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.totalAssists}</h3>
                        <p>Assistências</p>
                    </div>
                </div>
            `;
        } else {
            periodStats.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-chart-bar"></i>
                    <p>Nenhuma estatística no período</p>
                </div>
            `;
        }
    }

    // ========================================
    // 10. ATUALIZAR RANKING DE JOGADORES
    // ========================================
    
    function atualizarRankingJogadores(stats) {
        if (!playerStatsGrid) return;
        
        const jogadoresAtivos = Object.values(stats.jogadores)
            .filter(j => j.partidas > 0)
            .sort((a, b) => {
                // Ordenar por média de rating (maior primeiro)
                const mediaA = a.rating / a.partidas;
                const mediaB = b.rating / b.partidas;
                return mediaB - mediaA;
            });
        
        if (jogadoresAtivos.length > 0) {
            playerStatsGrid.style.display = 'block';
            if (noPlayersMessage) noPlayersMessage.style.display = 'none';
            
            playerStatsGrid.innerHTML = jogadoresAtivos.map((jogador, index) => {
                const media = (jogador.rating / jogador.partidas).toFixed(1);
                
                return `
                    <div class="player-stat-card">
                        <div class="player-stat-header">
                            <span class="player-rank">${index + 1}º</span>
                            <span class="player-name">${jogador.nome}</span>
                        </div>
                        <div class="player-stat-details">
                            <div class="stat-item">
                                <span class="stat-label">Jogos</span>
                                <span class="stat-value">${jogador.partidas}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Gols</span>
                                <span class="stat-value">${jogador.gols}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Assists</span>
                                <span class="stat-value">${jogador.assists}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Média</span>
                                <span class="stat-value">⭐ ${media}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            playerStatsGrid.style.display = 'none';
            if (noPlayersMessage) noPlayersMessage.style.display = 'block';
        }
    }

    // ========================================
    // 11. ATUALIZAR LISTA DE PARTIDAS
    // ========================================
    
    function atualizarListaPartidas(partidas) {
        if (!matchesList) return;
        
        if (partidas.length > 0) {
            matchesList.style.display = 'block';
            if (noMatchesMessage) noMatchesMessage.style.display = 'none';
            
            // Ordenar da mais recente para a mais antiga
            const partidasOrdenadas = [...partidas].sort((a, b) => 
                new Date(b.data) - new Date(a.data)
            );
            
            matchesList.innerHTML = partidasOrdenadas.map(partida => {
                const data = new Date(partida.data).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                
                const totalGols = partida.estatisticas.reduce((sum, e) => sum + (e.gols || 0), 0);
                const totalAssists = partida.estatisticas.reduce((sum, e) => sum + (e.assists || 0), 0);
                const mvp = partida.estatisticas.sort((a, b) => b.rating - a.rating)[0]?.jogadorNome || '-';
                
                return `
                    <div class="match-card">
                        <div class="match-header">
                            <span class="match-date">
                                <i class="far fa-calendar"></i> ${data}
                            </span>
                            <span class="match-players">
                                <i class="fas fa-users"></i> ${partida.estatisticas.length} jogadores
                            </span>
                        </div>
                        <div class="match-stats">
                            <span class="match-stat">
                                <i class="fas fa-futbol"></i> ${totalGols} gols
                            </span>
                            <span class="match-stat">
                                <i class="fas fa-handshake"></i> ${totalAssists} assistências
                            </span>
                            <span class="match-stat">
                                <i class="fas fa-star"></i> MVP: ${mvp}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            matchesList.style.display = 'none';
            if (noMatchesMessage) {
                noMatchesMessage.style.display = 'block';
                noMatchesMessage.innerHTML = `
                    <i class="fas fa-calendar-times"></i>
                    <h3>Nenhuma partida no período</h3>
                    <p>Não há partidas registradas em ${currentView.periodType === 'year' ? currentView.year : `${currentView.month}/${currentView.year}`}.</p>
                `;
            }
        }
    }

    // ========================================
    // 12. ATUALIZAR MURAL COMPLETO
    // ========================================
    
    
    function atualizarMural() {
        atualizarTituloPeriodo();
        
        const partidasFiltradas = filtrarPartidasPorPeriodo();
        const estatisticas = calcularEstatisticas(partidasFiltradas);
        
        atualizarStatsGerais(estatisticas);
        atualizarRankingJogadores(estatisticas);
        atualizarListaPartidas(partidasFiltradas);
    }

    // ========================================
    // 13. INICIALIZAÇÃO
    // ========================================
    

    function init() {
        console.log('📊 Inicializando mural de estatísticas');
        
        // Carregar dados
        carregarDados();
        
        // Configurar componentes
        setupMobileMenu();
        setupLoginModal();
        setupPeriodListeners();
        
        // Renderizar seletor de meses
        renderizarSeletorMeses();
        
        // Atualizar botão admin
        atualizarBotaoAdmin();
        
        // Atualizar mural
        atualizarMural();
        
        // Atualizar a cada 30 segundos (para ver novos dados)
        setInterval(() => {
            carregarDados();
            atualizarMural();
            atualizarBotaoAdmin();
        }, 30000);
    }
    
    // Iniciar
    init();

    window.renderizarCardsJogadores = function(jogadores) {
                const grid = document.getElementById('playerStatsGrid');
                const noPlayersMsg = document.getElementById('noPlayersMessage');
                
                if (!grid) return;
                
                if (jogadores.length === 0) {
                    grid.style.display = 'none';
                    if (noPlayersMsg) noPlayersMsg.style.display = 'block';
                    return;
                }
                
                grid.style.display = 'grid';
                if (noPlayersMsg) noPlayersMsg.style.display = 'none';
                
                grid.innerHTML = jogadores.map((jogador, index) => {
                    const media = jogador.partidas > 0 
                        ? (jogador.rating / jogador.partidas).toFixed(1) 
                        : '0.0';
                    
                    const golsPorJogo = jogador.partidas > 0 
                        ? (jogador.gols / jogador.partidas).toFixed(2) 
                        : '0.00';
                    
                    const assistsPorJogo = jogador.partidas > 0 
                        ? (jogador.assists / jogador.partidas).toFixed(2) 
                        : '0.00';
                    
                    // Verificar se é o top 1 para destacar
                    const isTop1 = index === 0;
                    
                    // Badges baseadas no ranking
                    let rankBadge = '';
                    let rankClass = '';
                    
                    if (index === 0) {
                        rankBadge = '<div class="player-badge badge-gold"><i class="fas fa-crown"></i></div>';
                        rankClass = 'featured';
                    } else if (index === 1) {
                        rankBadge = '<div class="player-badge badge-green"><i class="fas fa-medal"></i></div>';
                    } else if (index === 2) {
                        rankBadge = '<div class="player-badge badge-blue"><i class="fas fa-medal"></i></div>';
                    }
                    
                    return `
                        <div class="player-card ${rankClass}">
                            <div class="player-card-header">
                                <span class="player-rank">#${index + 1}</span>
                                <h3 class="player-name">${jogador.nome}</h3>
                                <div class="player-badges">
                                    ${rankBadge}
                                </div>
                            </div>
                            
                            <div class="player-card-body">
                                <div class="player-stats-grid">
                                    <div class="player-stat-item">
                                        <div class="player-stat-label">
                                            <i class="fas fa-futbol"></i> Gols
                                        </div>
                                        <div class="player-stat-value">
                                            ${jogador.gols}
                                            <span class="player-stat-sub">(${golsPorJogo}/j)</span>
                                        </div>
                                    </div>
                                    
                                    <div class="player-stat-item">
                                        <div class="player-stat-label">
                                            <i class="fas fa-handshake"></i> Assists
                                        </div>
                                        <div class="player-stat-value">
                                            ${jogador.assists}
                                            <span class="player-stat-sub">(${assistsPorJogo}/j)</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="player-rating">
                                    <span class="player-rating-label">
                                        <i class="fas fa-star"></i> Média de Rating
                                    </span>
                                    <span class="player-rating-value">⭐ ${media}</span>
                                </div>
                            </div>
                            
                            <div class="player-card-footer">
                                <span>
                                    <i class="fas fa-calendar-alt"></i> ${jogador.partidas} jogos
                                </span>
                                <span>
                                    <i class="fas fa-clock"></i> Participação: ${jogador.partidas > 0 ? ((jogador.gols + jogador.assists) / jogador.partidas * 100).toFixed(0) : 0}%
                                </span>
                            </div>
                        </div>
                    `;
                }).join('');
            };
            
            /**
             * Renderiza cards de estatísticas gerais
             */
            window.renderizarCardsEstatisticas = function(stats) {
                const container = document.getElementById('periodStats');
                if (!container) return;
                
                if (stats.totalPartidas === 0) {
                    container.innerHTML = `
                        <div class="empty-state" style="grid-column: 1/-1;">
                            <i class="fas fa-chart-bar"></i>
                            <h3>Nenhuma estatística</h3>
                            <p>Não há dados disponíveis para o período selecionado.</p>
                        </div>
                    `;
                    return;
                }
                
                const jogadoresAtivos = Object.values(stats.jogadores || {})
                    .filter(j => j.partidas > 0).length;
                
                container.innerHTML = `
                    <div class="stat-summary-card">
                        <div class="stat-summary-icon">
                            <i class="fas fa-futbol"></i>
                        </div>
                        <div class="stat-summary-info">
                            <h3>${stats.totalPartidas}</h3>
                            <p>Partidas</p>
                        </div>
                    </div>
                    
                    <div class="stat-summary-card">
                        <div class="stat-summary-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-summary-info">
                            <h3>${jogadoresAtivos}</h3>
                            <p>Jogadores</p>
                        </div>
                    </div>
                    
                    <div class="stat-summary-card">
                        <div class="stat-summary-icon">
                            <i class="fas fa-futbol"></i>
                        </div>
                        <div class="stat-summary-info">
                            <h3>${stats.totalGols}</h3>
                            <p>Gols</p>
                        </div>
                    </div>
                    
                    <div class="stat-summary-card">
                        <div class="stat-summary-icon">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <div class="stat-summary-info">
                            <h3>${stats.totalAssists}</h3>
                            <p>Assistências</p>
                        </div>
                    </div>
                `;
            };
            
            /**
             * Renderiza cards de partidas
             */
            window.renderizarCardsPartidas = function(partidas) {
                const container = document.getElementById('matchesList');
                const noMatchesMsg = document.getElementById('noMatchesMessage');
                
                if (!container) return;
                
                if (partidas.length === 0) {
                    container.style.display = 'none';
                    if (noMatchesMsg) noMatchesMsg.style.display = 'block';
                    return;
                }
                
                container.style.display = 'grid';
                if (noMatchesMsg) noMatchesMsg.style.display = 'none';
                
                const partidasOrdenadas = [...partidas].sort((a, b) => 
                    new Date(b.data) - new Date(a.data)
                );
                
                container.innerHTML = partidasOrdenadas.map(partida => {
                    const data = new Date(partida.data).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    
                    const totalGols = partida.estatisticas.reduce((sum, e) => sum + (e.gols || 0), 0);
                    const totalAssists = partida.estatisticas.reduce((sum, e) => sum + (e.assists || 0), 0);
                    const mvp = partida.estatisticas.sort((a, b) => b.rating - a.rating)[0];
                    
                    return `
                        <div class="match-card">
                            <div class="match-header">
                                <span class="match-date">
                                    <i class="far fa-calendar"></i> ${data}
                                </span>
                                <span class="match-players-count">
                                    <i class="fas fa-users"></i> ${partida.estatisticas.length}
                                </span>
                            </div>
                            
                            <div class="match-stats">
                                <div class="match-stat">
                                    <i class="fas fa-futbol"></i>
                                    <span>${totalGols}</span>
                                    <small>gols</small>
                                </div>
                                <div class="match-stat">
                                    <i class="fas fa-handshake"></i>
                                    <span>${totalAssists}</span>
                                    <small>assists</small>
                                </div>
                                <div class="match-stat">
                                    <i class="fas fa-users"></i>
                                    <span>${partida.estatisticas.length}</span>
                                    <small>jogadores</small>
                                </div>
                            </div>
                            
                            ${mvp ? `
                                <div class="match-mvp">
                                    <i class="fas fa-star"></i>
                                    <span>MVP: <strong>${mvp.jogadorNome}</strong> (⭐ ${mvp.rating})</span>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');
            };
});