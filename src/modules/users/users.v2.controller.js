import User from "./user.model.js";

const userResponse = (user) => {
  return {
    id: user._id || user.id,
    username: user.username,
    email: user.email,
    password: user.password,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("+password");
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  const { username, email, password, role } = req.body || {};

  // 1. Validate Input Data
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "username, email, and password are required",
    });
  }

  try {
    // 2. Check Existing User
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });
    }

    // 3. Save to MongoDB
    const doc = await User.create({
      username,
      email,
      password,
      role,
    });

    // 4. Return Success Response
    return res.status(201).json({ success: true, data: userResponse(doc) });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email) {
    return res
      .status(400)
      .json({ success: false, error: "Missing username or email" });
  }

  try {
    const updateData = { username, email };
    if (password) updateData.password = await bcrypt.hash(password, 12);
    if (role) updateData.role = role;

    const updateUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updateUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: userResponse(updateUser),
    });
  } catch (error) {
    // return res.status(400).json({ success: false, error: error.message });

    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    // 1. ใช้ findByIdAndDelete เพื่อลบข้อมูลตาม ID
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    // 2. ถ้าไม่เจอ User ที่ต้องการลบ
    if (!deletedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Delete successful!",
      deletedData: userResponse(deletedUser),
    });
  } catch (error) {
    // return res.status(400).json({ success: false, error: error.message });
    next(error);
  }
};
