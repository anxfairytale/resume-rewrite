require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const routes=require('./router');
const db=require('./model/index')
const app = express();
app.use(cors());
app.use(express.json());
app.use("/generated", express.static("generated"));
app.use("/uploads", express.static("uploads"));
app.use('/', routes);
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
if (!fs.existsSync("generated")) {
  fs.mkdirSync("generated");
}
db.sequelize.sync()
.then(()=>{
  console.log('Database Connection Successful');
  app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
}).catch((err)=>{
  console.log(err);
})
