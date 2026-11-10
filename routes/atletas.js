
const express = require('express');
const supabase = require('../supabase');

const router = express.Router();

router.get('/atletas', async (req, res) => {
    const { data: perfis, error } = await supabase
        .rpc('listar_perfis_publicos');

    if (error) {
        console.error('Erro ao buscar atletas:', error);
        return res.status(500).send('Erro ao carregar atletas.');
    }

    const atletas = perfis.filter(
        perfil => perfil.tipo === 'atleta'
    );

    res.render('atletas', { atletas });
});

router.get('/atletas/:id', async (req, res) => {
    try {
        const { data: perfis, error } = await supabase
            .rpc('listar_perfis_publicos');

        if (error) throw error;

        const atleta = perfis.find(
            perfil =>
                perfil.id === req.params.id &&
                perfil.tipo === 'atleta'
        );

        if (!atleta) {
            return res.status(404).send('Atleta não encontrado.');
        }

        // Busca a quantidade de seguidores
        const { count: quantidadeSeguidores, error: erroSeguidores } =
            await supabase
                .from('seguidores')
                .select('id', { count: 'exact', head: true })
                .eq('seguido_id', atleta.id);

        if (erroSeguidores) throw erroSeguidores;

        // Busca quantas pessoas o atleta segue
        const { count: quantidadeSeguindo, error: erroSeguindo } =
            await supabase
                .from('seguidores')
                .select('id', { count: 'exact', head: true })
                .eq('seguidor_id', atleta.id);

        if (erroSeguindo) throw erroSeguindo;

        const usuarioId = req.session.usuario?.id || null;

        const ehMeuPerfil = usuarioId === atleta.id;
        let usuarioSegueAtleta = false;

        // Verifica se o usuário logado já segue esse atleta
        if (usuarioId && !ehMeuPerfil) {
            const { data: seguimento, error: erroBusca } =
                await supabase
                    .from('seguidores')
                    .select('id')
                    .eq('seguidor_id', usuarioId)
                    .eq('seguido_id', atleta.id)
                    .maybeSingle();

            if (erroBusca) throw erroBusca;

            usuarioSegueAtleta = !!seguimento;
        }

        res.render('perfil-atleta', {
            atleta,
            quantidadeSeguidores: quantidadeSeguidores || 0,
            quantidadeSeguindo: quantidadeSeguindo || 0,
            usuarioSegueAtleta,
            ehMeuPerfil
        });

    } catch (error) {
        console.error('Erro ao buscar perfil:', error.message);
        return res.status(500).send('Erro ao carregar perfil.');
    }
});

module.exports = router;
