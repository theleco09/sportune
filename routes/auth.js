const express = require('express');
const atletas = require('../data/atletas');
const treinadores = require('../data/treinadores');

const router = express.Router();

function verificarLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    next();
}
router.get('/login', (req, res) => {
    res.render('login', {
        erro: null
    });
});

router.get('/perfil', verificarLogin, (req, res) => {

    const usuario = req.session.usuario;
    const tipo = req.session.tipo;

    res.render('perfil', {
        usuario: usuario,
        tipo: tipo
    });

});

router.get('/logout', (req, res) => {

    req.session.destroy(() => {
        res.redirect('/');
    });

});

router.get('/perfil/editar', verificarLogin, (req, res) => {
    const usuario = req.session.usuario;
    const tipo = req.session.tipo;

    res.render('editar-perfil', {
        usuario: usuario,
        tipo: tipo,
        erro: null
    });
});
router.post('/perfil/editar', verificarLogin, (req, res) => {
    const { nome, email, esporte, pais, experiencia } = req.body;

    const usuario = req.session.usuario;
    const tipo = req.session.tipo;

    usuario.nome = nome;
    usuario.email = email;
    usuario.esporte = esporte;
    usuario.pais = pais;

    if (tipo === 'treinador') {
        usuario.experiencia = experiencia;
    }

    req.session.usuario = usuario;

    res.redirect('/perfil');
});

router.post('/login', (req, res) => {

    const { email, senha } = req.body;

    const atleta = atletas.find(usuario =>
        usuario.email === email && usuario.senha === senha
    );

    const treinador = treinadores.find(usuario =>
        usuario.email === email && usuario.senha === senha
    );

    if (atleta) {
        req.session.usuario = atleta;
        req.session.tipo = 'atleta';
    
        return res.redirect('/perfil');
    }
    
    if (treinador) {
        req.session.usuario = treinador;
        req.session.tipo = 'treinador';
    
        return res.redirect('/perfil');
    }

    res.render('login', {
        erro: 'Email ou senha incorretos.'
    });
});

router.get('/cadastro', (req, res) => {
    const tipo = req.query.tipo;

    if (tipo !== 'atleta' && tipo !== 'treinador') {
        return res.redirect('/jornada');
    }
    res.render('cadastro', {
        tipo: tipo,
        erro: null
    });
});

router.post('/cadastro', (req, res) => {
    const { nome, email, senha, esporte, pais, experiencia, tipo } = req.body;

    if (!nome || !email || !senha || !esporte || !pais) {
        return res.render('cadastro', {
            tipo: tipo,
            erro: 'Preencha todos os campos obrigatórios.'
        });
    }

    const emailExiste =
    atletas.some(usuario => usuario.email === email) ||
    treinadores.some(usuario => usuario.email === email);

    if (emailExiste) {
        return res.render('cadastro', {
            tipo: tipo,
            erro: 'Este email já está cadastrado.'
        });
    }
    if (tipo === 'atleta') {
        const novoAtleta = {
            id: atletas.length + 1,
            nome: nome,
            email: email,
            senha: senha,
            esporte: esporte,
            pais: pais
        };
        console.log('NOVO ATLETA:', novoAtleta);
        atletas.push(novoAtleta);

        res.redirect('/atletas');
    } else {
        const novoTreinador = {
            id: treinadores.length + 1,
            nome: nome,
            email: email,
            senha: senha,
            esporte: esporte,
            pais: pais,
            experiencia: experiencia
        };
        console.log('NOVO TREINADOR:', novoTreinador);
        treinadores.push(novoTreinador);

        res.redirect('/treinadores');
    }
});

module.exports = router;