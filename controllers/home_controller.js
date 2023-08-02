
const User = require("../models/user");
const Company=require('../models/company');

// this is the default execution when you run the basic url home page
module.exports.home=async function(req,res)
{
    return res.render('home');
}
module.exports.add=async function(req,res)
{
    return res.render('create_company');
}
// this function will create the comapany along with the owner or admin.
module.exports.create=async function(req,res)
{
    try{
        let company=await Company.create({
            name:req.body.cname,
            description:req.body.description
        });
        if(req.body.password==req.body.cpassword)
        {
            let user=await User.create({
                name:req.body.name,
                email:req.body.email,
                company:company.id,
                type:'admin',
                password:req.body.password
            });
            company.employees.push(user);
            company.save();
        }
        return res.redirect('/');
    }
    catch(err)
    {
        console.log(err);
        return;
    }
}
