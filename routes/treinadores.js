const express = require('express');
const treinadores = require('../data/treinadores');

const router = express.Router();

router.get('/treinadores', (req, res) => {

    res.render('treinadores', { treinadores: treinadores });

});
router.get('/treinadores/:id', (req, res) => {
    const id = Number(req.params.id);
    const treinador = treinadores.find(treinador => treinador.id === id);

    res.render('perfil-treinador', { treinador: treinador });
});

module.exports = router;
