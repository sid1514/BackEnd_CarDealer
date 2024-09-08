const express = require("express");
const Cars = require("./carsData");
const Login = require("./login");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

const route = express.Router();
require("./conn.js");

route.get("/", (req, res) => {
  res.end("home page");
});

//======== sign In and sign Up =======
route.post(
  "/signUp",
  asyncHandler(async (req, res) => {
    const { username, userpass, phoneNumber, userEmail } = req.body;
    const userFound = await Login.findOne({ username });

    if (userFound) {
      return res.status(404).send("Username already created create another");
    }
    let user = new Login({
      username,
      userpass,
      phoneNumber,
      userEmail,
    });

    await user.save();
    res.send("user Created");
  })
);

route.post(
  "/signIn",
  asyncHandler(async (req, res) => {
    const { username, userpass } = req.body;

    if (!username || !userpass) {
      return res.status(400).send("Username and password are required");
    }

    const user = await Login.findOne({ username });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const validPassword = await bcrypt.compare(userpass, user.userpass);

    if (validPassword) {
      const token = jwt.sign(
        { user_id: user._id, username },
        process.env.TOKEN_KEY,
        { expiresIn: "2h" }
      );

      user.token = token;
      res.cookie("token", user.token, { http: true });
      return res.send(user);
    } else {
      return res.status(401).send("Invalid password");
    }
  })
);

//===== update user ======
route.put(
  "/updateUser/:userid",
  asyncHandler(async (req, res) => {
    const { userid } = req.params;
    const updateFields = req.body;

    const updatedUser = await Login.findOneAndUpdate(
      { _id: userid },
      updateFields,
      { new: true }
    );

    res.send(updatedUser);
  })
);

//======= get login data ======
route.get(
  "/getLoginData",
  asyncHandler(async (req, res) => {
    let d = await Login.find(req.query);
    res.send(d);
  })
);

//==== get cars details ========
route.get(
  "/getCarbyName/:car_brand",
  asyncHandler(async (req, res) => {
    let { brand } = req.params;

    let data = await Cars.find({ car_brand: brand });

    if (data.length == 0) {
      res.send("not found ....");
    } else {
      res.send(data);
    }
  })
);

route.get(
  "/getCarsData",
  asyncHandler(async (req, res) => {
    let d = await Cars.find();
    res.send(d);
  })
);

route.get(
  "/getCarBycategory/:category",
  asyncHandler(async (req, res) => {
    const category = req.params.category;
    let d;
    if (category === "featured") {
      d = await Cars.find({ car_brand: "BMW" });
    } else if (category === "used") {
      d = await Cars.find({ car_brand: "Toyota" });
    }
    res.send(d);
  })
);

//=======post car details====
route.post(
  "/postCar",
  asyncHandler(async (req, res) => {
    const {
      car_brand,
      car_model,
      car_price,
      car_image,
      number_of_seats,
      Drive_Type,
      transmission,
      year,
      fuel_type,
      Engine_size,
      doors,
      cylinder,
      color,
    } = req.body;
    let carD = new Cars({
      car_brand,
      car_model,
      car_price,
      car_image,
      number_of_seats,
      Drive_Type,
      transmission,
      year,
      fuel_type,
      Engine_size,
      doors,
      cylinder,
      color,
    });
    await carD.save();
    res.send("user Created");
  })
);

//=====remove car and remove user=============
route.delete(
  "/removeUser/:name",
  asyncHandler(async (req, res) => {
    const { name } = req.params;
    let Data = await Login.findOne({ userid: name });
    if (Data == null) {
      res.send("not found ....");
    } else {
      let id = Data._id;
      console.log(Data.id);
      await Login.findByIdAndDelete(id);

      res.send("Reccord Remove");
    }
  })
);

route.delete(
  "/removeCar/:c_model",
  asyncHandler(async (req, res) => {
    const { c_model } = req.params;
    let Data = await Cars.findOne({ car_model: c_model });
    if (Data == null) {
      res.send("not found ....");
    } else {
      let id = Data._id;
      console.log(Data.id);
      await Cars.findByIdAndDelete(id);

      res.send("Reccord Remove");
    }
  })
);

//==========favorite car and booked car================================
route.post(
  "/favoriteCar",
  asyncHandler(async (req, res) => {
    const { userid, favoriteCar } = req.body;

    const user = await Login.findOneAndUpdate(
      { _id: userid },
      { $set: { favoriteCar: favoriteCar } },
      { new: true }
    );

    res.json(user);
  })
);

route.post(
  "/bookedCar",
  asyncHandler(async (req, res) => {
    const { userid, bookedCar } = req.body;

    const user = await Login.findOneAndUpdate(
      { _id: userid },
      { $set: { bookedCar: bookedCar } },
      { new: true }
    );

    res.json(user);
  })
);

route.post(
  "/CancelBookedCar",
  asyncHandler(async (req, res) => {
    const { userid } = req.body;

    const user = await Login.findOneAndUpdate(
      { _id: userid },
      { $set: { bookedCar: null } },
      { new: true }
    );

    res.json(user);
  })
);

route.get(
  "/getFavoriteCar/:userId",
  asyncHandler(async (req, res) => {
    const { userId } = req.params; // Get the userId from the URL parameter

    const user = await Login.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const favouriteCarDetails = user.favoriteCar;
    res.json(favouriteCarDetails);
  })
);

route.get(
  "/getBookedCar/:userId",
  asyncHandler(async (req, res) => {
    const { userId } = req.params; // Get the userId from the URL parameter

    const user = await Login.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const bookedCarDetails = user.bookedCar;
    res.json(bookedCarDetails);
  })
);

module.exports = route;
