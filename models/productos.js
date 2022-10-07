import mongoose from "mongoose";

export const productosCollection = 'productos';

export const productosSchema = new mongoose.Schema({
    title: {type: String, required: true},
    price: {type: Number, required: true},
    thumbnail: {type: String, required: true}
});