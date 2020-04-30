const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

app.post("/bot", (req, res) => {
    console.log({ req });
    res.status(200);
});

app.listen(PORT, console.log(`Server started on port ${PORT}`));