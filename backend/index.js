const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const memberRoutes = require("./routes/member.routes")

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err))

app.use("/members", memberRoutes)

// Health check route (used by uptime monitor)
app.get("/api/health", (req, res) => {
    res.status(200).send("Server is alive ✅");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))