const express = require('express');
const supabase = require('../supabase');

const router = express.Router();

router.get('/atletas', async (req, res) => {
    const { data: perfis, error } = await supabase.rpc('listar_perfis_publicos');

    if (error) {
        console.error('Erro ao buscar atletas:', error);
        return res.status(500).send('Erro ao carregar atletas.');
    }

    const atletas = perfis.filter(perfil => perfil.tipo === 'atleta');

    res.render('atletas', { atletas });
});

router.get('/atletas/:id', async (req, res) => {
    const { data: perfis, error } = await supabase.rpc('listar_perfis_publicos');

    if (error) {
        console.error('Erro ao buscar perfil:', error);
        return res.status(500).send('Erro ao carregar perfil.');
    }

    const atleta = perfis.find(perfil =>
        perfil.id === req.params.id && perfil.tipo === 'atleta'
    );

    if (!atleta) {
        return res.status(404).send('Atleta não encontrado.');
    }

    res.render('perfil-atleta', { atleta });
});

module.exports = router;