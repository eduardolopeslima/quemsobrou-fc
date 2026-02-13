

document.addEventListener('DOMContentLoaded', function() {

    // Login
    const loginPage = document.getElementById('login-page');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const errorMessage = document.getElementById('error-message');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    
    // Logout e navegação
    const logoutBtn = document.getElementById('logout-btn');
    const homeBtn = document.getElementById('home-btn');
    const navTabs = document.querySelectorAll('.nav-tab');
    const pages = document.querySelectorAll('.page');
    
    // NOVA PARTIDA

    // Step 1
    const playerNameInput = document.getElementById('playerName');
    const addPlayerBtn = document.getElementById('addPlayer');
    const playersList = document.getElementById('playersList');
    const playersCount = document.getElementById('playersCount');
    const emptyPlayersMessage = document.getElementById('emptyPlayersMessage');
    const goToStep2Btn = document.getElementById('goToStep2');
    
    // Step 2
    const backToStep1Btn = document.getElementById('backToStep1');
    const statsTableBody = document.getElementById('statsTableBody');
    const emptyStatsMessage = document.getElementById('emptyStatsMessage');
    const goToStep3Btn = document.getElementById('goToStep3');
    
    // Step 3
    const backToStep2Btn = document.getElementById('backToStep2');
    const resultsContainer = document.getElementById('resultsContainer');
    const emptyResultsMessage = document.getElementById('emptyResultsMessage');
    const saveMatchBtn = document.getElementById('saveMatch');
    const resetAllBtn = document.getElementById('resetAll');
    

    // GERENCIAR JOGADORES
    
    const newPlayerName = document.getElementById('newPlayerName');
    const addNewPlayerBtn = document.getElementById('addNewPlayer');
    const allPlayersList = document.getElementById('allPlayersList');
    const noPlayersMessage = document.getElementById('noPlayersMessage');

    // CAMPEONATO MATA-MATA
    
    const tournamentName = document.getElementById('tournamentName');
    const tournamentSeason = document.getElementById('tournamentSeason');
    const tournamentYear = document.getElementById('tournamentYear');
    const createTournamentBtn = document.getElementById('createTournamentBtn');
    const tournamentsList = document.getElementById('tournamentsList');
    const noTournamentsMessage = document.getElementById('noTournamentsMessage');
    
    // MURAL ADMIN
    
    const currentPeriodEl = document.getElementById('currentPeriod');
    const prevPeriodBtn = document.querySelector('.prev-period');
    const nextPeriodBtn = document.querySelector('.next-period');
    const periodTabs = document.querySelectorAll('.period-tab');
    const monthSelector = document.getElementById('monthSelector');
    const periodStats = document.getElementById('periodStats');
    const playerStatsGrid = document.getElementById('playerStatsGrid');
    const matchesList = document.getElementById('matchesList');
    const noMatchesMessage = document.getElementById('noMatchesMessage');

    
    // Dados
    let appData = {
        players: [],
        matches: [],
        tournaments: [],
        nextPlayerId: 1,
        nextMatchId: 1,
        nextTournamentId: 1
    };
    
    // Nova partida
    let currentStep = 1;
    let currentPlayers = [];
    let playerStats = {};
    let matchResults = [];
    
    // Mural
    let currentView = {
        periodType: 'year',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    };

    // ========================================
    // 1. VERIFICAR AUTENTICAÇÃO
    // ========================================
    
    function verificarAutenticacao() {
        const user = Auth.checkSession();
        
        if (user) {
            console.log('✅ Usuário autenticado:', user.username);
            mostrarApp();
            carregarDados();
            return true;
        } else {
            console.log('🔒 Usuário não autenticado');
            mostrarLogin();
            return false;
        }
    }
    
    function mostrarLogin() {
        if (loginPage) loginPage.style.display = 'flex';
        if (appContainer) appContainer.style.display = 'none';
    }
    
    function mostrarApp() {
        if (loginPage) loginPage.style.display = 'none';
        if (appContainer) appContainer.style.display = 'block';
        
        // Mostrar nome do usuário
        const user = Auth.getCurrentUser();
        const userInfoEl = document.querySelector('.user-info');
        if (userInfoEl && user) {
            userInfoEl.innerHTML = `<i class="fas fa-user-shield"></i> ${user.nome} (${user.role === 'super_admin' ? 'Master' : 'Admin'})`;
        }
    }

    
    function setupLoginForm() {
        if (!loginForm) return;
        
        const newLoginForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newLoginForm, loginForm);
        
        newLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username')?.value.trim().toLowerCase() || '';
            const password = document.getElementById('password')?.value || '';
            const rememberMe = document.getElementById('remember-me')?.checked || false;
            
            if (!username || !password) {
                mostrarErro('Preencha todos os campos');
                return;
            }
            
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            
            try {
                const result = await Auth.login(username, password, rememberMe);
                
                if (result.success) {
                    console.log('✅ Login admin:', username);
                    window.location.reload();
                } else {
                    mostrarErro(result.message);
                }
            } catch (error) {
                console.error('❌ Erro:', error);
                mostrarErro('Erro ao processar login');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }
    
    function mostrarErro(msg) {
        if (errorMessage) errorMessage.textContent = msg;
        if (loginError) {
            loginError.classList.add('show');
            setTimeout(() => loginError.classList.remove('show'), 5000);
        }
    }


    function setupEventListeners() {
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                Auth.logout();
            });
        }
    
        if (homeBtn) {
            homeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }
        
        navTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const page = this.dataset.page;
                navegarParaPagina(page);
            });
        });
    }
    
    function navegarParaPagina(page) {
        navTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.page === page) {
                tab.classList.add('active');
            }
        });
        
        pages.forEach(p => {
            p.classList.remove('active');
            if (p.id === `${page}-page`) {
                p.classList.add('active');
            }
        });
        
        if (page !== 'new-match') {
            currentStep = 1;
            mostrarStep(currentStep);
        }
        
        if (page === 'manage-players') {
            carregarTodosJogadores();
        }
        
        if (page === 'tournament') {
            carregarTodosCampeonatos();
            preencherAnos();
        }
        
        if (page === 'mural') {
            renderizarSeletorMeses();
            atualizarMural();
        }
    }

    // 4. DADOS (LOCALSTORAGE)
    
    function carregarDados() {
        try {
            const saved = localStorage.getItem('quemSobrouFC');
            if (saved) {
                appData = JSON.parse(saved);
                
                // Garantir propriedades
                if (!appData.players) appData.players = [];
                if (!appData.matches) appData.matches = [];
                if (!appData.tournaments) appData.tournaments = [];
                if (!appData.nextPlayerId) appData.nextPlayerId = 1;
                if (!appData.nextMatchId) appData.nextMatchId = 1;
                if (!appData.nextTournamentId) appData.nextTournamentId = 1;
            }
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
        }
    }
    
    function salvarDados() {
        try {
            localStorage.setItem('quemSobrouFC', JSON.stringify(appData));
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
            alert('Erro ao salvar dados. Verifique o espaço disponível.');
        }
    }


    
    function setupNewMatchListeners() {
        if (!addPlayerBtn) return;
        
        addPlayerBtn.addEventListener('click', adicionarJogadorPartida);
        
        if (playerNameInput) {
            playerNameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    adicionarJogadorPartida();
                }
            });
        }
        
        if (goToStep2Btn) {
            goToStep2Btn.addEventListener('click', function() {
                if (currentPlayers.length > 0) {
                    mostrarStep(2);
                    inicializarTabelaStats();
                } else {
                    alert('Adicione pelo menos um jogador.');
                }
            });
        }
        
        if (backToStep1Btn) {
            backToStep1Btn.addEventListener('click', function() {
                mostrarStep(1);
            });
        }
        
        if (goToStep3Btn) {
            goToStep3Btn.addEventListener('click', function() {
                if (validarStats()) {
                    calcularResultados();
                    mostrarStep(3);
                } else {
                    alert('Preencha as estatísticas de todos os jogadores.');
                }
            });
        }
        
        if (backToStep2Btn) {
            backToStep2Btn.addEventListener('click', function() {
                mostrarStep(2);
            });
        }
        
        if (saveMatchBtn) {
            saveMatchBtn.addEventListener('click', salvarPartida);
        }
        
        if (resetAllBtn) {
            resetAllBtn.addEventListener('click', resetarPartida);
        }
    }
    
    function adicionarJogadorPartida() {
        if (!playerNameInput) return;
        
        const nome = playerNameInput.value.trim();
        if (!nome) {
            alert('Digite o nome do jogador');
            return;
        }
        
        if (currentPlayers.some(p => p.nome.toLowerCase() === nome.toLowerCase())) {
            alert('Jogador já adicionado a esta partida');
            return;
        }
        
        const jogador = {
            id: Date.now() + Math.random(),
            nome: nome
        };
        
        currentPlayers.push(jogador);
        atualizarListaJogadoresPartida();
        
        playerNameInput.value = '';
        playerNameInput.focus();
    }
    
    window.removerJogadorPartida = function(id) {
        currentPlayers = currentPlayers.filter(p => p.id !== id);
        delete playerStats[id];
        atualizarListaJogadoresPartida();
        
        if (currentStep === 2) {
            inicializarTabelaStats();
        }
    };
    
    function atualizarListaJogadoresPartida() {
        if (!playersCount) return;
        
        playersCount.textContent = currentPlayers.length;
        
        if (currentPlayers.length > 0) {
            if (emptyPlayersMessage) emptyPlayersMessage.style.display = 'none';
            if (playersList) {
                playersList.innerHTML = currentPlayers.map(p => `
                    <div class="player-item">
                        <div class="player-info">
                            <i class="fas fa-user"></i>
                            <span class="player-name">${p.nome}</span>
                        </div>
                        <button class="remove-player" onclick="removerJogadorPartida(${p.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');
            }
        } else {
            if (emptyPlayersMessage) emptyPlayersMessage.style.display = 'block';
            if (playersList) playersList.innerHTML = '';
        }
    }
    
    function mostrarStep(step) {
        currentStep = step;
        
        document.querySelectorAll('.step-container #step1, .step-container #step2, .step-container #step3').forEach(el => {
            if (el) el.style.display = 'none';
        });
        
        const stepEl = document.getElementById(`step${step}`);
        if (stepEl) stepEl.style.display = 'block';
    }

    
    function inicializarTabelaStats() {
        if (!statsTableBody) return;
        
        if (currentPlayers.length === 0) {
            if (emptyStatsMessage) emptyStatsMessage.style.display = 'block';
            statsTableBody.innerHTML = '';
            return;
        }
        
        if (emptyStatsMessage) emptyStatsMessage.style.display = 'none';
        
        statsTableBody.innerHTML = currentPlayers.map(p => {
            const stats = playerStats[p.id] || { gols: 0, assists: 0 };
            
            return `
                <tr>
                    <td>${p.nome}</td>
                    <td>
                        <input type="number" class="stats-input" min="0" 
                               value="${stats.gols || 0}"
                               onchange="atualizarStat(${p.id}, 'gols', this.value)">
                    </td>
                    <td>
                        <input type="number" class="stats-input" min="0" 
                               value="${stats.assists || 0}"
                               onchange="atualizarStat(${p.id}, 'assists', this.value)">
                    </td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="removerJogadorPartida(${p.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    window.atualizarStat = function(id, stat, valor) {
        if (!playerStats[id]) {
            playerStats[id] = { gols: 0, assists: 0 };
        }
        playerStats[id][stat] = parseInt(valor) || 0;
    };
    
    function validarStats() {
        return currentPlayers.every(p => playerStats[p.id] !== undefined);
    }

    
    function calcularResultados() {
        matchResults = currentPlayers.map(p => {
            const stats = playerStats[p.id] || { gols: 0, assists: 0 };
            const gols = stats.gols || 0;
            const assists = stats.assists || 0;
            
            // Rating: base 6.0 + 0.5 por gol + 0.3 por assistência
            let rating = 1.0 + (gols * 0.5) + (assists * 0.3);
            rating = Math.min(Math.max(rating, 1), 10);
            
            return {
                id: p.id,
                nome: p.nome,
                gols: gols,
                assists: assists,
                rating: parseFloat(rating.toFixed(1))
            };
        }).sort((a, b) => b.rating - a.rating);
        
        exibirResultados();
    }
    
    function exibirResultados() {
        if (!resultsContainer) return;
        
        if (matchResults.length === 0) {
            if (emptyResultsMessage) emptyResultsMessage.style.display = 'block';
            resultsContainer.innerHTML = '';
            return;
        }
        
        if (emptyResultsMessage) emptyResultsMessage.style.display = 'none';
        
        const totalGols = matchResults.reduce((sum, p) => sum + p.gols, 0);
        
        resultsContainer.innerHTML = matchResults.map((p, index) => {
            let badges = [];
            let cardClass = 'result-card';
            
            if (index === 0) {
                badges.push('<span class="badge mvp">🏆 MVP</span>');
                cardClass += ' mvp';
            }
            
            const artilheiro = [...matchResults].sort((a, b) => b.gols - a.gols)[0];
            if (p.id === artilheiro.id && p.gols > 0) {
                badges.push('<span class="badge scorer">⚽ Artilheiro</span>');
                cardClass += ' top-scorer';
            }
            
            const assistente = [...matchResults].sort((a, b) => b.assists - a.assists)[0];
            if (p.id === assistente.id && p.assists > 0) {
                badges.push('<span class="badge assister">🎯 Mais Assistências</span>');
                cardClass += ' top-assister';
            }
            
            return `
                <div class="${cardClass}">
                    <div class="result-header">
                        <span class="result-rank">${index + 1}º</span>
                        <span class="result-rating">${p.rating}</span>
                    </div>
                    <h4>${p.nome}</h4>
                    <div class="result-stats">
                        <div>
                            <span class="stat-label">Gols</span>
                            <span class="stat-value">${p.gols}</span>
                        </div>
                        <div>
                            <span class="stat-label">Assistências</span>
                            <span class="stat-value">${p.assists}</span>
                        </div>
                        <div>
                            <span class="stat-label">Participação</span>
                            <span class="stat-value">${totalGols > 0 ? ((p.gols / totalGols) * 100).toFixed(1) : 0}%</span>
                        </div>
                    </div>
                    <div class="badges">${badges.join('')}</div>
                </div>
            `;
        }).join('');
    }
    
    function salvarPartida() {
        if (matchResults.length === 0) {
            alert('Nenhuma estatística para salvar');
            return;
        }
        
        // Criar partida
        const partida = {
            id: appData.nextMatchId++,
            data: new Date().toISOString(),
            jogadores: currentPlayers.map(p => p.id),
            estatisticas: matchResults.map(p => ({
                jogadorId: p.id,
                jogadorNome: p.nome,
                gols: p.gols,
                assists: p.assists,
                rating: p.rating
            }))
        };
        
        appData.matches.push(partida);
        

        matchResults.forEach(p => {
            let jogador = appData.players.find(j => j.id === p.id);
            
            if (!jogador) {
                jogador = {
                    id: p.id,
                    nome: p.nome,
                    partidas: 0,
                    totalGols: 0,
                    totalAssists: 0,
                    totalRating: 0
                };
                appData.players.push(jogador);
            }
            
            jogador.partidas = (jogador.partidas || 0) + 1;
            jogador.totalGols = (jogador.totalGols || 0) + p.gols;
            jogador.totalAssists = (jogador.totalAssists || 0) + p.assists;
            jogador.totalRating = (jogador.totalRating || 0) + p.rating;
        });
        
        salvarDados();
        
        alert(`✅ Partida salva!\n\nGols: ${matchResults.reduce((s, p) => s + p.gols, 0)}\nMVP: ${matchResults[0].nome}`);
        
        resetarPartida();
    }
    
    function resetarPartida() {
        currentPlayers = [];
        playerStats = {};
        matchResults = [];
        if (playerNameInput) playerNameInput.value = '';
        atualizarListaJogadoresPartida();
        mostrarStep(1);
    }

    
    function setupManagePlayersListeners() {
        if (!addNewPlayerBtn) return;
        
        addNewPlayerBtn.addEventListener('click', cadastrarJogador);
        
        if (newPlayerName) {
            newPlayerName.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    cadastrarJogador();
                }
            });
        }
    }
    
    function cadastrarJogador() {
        if (!newPlayerName) return;
        
        const nome = newPlayerName.value.trim();
        if (!nome) {
            alert('Digite o nome do jogador');
            return;
        }
        
        if (appData.players.some(p => p.nome.toLowerCase() === nome.toLowerCase())) {
            alert('Jogador já cadastrado');
            return;
        }
        
        appData.players.push({
            id: appData.nextPlayerId++,
            nome: nome,
            partidas: 0,
            totalGols: 0,
            totalAssists: 0,
            totalRating: 0
        });
        
        salvarDados();
        carregarTodosJogadores();
        
        newPlayerName.value = '';
        newPlayerName.focus();
        
        alert(`✅ Jogador ${nome} cadastrado!`);
    }
    
    window.deletarJogador = function(id, nome) {
        if (!confirm(`Tem certeza que deseja excluir ${nome}?`)) return;
        
        appData.players = appData.players.filter(p => p.id !== id);        
        appData.matches.forEach(m => {
            m.estatisticas = m.estatisticas.filter(e => e.jogadorId !== id);
            m.jogadores = m.jogadores.filter(j => j !== id);
        });
        
        salvarDados();
        carregarTodosJogadores();
        
        alert(`✅ Jogador ${nome} excluído!`);
    };
    
    function carregarTodosJogadores() {
        if (!allPlayersList) return;
        
        if (appData.players.length > 0) {
            if (noPlayersMessage) noPlayersMessage.style.display = 'none';
            
            const ordenados = [...appData.players].sort((a, b) => a.nome.localeCompare(b.nome));
            
            allPlayersList.innerHTML = ordenados.map(p => {
                const media = p.partidas > 0 ? (p.totalRating / p.partidas).toFixed(1) : '0.0';
                
                return `
                    <div class="player-item">
                        <div class="player-info">
                            <i class="fas fa-user"></i>
                            <div>
                                <div class="player-name">${p.nome}</div>
                                <small>
                                    ${p.partidas || 0} jogos | 
                                    ${p.totalGols || 0} gols | 
                                    ${p.totalAssists || 0} assists | 
                                    ⭐ ${media}
                                </small>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-danger" onclick="deletarJogador(${p.id}, '${p.nome}')">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                `;
            }).join('');
        } else {
            if (noPlayersMessage) noPlayersMessage.style.display = 'block';
            if (allPlayersList) allPlayersList.innerHTML = '';
        }
    }

    
    function setupTournamentListeners() {
        if (!createTournamentBtn) return;
        
        createTournamentBtn.addEventListener('click', criarCampeonato);
    }
    
    function preencherAnos() {
        if (!tournamentYear) return;
        
        const anoAtual = new Date().getFullYear();
        tournamentYear.innerHTML = '';
        
        for (let ano = anoAtual; ano >= anoAtual - 5; ano--) {
            const option = document.createElement('option');
            option.value = ano;
            option.textContent = ano;
            if (ano === anoAtual) option.selected = true;
            tournamentYear.appendChild(option);
        }
    }
    
    function criarCampeonato() {
        if (!tournamentName || !tournamentSeason) return;
        
        const nome = tournamentName.value.trim();
        const temporada = tournamentSeason.value;
        const ano = tournamentYear?.value || new Date().getFullYear();
        
        if (!nome) {
            alert('Digite o nome do campeonato');
            return;
        }
        
        if (!temporada) {
            alert('Selecione a temporada');
            return;
        }
        
        appData.tournaments.push({
            id: appData.nextTournamentId++,
            nome: nome,
            temporada: temporada,
            ano: parseInt(ano),
            status: 'ativo',
            criado: new Date().toISOString()
        });
        
        salvarDados();
        carregarTodosCampeonatos();
        
        tournamentName.value = '';
        tournamentSeason.value = '';
        
        alert(`✅ Campeonato "${nome}" criado!`);
    }
    
    window.finalizarCampeonato = function(id, nome) {
        if (!confirm(`Finalizar campeonato "${nome}"?`)) return;
        
        const campeonato = appData.tournaments.find(t => t.id === id);
        if (campeonato) {
            campeonato.status = 'finalizado';
            salvarDados();
            carregarTodosCampeonatos();
        }
    };
    
    window.deletarCampeonato = function(id, nome) {
        if (!confirm(`Excluir campeonato "${nome}"?`)) return;
        
        appData.tournaments = appData.tournaments.filter(t => t.id !== id);
        salvarDados();
        carregarTodosCampeonatos();
        
        alert(`✅ Campeonato "${nome}" excluído!`);
    };
    
    function carregarTodosCampeonatos() {
        if (!tournamentsList) return;
        
        if (appData.tournaments.length > 0) {
            if (noTournamentsMessage) noTournamentsMessage.style.display = 'none';
            
            const ordenados = [...appData.tournaments].sort((a, b) => {
                if (a.ano !== b.ano) return b.ano - a.ano;
                return b.id - a.id;
            });
            
            tournamentsList.innerHTML = ordenados.map(t => `
                <div class="tournament-card">
                    <div class="tournament-header">
                        <h4>${t.nome}</h4>
                        <span class="tournament-badge ${t.status === 'ativo' ? 'status-active' : 'status-finished'}">
                            ${t.status === 'ativo' ? 'Em andamento' : 'Finalizado'}
                        </span>
                    </div>
                    <div class="tournament-info">
                        <span><i class="fas fa-calendar"></i> ${t.temporada} ${t.ano}</span>
                        <span><i class="fas fa-diagram-project"></i> Mata-mata</span>
                    </div>
                    <div class="tournament-actions">
                        ${t.status === 'ativo' ? `
                            <button class="btn btn-sm btn-warning" onclick="finalizarCampeonato(${t.id}, '${t.nome}')">
                                <i class="fas fa-flag-checkered"></i> Finalizar
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-danger" onclick="deletarCampeonato(${t.id}, '${t.nome}')">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            if (noTournamentsMessage) noTournamentsMessage.style.display = 'block';
            if (tournamentsList) tournamentsList.innerHTML = '';
        }
    }

    
    function setupMuralListeners() {
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
    
    function atualizarMural() {
        atualizarTituloPeriodo();
        
        const partidasFiltradas = filtrarPartidasPorPeriodo();
        const stats = calcularEstatisticasPeriodo(partidasFiltradas);
        
        atualizarStatsPeriodo(stats);
        atualizarStatsJogadores(stats);
        atualizarListaPartidas(partidasFiltradas);
        atualizarMensagensVazias(partidasFiltradas, stats);
    }
    
    function atualizarTituloPeriodo() {
        if (!currentPeriodEl) return;
        
        if (currentView.periodType === 'year') {
            currentPeriodEl.textContent = currentView.year;
        } else {
            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            currentPeriodEl.textContent = `${meses[currentView.month - 1]}/${currentView.year}`;
        }
    }
    
    function filtrarPartidasPorPeriodo() {
        return appData.matches.filter(m => {
            const data = new Date(m.data);
            const ano = data.getFullYear();
            const mes = data.getMonth() + 1;
            
            if (currentView.periodType === 'year') {
                return ano === currentView.year;
            } else {
                return ano === currentView.year && mes === currentView.month;
            }
        });
    }
    
    function calcularEstatisticasPeriodo(partidas) {
        const stats = {
            totalPartidas: partidas.length,
            totalGols: 0,
            totalAssists: 0,
            jogadores: {}
        };
        
        // Inicializar jogadores
        appData.players.forEach(p => {
            stats.jogadores[p.id] = {
                id: p.id,
                nome: p.nome,
                partidas: 0,
                gols: 0,
                assists: 0,
                rating: 0
            };
        });
        
        // Calcular estatísticas
        partidas.forEach(p => {
            stats.totalGols += p.estatisticas.reduce((s, e) => s + (e.gols || 0), 0);
            stats.totalAssists += p.estatisticas.reduce((s, e) => s + (e.assists || 0), 0);
            
            p.estatisticas.forEach(e => {
                if (stats.jogadores[e.jogadorId]) {
                    stats.jogadores[e.jogadorId].partidas++;
                    stats.jogadores[e.jogadorId].gols += e.gols || 0;
                    stats.jogadores[e.jogadorId].assists += e.assists || 0;
                    stats.jogadores[e.jogadorId].rating += e.rating || 0;
                }
            });
        });
        
        return stats;
    }
    
    function atualizarStatsPeriodo(stats) {
        if (!periodStats) return;
        
        const jogadoresAtivos = Object.values(stats.jogadores).filter(j => j.partidas > 0).length;
        
        periodStats.innerHTML = `
            <div class="stat-card">
                <i class="fas fa-futbol"></i>
                <h3>${stats.totalPartidas}</h3>
                <p>Partidas</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-users"></i>
                <h3>${jogadoresAtivos}</h3>
                <p>Jogadores</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-futbol"></i>
                <h3>${stats.totalGols}</h3>
                <p>Gols</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-handshake"></i>
                <h3>${stats.totalAssists}</h3>
                <p>Assistências</p>
            </div>
        `;
    }
    
    function atualizarStatsJogadores(stats) {
        if (!playerStatsGrid) return;
        
        const jogadoresAtivos = Object.values(stats.jogadores)
            .filter(j => j.partidas > 0)
            .sort((a, b) => (b.rating / b.partidas) - (a.rating / a.partidas));
        
        if (jogadoresAtivos.length > 0) {
            playerStatsGrid.style.display = 'block';
            
            playerStatsGrid.innerHTML = jogadoresAtivos.map((j, i) => {
                const media = (j.rating / j.partidas).toFixed(1);
                
                return `
                    <div class="player-stat-card">
                        <div class="player-stat-header">
                            <span class="player-rank">${i + 1}º</span>
                            <span class="player-name">${j.nome}</span>
                        </div>
                        <div class="player-stat-details">
                            <div><span class="label">Jogos:</span> ${j.partidas}</div>
                            <div><span class="label">Gols:</span> ${j.gols}</div>
                            <div><span class="label">Assists:</span> ${j.assists}</div>
                            <div><span class="label">Média:</span> ⭐ ${media}</div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            playerStatsGrid.style.display = 'none';
        }
    }
    
    function atualizarListaPartidas(partidas) {
        if (!matchesList) return;
        
        if (partidas.length > 0) {
            matchesList.style.display = 'block';
            if (noMatchesMessage) noMatchesMessage.style.display = 'none';
            
            const ordenadas = [...partidas].sort((a, b) => new Date(b.data) - new Date(a.data));
            
            matchesList.innerHTML = ordenadas.map(p => {
                const data = new Date(p.data).toLocaleDateString('pt-BR');
                const gols = p.estatisticas.reduce((s, e) => s + (e.gols || 0), 0);
                const assists = p.estatisticas.reduce((s, e) => s + (e.assists || 0), 0);
                const mvp = p.estatisticas.sort((a, b) => b.rating - a.rating)[0]?.jogadorNome || '-';
                
                return `
                    <div class="match-card">
                        <div class="match-header">
                            <span class="match-date">${data}</span>
                            <span class="match-players">${p.estatisticas.length} jogadores</span>
                        </div>
                        <div class="match-stats">
                            <span><i class="fas fa-futbol"></i> ${gols} gols</span>
                            <span><i class="fas fa-handshake"></i> ${assists} assists</span>
                            <span><i class="fas fa-star"></i> MVP: ${mvp}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            matchesList.style.display = 'none';
            if (noMatchesMessage) noMatchesMessage.style.display = 'block';
        }
    }
    
    function atualizarMensagensVazias(partidas, stats) {
        if (noMatchesMessage) {
            noMatchesMessage.style.display = partidas.length > 0 ? 'none' : 'block';
        }
    }

    
    function init() {
        console.log('🚀 Inicializando painel admin');
        
        
        if (!verificarAutenticacao()) {
            setupLoginForm();
            return;
        }
        
        
        setupEventListeners();
        setupNewMatchListeners();
        setupManagePlayersListeners();
        setupTournamentListeners();
        setupMuralListeners();
        
        
        mostrarStep(1);
        carregarTodosJogadores();
        carregarTodosCampeonatos();
        preencherAnos();
        renderizarSeletorMeses();
        atualizarMural();
    }
    
    
    init();
});