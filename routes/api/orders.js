const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const authenticateToken = require('../../middleware/auth');



//Create an order
router.post('/', authenticateToken, async(req, res)=> {
    try {
        const userId = req.user.id;
        const productId = req.body.productId;

        const product = await Product.findById(productId);
        if(!product) {
            return res.status(400).json({ massage: "Product not found"});
        }else {
            const orderObj = {
                userId: userId,
                productId: productId,
                qty: req.body.qty ?? 1,
                purchaseDate: new Date(),
                expectedDeliveryDate: new Date(),
                status: "in-progress",
                location: req.body.location ?? "",
            }

            orderObj.total = parseInt(product.price) * orderObj.qty;

            const order = new Order(orderObj);
            await order.save();
            res.status(201).json(order);
        }
    } catch (error) {
        res.status(500).json({message: "Something went wrong"});
    }
    
})

module.exports = router;