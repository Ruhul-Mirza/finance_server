const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authMiddleware = require("../middleware/auth");
const generateAIRecommendation = require('../AI/aiSuggestions'); 

// SIGNUP
router.post("/register", async (req, res) => {
  const { fname, email, password, cpassword,dob } = req.body;

  if (!fname || !email || !password || !cpassword || !dob) {
    return res.status(400).json({ error: "Fill all the details" });
  }

  try {
    const alreadyUser = await User.findOne({ email: email });
    if (alreadyUser) {
      return res.status(400).json({ error: "This email already exists" });
    } else if (password !== cpassword) {
      return res
        .status(400)
        .json({ error: "Password and confirm password do not match" });
    } else {
      const addUser = new User({
        fname,
        email,
        password,
        cpassword,
        dob,
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

// LOGIN 
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
        httpOnly: true,
      });
      const result = {
        user: userAlready,
        token,
      };
      return res.status(200).json({ status: 200, result });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});


// VALIDATING USER
router.get("/validuser", authenticate, async (req, res) => {
  try {
    const ValidUser = await User.findOne({ _id: req.userId });
    res.status(201).json({ status: 201, ValidUser });
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

// LOGOUT
router.get("/logout", authenticate, async (req, res) => {
  try {
    req.mainUser.tokens = req.mainUser.tokens.filter((curtokens) => {
      return curtokens.token !== req.token;
    });

    res.clearCookie("usercookies", { path: "/" });
    await req.mainUser.save();

    return res
      .status(201)
      .json({ status: 201, message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, error: "Logout failed" });
  }
});

// ADDING EXPENSE DATA
router.post("/expense", authMiddleware, async (req, res) => {
    const {
      home,
      month,
      rentAmount,
      foodAmount,
      entertainmentAmount,
      utilitiesAmount,
      personalAmount,
      othersAmount,
      monthlyAmount,
    } = req.body;
  
    try {
      const monthCheck = await User.findOne({ "expenses.month": month });  // check for expenses with month
      if (monthCheck) {
        return res.status(409).json({ message: "Expense for this month is already saved!" });
      }
      // If the month doesn't exist, save the expense
      const newExpense = {
        home,
        month,
        rentAmount: home === "rent" ? rentAmount : 0,
        foodAmount,
        entertainmentAmount,
        utilitiesAmount,
        personalAmount,
        othersAmount,
        monthlyAmount,
      };
  
      const user = req.user;
      user.expenses.push(newExpense);
      await user.save();
  
      res.status(201).json({ message: "Expense saved successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: `Your Data of this ${month} already register if you want to change than edit` });
    }
  });
  
// FINDING EXPENSE DATA
router.get("/expense", async (req, res) => {
  try {
    const userData = await User.find({}, { expenses: 1, savings: 1 });
    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATING EXPENSE DATA
router.put("/expense/:expenseId", authMiddleware, async (req, res) => {
  const { expenseId } = req.params;
  const { expenses } = req.body; 
  try {
    const user = await User.findOne({ _id: req.user._id });
    // Update the expense
    const expenseIndex = user.expenses.findIndex(
      (exp) => exp._id.toString() === expenseId
    );
    if (expenseIndex !== -1) {
      user.expenses[expenseIndex] = expenses;
      await user.save();
      res
        .status(200)
        .json({ message: "Expense updated successfully, savings removed!" });
    } else {
      res.status(404).json({ message: "Expense not found!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating expense data" });
  }
});

// DELETING EXPENSE DATA
router.delete("/expense/:expenseId", async (req, res) => {
  const { expenseId } = req.params;
  try {
    const updatedUser = await User.updateOne(
      { "expenses._id": expenseId },
      {
        $pull: { expenses: { _id: expenseId } },
      }
    );

    if (updatedUser.modifiedCount > 0) {
      res.status(200).json({ message: "Expense deleted successfully" });
    } else {
      res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// DISPLAYING CHART
router.get("/chart/:expenseId", async (req, res) => {
  try {
    console.log("Request ID:", req.params.expenseId);

    const expenseData = await User.findOne({
      "expenses._id": req.params.expenseId,
    }).select("expenses");

    if (!expenseData) {
      console.log("Expense not found");
      return res.status(404).json({ error: "Expense not found" });
    }

    const expense = expenseData.expenses.find(
      (exp) => exp._id.toString() === req.params.expenseId
    );

    console.log("Found Expense:", expense);
    res.json(expense);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: error.message }); 
  }
});

// API INTEGRATION
router.post('/api/ai/suggestions', async (req, res) => {
  const { userId, month } = req.body; 

  try {
    
      const userData = await User.findOne({ _id: userId, 'expenses.month': month }, { 'expenses.$': 1 });

      if (!userData || !userData.expenses.length) {
          return res.status(404).json({ message: 'No expense data found for this month' });
      }
      const expenseData = userData.expenses[0]; 
      const suggestion = generateAIRecommendation(expenseData);
      res.json({ suggestion });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
