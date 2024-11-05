const mongoose = require("mongoose");

const savingSchema = new  mongoose.Schema({
    savingAmount:{
        type:Number,
        reuired:true
    }
})

const Saving = mongoose.model("saving",savingSchema)
module.exports = Saving