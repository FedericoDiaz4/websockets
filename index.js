import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import { getProductosTest } from './controllers/faker.js';
import { engine } from 'express-handlebars';
import { productosCollection, productosSchema } from './models/productos.js';
import ContenedorMongoDB from './contenedores/contenedorMongo.js';
import { mensajesCollection, mensajesSchema } from './models/mensajes.js';

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);
const contenedorMongoProductos = new ContenedorMongoDB(productosCollection, productosSchema);
const contenedorMongoMensajes = new ContenedorMongoDB(mensajesCollection, mensajesSchema);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());

const sessionData = session({
    store: new connectMongo({
        mongoUrl: 'mongodb+srv://root:q1w2e3r4@cluster0.dxsuj0e.mongodb.net/?retryWrites=true&w=majority',
        useNewUrlParser: true,
        useUnifiedTopology: true
    }),
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 10000 * 60
    },
    rolling: true
});

app.use(sessionData);

app.engine('.handlebars', engine());
app.set("view engine", ".handlebars");
app.set("views", "./views");

app.get('/login', (req, res) => {
    res.sendFile('./views/login.html', {root: '.'});
});

app.post('/login', (req, res) => {
    const { name } = req.body;
    req.session.user = name;
    res.redirect('/');
});

app.get('/logout', async (req,res) => {
    const user = req.session.user;
    req.session.destroy(err => {
        if (err) {
           return res.json({status: 'Logout Error', body: err});
        }
    })
    res.render('logout', {
        name: user
    });
});

app.get('/api/productos-test', async (req,res) => {
    const productos = await getProductosTest(5);
    res.render('datos', {
        productos: productos,
        conProductos: (productos.length > 0)
    });
})

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionData));

io.on('connection', async socket => {
    const session = socket.request.session;
    if (!session.user) {
        socket.emit('redirect', '/login');
    } else {
        const user = session.user;
        console.log(`Usuario: ${user} conectado`);
        const productos = await contenedorMongoProductos.getAll();
        const mensajes = await contenedorMongoMensajes.getAll();
        socket.emit('newSession', user);
        socket.emit("getProductos", productos);
        socket.emit("getMensajes", mensajes);

        socket.on('addProducto', async prod => {
            const session = socket.request.session;
            if (new Date() > session.cookie._expires) {
                socket.emit('redirect', '/login');
            } else {
                console.log("Agregando producto...");
                await contenedorMongoProductos.addData(prod);
                console.log("Producto Agregado.");
                const productos = await contenedorMongoProductos.getAll();
                io.sockets.emit('getProductos', productos);
            }
        });

        socket.on('addMensaje', async msj => {
            console.log("Agregando Mensaje...");
            await contenedorMongoMensajes.addData(msj);
            console.log("Mensaje Agregado");
            const mensajes = await contenedorMongoMensajes.getAll();
            io.sockets.emit('getMensajes', mensajes);
            session.touch();
        });
    }
});

const PORT = process.env.PORT || 8080;
const server = httpServer.listen(PORT, () => {
    console.log(`Servidor levantado en puerto ${PORT}`)
})

server.on('error', error => {
    console.log(error);
})