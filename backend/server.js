const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let db;
const app = express();
app.use(express.json());
app.use(cors());

// JWT Secret (In production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "oralvis_healthcare_secret_key_2025";

const initializeDBandServer = async () => {
    try {
        db = await open({
            filename: path.join(__dirname, "oralvis_healthcare.db"),
            driver: sqlite3.Database,
        });

        // Create tables if they don't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('Technician', 'Dentist')),
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_name TEXT NOT NULL,
                patient_id TEXT NOT NULL,
                scan_type TEXT NOT NULL DEFAULT 'RGB',
                region TEXT NOT NULL CHECK (region IN ('Frontal', 'Upper Arch', 'Lower Arch')),
                image_url TEXT NOT NULL,
                upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                uploaded_by INTEGER,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (uploaded_by) REFERENCES users (id)
            );
        `);

        // Insert sample data if tables are empty
        const userCount = await db.get("SELECT COUNT(*) as count FROM users");
        if (userCount.count === 0) {
            await insertSampleData();
        }

        app.listen(5000, () => {
            console.log("OralVis Healthcare Server is running on http://localhost:5000/");
        });
    } catch (error) {
        console.log(`Database error is ${error.message}`);
        process.exit(1);
    }
};

const insertSampleData = async () => {
    // Hash passwords for sample users
    const hashedTechPassword = await bcrypt.hash("tech123", 10);
    const hashedDentistPassword = await bcrypt.hash("dentist123", 10);

    const sampleUsers = [
        {
            email: "technician@oralvis.com",
            password: hashedTechPassword,
            role: "Technician"
        },
        {
            email: "dentist@oralvis.com", 
            password: hashedDentistPassword,
            role: "Dentist"
        },
        {
            email: "tech1@oralvis.com",
            password: hashedTechPassword,
            role: "Technician"
        },
        {
            email: "dr.smith@oralvis.com",
            password: hashedDentistPassword,
            role: "Dentist"
        }
    ];

    // Insert sample users
    for (const user of sampleUsers) {
        const result = await db.run(
            `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`,
            [user.email, user.password, user.role]
        );
    }

    // Insert sample scans
    const sampleScans = [
        {
            patient_name: "Rajesh",
            patient_id: "PAT001",
            scan_type: "RGB",
            region: "Frontal",
            image_url: "https://res.cloudinary.com/dw7dhefpb/image/upload/v1756810877/pexels-pixabay-52527_raxiqj.jpg",
            uploaded_by: 1
        },
        {
            patient_name: "Priya Reddy",
            patient_id: "PAT002", 
            scan_type: "RGB",
            region: "Upper Arch",
            image_url: "https://res.cloudinary.com/dw7dhefpb/image/upload/v1756810876/istockphoto-860423716-2048x2048_fpc3kn.jpg",
            uploaded_by: 1
        },
        {
            patient_name: "Arjun Reddy",
            patient_id: "PAT003",
            scan_type: "RGB", 
            region: "Lower Arch",
            image_url: "https://res.cloudinary.com/dw7dhefpb/image/upload/v1756810876/istockphoto-1435587331-2048x2048_zfctzh.jpg",
            uploaded_by: 3
        },
        {
            patient_name: "Vikram Kumar",
            patient_id: "PAT004",
            scan_type: "RGB",
            region: "Frontal",
            image_url: "https://res.cloudinary.com/dw7dhefpb/image/upload/v1756810876/istockphoto-936887200-2048x2048_wsooeh.jpg", 
            uploaded_by: 1
        }
    ];

    for (const scan of sampleScans) {
        await db.run(
            `INSERT INTO scans (patient_name, patient_id, scan_type, region, image_url, uploaded_by) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [scan.patient_name, scan.patient_id, scan.scan_type, scan.region, scan.image_url, scan.uploaded_by]
        );
    }

    console.log("Sample data inserted successfully!");
    console.log("Login Credentials:");
    console.log("Technician: technician@oralvis.com / tech123");
    console.log("Dentist: dentist@oralvis.com / dentist123");
};

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

// Middleware to check user role
const checkRole = (requiredRole) => {
    return (req, res, next) => {
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ error: `Access denied. ${requiredRole} role required.` });
        }
        next();
    };
};

// POST /api/auth/login - User login
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Find user by email
        const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
        
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/auth/register - Register new user (for testing purposes)
app.post("/api/auth/register", async (req, res) => {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
        return res.status(400).json({ error: "Email, password, and role are required" });
    }

    if (!['Technician', 'Dentist'].includes(role)) {
        return res.status(400).json({ error: "Role must be either 'Technician' or 'Dentist'" });
    }

    try {
        // Check if user already exists
        const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [email]);
        
        if (existingUser) {
            return res.status(409).json({ error: "User with this email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await db.run(
            "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
            [email, hashedPassword, role]
        );

        res.status(201).json({
            message: "User registered successfully",
            data: {
                id: result.lastID,
                email,
                role
            }
        });
    } catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/scans - Upload new scan (Technician only)
app.post("/api/scans", authenticateToken, checkRole('Technician'), async (req, res) => {
    const { patient_name, patient_id, scan_type = 'RGB', region, image_url } = req.body;
    
    if (!patient_name || !patient_id || !region || !image_url) {
        return res.status(400).json({ 
            error: "Patient name, patient ID, region, and image URL are required" 
        });
    }

    if (!['Frontal', 'Upper Arch', 'Lower Arch'].includes(region)) {
        return res.status(400).json({ 
            error: "Region must be 'Frontal', 'Upper Arch', or 'Lower Arch'" 
        });
    }

    try {
        const result = await db.run(
            `INSERT INTO scans (patient_name, patient_id, scan_type, region, image_url, uploaded_by) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [patient_name, patient_id, scan_type, region, image_url, req.user.id]
        );

        const newScan = await db.get("SELECT * FROM scans WHERE id = ?", [result.lastID]);

        res.status(201).json({
            message: "Scan uploaded successfully",
            data: newScan
        });
    } catch (error) {
        console.error("Error uploading scan:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/scans - Get all scans (Dentist only)
app.get("/api/scans", authenticateToken, checkRole('Dentist'), async (req, res) => {
    try {
        const { search, region, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT s.*, u.email as uploaded_by_email 
            FROM scans s 
            LEFT JOIN users u ON s.uploaded_by = u.id
        `;
        let countQuery = "SELECT COUNT(*) as total FROM scans s";
        let params = [];
        let conditions = [];

        // Search functionality
        if (search) {
            conditions.push("(s.patient_name LIKE ? OR s.patient_id LIKE ?)");
            params.push(`%${search}%`, `%${search}%`);
        }

        // Filter by region
        if (region) {
            conditions.push("s.region = ?");
            params.push(region);
        }

        if (conditions.length > 0) {
            const whereClause = " WHERE " + conditions.join(" AND ");
            query += whereClause;
            countQuery += whereClause;
        }

        query += " ORDER BY s.upload_date DESC LIMIT ? OFFSET ?";
        params.push(parseInt(limit), parseInt(offset));

        const scans = await db.all(query, params);
        
        // Get total count for pagination
        const totalResult = await db.get(countQuery, params.slice(0, -2));
        const total = totalResult.total;

        res.json({
            message: "success",
            data: scans,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_records: total,
                per_page: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("Error retrieving scans:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/scans/:id - Get specific scan details (Dentist only)
app.get("/api/scans/:id", authenticateToken, checkRole('Dentist'), async (req, res) => {
    const { id } = req.params;
    
    try {
        const scan = await db.get(`
            SELECT s.*, u.email as uploaded_by_email 
            FROM scans s 
            LEFT JOIN users u ON s.uploaded_by = u.id 
            WHERE s.id = ?
        `, [id]);
        
        if (!scan) {
            return res.status(404).json({ error: "Scan not found" });
        }
        
        res.json({ 
            message: "success",
            data: scan
        });
    } catch (error) {
        console.error("Error retrieving scan:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/technician/scans - Get scans uploaded by current technician
app.get("/api/technician/scans", authenticateToken, checkRole('Technician'), async (req, res) => {
    try {
        const { search, region, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM scans WHERE uploaded_by = ?";
        let countQuery = "SELECT COUNT(*) as total FROM scans WHERE uploaded_by = ?";
        let params = [req.user.id];
        let conditions = [];

        // Search functionality
        if (search) {
            conditions.push("(patient_name LIKE ? OR patient_id LIKE ?)");
            params.push(`%${search}%`, `%${search}%`);
        }

        // Filter by region
        if (region) {
            conditions.push("region = ?");
            params.push(region);
        }

        if (conditions.length > 0) {
            const additionalWhere = " AND " + conditions.join(" AND ");
            query += additionalWhere;
            countQuery += additionalWhere;
        }

        query += " ORDER BY upload_date DESC LIMIT ? OFFSET ?";
        params.push(parseInt(limit), parseInt(offset));

        const scans = await db.all(query, params);
        
        // Get total count for pagination
        const totalResult = await db.get(countQuery, params.slice(0, -2));
        const total = totalResult.total;

        res.json({
            message: "success",
            data: scans,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_records: total,
                per_page: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("Error retrieving technician scans:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT /api/scans/:id - Update scan details (Technician only, own scans)
app.put("/api/scans/:id", authenticateToken, checkRole('Technician'), async (req, res) => {
    const { id } = req.params;
    const { patient_name, patient_id, scan_type = 'RGB', region, image_url } = req.body;
    
    if (!patient_name || !patient_id || !region || !image_url) {
        return res.status(400).json({ 
            error: "Patient name, patient ID, region, and image URL are required" 
        });
    }

    if (!['Frontal', 'Upper Arch', 'Lower Arch'].includes(region)) {
        return res.status(400).json({ 
            error: "Region must be 'Frontal', 'Upper Arch', or 'Lower Arch'" 
        });
    }

    try {
        // Check if scan exists and belongs to current technician
        const scan = await db.get("SELECT * FROM scans WHERE id = ? AND uploaded_by = ?", [id, req.user.id]);
        if (!scan) {
            return res.status(404).json({ error: "Scan not found or access denied" });
        }

        await db.run(
            `UPDATE scans SET patient_name = ?, patient_id = ?, scan_type = ?, region = ?, image_url = ? 
             WHERE id = ? AND uploaded_by = ?`,
            [patient_name, patient_id, scan_type, region, image_url, id, req.user.id]
        );

        const updatedScan = await db.get("SELECT * FROM scans WHERE id = ?", [id]);

        res.json({
            message: "Scan updated successfully",
            data: updatedScan
        });
    } catch (error) {
        console.error("Error updating scan:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE /api/scans/:id - Delete a scan (Technician only, own scans)
app.delete("/api/scans/:id", authenticateToken, checkRole('Technician'), async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if scan exists and belongs to current technician
        const scan = await db.get("SELECT * FROM scans WHERE id = ? AND uploaded_by = ?", [id, req.user.id]);
        if (!scan) {
            return res.status(404).json({ error: "Scan not found or access denied" });
        }

        await db.run("DELETE FROM scans WHERE id = ? AND uploaded_by = ?", [id, req.user.id]);
        
        res.json({
            message: "Scan deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting scan:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/regions - Get unique regions for filtering
app.get("/api/regions", authenticateToken, async (req, res) => {
    try {
        const regions = await db.all("SELECT DISTINCT region FROM scans ORDER BY region");
        res.json({
            message: "success",
            data: regions.map(row => row.region)
        });
    } catch (error) {
        console.error("Error retrieving regions:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/stats - Get dashboard statistics
app.get("/api/stats", authenticateToken, async (req, res) => {
    try {
        let stats = {};

        if (req.user.role === 'Dentist') {
            // Dentist can see all stats
            const totalScans = await db.get("SELECT COUNT(*) as count FROM scans");
            const totalPatients = await db.get("SELECT COUNT(DISTINCT patient_id) as count FROM scans");
            const scansByRegion = await db.all(`
                SELECT region, COUNT(*) as count 
                FROM scans 
                GROUP BY region 
                ORDER BY count DESC
            `);
            const recentScans = await db.all(`
                SELECT COUNT(*) as count 
                FROM scans 
                WHERE DATE(upload_date) = DATE('now')
            `);

            stats = {
                total_scans: totalScans.count,
                total_patients: totalPatients.count,
                scans_by_region: scansByRegion,
                today_uploads: recentScans[0]?.count || 0
            };
        } else if (req.user.role === 'Technician') {
            // Technician can only see their own stats
            const totalScans = await db.get("SELECT COUNT(*) as count FROM scans WHERE uploaded_by = ?", [req.user.id]);
            const totalPatients = await db.get("SELECT COUNT(DISTINCT patient_id) as count FROM scans WHERE uploaded_by = ?", [req.user.id]);
            const scansByRegion = await db.all(`
                SELECT region, COUNT(*) as count 
                FROM scans 
                WHERE uploaded_by = ?
                GROUP BY region 
                ORDER BY count DESC
            `, [req.user.id]);
            const recentScans = await db.all(`
                SELECT COUNT(*) as count 
                FROM scans 
                WHERE uploaded_by = ? AND DATE(upload_date) = DATE('now')
            `, [req.user.id]);

            stats = {
                total_scans: totalScans.count,
                total_patients: totalPatients.count,
                scans_by_region: scansByRegion,
                today_uploads: recentScans[0]?.count || 0
            };
        }

        res.json({
            message: "success",
            data: stats
        });
    } catch (error) {
        console.error("Error retrieving stats:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/profile - Get current user profile
app.get("/api/profile", authenticateToken, async (req, res) => {
    try {
        const user = await db.get("SELECT id, email, role, createdAt FROM users WHERE id = ?", [req.user.id]);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.json({
            message: "success",
            data: user
        });
    } catch (error) {
        console.error("Error retrieving profile:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/patients - Get unique patients (for both roles)
app.get("/api/patients", authenticateToken, async (req, res) => {
    try {
        let query = "SELECT DISTINCT patient_id, patient_name FROM scans";
        let params = [];

        if (req.user.role === 'Technician') {
            // Technician can only see their own patients
            query += " WHERE uploaded_by = ?";
            params.push(req.user.id);
        }

        query += " ORDER BY patient_name";

        const patients = await db.all(query, params);
        
        res.json({
            message: "success",
            data: patients
        });
    } catch (error) {
        console.error("Error retrieving patients:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        message: "OralVis Healthcare API is running",
        timestamp: new Date().toISOString(),
        status: "healthy"
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// Handle 404 for undefined routes
// Works in Express 5
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});


initializeDBandServer();