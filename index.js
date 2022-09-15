import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import contenedorDB from './contenedores/contenedorDb.js';
import mysqlOptions from './config/mysqlconfig.js';
import sqlliteOptions from './config/sqlliteconfig.js';

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);
const contenedorProductos = new contenedorDB(mysqlOptions, 'productos')
const contenedorMensajes = new contenedorDB(sqlliteOptions ,'mensajes')

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

io.on('connection', async socket => {
    console.log("Usuario Conectado");
    const productos = await contenedorProductos.selectData();
    const mensajes = await contenedorMensajes.selectData();
    socket.emit("getProductos", productos);
    socket.emit("getMensajes", mensajes);

    socket.on('addProducto', async prod => {
        console.log("Agregando producto...");
        await contenedorProductos.addData(prod);
        console.log("Producto Agregado.");
        const productos = await contenedorProductos.selectData();
        io.sockets.emit('getProductos', productos);
    });

    socket.on('addMensaje', async msj => {
        console.log("Agregando Mensaje...");
        await contenedorMensajes.addData(msj);
        console.log("Mensaje Agregado");
        const mensajes = await contenedorMensajes.selectData();
        io.sockets.emit('getMensajes', mensajes);   
    })
});

const PORT = process.env.PORT || 8080;
const server = httpServer.listen(PORT, () => {
    console.log(`Servidor levantado en puerto ${PORT}`)
})

server.on('error', error => {
    console.log(error);
})