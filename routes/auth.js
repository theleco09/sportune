const express = require('express');
const atletas = require('../data/atletas');
const treinadores = require('../data/treinadores');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/perfil', (req, res) => {

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

    res.send('Email ou senha incorretos.');
});

router.get('/cadastro', (req, res) => {
    const tipo = req.query.tipo;

    if (tipo !== 'atleta' && tipo !== 'treinador') {
        return res.redirect('/jornada');
    }
    res.render('cadastro', { tipo: tipo });
});

router.post('/cadastro', (req, res) => {
    const { nome, email, senha, esporte, pais, experiencia, tipo } = req.body;

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