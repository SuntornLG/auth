const router = require('express').Router();
const User = require('../models/User');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validation');

router.post('/register', async (req, res) => {

    // Validate data before crate new user
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    // Check if user already in db.
    const emailExist = await User.findOne({email: req.body.email });

    if(emailExist) return res.status(400).send('Email already exist');
  
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //Create user model
    const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashPassword
    });

    try{

        const saveUser = await user.save();
        return res.send({user: user._id});

    }catch(err){
        return  res.status(400).send(err);
    }

});

router.post('/login', async (req, res) => {

    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({email: req.body.email });
    if(!user) return res.send(400).send('Invalid email or password!');

    // Check if password correct
    const validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass) return res.send(400).send('Invalid email or password!');

    // ceate and assign a token
    // Add claims
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('bearer', token).send(token);
});


module.exports = router;
