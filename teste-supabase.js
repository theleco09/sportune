
const supabase = require('./supabase');

async function testarConexao() {
    const { data, error } = await supabase
        .from('usuarios')
        .select('id')
        .limit(1);

    if (error) {
        console.error('Erro ao conectar:', error.message);
        return;
    }

    console.log('Conexão com o Supabase funcionando!');
    console.log('Consulta executada com sucesso.');
}

testarConexao();
