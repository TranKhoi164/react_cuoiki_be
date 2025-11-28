const Account = require("../models/Account");

// Register: Create new account
async function register(req, res) {
  try {
    const { username, password, avatar, dateOfBirth, role, address } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        message: "Username, password are required"
      });
    }

    // Check if username already exists
    const existingAccount = await Account.findOne({ username });
    if (existingAccount) {
      return res.status(400).json({
        message: "Username already exists"
      });
    }

    // Create new account
    const account = await Account.create({
      username,
      password,
      // fullName,
      avatar: avatar || null,
      dateOfBirth: dateOfBirth || null,
      role: role || 0,
      address: address || {}
    });

    // Return account without password
    const accountResponse = account.toObject();
    delete accountResponse.password;

    res.status(201).json({
      message: "Account created successfully",
      account: accountResponse
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating account",
      error: error.message
    });
  }
}

// Login: Verify username and password
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    // Find account by username
    const account = await Account.findOne({ username });
    if (!account) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // Verify password (plain text comparison)
    if (account.password !== password) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // Return account without password
    const accountResponse = account.toObject();
    delete accountResponse.password;

    res.json({
      message: "Login successful",
      account: accountResponse
    });
  } catch (error) {
    res.status(500).json({
      message: "Error during login",
      error: error.message
    });
  }
}

// Logout: Simple endpoint (since no JWT, logout is mainly client-side)
async function logout(req, res) {
  try {
    res.json({
      message: "Logout successful"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error during logout",
      error: error.message
    });
  }
}

module.exports = {
  register,
  login,
  logout
};

