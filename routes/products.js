const express = require('express');
const Product = require('../models/product');
const upload = require('../midlware/uploadImg');
const validateProduct = require('../helpers/validateProduct');
const validateObjectId = require('../helpers/validateObjectId');

const router = express.Router();

//get all products 
router.get('/', async (req, res) => {
    const products = await Product.find({
        isDeleted: {
            $ne: true
        }
    });
    if (!products) return res.status(404).send('Product not found');
    res.send(products);
});

//TODO : check which search???
//search for product  
router.post('/search', async (req, res) => {
    console.log("search Product ");
    const searchparams = {
        ...req.body
    }
    if (searchparams.title) {
        await Product.find({
            $and: [{
                title: new RegExp(".*" + searchparams.title + ".*") //TODO : case sensitive???
            }, {
                isDeleted: { $ne: true}
            }]
        }, (error, result) => {
            if (error) {
                return res.send(error)
            }
            if (!result.length)
                return res.status(404).send("Data Not Found")
            return res.send(result)
        })
    }
    else{
        return res.status(404).send("No title found")
    }
});

//   /search/Brand?Brand=Lenovo 
//   /search/Brand?Brand=HP
//   /search/Brand?Brand=Dell
router.get('/search/Brand', async (req, res) => {
    console.log("search Product brand");
    console.log("hi2");
    //console.log("Requset "+req.baseUrl);
    //const queryObject = url.parse(req.url,true).search;
    console.log(req.query.Brand);
    //console.log(queryObject);
    //console.log(queryObject[0]);
    //console.log(queryObject.Brand);
    //console.log(queryObject["Brand"]);
    //const products = await Product.find({"title":{ $regex:req.query.title}},{"isDeleted": false});
    const products = await Product.find({"details.Brand":req.query.Brand},{"isDeleted": false});
    //console.log(req.originalUrl);
    //console.log(products)
    if (!products) return res.status(404).send('Product not found');
    res.send(products);
});

//   /search/Processor?Processor=Core i3 
//   /search/Processor?Processor=Core i5
//   /search/Processor?Processor=Core i7
//   /search/Processor?Processor=Core i9
router.get('/search/Processor', async (req, res) => {
    console.log("search Product Processor");
    const products = await Product.find({"details.Processor":req.query.Processor},{"isDeleted": false});
    if (!products) return res.status(404).send('Product not found');
    res.send(products);
});


//get promoted products only
router.get('/promoted', async (req, res) => {
    console.log("get Product promoted");
    const products = await Product.find({
        $and: [{
            isPromoted: true
        }, {
            isDeleted: false
        }]
    });
    if (!products)
        return res.status(404).send('Product not found');
    res.send(products);
});

//get Product
router.get('/:id', async (req, res) => {
    console.log("get Product by id");
    const {
        id
    } = req.params;
    const {
        error
    } = validateObjectId(id);
    if (error) return res.status(400).send('Invalid Product');
    //find->filter is delelted and by id 
    const product = await Product.find({
        $and: [{
            '_id': id
        }, {
            isDeleted: {
                $ne: true
            }
        }]
    });
    if (!product) return res.status(404).send('Product not found');

    res.send(product);
});

//delete product 
router.delete('/:id', async (req, res) => {
    console.log("delete Product by id");
    const {
        id
    } = req.params;
    const {
        error
    } = validateObjectId(id);
    if (error) return res.status(400).send('Invalid Product');
    const product = await Product.findByIdAndUpdate(id, {
        $set: {
            isDeleted: true
        }
    });
    if (!product)
        return res.status(404).send('Product not found');
    const deleltedProduct = await Product.findById(id);
    res.send(deleltedProduct);
});

//edit product 
router.patch('/:id', upload.array('images', 5), async (req, res) => {
    console.log("update Product by id");
    const {
        id
    } = req.params;
    const {
        error
    } = validateObjectId(id);
    if (error)
        return res.status(400).send(error.details);
    const product = {
        ...req.body
    }

    let productFromDB = await Product.findOne({
        _id: id
    });
    productFromDB.title = product.title ? product.title : productFromDB.title;
    productFromDB.price = product.price ? product.price : productFromDB.price;
    productFromDB.ratioOfPromotion = product.ratioOfPromotion ? product.ratioOfPromotion : productFromDB.ratioOfPromotion;
    productFromDB.isPromoted = product.isPromoted ? product.isPromoted : productFromDB.isPromoted;
    productFromDB.quantity = product.quantity ? product.quantity : productFromDB.quantity;
    productFromDB.isDeleted = product.isDeleted ? product.isDeleted : productFromDB.isDeleted;
    if (!product.details) {
        productFromDB.details = productFromDB.details;
    } else {
        productFromDB.details.Brand = product.details.Brand ? product.details.Brand : productFromDB.details.Brand;
        productFromDB.details.Processor = product.details.Processor ? product.details.Processor : productFromDB.details.Processor;
        productFromDB.details.RAM = product.details.RAM ? product.details.RAM : productFromDB.details.RAM;
        productFromDB.details.HardDisk = product.details.HardDisk ? product.details.HardDisk : productFromDB.details.HardDisk;
        productFromDB.details.GPU = product.details.GPU ? product.details.GPU : productFromDB.details.GPU;
        productFromDB.details.Color = product.details.Color ? product.details.Color : productFromDB.details.Color;
    }
    if (req.files) {
        let images = [];
        req.files.forEach(image => {
            images.push(`Uploads/${image.filename}`);
        })
        productFromDB.images = images;
    } else {
        productFromDB.images = productFromDB.images;
    }


    await productFromDB.save();
    res.send(productFromDB);
});

//add product
router.post('/', upload.array('images', 5), async (req, res) => {
    console.log("add Product by id");
    const {
        error
    } = validateProduct(req.body);
    if (error) return res.status(400).send(error.details);
    let product = new Product({
        ...req.body
    });

    let images = [];
    req.files.forEach(image => {
        images.push(`Uploads/${image.filename}`);
    })
    product.isDeleted = false;
    product.images = images;
    if (product.ratioOfPromotion)
        product.isPromoted = true;
    product = await product.save();
    res.send(product);
});

module.exports = router;