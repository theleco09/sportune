const express = require('express');

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
    console.log(req.body);

    res.send('Cadastro concluido!');
});

module.exports = router;