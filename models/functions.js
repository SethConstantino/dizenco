const User=require('../models/userSchema');
const bcrypt=require('bcryptjs');
const enigma=require('enigma-code');
const errors=[];

function toLower(text){
    var arr=[];
    arr=text.split(" ");
    for(var i=0; i<arr.length; i++) arr[i]=arr[i].toLowerCase();
    text="";
    for(var i=0; i<arr.length; i++){
        if(!(i<arr.length-1)) {
            text=text+arr[i];
            break;
        }
        text+=arr[i]+" ";
    }
    return text;
}

function capitalize(text){
    var arr=[];
    arr=text.split(" ");
    for(var i=0; i<arr.length; i++){
        str=arr[i];
        firstLetter=str.substring(0, 1);
        firstLetter=firstLetter.toUpperCase();
        restLetters=str.substring(1, str.length);
        str=firstLetter+restLetters;
        arr[i]=str;
    }
    text="";
    for(var i=0; i<arr.length; i++){
        if(!(i<arr.length-1)) {
            text+=arr[i];
            break;
        }
        text=text+arr[i]+" ";
    }
    return text;
}

function tempUser(users){
    users.forEach(temp=>{
        temp.name=capitalize(temp.name);
        temp.lastName=capitalize(temp.lastName);
    });
    return users;
}

function tempContact(contact){
    contact.forEach(temp=>{
        temp.name=capitalize(temp.name);
    });
    return contact;
}

function saveProducts(data){
    families=[], products=[], product=[], i=0
    while(i<data.length){
        if(data[i].length==1){
            i++
            continue
        } else {
            families.push(data[i][0])
            product=[]
            for(j=1; j<data[i].length; j++){
                product.push(data[i][j])
            }
            products.push(product)
            i++
        }
    }
    return [families, products]
}

async function logIn(req, res, next) {
    const errors=[];
    const user=await User.findOne({email:req.body.email});
    if(user){
        const matchPassword=await match(req.body.password, user.password);//esto devuelve true o false
        if(matchPassword && user.status) {
            var arr=[];
            var aux=capitalize(user.name);
            arr=aux.split(" ");
            var userName=arr[0]+" ";
            aux=capitalize(user.lastName);
            arr=aux.split(" ");
            userName+=arr[0];
            req.session.id=user.id;
            req.session.role=user.role;
            req.session.logged=true;
            return next();
        } else {
            errors.push("El correo o la contraseña no coinciden con ningún registro");
            res.render('login', {error:errors});
            while(errors.length>0) errors.pop();
        }
    } else {
        errors.push("El correo o la contraseña no coinciden con ningún registro");
        res.render('login', {error:errors});
    }
}

function isLoggedIn(req, res, next) {
    if (req.session.logged) return next();
    res.redirect('/');
}

function isAdmin(req, res, next){
    if(req.session.role && req.session.logged) return next();
    res.redirect('/contact/showContacts');
}

async function encrypt(plainPassword){
    const hash=await bcrypt.hash(plainPassword, 10);
    return hash;
}

async function match(plainPassword, hashPassword){
    return await bcrypt.compare(plainPassword, hashPassword);
}

const functions={
    toLower,
    capitalize,
    tempUser,
    tempContact,
    saveProducts,
    encrypt,
    match,
    logIn,
    isLoggedIn,
    isAdmin
}

module.exports=functions;