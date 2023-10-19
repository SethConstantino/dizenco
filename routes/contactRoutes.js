//packages
const contactRoute=require('express').Router();

//imports from models
const Contact=require('../models/contactShema');
const Dates=require('../models/dates');
const Products=require('../models/brands');
const Functions=require('../models/functions');
const {isLoggedIn}=require('../models/functions');
const functions = require('../models/functions');
const errors=[];

//new contact form (ready)
contactRoute.get('/newContact', (req, res)=>{
    //console.log(Families)
    res.render('newContact', {Family:Products});
});

//save new contact (ready)
contactRoute.route('/newContact').post(async (req, res)=>{
    var brands=[]
    const {Herradura, Tokai, Bic, Arbol_Verde, Panasonic, Quala, Maruchan, Mead_Johnson, Reckitt, AJEMex, Dorco}=req.body;
    brands.push(Herradura, Tokai, Bic, Arbol_Verde, Panasonic, Quala, Maruchan, Mead_Johnson, Reckitt, AJEMex, Dorco)
    brands=Functions.saveProducts(brands)

    const contact=new Contact({
        name:Functions.toLower(req.body.name),
        email:req.body.email,
        phone:req.body.phone,
        text:req.body.text,
        company:req.body.company,
        state:req.body.state,
        families:brands[0],
        products:brands[1],
        distributionChannel:req.body.distributionChannel
    });
    await contact.save();

    res.redirect('https://dizenco.com.mx/')
});

//show unattended contacts (ready)
contactRoute.route('/showContacts').get(isLoggedIn, async (req, res)=>{
    const contact=await Contact.find({status:true})
    if(contact) {
        res.render('showContacts',{Contacts:Functions.tempContact(contact), months:Dates.Months, Status:true, Role:req.session.role}) 
    } else {
        errors.push("Hubo un problema, recargue la página")
        res.redirect('/contact/404')
    }
});

//show attended contacts (ready)
contactRoute.route('/showContactsAttended').get(isLoggedIn, async (req, res)=>{
    const contact=await Contact.find({status:false})
    if(contact) {
        res.render('showContacts', {Contacts:Functions.tempContact(contact), months:Dates.Months, Status:false, Role:req.session.role}) 
    } else {
        errors.push("Hubo un problema, recargue la página")
        res.redirect('/contact/404')
    }
});

//mark a contact as attended (ready)
contactRoute.route('/markAsAttended/:id').get(isLoggedIn, async (req, res)=>{
    const contact=await Contact.findByIdAndUpdate(req.params.id, {
        $set:{
            status:false,
            attendanceDate:Date.now()
        }
    }, {new:true})
    if(contact) {
        res.redirect('/contact/showContacts')
    } else {
        errors.push("Hubo un problema, recargue la página")
        res.redirect('/contact/404')
    }
});

//mark a contact as unattended ()
contactRoute.route('/unmarkAsAttended/:id').get(isLoggedIn, async (req, res)=>{
    const contact=await Contact.findByIdAndUpdate(req.params.id, {
        $set:{
            status:true,
            attendanceDate:null
        }
    }, {new:true})
    if(contact) res.redirect('/contact/showContactsAttended')
    else {
        errors.push("Hubo un problema, recargue la página")
        res.redirect('/contact/404')
    }
});

contactRoute.get('/404', (req, res)=>{
    res.render('404', {error:errors.pop()});
});


module.exports=contactRoute;