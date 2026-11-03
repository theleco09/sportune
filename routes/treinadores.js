const express = require('express');
const supabase = require('../supabase');

const router = express.Router();

router.get('/treinadores', async (req, res) => {
    const { data: perfis, error } = await supabase.rpc('listar_perfis_publicos');

    if (error) {
        console.error('Erro ao buscar treinadores:', error);
        return res.status(500).send('Erro ao carregar treinadores.');
    }

    const treinadores = perfis.filter(perfil => perfil.tipo === 'treinador');

    res.render('treinadores', { treinadores });
});

router.get('/treinadores/:id', async (req, res) => {
    const { data: perfis, error } = await supabase.rpc('listar_perfis_publicos');

    if (error) {
        console.error('Erro ao buscar perfil:', error);
        return res.status(500).send('Erro ao carregar perfil.');
    }

    const treinador = perfis.find(perfil =>
        perfil.id === req.params.id && perfil.tipo === 'treinador'
    );

    if (!treinador) {
        return res.status(404).send('Treinador não encontrado.');
    }

    res.render('perfil-treinador', { treinador });
});

module.exports = router;