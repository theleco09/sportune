const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// Listar publicações
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

module.exports = router;