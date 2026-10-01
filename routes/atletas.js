const express = require('express');
const atletas = require('../data/atletas');

const router = express.Router();

router.get('/atletas', (req, res) => {

    res.render('atletas', { atletas: atletas });

});

module.exports = router;

