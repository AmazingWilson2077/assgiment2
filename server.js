const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// 创建Express应用
const app = express();
app.use(bodyParser.json());

// 连接到MongoDB
mongoose.connect('mongodb+srv://admin:son=ACCESS_DENIED@cluster0.nownue5.mongodb.net/myDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 定义产品Schema
const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    quantity: Number,
    category: String
});

// 创建产品模型
const Product = mongoose.model('Product', productSchema);

// 创建新产品
app.post('/products', async (req, res) => {
    const product = new Product(req.body);
    try {
        await product.save();
        res.status(201).send(product);
    } catch (error) {
        res.status(400).send(error);
    }
});

// // 获取所有产品
// app.get('/products', async (req, res) => {
//     try {
//         const products = await Product.find({});
//         res.status(200).send(products);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });


app.get('/', async (req, res) => {
    res.send('Welcome to the server!');
});

app.get('/products', async (req, res) => {
    const { name } = req.query;
    try {
        const filter = name ? { name: new RegExp(name, 'i') } : {};
        const products = await Product.find(filter);
        res.status(200).send(products);
    } catch (error) {
        res.status(500).send(error);
    }
});


// 获取单个产品
app.get('/products/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const product = await Product.findById(_id);
        if (!product) {
            return res.status(404).send();
        }
        res.status(200).send(product);
    } catch (error) {
        res.status(500).send(error);
    }
});

// 更新产品
app.patch('/products/:id', async (req, res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'price', 'quantity', 'category'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const product = await Product.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });

        if (!product) {
            return res.status(404).send();
        }

        res.send(product);
    } catch (error) {
        res.status(400).send(error);
    }
});

// 删除产品
app.delete('/products/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const product = await Product.findByIdAndDelete(_id);

        if (!product) {
            return res.status(404).send();
        }

        res.send(product);
    } catch (error) {
        res.status(500).send(error);
    }
});


// delete_all
app.delete('/products', async (req, res) => {
    try {
        const result = await Product.deleteMany({});

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: 'No products found to delete.' });
        }

        res.send({ message: 'All products deleted successfully.', deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).send(error);
    }
});


// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
