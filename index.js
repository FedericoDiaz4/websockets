// imports httpserver e io server
import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
//imports session
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectMongo from 'connect-mongo';
//import faker
import { getProductosTest } from './controllers/faker.js';
//imports handlebars
import { engine } from 'express-handlebars';
//imports contenedores y schemas.
import { productosCollection, productosSchema } from './models/productos.js';
import ContenedorMongoDB from './contenedores/contenedorMongo.js';
import { mensajesCollection, mensajesSchema } from './models/mensajes.js';


//iniciacion de servidor
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);
const contenedorMongoProductos = new ContenedorMongoDB(productosCollection, productosSchema);
const contenedorMongoMensajes = new ContenedorMongoDB(mensajesCollection, mensajesSchema);

//middlewares de uso general
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());

//objeto con la info de la session.
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

//agrego la sesion a la app.
app.use(sessionData);

//config handlebars
app.engine('.handlebars', engine());
app.set("view engine", ".handlebars");
app.set("views", "./views");

//get de login, para devolver el html con el formulario de logueo.
app.get('/login', (req, res) => {
    res.sendFile('./views/login.html', {root: '.'});
});

//Post de login, obtiene el nombre escrito y crea la sesion con ese nombre, despues redirecciona al '/'. donde corre la app con sockets
app.post('/login', (req, res) => {
    const { name } = req.body;
    req.session.user = name;
    res.redirect('/');
});

//get de logout, borra la session en cuestion y renderiza el hbs de deslogueo.
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

//apitest de faker.
app.get('/api/productos-test', async (req,res) => {
    const productos = await getProductosTest(5);
    res.render('datos', {
        productos: productos,
        conProductos: (productos.length > 0)
    });
})

//middleware para usar las sesiones en los sockets.
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionData));

//conexion del socket. Si no existe la session redirecciona al login.
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

        //producto nuevo.
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
            const session = socket.request.session;
            if (new Date() > session.cookie._expires) {
                socket.emit('redirect', '/login');
            } else {
                console.log("Agregando Mensaje...");
                await contenedorMongoMensajes.addData(msj);
                console.log("Mensaje Agregado");
                const mensajes = await contenedorMongoMensajes.getAll();
                io.sockets.emit('getMensajes', mensajes);
            }
        });
    }
});

//iniciacion de srv.
const PORT = process.env.PORT || 8080;
const server = httpServer.listen(PORT, () => {
    console.log(`Servidor levantado en puerto ${PORT}`)
})

server.on('error', error => {
    console.log(error);
})