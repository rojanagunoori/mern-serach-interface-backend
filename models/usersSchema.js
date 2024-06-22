const mongoose = require("mongoose")
const validator = require("validator")

const usersSchema = new mongoose.Schema({
    fname: {
        type: String,
        reqired: true,
        trime: true
    },
    lname: {
        type: String,
        reqired: true,
        trime: true
    }, email: {
        type: String,
        reqired: true,
        unique: true,
        validator(value) {
            if (!validator.isEmail(value)) {
                throw Error("not valid email")
            }
        }
    },
    mobile: {
        type: String,
        reqired: true,
        unique: false,
        minlength:10,
        maxlength:10
    },gender:{
        type: String,
        reqired: true,
    },
   
    status:{
        type: String,
        reqired: true,  
    },
    profile:{
        type: String,
        reqired: true,
    },
    location:{
        type: String,
        reqired: true,
    },
    dateCreated:Date,
    dateUpdated:Date
})

usersSchema.index({ mobile: 1 }, { unique: false });

//model
const users=new mongoose.model("users",usersSchema)

module.exports=users