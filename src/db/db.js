let mongoose = require("mongoose");
require("dotenv").config()
mongoose.connect("mongodb+srv://admin123:CPZIzsRoKVTbnSmA@cluster0.csosm2n.mongodb.net").then(()=>{
    console.log("Database Connected");
}).catch((e)=>{
    console.log("Database Error", e);
})