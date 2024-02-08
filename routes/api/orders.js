const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const authenticateToken = require('../../middleware/auth');
const { body, validationResult } = require("express-validator");


//Create an order
router.post('/', authenticateToken, async(req, res)=> {
    try {
        const userId = req.user.id;
        const productId = req.body.productId;
        const qty = req.body.qty ?? 1;

        const product = await Product.findById(productId);
        if(!product) {
            return res.status(400).json({ massage: "Product not found"});
        }else {
            const orderObj = {
                userId: userId,
                productId: productId,
                qty: qty,
                purchaseDate: new Date(),
                expectedDeliveryDate: new Date(),
                status: "in-progress",
                location: req.body.location ?? "",
                total: parseInt(product.price) * qty
            }

            //orderObj.total = parseInt(product.price) * orderObj.qty;

            const order = new Order(orderObj);
            await order.save();
            res.status(201).json(order);
        }
    } catch (error) {
        res.status(500).json({message: "Something went wrong"});
    }
    
})

//Get all orders by user
router.get("/", authenticateToken, async (req, res) => {
    try{
        const userId = req.user.id;
        const orders = await Order.find({userId: userId});
        if(orders.length === 0) {
            return res.status(400).json({ massage: "Orders not found"});
        }else{
            res.status(200).json(orders);
        }
    } catch {
        res.status(500).json({massage: "Something went wrong"});
    }
})

//Change order status
router.put("/status/:id", 
    [
        authenticateToken, 
        [
            body("status", "status is required").notEmpty(),
            body("status", "give a valid status").isIn(["in-progress", "delivered"]),
        ],
    ], 
    async (req, res) => {
        try{
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const id = req.params.id;
            const userId = req.user.id;
            const status = req.body.status;
            const order = await Order.findOneAndUpdate({_id: id, userId: userId}, {status: status}, {new: true});
            if(!order) {
                return res.status(400).json({massage: "Order not found"});
            } else {
                res.json(order);
            }
        } catch {
            res.status(500).json({massage: "Something went wrong"});
    }
});

//* Get one order
router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const userId = req.user.id;
      const order = await Order.findOne({ _id: id, userId: userId });
      if (order) {
        res.json(order);
      } else {
        return res.status(400).json({ message: "Order not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  });
  
  //* Delete One Order
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const userId = req.user.id;
      const order = await Order.findOneAndDelete({ _id: id, userId: userId });
      if (order) {
        res.json({message:"Deleted" });
      } else {
        return res.status(400).json({ message: "Order not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  });


module.exports = router;