const socket = io();

const agregarProducto = document.getElementById('agregarProducto');
const agregarMensaje = document.getElementById('agregarMensaje');

const logout = () => {
    console.log("asd");
    console.log(window.location.href);
    window.location.href = 'localhost:8080/logout';
}

socket.on('newSession', async usuario => {
    if (usuario !== null) {
        try {
            const res = await fetch('./views/usuario.handlebars');
            const plantilla = await res.text();
            const template = Handlebars.compile(plantilla);
            document.getElementById("loginUsuario").innerHTML = template({usuario});
        } catch (error) {
            console.log(error);
        }
    }
})

socket.on('getProductos', async productos => {
    if (productos !== null) {
        try {
            const res = await fetch('./views/productos.handlebars');
            const plantilla = await res.text();
            const template = Handlebars.compile(plantilla);
            const conProductos = (productos.length > 0);
            document.getElementById("listaProductos").innerHTML = template({productos, conProductos});
        } catch (error) {
            console.log(error);
        }
    }
})

socket.on('getMensajes', async mensajes => {
    if (mensajes !== null) {
        try {
            const res = await fetch('./views/mensajes.handlebars');
            const plantilla = await res.text();
            const template = Handlebars.compile(plantilla);
            const conMensajes = (mensajes.length >0);
            document.getElementById("listaMensajes").innerHTML = template({mensajes, conMensajes});
        } catch (error) {
            console.log(error);   
        }
    }
})

agregarProducto.addEventListener('submit', e => {
    e.preventDefault();
    const producto = {
        title: agregarProducto[0].value,
        price: agregarProducto[1].value,
        thumbnail: agregarProducto[2].value
    }
    socket.emit('addProducto', producto)
    agregarProducto.reset();
})

agregarMensaje.addEventListener('submit', e => {
    e.preventDefault();
    const mensaje = {
        author: {
            id: agregarMensaje[0].value,
            nombre: agregarMensaje[1].value,
            apellido: agregarMensaje[2].value,
            edad: agregarMensaje[3].value,
            alias: agregarMensaje[4].value,
            avatar: agregarMensaje[5].value
        },
        text: agregarMensaje[6].value,
    }
    socket.emit('addMensaje', mensaje)
    agregarMensaje.reset();
});

socket.on('redirect', ruta => {
    window.location.href = ruta;
});