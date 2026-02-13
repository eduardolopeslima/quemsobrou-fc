const ADMIN_CREDENTIALS = {
    "doissdu": {
        hash: "aa0493c3f74ace6155b75c861cc58bd80d41cf281c7d2f369eb6faf57f0cd1ff",
        salt: "646f69737364755155454d5f534f4252",
        nome: "Administrador Master",
        role: "super_admin"
    },
    "brunosfc": {
        hash: "6d9bfc40d3ee23487012a3297f7281017c9e5538e6641e2f1d5cae0aa0655ce2",
        salt: "6272756e6f7366635155454d5f534f42",
        nome: "Bruno",
        role: "admin"
    },
    "jeansfc": {
        hash: "ac9c474fb159d2b0ce78f43b5e457a45050f59e7de616ea2e9042fdfb198b10f",
        salt: "6a65616e7366635155454d5f534f4252",
        nome: "João Santos",
        role: "admin"
    },
    "guigosfc": {
        hash: "ba35598f93d1fcccf2fe2e22543dfd83e35e51696e30cbb9274cc3427f44f483",
        salt: "677569676f7366635155454d5f534f42",
        nome: "Guigo",
        role: "admin"
    }
};

window.ADMIN_CREDENTIALS = ADMIN_CREDENTIALS;

// Mensagem de confirmação no console
console.log('✅ credentials.js carregado - 4 administradores fixos');