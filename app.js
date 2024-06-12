
require("dotenv").config();
let express= require("express");
let app = express();
let port = process.env.PORT;
app.use(express.json())
let db = require("./src/db/db")
let UserData = require("./src/models/UserData")
let bcrypt = require("bcryptjs")
let verification = require("./middleware/verification");
let cors = require("cors")
let bodyParser = require('body-parser');


// Cors Setup 
let corsOptions = {
    origin: 'https://contact-book-63496.web.app',
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
    creddentials: true,
    optionsSuccessStatus: 204
}
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
app.use(cors(corsOptions))


app.get("/", (req, res)=>{
    res.send("hello wordl")
})

app.post("/verify", (req, res)=>{
    async function v(){
        let {token} = req.body;
        try{
            let verify = await verification({token: token});
            console.log(verify);
            
            if(verify.verified === true  || verify.verified){
                res.status(200).json({msg: "LoggedIn", verified: true})
            }
            else{
                res.status(400).json({msg: "Login First", verified: false})

            }
        }
        catch(e){
            console.log("Verification Error", e);
        }
    };
    v();
});

app.post("/register", (req, res)=>{
    // console.log(req.body);
    async function insertdata(){
        let {name, email, password} = req.body;
        try{
            let data = await UserData.create({
                name: name,
                email: email,
                password: password
            });
            let token = await data.generateAuthToken();
            console.log("Token in Backend", token); // Checking if token is retrieveing in backend 
            console.log("Data Saved", data);  // Checking if data is saved in database
            res.status(201).json({msg: "Account Created Successfully", token : token, verified: true, cause : true});
        }
        catch(e){
            if(e.code === 11000){
                console.log("Email is already exists");
                res.status(400).json({msg: "Email is already exists", verified :false, cause : true});
                
                // res.send("Email Already Exists")
            }
            else{
                console.log("Inserting Data Error", e.message);
                res.status(400).json({msg: "Server Error, Please Try Again Later!", verified :false, cause : true});
            }
        }
    }
    insertdata();
})




app.post("/login", cors(corsOptions) ,(req, res)=>{
    async function getData (){
        let {email, password} = req.body;
        console.log(req.body);
        console.log("BODY", req.body);
        console.log("Email", req.body.email);
        try{
            let data= await UserData.findOne({email: email});
            console.log(data);
            if(data !== null){
            console.log(data);
            let verify = await bcrypt.compare(password, data.password);
            if(verify === true){
                let token = await data.generateAuthToken();
                res.status(200).json({verified : true, msg: "Login Successfully", token: token});
            }
            else{
                res.status(400).json({verified : false ,msg: "Wrong Password"});
            }
            }
            else{
                res.send({msg: "Accound not found"});
            }
        }
        catch(e){
            console.log("Login Data Fetching Error", e);
        }
    };
    getData()
});

app.post("/getContacts", (req, res)=>{
    async function getContacts(){
        try{
            let {token} = req.body;
            // console.log(token);
            let verify = await verification({token: token});
            if(verify.verified === true  || verify.verified ){
                let data = await UserData.findOne({_id: verify._id}).select({contacts: 1});
                res.status(200).json({data: data})
            }
            console.log(verify);

        }
        catch(e){
            console.log("Fetching Contacts Data Error", e);
        }
    };
    getContacts();
});


app.post("/createContact", (req, res)=>{
    async function createContact(){
        let {token, name, email, phone} = req.body;
        console.log(req.body)
        try{
            let verify = await verification({token: token});
            if(verify.verified === true  || verify.verified){
                console.log(verify)
                let data = await UserData.findOne({_id: verify._id});
                // console.log(c);
                // console.log(data);
                console.log(data);
                i = data.contacts.length;
                let contact = {
                    id: ++i,
                    name : name,
                     email: email,
                      phone: phone,
                }
                // console.log(data.contacts.length)
                data.contacts.push(contact);
                await data.save()
                console.log(data);
                console.log("Data Saved Successfully");
                res.status(200).json({msg: "Data Saved Successfully"});
            }
            else{
                res.status(400).json({msg: "Account Error, Login Again"})
            }
        }
        catch(e){
            console.log("Creating Contact Error" , e);
        }
    };
    createContact()

});

app.post("/updateContact", (req, res)=>{
    async function updateContact(){
        try{
            // console.log(req.body);
            let {token, id, name, email, phone} = req.body;
            let verify = await verification({token: token});
            if(verify.verified === true || verify.verified){
                let data = await UserData.findOne({_id: verify._id})
                let contacts = data.contacts;
                
                let a = contacts.map((value, i)=>{
                    if(id === i){
                        // value.name = name;
                        // value.email = email;
                        // value.phone = phone;
                        // return(value)
                        return({id:id ,name: name, email: email, phone: phone});
                    }
                    else{
                        return(value)   
                    }
                });
                // console.log( "A", a); //Checking if the retrieving correct data from mapping
                let update_data = await UserData.findByIdAndUpdate({_id: verify._id},{
                    $set:{
                        contacts : a
                    }
                }, {
                    new: true,
                });
                // console.log(update_data); //Checking if the data has been updated
                res.status(200).json({msg: "Data Updated Successfully"});

            }
            else{
                res.status(400).json({msg: "Login First"})
            }
        }
        catch(e){
            console.log("Updating Contact Error",e );
        }
    };
    updateContact();
})

app.post("/deleteContact", (req, res)=>{
    let {token, id} = req.body;
    async function deletContact(){
        try{
            
            let verify = await verification({token: token});
            console.log(req.body);

            if(verify.verified){
                let data = await UserData.findOne({_id: verify._id});
                let contacts = data.contacts;
                let a = contacts.filter((value, i)=>{
                    if(id !== i){
                        return(value)  
                    }
                })
                let delete_data = await UserData.findByIdAndUpdate({_id: verify._id},{
                    $set:{
                        contacts : a
                    }
                }, {
                    new: true,
                });
                console.log(delete_data); //Checking if the data has been updated
                res.status(200).json({msg :"Data Deleted Successfully"});
            }
            else{
                res.status(400).json({msg : "Login First!"})
            }
        }
        catch(e){
            console.log("Data Deleting Error", e);
        }
    };
    deletContact();  
})

app.post("/logout", (req, res)=>{
    console.log(req.body);
    let {token} = req.body
   async function logoutUser(){
        try{
            let verify = await verification({token: token});
            let delete_data = await UserData.findByIdAndUpdate({_id: verify._id},{
                $set:{
                    tokens : []
                }
            }, {
                new: true,
            });
                res.status(200).json({msg: "Logged Out"}) //Checking if the data has been updated
        }
        catch(e){
            console.log("Logout User Error", e);
        }
    };
    logoutUser();
})

app.listen(port, ()=>{
    console.log(`Serve is active on port ${port}`);
})