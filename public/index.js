const socket = io();

const agregarProducto = document.getElementById('agregarProducto');
const agregarMensaje = document.getElementById('agregarMensaje');

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
        author: agregarMensaje[0].value,
        msj: agregarMensaje[1].value,
        fyh: new Date().toLocaleDateString(),
    }
    socket.emit('addMensaje', mensaje)
    agregarMensaje.reset();
})
