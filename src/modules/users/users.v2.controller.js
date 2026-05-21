import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // 1. ตรวจสอบข้อมูลว่ากรอกครบไหม
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    // 2. ค้นหาผู้ใช้ใน DB (🌟 ต้องใช้ .select("+password") เพื่อดึงตัวแฮชมาเทียบด้วยนะคะ!)
    const userInDB = await User.findOne({ email }).select("+password");

    // IF (!userInDB) { RETURN "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }
    if (!userInDB) {
      return res
        .status(401)
        .json({ success: false, error: "email or password is incorrect" });
    }

    // 3. เปรียบเทียบรหัสผ่านด้วย bcrypt.compare
    // isMatch = await bcrypt.compare(plainPassword, userInDB.password)
    const isMatch = await bcrypt.compare(password, userInDB.password);

    // IF (isMatch == false) { RETURN "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "email or password is incorrect" });
    }

    const token = jwt.sign({ userId: userInDB._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true, // 🔐 ป้องกันแฮกเกอร์ใช้ JavaScript (XSS) แอบมาขโมยดูดเอา Token ออกไป
      secure: isProd, // 🌟 ยืดหยุ่นตามสภาพแวดล้อม: อยู่ในเครื่องเป็น false ขึ้นเซิร์ฟเวอร์เป็น true!
      sameSite: isProd ? "none" : "lax", // 🚪 ถ้าขึ้น Server จริงและแยกหน้า-หลังบ้าน นิยมใช้ none คู่ออปชัน secure ค่ะ
      maxAge: 60 * 60 * 1000, // ⏳ ตั้งเวลาหมดอายุของคุกกี้ชิ้นนี้ (ตัวอย่างนี้คือ 1 ชั่วโมง)
    });

    // ELSE { RETURN "เข้าสู่ระบบสำเร็จ!" }
    return res.status(200).json({
      success: true,
      message: "Login successfully!",
      _id: userInDB._id,
      username: userInDB.username,
      email: userInDB.email,
      role: userInDB.role,
    });
  } catch (error) {
    next(error);
  }
};

export const checkUser = async (req, res, next) => {
  try {
    const userId = req.user.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";

  try {
    res.clearCookie("accessToken", {
      httpOnly: true, // 🔐 ป้องกันแฮกเกอร์ใช้ JavaScript (XSS) แอบมาขโมยดูดเอา Token ออกไป
      secure: isProd, // 🌟 ยืดหยุ่นตามสภาพแวดล้อม: อยู่ในเครื่องเป็น false ขึ้นเซิร์ฟเวอร์เป็น true!
      sameSite: isProd ? "none" : "lax", // 🚪 ถ้าขึ้น Server จริงและแยกหน้า-หลังบ้าน นิยมใช้ none คู่ออปชัน secure ค่ะ
    });
    return res
      .status(200)
      .json({ success: true, message: "Logout successfully!" });
  } catch (error) {
    next(error);
  }
};
