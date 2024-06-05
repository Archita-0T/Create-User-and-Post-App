const express = require('express');
const app = express();
const flash = require('connect-flash');
const expressSession = require('express-session');



const jwt = require('jsonwebtoken');
const userModel = require('./models/user');
const postModel = require('./models/post');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
app.set("view engine","ejs");
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: "hellllooo"
}))
app.use(flash());


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.render("index");
})
app.get('/login',(req,res)=>{
    res.render("login");
})

app.get('/profile', isLoggedIn, (req,res)=>{
    console.log(req.user);
    res.render("login");
})

app.post('/register',async (req,res)=>{
    let {name, username, email, password, age} = req.body;
    let user = await userModel.findOne({email});
    if (user) return res.status(500).render("registers");
    
    bcrypt.genSalt(10, (err,salt)=>{
        bcrypt.hash(password,salt, async (err,hash)=>{
            let user = await userModel.create({
                username,
                email,
                age,
                name,
                password:hash
            });

            let token = jwt.sign({email:email, userid:user._id}, "shhhh");
            res.cookie("token",token);
            res.render("register");
            

        })
    })

})

app.post('/login',async (req,res)=>{
    let {email, password} = req.body;
    let user = await userModel.findOne({email});
    if (!user) return res.status(500).render("flashone");
    
   bcrypt.compare(password, user.password, function(err, result){
    if(result){
        
        let token = jwt.sign({email:email, userid:user._id}, "shhhh");
            res.cookie("token",token);
            res.status(200).send("You can login");


    }
    else res.redirect('/login');
   })
   

})

app.get('/logout',(req,res)=>{
    res.cookie("token","");
    res.redirect("/login");
})

function isLoggedIn(req, res, next){
    if(req.cookies.token=="") res.send("You must be logged in!");
    else{
        let data= jwt.verify(req.cookies.token,"shhhh");
        req.user = data;
    }
    next();
}


app.listen(3000);