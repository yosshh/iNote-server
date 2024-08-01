const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "yashaccha$hai";
// ROUTE: 1 create a user using: POST "./api/auth/createUser" no login required.
router.post(
  "/createUser",
  [
    body("name", "Enter a valid name.").isLength({ min: 3 }),
    body("email", "Enter a valid email.").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    //  console.log(req.body);
    //  const user = User(req.body);
    //  user.save();
    // below code is for identifying errors
    // if we go to thunderbolt and do not fill name it will show error
    // we can also give a custom message to the field as done in code 10 and 11 for name and email
    // if there are no errors, return bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      const userExists = await User.findOne({email: req.body.email});
      if(userExists) {
        return res.status(400).json({success, error: "User already exits"})
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      // this upper code will generate a hash value for the password which will prevent the user file from hacking
      // this below code will check if the user with this email exists already
      let user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        }
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Crashed.");
    }
    //   res.send({ errors: result.array() }); we do'nt require this we are already using res.json
  }
);

// ROUTE: 2 Authenticate a user using: POST "./api/auth/createUser" no login required.
router.post(
  "/login",
  [
    body("email", "Enter a valid email.").isEmail(),
    body("password", "Password can not be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success, error: "Please login with correct credentials." });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ success, error: "Please login with correct credentials." });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Crashed.");
    }
  }
);

// ROUTE: 3 get loggedin user details using: POST "./api/auth/getuser" no login required.
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Crashed.");
  }
});
module.exports = router;
