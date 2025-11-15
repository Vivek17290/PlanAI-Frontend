require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");   // ⬅️ ADD THIS
const authRoutes = require("./routes/auth/authRoutes");

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("Mongo DB Error:", err));

app.use("/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
