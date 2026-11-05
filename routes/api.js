const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

router.get('/publicacoes', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('publicacoes')
            .select('id, usuario_id, conteudo, criado_em')
            .order('criado_em', { ascending: false });

        if (error) throw error;

        return res.status(200).json({
            sucesso: true,
            total: data.length,
            publicacoes: data
        });

    } catch (error) {
        console.error('Erro na API:', error.message);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar publicações.'
        });
    }
});

router.get('/atletas', async (req, res) => {
    try {
        const { data: perfis, error } = await supabase
            .rpc('listar_perfis_publicos');

        if (error) throw error;

        const atletas = perfis.filter(
            perfil => perfil.tipo === 'atleta'
        );

        return res.status(200).json({
            sucesso: true,
            total: atletas.length,
            atletas
        });

    } catch (error) {
        console.error('Erro na API de atletas:', error.message);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar atletas.'
        });
    }
});

router.get('/atletas/:id', async (req, res) => {
    try {
        const { data: perfis, error } = await supabase
            .rpc('listar_perfis_publicos');

        if (error) throw error;

        const atleta = perfis.find(perfil =>
            perfil.id === req.params.id &&
            perfil.tipo === 'atleta'
        );

        if (!atleta) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Atleta não encontrado.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            atleta
        });

    } catch (error) {
        console.error('Erro ao buscar atleta:', error.message);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar atleta.'
        });
    }
});

router.get('/publicacoes/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID de publicação inválido.'
            });
        }

        const { data, error } = await supabase
            .from('publicacoes')
            .select('id, usuario_id, conteudo, criado_em')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Publicação não encontrada.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            publicacao: data
        });

    } catch (error) {
        console.error('Erro ao buscar publicação:', error.message);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar publicação.'
        });
    }
});

module.exports = router;