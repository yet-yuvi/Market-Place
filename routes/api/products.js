const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const File = require('../../models/File');
const authenticateToken = require('../../middleware/auth');
const multer = require('multer');


const  storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
    }
})

const upload = multer({storage: storage});

// Upload a file
router.post("/uploads", [authenticateToken, upload.single("file")], async(req, res) => {
  if (req.user.type != "admin") {
    return res.status(400).json({ message: "You are not an admin" });
  }else {
    const fileObj = {
      name: req.file.filename,    // Question
      path: req.file.path
    }

    const file = new File(fileObj);
    await file.save();
    res.status(201).json(file);
    console.log("file");
  }
    
});

// Product Create
router.post('/', authenticateToken, async(req, res) => {
    try {
      if(req.user.type !== 'admin') {
          return res.status(400).json({message: "You are not an admin"});
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
      if (product?.fileId) {
          const createdProduct = await Product.findById(product._id)
          .populate(["fileId", "userId"])    // Question: what populate?
          .exec();
          res.status(201).json(createdProduct);
        } else {
          res.status(201).json(product);
        }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong." });
    }
});


//* get all products
router.get("/", authenticateToken, async (req, res) => {
    try {
      let current = req?.query?.current ?? "1";
      current = parseInt(current);
      let pageSize = req?.query?.pageSize ?? "10";
      pageSize = parseInt(pageSize);
  
      const aggregate = [];
  
      aggregate.push({
        $match: {},
      });
  
      aggregate.push({
          $sort: {
              // name: 1,
              createdAt: -1
          }
      })
  
      aggregate.push({
          $skip: (current-1) * pageSize
      })
      aggregate.push({
          $limit: pageSize * 1
      })
  
      aggregate.push({
        $lookup: {
          from: "files",
          localField: "fileId",
          foreignField: "_id",
          as: "file",
        },
      });
  
      aggregate.push({
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "vendor",
        },
      });
  
      const products = await Product.aggregate(aggregate);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Something went wrong." });
    }
  });

  
  //* get one product
  router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const product = await Product.findById(id)
        .populate(["fileId", "userId"])
        .exec();
  
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: "No product found." });
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong." });
    }
  });

  
  //* update one product
  router.put("/:id", authenticateToken, async (req, res) => {
    try {
      if (req.user.type != "admin") {
        return res.status(400).json({ message: "You are not an admin" });
      } else {
        const id = req.params.id;
        const body = req.body;
        const product = await Product.findByIdAndUpdate(id, body, { new: true });
        //const product = await Product.findOneAndUpdate({_id: id}, {userId: req.user.id}, body, { new: true });
  
        if (product) {
          res.json(product);
        } else {
          res.status(404).json({ message: "No product found." });
        }
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong." });
    }
  });

  
  //* delete one product
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      if (req.user.type != "admin") {
        return res.status(400).json({ message: "You are not an admin" });
      } else {
        const id = req.params.id;
        const product = await Product.findById(id);
  
        if (product) {
          await Product.findByIdAndDelete(id);
          res.json(product);
        } else {
          res.status(404).json({ message: "No product found." });
        }
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong." });
    }
  });


module.exports = router;