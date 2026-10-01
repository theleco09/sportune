const express = require('express');
const atletas = require('../data/atletas');

const router = express.Router();

router.get('/atletas', (req, res) => {

    res.render('atletas', { atletas: atletas });

});
router.get('/atletas/:id', (req, res) => {
    const id = Number(req.params.id);
    const atleta = atletas.find(atleta => atleta.id === id);

    res.render('perfil-atleta', { atleta: atleta });
});

module.exports = router;

