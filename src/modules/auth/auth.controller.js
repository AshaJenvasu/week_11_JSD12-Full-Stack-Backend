import bcrypt from "bcrypt";
import User from "../users/user.model.js";

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

    // ELSE { RETURN "เข้าสู่ระบบสำเร็จ!" }
    return res.status(200).json({
      success: true,
      message: "Login successfully!",
      // ในอนาคตบทเรียนถัดไปของเธอ ตรงนี้จะมีการสร้าง Token ส่งกลับไปด้วยล่ะค่ะ 😉
    });
  } catch (error) {
    next(error);
  }
};
