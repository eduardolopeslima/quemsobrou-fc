// ============================================
// QUEM SOBROU FC - SISTEMA DE AUTENTICAÇÃO
// VERSÃO: 3.0.0 - CORRIGIDA E TESTADA
// ============================================

const Auth = {
    // ========================================
    // FUNÇÃO DE HASH SHA-256
    // ========================================
    async sha256(message) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error('❌ Erro no hash:', error);
            return null;
        }
    },

    // ========================================
    // LOGIN - VERSÃO CORRIGIDA
    // ========================================
    async login(username, password, rememberMe = false) {
        try {
            console.log('🔐 Iniciando login para:', username);
            
            // Verificar se credentials foi carregado
            if (typeof ADMIN_CREDENTIALS === 'undefined') {
                console.error('❌ ADMIN_CREDENTIALS não definido!');
                return { 
                    success: false, 
                    message: 'Erro no sistema de autenticação' 
                };
            }
            
            // Normalizar username (minúsculas)
            const userKey = username.toLowerCase().trim();
            
            // Verificar se usuário existe
            const userData = ADMIN_CREDENTIALS[userKey];
            if (!userData) {
                console.log('❌ Usuário não encontrado:', userKey);
                return { 
                    success: false, 
                    message: 'Usuário ou senha incorretos' 
                };
            }
            
            console.log('✅ Usuário encontrado:', userKey);
            
            // Gerar hash da senha fornecida
            const hashFornecido = await this.sha256(password + userData.salt);
            
            if (!hashFornecido) {
                return { 
                    success: false, 
                    message: 'Erro ao processar senha' 
                };
            }
            
            console.log('🔑 Hash gerado:', hashFornecido.substring(0, 10) + '...');
            console.log('🔒 Hash esperado:', userData.hash.substring(0, 10) + '...');
            
            // Comparar hashes
            if (hashFornecido === userData.hash) {
                // Login bem sucedido
                const usuario = {
                    username: userKey,
                    nome: userData.nome,
                    role: userData.role,
                    loginEm: new Date().toISOString()
                };
                
                // Criar sessão (8 horas)
                const sessao = {
                    usuario: usuario,
                    expira: Date.now() + (8 * 60 * 60 * 1000)
                };
                
                // Salvar no sessionStorage
                sessionStorage.setItem('quemSobrouSession', JSON.stringify(sessao));
                console.log('✅ Sessão salva no sessionStorage');
                
                // Salvar último usuário se "lembrar-me"
                if (rememberMe) {
                    localStorage.setItem('quemSobrouLastUser', userKey);
                    console.log('✅ Último usuário salvo no localStorage');
                }
                
                console.log('🎉 Login bem sucedido!');
                
                return {
                    success: true,
                    user: usuario,
                    message: 'Login realizado com sucesso'
                };
            } else {
                console.log('❌ Senha incorreta');
                return {
                    success: false,
                    message: 'Usuário ou senha incorretos'
                };
            }
        } catch (error) {
            console.error('❌ Erro no login:', error);
            return {
                success: false,
                message: 'Erro ao processar login'
            };
        }
    },

    // ========================================
    // VERIFICAR SESSÃO
    // ========================================
    checkSession() {
        try {
            const sessao = sessionStorage.getItem('quemSobrouSession');
            
            if (!sessao) {
                console.log('🔍 Nenhuma sessão encontrada');
                return null;
            }
            
            const dados = JSON.parse(sessao);
            
            // Verificar expiração
            if (dados.expira && dados.expira > Date.now()) {
                console.log('✅ Sessão válida para:', dados.usuario.username);
                return dados.usuario;
            } else {
                console.log('⏰ Sessão expirada');
                sessionStorage.removeItem('quemSobrouSession');
                return null;
            }
        } catch (error) {
            console.error('❌ Erro ao verificar sessão:', error);
            sessionStorage.removeItem('quemSobrouSession');
            return null;
        }
    },

    // ========================================
    // LOGOUT
    // ========================================
    logout() {
        try {
            sessionStorage.removeItem('quemSobrouSession');
            console.log('👋 Logout realizado');
            window.location.href = 'index.html';
            return true;
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            return false;
        }
    },

    // ========================================
    // OBTER ÚLTIMO USUÁRIO
    // ========================================
    getLastUser() {
        try {
            return localStorage.getItem('quemSobrouLastUser') || '';
        } catch (error) {
            console.error('❌ Erro ao obter último usuário:', error);
            return '';
        }
    },

    // ========================================
    // VERIFICAR PERMISSÕES
    // ========================================
    isAdmin() {
        const user = this.checkSession();
        return user && (user.role === 'admin' || user.role === 'super_admin');
    },

    isSuperAdmin() {
        const user = this.checkSession();
        return user && user.role === 'super_admin';
    },

    getCurrentUser() {
        return this.checkSession();
    }
};

// ============================================
// EXPORTAR GLOBALMENTE
// ============================================
window.Auth = Auth;

console.log('✅ Auth.js carregado e pronto!');