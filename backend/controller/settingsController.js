const express=require("express");
const router=express.Router();
const {Setting}=require("../model");
const authenticateToken=require("../middleware/authMiddleware");
function adminOnly(req,res,next){
    if(req.user.role!=="admin"){
        return res.status(403).json({message:"Admin access only"});
    }
    next();
}
router.get("/",authenticateToken,adminOnly,async(req,res)=>{
    try{
        let settings=await Setting.findOne();
        if(!settings){
            settings=await Setting.create({
                freeTrialUses:3,
                paidAmount:99
            })
        }
        res.json(settings);
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Could not fetch settings"});
    }
});
router.put("/",authenticateToken,adminOnly,async(req,res)=>{
    try{
        const {freeTrialUses,paidAmount}=req.body;
        let settings=await Setting.findOne();
        if(!settings){
            settings=await Setting.create({
                freeTrialUses,
                paidAmount
            });
        }else{
            await settings.update({
                freeTrialUses,
                paidAmount
            });
        }
        res.json({
            message:"Settings updated successfully",
            settings
        });
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Could not update settings"});
    }
});
module.exports=router;