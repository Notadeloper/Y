import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json()); // to parse req.body as middleware - executed every req, res
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser()); // to parse req.cookie


app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
})