

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId, } = require("mongodb");
const app = express();
const port = process.env.PORT || 5002;  

app.use(cors());
app.use(express.json()); 

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
    const userCollecction = client.db("remotely").collection("users"); 
    // const cartCollection = client.db("productDB").collection("carts"); 

    app.post("/users", async (req, res) => { 
      const user = req.body;
      const query = { email: user?.email }; 
      const existingUser = await userCollecction.findOne(query);    
      if (existingUser) { 
        return res.send({ message: "User already exists", insertedId: null }); 
      } 
 
      const result = await userCollecction.insertOne(user);  
      res.send(result); 
    });
    

    app.get("/users/:email", async (req, res) => { 
      const { email } = req.params; // Access email from route parameters
      const query = { email: email }; 
      const user = await userCollecction.findOne(query)
      if(user){
       return  res.json(user); 
      }
      else{
        res.status(404).json({ message: 'User not found' }); 
      } 
      res.send(user); 
    }); 


    // app.post("/products", async (req, res) => {
    //   const product = req.body;
    //   const result = await productCollection.insertOne(product);
    //   res.send(result);  
    // });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
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



