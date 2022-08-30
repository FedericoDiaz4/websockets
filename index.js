import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import Contenedor from './contenedor.js';

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);
const archivoProductos = new Contenedor('./productos.txt');
const archivoMensajes = new Contenedor('./mensajes.txt');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

io.on('connection', async socket => {
    console.log("Usuario Conectado");
    const productos = await archivoProductos.getAll();
    const mensajes = await archivoMensajes.getAll();
    socket.emit("getProductos", productos);
    socket.emit("getMensajes", mensajes);

    socket.on('addProducto', async prod => {
        console.log("Agregando producto...");
        await archivoProductos.save(prod);
        console.log("Producto Agregado.");
        const productos = await archivoProductos.getAll();
        io.sockets.emit('getProductos', productos);
    });

    socket.on('addMensaje', async msj => {
        console.log("Agregando Mensaje...");
        await archivoMensajes.save(msj);
        console.log("Mensaje Agregado");
        const mensajes = await archivoMensajes.getAll();
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