import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { getProductosTest } from './controllers/faker.js';
import { engine } from 'express-handlebars';
import { productosCollection, productosSchema } from './models/productos.js';
import ContenedorMongoDB from './contenedores/contenedorMongo.js';
import { mensajesCollection, mensajesSchema } from './models/mensajes.js';
import {normalize, schema, denormalize} from 'normalizr';
import util from 'util';

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);
const contenedorMongoProductos = new ContenedorMongoDB(productosCollection, productosSchema);
const contenedorMongoMensajes = new ContenedorMongoDB(mensajesCollection, mensajesSchema);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.engine('.handlebars', engine());
app.set("view engine", ".handlebars");
app.set("views", "./views");

const print = (obj) => {
    console.log(util.inspect(obj, false, 12, true));
}

const normalizarData = (data) => {
    const author = new schema.Entity('author');
    const text = new schema.Entity('text', {
        author: author
    });
    
    const message = new schema.Entity('message', {
        author: author,
        text: [text]
    });

    const normalizedData = normalize(data, message);
    console.log(JSON.stringify(data).length);
    console.log(JSON.stringify(normalizedData).length);
    //print(normalizedData);
    return normalizedData;
} 

io.on('connection', async socket => {
    console.log("Usuario Conectado");
    const productos = await contenedorMongoProductos.getAll();
    const mensajes = await contenedorMongoMensajes.getAll();
    normalizarData(mensajes);
    socket.emit("getProductos", productos);
    socket.emit("getMensajes", mensajes);

    socket.on('addProducto', async prod => {
        console.log("Agregando producto...");
        await contenedorMongoProductos.addData(prod);
        console.log("Producto Agregado.");
        const productos = await contenedorMongoProductos.getAll();
        io.sockets.emit('getProductos', productos);
    });

    socket.on('addMensaje', async msj => {
        console.log("Agregando Mensaje...");
        await contenedorMongoMensajes.addData(msj);
        console.log("Mensaje Agregado");
        const mensajes = await contenedorMongoMensajes.getAll();
        io.sockets.emit('getMensajes', mensajes);   
    })
});

app.get('/api/productos-test', async (req,res) => {
    const productos = await getProductosTest(5);
    res.render('datos', {
        productos: productos,
        conProductos: (productos.length > 0)
    });
})

const PORT = process.env.PORT || 8080;
const server = httpServer.listen(PORT, () => {
    console.log(`Servidor levantado en puerto ${PORT}`)
})

server.on('error', error => {
    console.log(error);
})