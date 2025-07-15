require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");

const authRoutes = require("./routes/auth");
require("./config/passport")(passport);

const app = express();
const PORT = process.env.PORT || 3002;
const MONGO_URL = process.env.MONGO_URL;

// ✅ Middleware
app.use(cors({
  origin: [
    "https://frontend-iota-livid.vercel.app",
  ],
  credentials: true, // optional: if using cookies
}));
app.use(express.json());
app.use(passport.initialize());

// ✅ Routes
app.use("/api/auth", authRoutes);

app.get("/getHoldings", async (req, res) => {
  const allHoldings = await HoldingsModel.find({});
  res.send(allHoldings);
});

app.post("/newOrder", async (req, res) => {
  const newOrder = new OrdersModel({
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
  });
  await newOrder.save();
  res.send({ msg: "Order placed!" });
});

app.get("/allOrders", async (req, res) => {
  const allOrders = await OrdersModel.find({});
  res.send(allOrders);
});

app.get("/getPositions", async (req, res) => {
  const allPositions = await PositionsModel.find({});
  res.send(allPositions);
});

// ✅ Protected Route
app.get(
  "/dashboard",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { password, ...safeUser } = req.user._doc;
    res.json({ message: "Welcome to dashboard", user: safeUser });
  }
);


// ✅ Start after DB Connect
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("DB successfully connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch((err)=>{
    console.log("mongoose connection err", err);
  })

