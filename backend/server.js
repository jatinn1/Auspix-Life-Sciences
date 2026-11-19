const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const enquiryRoutes = require("./routes/enquiryRoutes");
const adminRoutes = require("./routes/adminRoutes");

dns.setServers(["8.8.8.8"]);

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;
const projectRoot = path.join(__dirname, "..");
const adminPath = path.join(projectRoot, "admin");

const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

allowedOrigins.push(
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`
);

const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        message: "Too many login attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

const enquiryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        message: "Too many enquiries submitted. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(helmet());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "1mb" }));

app.use("/api/admin/login", adminLoginLimiter);
app.use("/api/enquiries", enquiryLimiter);

app.use("/api/enquiries", enquiryRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Auspix Life Sciences API is running"
    });
});

app.use("/assets", express.static(path.join(projectRoot, "assets")));
app.use("/css", express.static(path.join(projectRoot, "css")));
app.use("/js", express.static(path.join(projectRoot, "js")));

app.get("/", (req, res) => {
    res.sendFile(path.join(projectRoot, "index.html"));
});

app.get("/admin/", (req, res) => {
    res.sendFile(path.join(adminPath, "index.html"));
});

app.get("/admin/", (req, res) => {
    res.sendFile(path.join(adminPath, "index.html"));
});

app.use(
    "/admin",
    express.static(adminPath)
);

app.use((err, req, res, next) => {
    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            message: "Origin not allowed"
        });
    }

    console.error(err);

    res.status(500).json({
        message: "Internal server error"
    });
});

const requiredEnv = [
    "MONGO_URI",
    "JWT_SECRET",
    "EMAIL_USER",
    "EMAIL_PASS",
    "ADMIN_EMAIL"
];

const missingEnv = requiredEnv.filter(
    (key) => !process.env[key]
);

if (missingEnv.length > 0) {
    console.error(
        `Missing environment variables: ${missingEnv.join(", ")}`
    );
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
        process.exit(1);
    });