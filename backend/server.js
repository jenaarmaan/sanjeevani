// ===================== IMPORTS =====================
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===================== SECRET KEY =====================
const SECRET_KEY = "sanjeevani-super-secret";

// ===================== APP SETUP =====================
const app = express();
app.use(express.json());
app.use(cors());

// ===================== TEMP DATABASE =====================
let users = [];
let symptomReports = [];
let emergencyLogs = [];
let healthRecords = [];

// ===================== JWT AUTH MIDDLEWARE =====================
function authMiddleware(req, res, next) {
    const token = req.headers["authorization"]; // read token from header

    if (!token) {
        return res.json({ success: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next(); // allow route to continue
    } catch (err) {
        return res.json({ success: false, message: "Invalid or expired token" });
    }
}

// ===================== ROUTES =====================

// CHECK SERVER
app.get("/", (req, res) => {
    res.send("Sanjeevani Backend Running");
});

// ---------------- REGISTER ----------------
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    const exists = users.find(u => u.email === email);
    if (exists) {
        return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: Date.now(),
        name,
        email,
        password: hashedPassword
    };

    users.push(newUser);

    res.json({
        success: true,
        message: "User registered successfully",
        user: newUser
    });
});

// ---------------- LOGIN ----------------
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        SECRET_KEY,
        { expiresIn: "1h" }
    );

    res.json({
        success: true,
        message: "Login successful",
        token: token,
        user: user
    });
});

// ---------------- SYMPTOM REPORT ----------------
app.post("/symptom-report", authMiddleware, (req, res) => {
    const { userId, symptoms, severity, description } = req.body;

    const report = {
        id: Date.now(),
        userId,
        symptoms,
        severity,
        description,
        timestamp: new Date().toISOString()
    };

    symptomReports.push(report);

    res.json({
        success: true,
        message: "Symptom report saved",
        report
    });
});

// ---------------- GET SYMPTOMS ----------------
app.get("/symptoms/:userId", authMiddleware, (req, res) => {
    const userId = req.params.userId;

    const result = symptomReports.filter(r => r.userId == userId);

    res.json({
        success: true,
        count: result.length,
        symptoms: result
    });
});

// ---------------- EMERGENCY SOS ----------------
app.post("/sos", authMiddleware, (req, res) => {
    const { userId, emergencyType, location, description } = req.body;

    const emergency = {
        id: Date.now(),
        userId,
        emergencyType,
        location,
        description,
        timestamp: new Date().toISOString()
    };

    emergencyLogs.push(emergency);

    res.json({
        success: true,
        message: "Emergency SOS logged",
        emergency
    });
});

// ---------------- ADD HEALTH RECORD ----------------
app.post("/add-record", authMiddleware, (req, res) => {
    const { userId, title, value, notes } = req.body;

    const record = {
        id: Date.now(),
        userId,
        title,
        value,
        notes,
        timestamp: new Date().toISOString()
    };

    healthRecords.push(record);

    res.json({
        success: true,
        message: "Record added",
        record
    });
});

// ---------------- GET HEALTH RECORDS ----------------
app.get("/records/:userId", authMiddleware, (req, res) => {
    const userId = req.params.userId;

    const result = healthRecords.filter(r => r.userId == userId);

    res.json({
        success: true,
        count: result.length,
        records: result
    });
});

// ===================== START SERVER =====================
app.listen(5000, () => {
    console.log("Backend is running on http://localhost:5000");
});