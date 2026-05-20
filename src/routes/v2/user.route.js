import { Router } from "express";
import User from "../../../src/modules/users/user.model.js";
import { supabase } from "../../config/supabase.js";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../modules/users/users.v2.controller.js";

export const router = Router();

// MongoDB routes (/api/v2/users)

router.get("/", getUsers);

router.post("/", createUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

// Supabase / PostgreSQL routes (/api/v2/users/pg)
// Password is excluded from SELECT

const PG_SELECT = "id, username, email, role, created_at, updated_at";

router.get("/pg", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select(PG_SELECT);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/pg", async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "username, email, and password are required",
    });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .insert({ username, email, password, role: role || "user" })
      .select(PG_SELECT)
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.put("/pg/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body || {};

  try {
    // ดึงข้อมูลเฉพาะตัวที่มีการส่งมาอัปเดต (ป้องกันการเอาค่า undefined ไปทับข้อมูลเก่า)
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (role) updateData.role = role;

    // ตรวจสอบว่ามีข้อมูลส่งมาแก้ไขไหม
    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No data provided for update" });
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select(PG_SELECT)
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.delete("/pg/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select(PG_SELECT)
      .single();

    if (error) throw error;

    // ส่งข้อมูลตัวที่เพิ่งโดนลบกลับไปด้วย เพื่อให้ฝั่งหน้าบ้านรู้ว่าลบตัวไหนสำเร็จ
    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully", data });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});
