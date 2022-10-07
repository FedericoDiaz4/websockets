import mongoose from "mongoose";
import Conn from '../config/configMongo.js';

const err = {err: "Error, no se puede conectar a la BD"};
Conn()

class ContenedorMongoDB {
    constructor(nombreColection, schema) {
        this.collection = mongoose.model(nombreColection, schema);
    }

    async getAll() {
        try {
            const data = await this.collection.find();
            return data;
        } catch (error) {
            console.log(error);
            return err;
        }
    }

    async getById(id, carrito) {
        try {
            const data = await this.collection.findById(id);
            if (data == null) {
                if (carrito) return {error: 'Error, carrito no encontrado'};
                return {error: "Error, producto no encontrado"};
            }
            if (carrito) return data.productos;
            return data;
        } catch (error) {
            console.log(error);
            return err;
        }
    }

    async addData(data) {
        try {
            return this.collection.create(data);
        } catch (error) {
            console.log(error);
            return err;   
        }
    }

    async addDataToCart(idCart, prod) {
        const cart = await this.getById(idCart);
        cart.productos.push(prod);
        await this.editData(idCart, cart);
        return cart;
    }

    async editData(id, data) {
        try {
            const update = await this.collection.replaceOne({'_id': id}, data);
            if (update == 0){
                return {err: "Error, no se pudo actualizar"};
            }
            return data;
        } catch (error) {
            console.log(error);
            return err;
        }
    }

    async deleteData(id) {
        try {
            const del = await this.collection.findByIdAndDelete(id);
            if (del == 0) {
                return {err: "Error, producto a eliminar no existe"};
            }
            return {done: `Producto ${id} eliminado satisfactoriamente.`};
        } catch (error) {
            console.log(error);
            return err;
        }
    }

    async deleteDataToCart(idCart, idProd) {
        const cart = await this.getById(idCart);
        const index = cart.productos.findIndex(d=> d._id == idProd);
        if (index == -1) {
            return {error: 'Error, producto a eliminar no encoentrado en el carrito'};
        }
        cart.productos.splice(index, 1);
        await this.editData(idCart, cart);
        return cart;
    }

    async deleteAll() {
        try {
            await this.collection.deleteMany({});    
        } catch (error) {
            console.log(error);
            return err;
        }
    }

}

export default ContenedorMongoDB;