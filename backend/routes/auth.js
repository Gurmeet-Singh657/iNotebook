const express=require('express');
const User=require('../models/User')
const router=express.Router();
const {body,validationResult}=require('express-validator')
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken');
const { exists } = require('../models/User');
const JWT_SECRET='Gurmeetisagood$boy'
const fetchuser=require('../middleware/fetchuser')

// ROUTE 1: Create a User using: POST "/api/auth/createuser" No login required
router.post('/createuser',[
    body('name','Enter a valid Name').isLength({ min: 5 }),
    body('email','Enter a valid email').isEmail(),
    body('password','Password must be atleast 5 characters').isLength({ min: 5 })],
    async(req,res)=>{
    // if there are errors , return bad request and the errors
    const errors =validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    let success=false
    try{
        // check whether the user with this email already exists
        let user=await User.findOne({email:req.body.email});
        if(user)
        {
            return res.status(400).json({success,error:"Sorry a user with this email already exists"})
        }
        const salt=await bcrypt.genSalt(10);

        const secPass=await bcrypt.hash(req.body.password,salt)
        // if user doesn't exist , create a new user
        user=await User.create({
            name:req.body.name,
            password:secPass,
            email:req.body.email
        })
        // .then(user=>res.json(user))
        // .catch(err=>{console.log(err)
        // res.json({error:'Please enter a unique value for email',message:err.message})})

        // since id uniquely defines details
        const data={user:{id:user.id}}
        const authtoken=jwt.sign(data,JWT_SECRET)
        console.log(authtoken)
        success=true
        res.json({success,authtoken})
    }
    catch(error){
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

// ROUTE 2 : Authenticate a user using POST :/api/auth/login", No login required
router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot be blank').exists()],
    async(req,res)=>{
        const errors =validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    const {email,password}=req.body;
    let success=false
    try
    {
        let user=await User.findOne({email});
        if(!user)
        {
            return res.status(400).json({success,error:"Please try to login with correct Credentials"});
        }
        const passwordCompare=await bcrypt.compare(password,user.password);
        if(!passwordCompare)
        {
            return res.status(400).json({success,error:"Please try to login with correct Credentials"});
        }

        const data={user:{id:user.id}}
        const authtoken=jwt.sign(data,JWT_SECRET)
        success=true
        res.json({success,authtoken})
    }
    catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
})
// ROUTE 3 : Get logged in User Details using : POST "/api/auth/getuser". login required
router.post('/getuser',fetchuser,async(req,res)=>{
    try{
        const userId=req.user.id
        const user=await User.findById(userId).select("-password")
        res.send(user)
    }
    catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
})

module.exports=router

