const express = require("express");
const app = express();
const path = require("path");

const userModel = require("./models/user");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/create", (req, res) => {
    res.render("index"); // Make sure you have a 'create.ejs' file in your views folder
});

app.get("/read", async (req, res) => {
    const users = await userModel.find();
    res.render("read", { users });
});

// Edit User
app.get("/edit/:userid", async (req, res) => {
    const user = await userModel.findOne({ _id: req.params.userid });
    res.render("edit", { user });
});

// Update User
app.post("/update/:userid", async (req, res) => {
    const { name, email, password, image } = req.body;
    await userModel.findOneAndUpdate({ _id: req.params.userid }, { name, email, image, password }, { new: true });
    res.redirect("/read");
});

// Delete User
app.get("/delete/:id", async (req, res) => {
    await userModel.findOneAndDelete({ _id: req.params.id });
    res.redirect("/read");
});

app.post("/create", async (req, res) => {
    const { name, email, password, image } = req.body;
    await userModel.create({
        name,
        email,
        password,
        image
    });
    res.redirect("/read");
});

app.listen(3000, () => {
    console.log(`App is running on port 3000`);
});
