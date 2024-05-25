let mongoose = require("mongoose");
require("dotenv").config()
mongoose.connect(process.env.DB_URL).then(()=>{
    console.log("Database Connected");
}).catch((e)=>{
    console.log("Database Error", e);
})