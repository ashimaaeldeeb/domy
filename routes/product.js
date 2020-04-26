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

//search for product  
router.post('/search', async (req, res) => {
    const searchparams = {
        ...req.body
    }
    if (searchparams.title) {
        await Product.find({
            title: new RegExp(".*" + searchparams.title + ".*")
        }, (error, result) => {
            if (error) {
                return res.send(error)
            }
            if (!result.length)
                return res.status(404).send("Data Not Found")
            return res.send(result)
        })
    }
});

//get promoted products only
router.get('/promoted', async (req, res) => {
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
    const deleltedPrpduct = await Product.findById(id);
    res.send(deleltedPrpduct);
});

//edit product 
router.patch('/:id', upload.array('images', 5), async (req, res) => {
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
        productFromDB.details.brand = product.details.brand ? product.details.brand : productFromDB.details.brand;
        productFromDB.details.processor = product.details.processor ? product.details.processor : productFromDB.details.processor;
        productFromDB.details.ram = product.details.ram ? product.details.ram : productFromDB.details.ram;
        productFromDB.details.hardDisk = product.details.hardDisk ? product.details.hardDisk : productFromDB.details.hardDisk;
        productFromDB.details.graphicsCard = product.details.graphicsCard ? product.details.graphicsCard : productFromDB.details.graphicsCard;
        productFromDB.details.color = product.details.color ? product.details.color : productFromDB.details.color;
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