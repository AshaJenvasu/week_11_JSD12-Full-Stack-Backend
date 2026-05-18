import express from "express";
import cors from "cors";

import { users } from "./fakeData/fakeUsers.js";
import { products } from "./fakeData/fakeProducts.js";
import { router as apiRoutes } from "./routes/index.js";
import { connectDB } from "./config/mongodb.js";
import { connectSupabase } from "./config/supabase.js";

const app = express();

app.use(cors());

//change JSON to JS
app.use(express.json());

//月の門
app.use("/api", apiRoutes);

//HOME
app.get("/", (req, res) => {
  res.json({
    message: "Express Server is running! Please use React frontend to test.",
  });
});

const PORT = 3000;

await connectDB();
await connectSupabase();

app.listen(PORT, () => {
  console.log(`Server running on PORT:${PORT} ❤️`);
});
