const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("./models/user");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Secret key
const SECRET_KEY = "dreamsinternational@vikram#1234";

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/create", (req, res) => {
    res.render("index");
});

// SignUp
app.post("/signup", async (req, res) => {
    const { name, role, age, expertise, password } = req.body;

    // password hashing 
    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
        name,
        role,
        age,
        expertise,
        password: hashedPassword
    });

    res.redirect("/create");
});

// Login
app.post("/login", async (req, res) => {
    const { name, password } = req.body;
    const user = await userModel.findOne({ name });

    if (!user) {
        return res.status(400).send("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).send("Invalid password");
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, name: user.name }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ token });
});

// verifying JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header("Authorization").replace("Bearer ", "");

    if (!token) {
        return res.status(401).send("Access denied");
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send("Invalid token");
    }
};

// Create user (protected route)
app.post("/create", authenticateJWT, async (req, res) => {
    const { name, blog, password, image } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
        name,
        blog,
        password: hashedPassword,
        image
    });

    res.redirect("/read");
});

// Read user (protected route)
app.get("/read", authenticateJWT, async (req, res) => {
    const users = await userModel.find();
    res.render("read", { users });
});

// Edit User (protected route)
app.get("/edit/:userid", authenticateJWT, async (req, res) => {
    const user = await userModel.findOne({ _id: req.params.userid });
    res.render("edit", { user });
});

// Update User (protected route)
app.post("/update/:userid", authenticateJWT, async (req, res) => {
    const { name, blog, password, image } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.findOneAndUpdate({ _id: req.params.userid }, { name, blog, image, password: hashedPassword }, { new: true });

    res.redirect("/read");
});

// Delete User (protected route)
app.get("/delete/:id", authenticateJWT, async (req, res) => {
    await userModel.findOneAndDelete({ _id: req.params.id });
    res.redirect("/read");
});

app.listen(3000, () => {
    console.log(`App is running on port 3000`);
});
