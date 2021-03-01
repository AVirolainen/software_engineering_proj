const {Router} = require("express")
const bcrypt = require("bcryptjs")
const config = require("config")
const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const User = require("../models/User")

const router = Router()


router.post("./register", 
    [
        check("email", "Email is not correct").isEmail(),
        check("password", "Min length of password is 6").isLength({min: 6})

    ],
    async(req, res)=>{
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: "There are some issues"})
        }

        const {email, password} = req.body
        const candidate = await User.findOne({email: email})

        if (candidate){
            return res.status(400).json({message: `Email ${email} is already used`})
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({email: email, password: hashedPassword})
        await user.save()

        res.status(201).json({message: "New user has been created"})


    }catch(e){
        res.status(500).json({message: "Oh, something is wrong("})
    }
})

router.post("./login",
    [
        check("email", "Email is not correct").isEmail()
    ],
    async(req, res)=>{
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: "There are some issues"})
        }

        const {email, password} = req.body
        
        const user = await User.findOne({email: email})

        if (!user){
            res.status(400).json({message: "There is no account with such email"})
        }
        
        const isMatch = bcrypt.compare(password, user.password)
        if (!isMatch){
            res.status(400).json({message: "Wrong password"})
        }

        const token = jwt.sign(
            {userId: user.id},
            config.get("jwtSecret"),
            {expiresIn: "1h"}
        )

        res.json({token, userId: user.id})


    }catch(e){
        res.status(500).json({message: "Oh, something is wrong("})
    }
})

module.exports = router