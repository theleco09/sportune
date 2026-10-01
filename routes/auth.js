const express = require('express');
const atletas = require('../data/atletas');
const treinadores = require('../data/treinadores');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
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