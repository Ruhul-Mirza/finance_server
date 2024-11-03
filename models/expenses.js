const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    home: {
        type: String,
        required: true,
    },
    rentAmount: {
        type: Number,
        default: 0,
    },
    foodAmount: {
        type: Number,
        required: true,
    },
    entertainmentAmount: {
        type: Number,
        required: true,
    },
    utilitiesAmount: {
        type: Number,
        required: true,
    },
    personalAmount: {
        type: Number,
        required: true,
    },
    othersAmount: {
        type: Number,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
