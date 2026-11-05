
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
            .select('id, usuario_id, conteudo, criado_em')
            .order('criado_em', { ascending: false });

        if (error) throw error;
        const idsPublicacoes = publicacoes.map(p => p.id);

        let curtidas = [];
        
        if (idsPublicacoes.length > 0) {
            const { data, error: erroCurtidas } = await supabase
                .from('curtidas')
                .select('publicacao_id, usuario_id')
                .in('publicacao_id', idsPublicacoes);
        
            if (erroCurtidas) throw erroCurtidas;
        
            curtidas = data;
        }
        // Buscar comentários das publicações
let comentarios = [];

if (idsPublicacoes.length > 0) {
    const { data, error: erroComentarios } = await supabase
        .from('comentarios')
        .select('id, publicacao_id, usuario_id, conteudo, criado_em')
        .in('publicacao_id', idsPublicacoes)
        .order('criado_em', { ascending: true });

    if (erroComentarios) throw erroComentarios;

    comentarios = data;
}
        
        const usuarioId = req.session.usuario?.id || null;
        const idsAutores = [
            ...new Set([
                ...publicacoes.map(p => p.usuario_id),
                ...comentarios.map(c => c.usuario_id)
            ])
        ];

        let nomesAutores = [];

        if (idsAutores.length > 0) {
            const { data, error: erroAutores } = await supabase
                .rpc('buscar_nomes_autores', {
                    p_ids: idsAutores
                });

            if (erroAutores) throw erroAutores;

            nomesAutores = data;
        }
        const publicacoesComAutores = publicacoes.map(publicacao => {
            const autor = nomesAutores.find(
                usuario => usuario.id === publicacao.usuario_id
            );
        
            const curtidasPublicacao = curtidas.filter(
                curtida => curtida.publicacao_id === publicacao.id
            );
        
            const comentariosPublicacao = comentarios
            .filter(c => c.publicacao_id === publicacao.id)
            .map(comentario => {
                const autorComentario = nomesAutores.find(
                    usuario => usuario.id === comentario.usuario_id
                );
        
                return {
                    ...comentario,
                    usuarios: {
                        nome: autorComentario?.nome || 'Usuário'
                    }
                };
            });
        
        return {
            ...publicacao,
            usuarios: {
                nome: autor?.nome || 'Usuário'
            },
            quantidadeCurtidas: curtidasPublicacao.length,
            usuarioCurtiu: curtidasPublicacao.some(
                curtida => curtida.usuario_id === usuarioId
            ),
            comentarios: comentariosPublicacao
        };
    });

        res.render('feed', {
            publicacoes: publicacoesComAutores,
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
router.post('/feed/:id/curtir', async (req, res) => {
    if (!req.session.usuario || !req.session.accessToken) {
        return res.redirect('/login');
    }

    const publicacaoId = Number(req.params.id);

    if (!Number.isInteger(publicacaoId) || publicacaoId <= 0) {
        return res.status(400).send('Publicação inválida.');
    }

    try {
        const clienteUsuario = criarClienteUsuario(
            req.session.accessToken
        );

        const usuarioId = req.session.usuario.id;

        // Verifica se o usuário já curtiu
        const { data: curtida, error: erroBusca } = await clienteUsuario
            .from('curtidas')
            .select('id')
            .eq('publicacao_id', publicacaoId)
            .eq('usuario_id', usuarioId)
            .maybeSingle();

        if (erroBusca) throw erroBusca;

        if (curtida) {
            // Se já curtiu, remove a curtida
            const { error } = await clienteUsuario
                .from('curtidas')
                .delete()
                .eq('id', curtida.id);

            if (error) throw error;

        } else {
            // Se ainda não curtiu, registra
            const { error } = await clienteUsuario
                .from('curtidas')
                .insert({
                    publicacao_id: publicacaoId,
                    usuario_id: usuarioId
                });

            if (error) throw error;
        }

        return res.redirect('/feed');

    } catch (error) {
        console.error('Erro ao curtir publicação:', error.message);

        return res.status(500).send(
            'Não foi possível atualizar a curtida.'
        );
    }
});
// Criar comentário
router.post('/feed/:id/comentar', async (req, res) => {
    if (!req.session.usuario || !req.session.accessToken) {
        return res.redirect('/login');
    }

    const publicacaoId = Number(req.params.id);
    const conteudo = req.body.conteudo?.trim();

    if (!Number.isInteger(publicacaoId) || publicacaoId <= 0) {
        return res.status(400).send('Publicação inválida.');
    }

    if (!conteudo || conteudo.length > 500) {
        return res.status(400).send(
            'O comentário deve ter entre 1 e 500 caracteres.'
        );
    }

    try {
        const clienteUsuario = criarClienteUsuario(
            req.session.accessToken
        );

        const { error } = await clienteUsuario
            .from('comentarios')
            .insert({
                publicacao_id: publicacaoId,
                usuario_id: req.session.usuario.id,
                conteudo
            });

        if (error) throw error;

        return res.redirect('/feed');

    } catch (error) {
        console.error('Erro ao criar comentário:', error.message);

        return res.status(500).send(
            'Não foi possível enviar o comentário.'
        );
    }
});
// Excluir publicação
router.post('/feed/:id/excluir', async (req, res) => {
    if (!req.session.usuario || !req.session.accessToken) {
        return res.redirect('/login');
    }

    const publicacaoId = Number(req.params.id);

    if (!Number.isInteger(publicacaoId) || publicacaoId <= 0) {
        return res.status(400).send('Publicação inválida.');
    }

    try {
        const clienteUsuario = criarClienteUsuario(
            req.session.accessToken
        );

        const { data, error } = await clienteUsuario
            .from('publicacoes')
            .delete()
            .eq('id', publicacaoId)
            .eq('usuario_id', req.session.usuario.id)
            .select('id')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return res.status(404).send(
                'Publicação não encontrada ou você não tem permissão para excluí-la.'
            );
        }

        return res.redirect('/feed');

    } catch (error) {
        console.error('Erro ao excluir publicação:', error.message);

        return res.status(500).send(
            'Não foi possível excluir a publicação.'
        );
    }
});
module.exports = router;
