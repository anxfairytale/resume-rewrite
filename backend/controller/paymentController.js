require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();
const { Setting } = require("../model");
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
}); const authenticateToken = require('../middleware/authMiddleware');
const db = require("../model/index");
const User = db.User;
router.get("/price",authenticateToken,async (req, res) => {
    try {
      const settings = await Setting.findOne();
      if (!settings) {
        return res.status(404).json({
          message: "Payment settings are not configured",
        });
      }
      const paidAmount = Number(settings.paidAmount);
      if (!Number.isFinite(paidAmount) ||paidAmount <= 0) {
        return res.status(400).json({
          message: "Invalid payment amount configured",
        });
      }
      return res.status(200).json({
        paidAmount,
      });
    } catch (err) {
      console.log("Fetch payment price error:", err);
      return res.status(500).json({
        message: "Could not fetch payment price",
      });
    }
  }
);
router.post("/create-order", authenticateToken, async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({
                freeTrialUses: 3,
                paidAmount: 99,
                proUses:10
            });
        }
        const amount=settings.paidAmount;
        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });
        res.status(200).json(order);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Could not create payment order" });
    }
});
router.post("/verify-payment", authenticateToken, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Payment verification failed",
            });
        }
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({
                freeTrialUses: 3,
                paidAmount: 99,
                proUses:10
            });
        }
        await User.update(
            {
                plan: "pro",
                proUsesLeft:settings.proUses,
            },
            {
                where: { id: req.user.id },
            }
        );
        const user = await User.findByPk(req.user.id);
        res.status(200).json({
            message: "Payment verified successfully",
            user
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Could not verify payment",
        });
    }
})
module.exports = router;
