//packages
const userRoute=require('express').Router();

//models
const User=require('../models/userSchema');
const Dates=require('../models/dates');
const Functions=require('../models/functions');
const {isAdmin, isLoggedIn, encrypt, match}=require('../models/functions');
const errors=[];

//new user register (ready)
userRoute.route('/newUser').get(isAdmin, (req, res)=>{
    res.render('newUser', {days:Dates.Day, months:Dates.Month, years:Dates.Year, namedMonths:Dates.Months, error:errors, Role:req.session.role});
    while(errors.length>0) errors.pop();
});

//new user saving (ready)
userRoute.route('/newUser').post(isAdmin, async (req, res)=>{
    const userEmail=await User.findOne({email:req.body.email});
    if(userEmail){
        errors.push({errorMessage:"El correo ingresado ya está asociado a otra cuenta"});
        res.redirect('/user/newUser');
    }else{
        const encryptedPassword=await encrypt('Dizenco');
        var user=new User({
            name:Functions.toLower(req.body.name),
            lastName:Functions.toLower(req.body.lastName),
            phone:req.body.phone,
            email:req.body.email,
            password:encryptedPassword,
            birthDate:req.body.birthYear+"-"+req.body.birthMonth+"-"+req.body.birthDay,
            admissionDate:req.body.admissionYear+"-"+req.body.admissionMonth+"-"+req.body.admissionDay,
            objective:req.body.objective,
            role:req.body.radioBtn
        });
        await user.save();
        res.redirect('/user/showUsers');
    }
});

//show active users (ready)
userRoute.route('/showUsers').get(isAdmin, async (req, res)=>{
    const users=await User.find({status:true});
    if(!users.length<=0) {
        res.render('showUsers',{users:Functions.tempUser(users), months:Dates.Months, Status:true, Role:req.session.role})
    } else {
        res.render('showUsers',{users:"", months:Dates.Months, Status:true, Role:req.session.role})
    }
});

//show inactive users (ready)
userRoute.route('/showUsersDeleted').get(isAdmin, async (req, res)=>{
    const users=await User.find({status:false});
    if(!users.length<=0) {
        res.render('showUsers',{users:Functions.tempUser(users), months:Dates.Months, Status:false, Role:req.session.role})
    } else {
        res.render('showUsers',{users:users, months:Dates.Months, Status:false, Role:req.session.role})
    }
});

//reactivate deleted users (ready)
userRoute.route('/reactivateUser/:id').get(isAdmin, async (req, res)=>{
    const encryptedPassword=await encrypt('Dizenco')
    await User.findByIdAndUpdate(req.params.id, {$set:{status:true, password:encryptedPassword}}, {new:true}).catch(Error=>{
        errors.push(Error);
        res.redirect('/user/404');
    });
    res.redirect('/user/showUsersDeleted');
});

//update users (ready)
userRoute.route('/updateUser/:id').get(isAdmin, async (req, res)=>{    
    const user=await User.findById(req.params.id).catch(Error=>{
        errors.push(Error);
        res.redirect('/user/404');
    });
    if(user) {
        user.name=Functions.capitalize(user.name);
        user.lastName=Functions.capitalize(user.lastName);
        res.render('updateUser', {User:user, days:Dates.Day, months:Dates.Month, years:Dates.Year, namedMonths:Dates.Months, error:errors, Role:req.session.role});
        while(errors.length>0) errors.pop();
    }
    
});

//save updated users (ready)
userRoute.route('/updateUser').post(isAdmin, async (req, res)=>{
    const user=await User.find({email:req.body.email});
    if(user.length==0) {
        await User.findByIdAndUpdate(req.body.id, {
            $set:{
                name:Functions.toLower(req.body.name),
                lastName:Functions.toLower(req.body.lastName),
                phone:req.body.phone,
                email:req.body.email,
                birthDate:req.body.birthYear+"-"+req.body.birthMonth+"-"+req.body.birthDay,
                admissionDate:req.body.admissionYear+"-"+req.body.admissionMonth+"-"+req.body.admissionDay,
                objective:req.body.objective,
                role:req.body.radioBtn
            }
        }, {new:true}).catch(Error=>{
            errors.push(Error);
            res.redirect('/user/404');
        });
        res.redirect('/user/showUsers');
        while(errors.length>0) errors.pop();
    } else {
        if(user[0].id==req.body.id){
            await User.findByIdAndUpdate(req.body.id, {
                $set:{
                    name:Functions.toLower(req.body.name),
                    lastName:Functions.toLower(req.body.lastName),
                    phone:req.body.phone,
                    email:req.body.email,
                    birthDate:req.body.birthYear+"-"+req.body.birthMonth+"-"+req.body.birthDay,
                    admissionDate:req.body.admissionYear+"-"+req.body.admissionMonth+"-"+req.body.admissionDay,
                    objective:req.body.objective,
                    role:req.body.radioBtn
                }
            }, {new:true}).catch(Error=>{
                errors.push(Error);
                res.redirect('/user/404');
            });
            res.redirect('/user/showUsers');
            while(errors.length>0) errors.pop();
        } else {
            errors.push('El correo ya esta asociado a otra cuenta, pruebe con uno diferente')
            res.redirect('/user/updateUser/'+req.body.id)
        }
    }
});

//delete user (ready)
userRoute.route('/deleteUser/:id').get(isAdmin, async (req, res)=>{
    await User.findByIdAndUpdate(req.params.id, {$set:{status:false}}, {new:true}).catch(Error=>{
        errors.push(Error);
        res.redirect('/user/404');
    });
    res.redirect('/user/showUsers');
});

//change password or other user info (ready)
userRoute.route('/updateProfileInfo').get(isLoggedIn, async (req, res)=>{
    res.render('updateProfileInfo', {Role:req.session.role, error:errors});
    while(errors.length>0) errors.pop();
});

//save new user password (ready)
userRoute.route('/updateProfilePassword').post(isLoggedIn, async (req, res)=>{
    const {oldPassword, newPassword}=req.body;
    const user=await User.findOne({id:req.session.id});
    if(user){
        const matchPassword=await match(oldPassword, user.password)
        if(matchPassword) {
            const encryptedPassword=await encrypt(newPassword)
            await User.findByIdAndUpdate(user.id, {$set:{password:encryptedPassword}}, {new:true})
            .catch(Error=>{
                errors.push(Error);
                res.redirect('/user/404')
            })
            res.redirect('/user/showUsers')
        } else {
            errors.push('Error al guardar la nueva contraseña, intente nuevamente')
            res.redirect('/user/updateProfileInfo')
        }
    }
});

userRoute.get('/404', (req, res)=>{
    res.render('404', {error:errors.pop()});
});

module.exports=userRoute;

