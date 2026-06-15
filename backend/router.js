const express=require("express")
const router=express.Router()
const resumeController=require('./controller/resumeController');
const authController=require('./controller/authController')
router.use('/auth',authController);
router.use('/resume',resumeController)
console.log("Main router loaded");
router.get("/", (req, res) => {
  res.send("Server is running");
});
module.exports=router;