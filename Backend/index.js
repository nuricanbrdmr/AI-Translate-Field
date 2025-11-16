import express from "express";
import cors from "cors"
import "dotenv/config"
import projectRoute from "./routes/projectRoute.js";
import connectDB from "./config/mongodb.js";

//app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();

//middlewares
app.use(express.json())
app.use(cors())

//initializing routes
app.use("/api/project", projectRoute)
app.get('/', (req, res) => res.send("API Working"));


app.listen(port, () => console.log(`Server started on ${port}`));