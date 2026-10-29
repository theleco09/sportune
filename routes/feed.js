
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

function criarClienteUsuario(accessToken) {
    const { createClient } = require('@supabase/supabase-js');

    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    );
}

router.get('/feed', async (req, res) => {
    try {
        const { data: publicacoes, error } = await supabase
            .from('publicacoes')
            .select(`
                id,
                usuario_id,
                conteudo,
                criado_em,
                usuarios ( nome )
            `)
            .order('criado_em', { ascending: false });

        if (error) throw error;

        res.render('feed', {
            publicacoes,
            erro: null,
            sucesso: null
        });
    } catch (error) {
        console.error('Erro ao buscar publicações:', error.message);

        res.status(500).send('Não foi possível carregar o feed.');
    }
});

router.post('/feed', async (req, res) => {
    if (!req.session.usuario || !req.session.accessToken) {
        return res.redirect('/login');
    }

    const conteudo = req.body.conteudo?.trim();

    if (!conteudo || conteudo.length > 1000) {
        return res.status(400).send(
            'A publicação deve ter entre 1 e 1000 caracteres.'
        );
    }

    try {
        const clienteUsuario = criarClienteUsuario(
            req.session.accessToken
        );

        const { error } = await clienteUsuario
            .from('publicacoes')
            .insert({
                usuario_id: req.session.usuario.id,
                conteudo
            });

        if (error) throw error;

        res.redirect('/feed');
    } catch (error) {
        console.error('Erro ao criar publicação:', error.message);

        res.status(500).send(
            'Não foi possível publicar. Tente novamente.'
        );
    }
});

module.exports = router;
