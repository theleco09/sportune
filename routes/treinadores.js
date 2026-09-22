const express = require('express');
const treinadores = require('../data/treinadores');

const router = express.Router();

router.get('/treinadores', (req, res) => {

    res.render('treinadores', { treinadores: treinadores });

});

module.exports = router;
