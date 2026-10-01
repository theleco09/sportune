const express = require('express');
const session = require('express-session');
const app = express();

app.use(session({
    secret: 'sportune-secreto',
    resave: false,
    saveUninitialized: false
}));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario;
    res.locals.tipo = req.session.tipo;

    next();
});

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