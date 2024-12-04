const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const secretKey = "mirzaruhulnazirhussain12345678910"; // Use a secure key in production

const userSchema = mongoose.Schema({
  fname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(val) {
      if (!validator.isEmail(val)) {
        throw new Error("Please Enter A Valid email");
      }
    },
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  expenses: [
    {
      home: String,
      month: String,
      rentAmount: Number,
      foodAmount: Number,
      entertainmentAmount: Number,
      utilitiesAmount: Number,
      personalAmount: Number,
      othersAmount: Number,
      monthlyAmount: Number,
    },
  ],
});

// Pre-save hook for hashing passwords
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // Hash password and confirm password (cpassword)
    this.password = await bcrypt.hash(this.password, 13);
  }
  next();
});

// Method for generating JWT token
userSchema.methods.generateAuthtoken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, secretKey);
    this.tokens = this.tokens.concat({ token }); // Save token in the user's tokens array
    await this.save();
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Token generation failed");
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
