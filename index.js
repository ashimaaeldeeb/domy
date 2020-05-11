const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const usersRouter = require("./routes/users");
const ordersRouter = require("./routes/orders");
const productRouter = require("./routes/products");
const cartsRoutser = require("./routes/carts");
var cors = require("cors");
const app = express();

// const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/express-mongoose-demo';
const port = process.env.PORT || 3000;
mongoose
  .connect("mongodb://localhost:27017/database", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.log("Failed to connect to Mongodb,", err.message));

app.use(express.static("./uploads/users"));
app.use(express.static("./uploads/products"));
app.use(express.static("./uploads/logo"));
app.use(express.static("./uploads/slider"));

// app.use(express.json());

// app.use(express.static('public'));

// app.use(express.json({ limit: '50mb' }));
// app.use(bodyParser({ limit: '50mb' }));
// app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    // limit: '50mb',
    extended: true,
    // parameterLimit: 50000
  })
);

app.use(cors());
app.options("*", cors());

// app.use('/public', express.static('public'));

app.use("/products", productRouter);
app.use("/orders", ordersRouter);
app.use("/users", usersRouter);
app.use("/carts", cartsRoutser);

app.listen(port, () => console.log(`Server listens on port ${port}`));
