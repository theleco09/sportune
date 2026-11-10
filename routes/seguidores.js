const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { createClient } = require('@supabase/supabase-js');

function criarClienteUsuario(accessToken) {
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

// Seguir ou deixar de seguir um usuário
router.post('/seguidores/:id/alternar', async (req, res) => {
    if (!req.session.usuario || !req.session.accessToken) {
        return res.redirect('/login');
    }

    const seguidoId = req.params.id;

    const uuidValido =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidValido.test(seguidoId)) {
        return res.status(400).send('Usuário inválido.');
    }

    try {
        const clienteUsuario = criarClienteUsuario(
            req.session.accessToken
        );

        const seguidorId = req.session.usuario.id;

        // Busca o perfil que será seguido
        const { data: perfis, error: erroPerfil } =
    await supabase.rpc('listar_perfis_publicos');

if (erroPerfil) throw erroPerfil;

const perfil = perfis.find(
    usuario => usuario.id === seguidoId
);

if (!perfil) {
    return res.status(404).send('Perfil não encontrado.');
}

        if (erroPerfil) throw erroPerfil;

        if (!perfil) {
            return res.status(404).send('Perfil não encontrado.');
        }

        if (seguidorId === seguidoId) {
            return res.status(400).send(
                'Você não pode seguir seu próprio perfil.'
            );
        }

        // Verifica se já existe uma relação
        const { data: seguimento, error: erroBusca } =
            await clienteUsuario
                .from('seguidores')
                .select('id')
                .eq('seguidor_id', seguidorId)
                .eq('seguido_id', seguidoId)
                .maybeSingle();

        if (erroBusca) throw erroBusca;

        if (seguimento) {
            // Deixa de seguir
            const { error } = await clienteUsuario
                .from('seguidores')
                .delete()
                .eq('id', seguimento.id);

            if (error) throw error;
        } else {
            // Começa a seguir
            const { error } = await clienteUsuario
                .from('seguidores')
                .insert({
                    seguidor_id: seguidorId,
                    seguido_id: seguidoId
                });

            if (error) throw error;
        }

        const rotaPerfil = perfil.tipo === 'atleta'
            ? `/atletas/${seguidoId}`
            : `/treinadores/${seguidoId}`;

        return res.redirect(rotaPerfil);

    } catch (error) {
        console.error('Erro ao atualizar seguidores:', error.message);

        return res.status(500).send(
            'Não foi possível atualizar o seguimento.'
        );
    }
});

module.exports = router;
