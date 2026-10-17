const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.disable("x-powered-by");

app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.locals.currentPath = req.path;
    next();
});
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/skills", (req, res) => {
    res.render("skills");
});

app.get("/projects", (req, res) => {
    res.render("projects");
});

app.get("/contact", (req, res) => {
    res.render("contact");
});

app.use((req, res) => {
    res.status(404).render("404");
});

app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    console.error("Request failed:", err.message);
    res.status(err.status || 500).render("404", { serverError: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// app.use((err, req, res, next) => {
//     if (res.headersSent) return next(err);

//     console.error("Request failed:", err.message);
//     res.status(err.status || 500).render("404", {
//         serverError: true
//     });
// });

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server running on port ${PORT}`);
// });
