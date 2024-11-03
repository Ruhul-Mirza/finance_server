const mongoose = require("mongoose");
const validator = require("validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const secretKey = "mirzaruhulnazirhussain12345678910"
const userSchema = mongoose.Schema({
    fname:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error("Please Enter A Valid email")
            }
        }
    },
    password:{
        type:String,
        minlength:6,
        required:true
    },
    cpassword:{
        type:String,
        minlength:6,
        required:true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ]
    
})


userSchema.pre("save", async function(next){
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 13);
        this.cpassword = await bcrypt.hash(this.cpassword, 13);
    }
    
    next()
})

// token
userSchema.methods.generateAuthtoken = async function() {
    try {
        let tokenGenerated = jwt.sign({_id:this._id},secretKey)
        // if (!this.tokens) {
        //     this.tokens = [];
        // }
        this.tokens = this.tokens.concat({token:tokenGenerated})
        await this.save();
        return tokenGenerated;
    } catch (error) {
        console.error("Error generating token:", error); 
        throw new Error("Token generation failed");
    }
}
const User = new mongoose.model("user",userSchema)
module.exports = User;