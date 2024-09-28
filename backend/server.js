import express from 'express';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import productRoutes from './routes/product.route.js';
import cors from 'cors';  // Add this line
dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());

app.use('/api/products', productRoutes);
        
app.listen(PORT, () => {
    connectDB()
    console.log('Server is running on http://localhost:'+ PORT);
});

