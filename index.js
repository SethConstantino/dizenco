//paquetes
const express=require('express');
const mongoose=require('mongoose');
const session=require('express-session');
const path=require('path');

//routes & objects
const User=require('./routes/userRoutes');
const Contact=require('./routes/contactRoutes');
const logIn=require('./models/functions').logIn;

//app configuration
const app=express();
app.set('port', process.env.PORT||8080);

app.use('/static',express.static(path.join(__dirname,"static")));

mongoose.connect('mongodb+srv://seth_c_99:dizenco@cluster0.lehnzxp.mongodb.net/dizencoApp?retryWrites=true&w=majority', 
{useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{
    console.log("Conexión con Mongo exitosa");
})
.catch((err)=>{
    console.log("La conexión falló, error: "+err);
});

app.use(session({
    secret:"proyecto Dizenco",
    resave:true,
    saveUninitialized:true
}));

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended:true}));

//login & logout
app.get('/', (req, res)=>{
    res.render('login', {error:""});
});
app.route('/login').post(logIn, (req, res)=>{
    req.session.role ? res.redirect('/user/showUsers') : res.redirect('/contact/showContacts');
});
app.get('/logout', (req, res)=>{
    req.session.destroy();
    res.redirect('/');
});

//routes for users & contacts
app.use('/user', User);
app.use('/contact', Contact);

app.listen(app.get('port'), console.log('Servidor activo en localhost'));


