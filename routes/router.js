const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const Expense = require("../models/expenses")
const Saving = require("../models/savings")
const router = express.Router();
const authenticate = require("../middleware/authenticate")
const authMiddleware = require('../middleware/auth')

router.post("/register", async (req, res) => {
    const { fname, email, password, cpassword } = req.body;

    if (!fname || !email || !password || !cpassword) {
        return res.status(400).json({ error: "Fill all the details" });
    }

    try {
        // Correct email 
        const alreadyUser = await User.findOne({ email: email });
        
        if (alreadyUser) {
            return res.status(400).json({ error: "This email already exists" });
        } else if (password !== cpassword) {
            return res.status(400).json({ error: "Password and confirm password do not match" });
        } else {
            const addUser = new User({
                fname,
                email,
                password,
                cpassword,
                
            });
            const adding = await addUser.save();
            console.log(adding);
            return res.status(201).json({ message: "User registered successfully" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
});

router.post("/", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Fill all the details" });
    }

    try {
        const userAlready = await User.findOne({ email: email });

        if (!userAlready) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, userAlready.password);
        
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        } else {
            const token = await userAlready.generateAuthtoken();
            res.cookie("usercookies", token, {
                expires: new Date(Date.now() + 9000000),
                httpOnly: true
            });
            const result = {
                user: userAlready,
                token
            };
            return res.status(200).json({ status: 200, result });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
});

router.get("/validuser",authenticate,async(req,res)=>{
    try {
        const ValidUser = await User.findOne({_id:req.userId})
        res.status(201).json({status:201,ValidUser})
    } catch (error) {
        res.status(401).json({status:401,error})
    }
})

router.get("/logout", authenticate, async (req, res) => {
    try {
        
        req.mainUser.tokens = req.mainUser.tokens.filter((curtokens) => {
            return curtokens.token !== req.token;
        });

        
        res.clearCookie("usercookies", { path: "/" });
        await req.mainUser.save();

        return res.status(201).json({ status: 201, message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: "Logout failed" });
    }
});
router.post("/expense", authMiddleware, async (req, res) => {
    const {
        home,
        rentAmount,
        foodAmount,
        entertainmentAmount,
        utilitiesAmount,
        personalAmount,
        othersAmount,
        monthlyAmount
    } = req.body;

    // Calculate total expenses
    const totalExpenses =
        (home === "rent" ? parseFloat(rentAmount) || 0 : 0) +
        (parseFloat(foodAmount) || 0) +
        (parseFloat(entertainmentAmount) || 0) +
        (parseFloat(utilitiesAmount) || 0) +
        (parseFloat(personalAmount) || 0) +
        (parseFloat(othersAmount) || 0);

    // Calculate savingAmount
    const savingAmount = (parseFloat(monthlyAmount) || 0) - totalExpenses;

    // Prepare expense and saving objects
    const newExpense = {
        home,
        rentAmount: home === "rent" ? rentAmount : 0,
        foodAmount,
        entertainmentAmount,
        utilitiesAmount,
        personalAmount,
        othersAmount,
        monthlyAmount
    };

    const newSaving = {
        savingAmount
    };

    const user = req.user;

    // Add to user collection
    user.expenses.push(newExpense);
    user.savings.push(newSaving);

    try {
        await user.save();
        res.status(201).json({ message: "Expense saved successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving expense" });
    }
});

module.exports = router;
