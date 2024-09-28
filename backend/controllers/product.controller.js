import Product from '../models/product.model.js';
import mongoose from 'mongoose'; // Add this import

export const createProduct = async (req, res) => {
    const product = req.body; // Remove 'await' here
    
    if(!product.name || !product.price || !product.image){
        return res.status(400).json({message: "All fields are required"}); // Add 'return' here
    }

    const newProduct = new Product(product); // Use 'new' keyword here

    try {
        await newProduct.save();
        res.status(201).json({success: true, data: newProduct});
    } catch (error) {
        console.error(error); // Use console.error for errors
        res.status(500).json({success: false, message: error.message});
    }
    
};

export const deleteProduct = async (req, res) => {
    const {id} = req.params;
    console.log(id);
    try {
        await Product.findByIdAndDelete(id);
        res.status(200).json({success: true, message: "Product deleted successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: error.message});
    }
};

export const getProduct = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({success: true, data: products}); // Change 'newProduct' to 'products'
    } catch (error) {
        console.error(error); // Use console.error for errors
        res.status(500).json({success: false, message: error.message});
    }
};

export const updateProduct = async (req, res) => {
    const {id} = req.params;

    const product = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({success: false, message: "Invalid product ID"});
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, product, {new: true});
        res.status(200).json({success: true, data: updatedProduct});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: error.message});
    }
};