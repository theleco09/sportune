require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

// Cliente para consultar dados respeitando o usuário autenticado.
function criarClienteUsuario(accessToken) {
    return createClient(supabaseUrl, supabaseKey, {
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
    });
}

function verificarLogin(req, res, next) {
    if (!req.session.usuario || !req.session.accessToken) {
        return res.redirect('/login');
    }

    next();
}

function encerrarSessao(req, res) {
    req.session.destroy(() => {
        res.redirect('/');
    });
}

function mostrarCadastro(res, tipo, erro) {
    return res.render('cadastro', { tipo, erro });
}

router.get('/login', (req, res) => {
    res.render('login', { erro: null });
});

router.get('/perfil', verificarLogin, (req, res) => {
    res.render('perfil', {
        usuario: req.session.usuario,
        tipo: req.session.tipo
    });
});

router.get('/logout', (req, res) => {
    encerrarSessao(req, res);
});

router.get('/perfil/editar', verificarLogin, (req, res) => {
    res.render('editar-perfil', {
        usuario: req.session.usuario,
        tipo: req.session.tipo,
        erro: null
    });
});

router.post('/perfil/editar', verificarLogin, async (req, res) => {
    const { nome, esporte, pais, experiencia } = req.body;
    const usuario = req.session.usuario;
    const tipo = req.session.tipo;
    const clienteUsuario = criarClienteUsuario(req.session.accessToken);

    if (!nome || !esporte || !pais ||
        (tipo === 'treinador' && !experiencia)) {
        return res.render('editar-perfil', {
            usuario,
            tipo,
            erro: 'Preencha todos os campos obrigatórios.'
        });
    }

    try {
        const { error: erroUsuario } = await clienteUsuario
            .from('usuarios')
            .update({ nome, pais })
            .eq('id', usuario.id);

        if (erroUsuario) throw erroUsuario;

        const tabelaPerfil = tipo === 'atleta'
            ? 'atletas'
            : 'treinadores';

        const dadosPerfil = tipo === 'atleta'
            ? { esporte }
            : { esporte, experiencia };

        const { error: erroPerfil } = await clienteUsuario
            .from(tabelaPerfil)
            .update(dadosPerfil)
            .eq('usuario_id', usuario.id);

        if (erroPerfil) throw erroPerfil;

        req.session.usuario = {
            ...usuario,
            nome,
            pais,
            esporte,
            ...(tipo === 'treinador' ? { experiencia } : {})
        };

        res.redirect('/perfil');
    } catch (error) {
        console.error('Erro ao editar perfil:', error.message);

        res.render('editar-perfil', {
            usuario,
            tipo,
            erro: 'Não foi possível atualizar o perfil.'
        });
    }
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: senha
        });

        if (error || !data.session) {
            return res.render('login', {
                erro: 'Email ou senha incorretos.'
            });
        }

        const clienteUsuario = criarClienteUsuario(
            data.session.access_token
        );

        const { data: perfil, error: erroPerfil } = await clienteUsuario
            .from('usuarios')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (erroPerfil || !perfil) {
            return res.render('login', {
                erro: 'Não foi possível carregar seu perfil.'
            });
        }

        const tabelaPerfil = perfil.tipo === 'atleta'
            ? 'atletas'
            : 'treinadores';

        const { data: detalhes, error: erroDetalhes } =
            await clienteUsuario
                .from(tabelaPerfil)
                .select('*')
                .eq('usuario_id', data.user.id)
                .single();

        if (erroDetalhes || !detalhes) {
            return res.render('login', {
                erro: 'Não foi possível carregar os dados do perfil.'
            });
        }

        req.session.usuario = {
            id: perfil.id,
            nome: perfil.nome,
            email: data.user.email,
            pais: perfil.pais,
            esporte: detalhes.esporte,
            ...(perfil.tipo === 'treinador'
                ? { experiencia: detalhes.experiencia }
                : {})
        };

        req.session.tipo = perfil.tipo;
        req.session.accessToken = data.session.access_token;
        req.session.refreshToken = data.session.refresh_token;

        res.redirect('/perfil');
    } catch (error) {
        console.error('Erro no login:', error.message);

        res.render('login', {
            erro: 'Ocorreu um erro ao entrar. Tente novamente.'
        });
    }
});

router.get('/cadastro', (req, res) => {
    const tipo = req.query.tipo;

    if (tipo !== 'atleta' && tipo !== 'treinador') {
        return res.redirect('/jornada');
    }

    res.render('cadastro', { tipo, erro: null });
});

router.post('/cadastro', async (req, res) => {
    const {
        nome,
        email,
        senha,
        esporte,
        pais,
        experiencia,
        tipo
    } = req.body;

    if (tipo !== 'atleta' && tipo !== 'treinador') {
        return res.redirect('/jornada');
    }

    if (
        !nome?.trim() ||
        !email?.trim() ||
        !senha ||
        !esporte?.trim() ||
        !pais?.trim() ||
        (tipo === 'treinador' && !experiencia?.trim())
    ) {
        return mostrarCadastro(
            res,
            tipo,
            'Preencha todos os campos obrigatórios.'
        );
    }

    if (senha.length < 6) {
        return mostrarCadastro(
            res,
            tipo,
            'A senha deve ter pelo menos 6 caracteres.'
        );
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: senha,
            options: {
                data: {
                    nome: nome.trim(),
                    tipo,
                    pais: pais.trim(),
                    esporte: esporte.trim(),
                    ...(tipo === 'treinador'
                        ? { experiencia: experiencia.trim() }
                        : {})
                }
            }
        });

        if (error) {
            console.error('Erro no cadastro:', error.message);

            return mostrarCadastro(
                res,
                tipo,
                'Não foi possível criar a conta. Verifique os dados e tente novamente.'
            );
        }

        // Sem sessão, o Supabase ainda exige uma etapa de confirmação.
        if (!data.session) {
            return mostrarCadastro(
                res,
                tipo,
                'Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.'
            );
        }

        const clienteUsuario = criarClienteUsuario(
            data.session.access_token
        );

        const { data: perfil, error: erroPerfil } = await clienteUsuario
            .from('usuarios')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (erroPerfil || !perfil) {
            console.error(
                'Conta criada, mas o perfil não foi carregado:',
                erroPerfil?.message
            );

            return mostrarCadastro(
                res,
                tipo,
                'A conta foi criada, mas houve um problema ao carregar o perfil. Tente entrar pela página de login.'
            );
        }

        const tabelaPerfil = tipo === 'atleta'
            ? 'atletas'
            : 'treinadores';

        const { data: detalhes, error: erroDetalhes } =
            await clienteUsuario
                .from(tabelaPerfil)
                .select('*')
                .eq('usuario_id', data.user.id)
                .single();

        if (erroDetalhes || !detalhes) {
            console.error(
                'Erro ao carregar os detalhes:',
                erroDetalhes?.message
            );

            return mostrarCadastro(
                res,
                tipo,
                'A conta foi criada, mas não foi possível carregar os dados do perfil. Tente entrar pela página de login.'
            );
        }

        req.session.usuario = {
            id: perfil.id,
            nome: perfil.nome,
            email: data.user.email,
            pais: perfil.pais,
            esporte: detalhes.esporte,
            ...(tipo === 'treinador'
                ? { experiencia: detalhes.experiencia }
                : {})
        };

        req.session.tipo = tipo;
        req.session.accessToken = data.session.access_token;
        req.session.refreshToken = data.session.refresh_token;

        res.redirect('/perfil');
    } catch (error) {
        console.error('Erro inesperado no cadastro:', error.message);

        mostrarCadastro(
            res,
            tipo,
            'Ocorreu um erro inesperado. Tente novamente.'
        );
    }
});

module.exports = router;
