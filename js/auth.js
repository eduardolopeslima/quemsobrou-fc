const Auth = {
        async sha256(message) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    async login(username, password, rememberMe = false) {
        try {
            console.log('🔐 Tentando login:', username);
            
            
            if (!window.ADMIN_CREDENTIALS) {
                console.error('❌ ADMIN_CREDENTIALS não encontrado!');
                return { 
                    success: false, 
                    message: 'Erro no sistema de autenticação' 
                };
            }
            
            
            const userKey = username.toLowerCase();
            const userData = window.ADMIN_CREDENTIALS[userKey];
            
            if (!userData) {
                console.log('❌ Usuário não encontrado:', username);
                return { 
                    success: false, 
                    message: 'Usuário ou senha incorretos' 
                };
            }
            
            // Gerar hash da senha fornecida com o salt do usuário
            const hashFornecido = await this.sha256(password + userData.salt);
            
            // Comparar hashes
            if (hashFornecido === userData.hash) {
                
                const usuario = {
                    username: userKey,
                    nome: userData.nome,
                    role: userData.role,
                    loginEm: new Date().toISOString()
                };
                
                
                const sessao = {
                    usuario: usuario,
                    expira: Date.now() + (8 * 60 * 60 * 1000)
                };
                
                
                sessionStorage.setItem('quemSobrouSession', JSON.stringify(sessao));
                
                o
                if (rememberMe) {
                    localStorage.setItem('quemSobrouLastUser', userKey);
                } else {
                    localStorage.removeItem('quemSobrouLastUser');
                }
                
                console.log('✅ Login bem sucedido:', userKey, '-', userData.role);
                
                return {
                    success: true,
                    user: usuario,
                    message: 'Login realizado com sucesso'
                };
            } else {
                console.log('❌ Senha incorreta para:', username);
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

    
    checkSession() {
        try {
            const sessao = sessionStorage.getItem('quemSobrouSession');
            
            if (!sessao) {
                return null;
            }
            
            const dados = JSON.parse(sessao);
            
            
            if (dados.expira > Date.now()) {
                return dados.usuario;
            } else {
                
                sessionStorage.removeItem('quemSobrouSession');
                console.log('⏰ Sessão expirada');
                return null;
            }
        } catch (error) {
            console.error('❌ Erro ao verificar sessão:', error);
            sessionStorage.removeItem('quemSobrouSession');
            return null;
        }
    },

    
    logout() {
        try {
            
            sessionStorage.removeItem('quemSobrouSession');
            
            console.log('👋 Logout realizado');
            
           
            window.location.href = 'index.html';
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao fazer logout:', error);
            return false;
        }
    },

   
    getLastUser() {
        try {
            return localStorage.getItem('quemSobrouLastUser') || '';
        } catch (error) {
            console.error('❌ Erro ao obter último usuário:', error);
            return '';
        }
    },

    
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


window.Auth = Auth;


console.log('✅ auth.js carregado - Sistema de autenticação pronto');