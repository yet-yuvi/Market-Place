const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const File = require('../../models/File');
const authenticateToken = require('../../middleware/auth');
const multer = require('multer');

const  storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./public/uploads/");
    },
    filename: function(req, file, cb){
        const uniqueSuffix = Date.now;
        cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
    }
})

const upload = multer({storage: storage});

// Upload a file
router.post("/uploads", upload.single("file"), async(req, res) => {
    const fileObj = {
        name: req.file.filename,
        path: req.file.path
    }

    const file = new File(fileObj);
    await file.save();
    res.status(201).json(file);
    console.log("file");
})

// Product Create
router.post('/', authenticateToken, async(req, res) => {
    if(req.user.type != 'admin'){
        return res.status(400).json({message: "You are not an admin"})

    }

    const userId = req.user.id

    const productObj = {
        name: req.body.name,
        desc: req.body.desc,
        madeIn: req.body.madeIn,
        price: req.body.price,
        fileId: req.body.fileId,
        userId: userId
    }

    const product = new Product(productObj)
    await product.save()
    res.status(201).json(product)
})


module.exports = router;