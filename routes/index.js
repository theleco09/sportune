const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});
router.get('/jornada', (req, res) => {
    res.render('jornada');
});

module.exports = router;