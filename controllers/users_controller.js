const User = require("../models/user");
const Company=require('../models/company');
const Feedback=require('../models/feedback');

//this function will fetch all the employees of the given company
module.exports.profile =async function(req, res){
    const users=await User.find({}).
    populate({path:'feedbackRecieved',}).
    populate({
        path:'feedbackPending'
       
    }).populate('company');
    let company=await Company.findById(req.user.company).
    
    populate({ 
        path: 'employees',populate:{path: 'feedbackpending'},
        populate: {
          path: 'feedbackRecieved',
          populate:{
            path: 'sender'
          },
          
          
        } 
     });
     // the pruser will fetch the user who logged in
    let pruser=await User.findById(req.user.id).populate('company').
    populate({
        path: 'feedbackRecieved',
        populate:{
          path: 'sender'
        },
        
        
      }).populate('feedbackPending'); 
    
      return res.render('user_profile',
      {
        title:'user-profile',
        users:company.employees,
        pruser:pruser
        
      });
    }
    
module.exports.update= async function(req,res)
{
    if(req.user.id==req.params.id)
    {
        try{
            let user= await User.findById(req.params.id);
            User.uploadedAvatar(req,res,function(err){
                if(err)
                {
                    console.log('***multer error',err)
                }
                console.log('re.file',req.file);
                user.name=req.body.name;
                user.email=req.body.email;
                if(req.file)
                {
                    user.avatar=User.avatarPath+'/'+req.file.filename;
                }
                user.save();
                return res.redirect('back');
            });
        }
        catch(err){
            req.flash('error',err);
            return res.redirect('back');
        }
        
    }
    else
    {
        return res.status(401).send('unauthorized');
    }
}

module.exports.signUp =async function(req, res){
    let user=await User.findById(req.user.id).populate('company')
    
    return res.render('user_sign_up', {
        user:user
    })
}

module.exports.signIn =async function(req, res){
    let company=await Company.find();
    console.log(company);
    if(company.length>0)
    {
    if(req.isAuthenticated())
    {
        return res.redirect('/users/profile');
    }
    console.log(company!=null);
    return res.render('user_sign_in', {
        title: "Social | Sign In"
    })
    }
    else
    {
        req.flash('success','create the company first')
        return res.redirect('/');
    }
}

// this function will create the new user
module.exports.create =async function(req, res){
    console.log("routes final");
    console.log(req.body.password);
    console.log(req.body.confirm_password);
    console.log(req.body.cpassword==req.body.password);
    if (req.body.password != req.body.cpassword){
        console.log('error');
        return res.redirect('back');
    }

    
        
    try{
        let user=await User.findOne({email: req.body.email});
        let company=await Company.findOne({name: req.body.company});
        if (!user){
            let result=await User.create({
                email:req.body.email,
                password:req.body.password,
                name:req.body.name,
                type:'employee',
                company:company.id
            })
            company.employees.push(result);
            company.save();   

                return res.redirect('/users/sign-in');
            }
        else
        {
            return res.redirect('back');
        }
    }
    catch(err){
        console.log(err);
        console.log('error in creating user while signing up'); 
        return;
    }
    
}

// this function will create the session for the user who logged in
module.exports.createSession =function(req, res){
    
    req.flash('success','logged in successfully');
    return res.redirect('/users/profile');
        
 
}
// this function will delete the session when user logout.
module.exports.destroySession=function(req,res,next){
    
    req.logout(function(err){
        if(err)
        {
            return next(err);
        }
    });
    req.flash('success','logged out successfully');
    
    return res.redirect('/');
}
// this function will fetch the employee given in the url.
module.exports.update=async function(req,res){
    
    let user=await User.findById(req.params.id).
    populate('company').
    populate({ 
        path: 'feedbackRecieved',
        populate: {
          path: 'sender'
          
        } 
     }).
    populate({
        path:'feedbackPending'
       
    });
    return res.render('employee',{
        user:user
        
    })
}
// this function will update the existing user data
module.exports.edit=async function(req,res)
{
    try
    {
        console.log(req.body);
        console.log(req.params.id);
        let user=await User.findByIdAndUpdate(req.params.id, 
            { name:req.body.name,
            email:req.body.email,
            rating:req.body.rating,
            type:req.body.type });
            console.log(user);
        return res.redirect('/users/profile');
    }
    catch(err)
    {
        console.log(err);
        return;
    }
}
// function will delete the data using id in the params
module.exports.delete=async function(req,res)
{
    try{
        let user = await User.findById(req.params.id);
        for(let feedback of user.feedbackRecieved)
        {
            await Feedback.findByIdAndDelete(feedback);
        }
        let feedbacks=await Feedback.find({sender:user.id});
        for(let feed of feedbacks)
        {
            await Feedback.findByIdAndDelete(feed.id);
        }
        let company=await Company.findByIdAndUpdate(user.company,{$pull:{employees:user.id}});
            await User.findByIdAndDelete(user._id);
            return res.redirect('back');
    }
    catch(err)
    {
        console.log(err);
        return;
    }
}
module.exports.addFeedbackrequest=async function(req,res)
{
    try{
        
        let result=await User.findById(req.params.id);
        let users=await User.find({'company':result.company});
        
        console.log(users);
        for(let user of users)
        {
            if(user.id!=req.params.id && user.type!="admin")
            {
                result.feedbackPending.push(user);
                
            }
        }
        result.save();
        req.flash('success','feedback request sent successfully')
        return res.redirect('back');
    }
    catch(err)
    {
        console.log(err);
        return;
    }
}
let mainuser;
module.exports.addFeedback=async function(req,res)
{
    try{
        let user=await User.findById(req.params.id);
        let curuser=res.locals.user;
        mainuser=curuser;
        return res.render('feedback',{
            user:user,
            curuser:curuser
        });
    }
    catch(err)
    {
        console.log(err);
        return;
    }
}
module.exports.createFeedback=async function(req,res)
{
    try{
        console.log(req.body);
        let recuser=await User.findById(req.params.id);
        let senduser=await User.findById(mainuser.id);
        let feedback=await Feedback.create({
            sender:senduser.id,
            reciever:recuser.id,
            about:req.body.about,
            rating:req.body.rating
        })
        recuser.feedbackRecieved.push(feedback);
        recuser.save();
        await User.findByIdAndUpdate(senduser.id,{$pull:{feedbackPending:req.params.id}});
        return res.redirect('/users/profile');
    }
    catch(err)
    {
        console.log(err);
        return;
    }
    
}
module.exports.newFeedback=async function(req,res)
{
    let feedbacks=await Feedback.find({sender:req.params.id});
    for(let feed of feedbacks)
    {
        await User.findByIdAndUpdate(feed.reciever,{$pull:{feedbackRecieved:feed.id}});
        await Feedback.findByIdAndDelete(feed.id);
    }
    let user=await User.findById(req.params.id);
    user.feedbackPending.splice(0,user.feedbackPending.length);
    user.save();
    return res.redirect('/users/employee/feedbackrequest/'+req.params.id);
}