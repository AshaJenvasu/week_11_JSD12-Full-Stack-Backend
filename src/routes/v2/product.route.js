import { Router } from "express";
import Product from "../../../src/modules/products/products.model.js";

export const router = Router();

// MongoDB routes (/api/v2/products)

// --- GET All Products ---
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// --- POST Create Product ---
router.post("/", async (req, res) => {
  // รับข้อมูลให้ตรงกับฟิลด์ของ Product นะจ๊ะ (ตามที่เราคุยกันรอบก่อน)
  const { productId, productName, price } = req.body || {};

  // ตรวจสอบค่าที่จำเป็น (Validation)
  if (!productId || !productName || price === undefined) {
    return res.status(400).json({
      success: false,
      error: "productId, productName, and price are required",
    });
  }

  try {
    // บันทึกลง MongoDB ด้วย Model Product
    const newProduct = await Product.create({ productId, productName, price });
    return res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// --- PUT Update Product ---
router.put("/:id", async (req, res) => {
  const { productId, productName, price } = req.body || {};

  if (!productId || !productName || price === undefined) {
    return res.status(400).json({
      success: false,
      error: "Missing productId, productName, or price",
    });
  }

  try {
    // อัปเดตข้อมูลสินค้าผ่าน Object ID ของ MongoDB
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { productId, productName, price },
      { new: true, runValidators: true }, // ให้คืนค่าตัวใหม่ที่อัปเดตแล้วกลับมา และตรวจสอบ Schema ด้วย
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// --- DELETE Product ---
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Delete successful!",
      deletedData: deletedProduct,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});
