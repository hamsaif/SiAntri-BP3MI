const express = require("express"); // framework server
const cors = require("cors"); // handle CORS

const antrianRoutes = require("./routes/antrian.routes");

const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/antrian", antrianRoutes);


// route tidak ditemukan
app.use(notFound);

// global error handler
app.use(errorHandler);

module.exports = app;