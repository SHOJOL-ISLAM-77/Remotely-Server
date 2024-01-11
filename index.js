const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 7000;
const jwt = require("jsonwebtoken");

// middleware
const corsOptions = {
  origin: ["http://localhost:5173", "https://remotely-d0697.web.app"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b2jpujy.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const userCollection = client.db("remotely").collection("users");
    const skillsCollection = client.db("remotely").collection("skills");
    const timeZoneCollection = client.db("remotely").collection("timeZone");
    const userProjectCollection = client
      .db("remotely")
      .collection("userProject");

    app.post("/api/v1/create-jwt", async (req, res) => {
      const user = req.body;
      console.log("I need a new jwt", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // Logout
    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
        console.log("Logout successful");
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // User projects related api

    app.post("/api/v1/create-project", async (req, res) => {
      const data = req.body;
      const result = await userProjectCollection.insertOne(data);
      res.send(result);
    });

    // User related apis

    // Save or modify user email, status in DB
    app.put("/api/v1/create-user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const isExist = await userCollection.findOne(query);
      console.log("User found?----->", isExist);
      if (isExist) return res.send(isExist);
      const result = await userCollection.updateOne(
        query,
        {
          $set: { ...user },
        },
        options
      );
      res.send(result);
    });

    app.get("/api/v1/get-user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.put("/api/v1/update-user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = {
        email: email,
      };
      const userData = req.body;
      const options = { upsert: true };

      const result = await userCollection.updateOne(
        filter,
        {
          $set: { ...userData },
        },
        options
      );
      res.send(result);
    });

    app.get("/api/v1/get-timeZone", async (req, res) => {
      const result = await timeZoneCollection.find().toArray();
      res.send(result);
    });

    app.get("/api/v1/get-skills/:id", async (req, res) => {
      const id = req.params.id;
      if (id != 0) {
        const query = { skill_id: id };
        const result = await skillsCollection.find(query).toArray();
        res.send(result);
      }
      if (id == 0) {
        const result = await skillsCollection.find().toArray();
        res.send(result);
      }
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(" remotely server is running");
});

app.listen(port, () => {
  console.log(` remotely is running on port: ${port}`);
});
