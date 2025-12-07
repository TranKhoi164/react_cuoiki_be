const Account = require("../models/Account");

// Register: Create new account
async function register(req, res) {
  try {
    const { username, password, avatar, dateOfBirth, role, address } = req.body;

    console.log(req.body)

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
      address: address || null
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
    console.log(error)
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

const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('id: ', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID tài khoản không hợp lệ.' });
    }

    // Lấy thông tin tài khoản (loại trừ trường nhạy cảm như password)
    const account = await Account.findById(id).select('-password');

    if (!account) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    }

    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({
      message: "Error getting account by id",
      error: error.message
    });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Chỉ cho phép cập nhật các trường sau:
    const allowedUpdates = ['dateOfBirth', 'address', 'username'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Trường cập nhật không hợp lệ.' });
    }

    // NGĂN CHẶN CẬP NHẬT PASSWORD và ROLE trực tiếp qua API này
    if (req.body.password || req.body.role) {
      return res.status(403).json({ message: 'Không được phép cập nhật mật khẩu hoặc vai trò qua API này.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID tài khoản không hợp lệ.' });
    }

    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    }

    // Áp dụng các thay đổi
    updates.forEach((update) => account[update] = req.body[update]);

    // Đặt { new: true } để trả về document sau khi cập nhật
    await account.save();

    // Trả về thông tin tài khoản đã cập nhật (loại trừ password)
    const updatedAccount = await Account.findById(id).select('-password');

    res.status(200).json({
      message: 'Cập nhật thông tin tài khoản thành công.',
      account: updatedAccount
    });

  } catch (error) {
    // Xử lý lỗi unique (ví dụ: username đã tồn tại)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.' });
    }
    handleServerError(res, error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getAccountById,
  updateAccount
};