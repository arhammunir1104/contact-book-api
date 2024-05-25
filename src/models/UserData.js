require("dotenv").config();
let mongoose = require("mongoose");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");
let validator = require("validator");


let UserDataSchema  = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: [true, "Email already exists"]
    },
    password: {
        type: String,
        required: true
    },
    contacts: [{
        id: {
            type: Number
        },
        name:{
            type:String
        },
        email:{
            type: String
        },
        phone: {
            type: String
        },
    }],
    tokens :[{
        token: {
            type: String
        }
    }]
})

UserDataSchema.methods.generateAuthToken  = async function(){
    try{
        let token = jwt.sign({_id: this._id}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token: token});
        // console.log("Token Generated in Model 2", token); Checking if the token has been generated 
        await this.save()
        return(token)
    }
    catch(e){
        console.log("Auth generating Error");
    }
}

UserDataSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

let userData =  new mongoose.model("UserData", UserDataSchema);

module.exports = userData;