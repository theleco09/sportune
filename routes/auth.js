const express = require('express');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/cadastro', (req, res) => {
    const tipo = req.query.tipo;

    res.render('cadastro', { tipo: tipo });
});

module.exports = router;