const express = require('express');

const app = express();

app.set('view engine', 'ejs');

const PORT = 3333;

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const atletasRouter = require('./routes/atletas');
const treinadoresRouter = require('./routes/treinadores');
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', atletasRouter);
app.use('/', treinadoresRouter);


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});