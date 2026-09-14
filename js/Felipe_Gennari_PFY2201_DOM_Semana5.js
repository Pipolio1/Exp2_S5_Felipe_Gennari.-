/* ============================================================
   Gaming House — JavaScript Semana 5
   Autor: Felipe Gennari — PFY2201 Desarrollo Frontend I
   Objetivo: manipular el DOM, manejar eventos click/mouseover/submit
   y cargar datos externos con Fetch API usando promesas.
   ============================================================ */

// Estado simple del carrito usado para calcular el total dinámico.
const carrito = [];

// Punto de entrada: espera a que el DOM esté listo antes de manipularlo.
document.addEventListener('DOMContentLoaded', inicializarAplicacion);

/**
 * Inicializa la aplicación configurando eventos y cargando datos externos.
 * Se ejecuta cuando el documento HTML ya fue parseado por el navegador.
 */
function inicializarAplicacion() {
    configurarEventos();
    cargarNoticiasAPI();
    actualizarTotalCarrito();
    mostrarMensaje('Interactividad cargada: busca productos, pasa el mouse por las tarjetas o agrega items al carrito.', 'info');
}

/**
 * Configura los eventos principales de la página.
 * Usa delegación de eventos sobre el contenedor de productos y el formulario.
 */
function configurarEventos() {
    const contenedorProductos = document.getElementById('contenedor-productos');
    const formBusqueda = document.getElementById('form-busqueda');

    if (contenedorProductos) {
        contenedorProductos.addEventListener('click', manejarClickCarrito);
        contenedorProductos.addEventListener('mouseover', resaltarTarjeta);
        contenedorProductos.addEventListener('mouseout', quitarResaltadoTarjeta);
    }

    if (formBusqueda) {
        formBusqueda.addEventListener('submit', manejarBusqueda);
    }
}

/**
 * Maneja el evento click de los botones "Agregar al carrito".
 * Crea un nuevo elemento li en el DOM y actualiza el total.
 * @param {MouseEvent} evento Evento click capturado por delegación.
 */
function manejarClickCarrito(evento) {
    const boton = evento.target.closest('.btn-agregar');

    if (!boton) {
        return;
    }

    const producto = {
        nombre: boton.dataset.nombre,
        precio: Number(boton.dataset.precio)
    };

    agregarProductoAlCarrito(producto);
    mostrarMensaje(`${producto.nombre} agregado al carrito.`, 'exito');
}

/**
 * Agrega un producto al carrito usando createElement y appendChild.
 * @param {{nombre: string, precio: number}} producto Producto seleccionado.
 */
function agregarProductoAlCarrito(producto) {
    const listaCarrito = document.getElementById('lista-carrito');

    if (!listaCarrito) {
        return;
    }

    // Si es el primer producto, se limpia el mensaje de carrito vacío.
    if (carrito.length === 0) {
        listaCarrito.innerHTML = '';
    }

    carrito.push(producto);

    const itemCarrito = document.createElement('li');
    itemCarrito.classList.add('list-group-item', 'item-carrito');
    itemCarrito.textContent = `${producto.nombre} - ${formatearPrecio(producto.precio)}`;

    listaCarrito.appendChild(itemCarrito);
    actualizarTotalCarrito();
}

/**
 * Resalta visualmente una tarjeta cuando el mouse pasa sobre ella.
 * @param {MouseEvent} evento Evento mouseover capturado por delegación.
 */
function resaltarTarjeta(evento) {
    const tarjeta = evento.target.closest('.card-producto');

    if (tarjeta) {
        tarjeta.classList.add('card-resaltada');
    }
}

/**
 * Quita el resaltado solo cuando el mouse sale completamente de la tarjeta.
 * @param {MouseEvent} evento Evento mouseout capturado por delegación.
 */
function quitarResaltadoTarjeta(evento) {
    const tarjeta = evento.target.closest('.card-producto');

    if (tarjeta && !tarjeta.contains(evento.relatedTarget)) {
        tarjeta.classList.remove('card-resaltada');
    }
}

/**
 * Maneja el submit del buscador evitando la recarga de la página.
 * Filtra las tarjetas de productos según el texto ingresado.
 * @param {SubmitEvent} evento Evento submit del formulario de búsqueda.
 */
function manejarBusqueda(evento) {
    evento.preventDefault();

    const inputBusqueda = document.getElementById('buscador');
    const termino = inputBusqueda ? inputBusqueda.value.trim().toLowerCase() : '';
    const tarjetas = document.querySelectorAll('#contenedor-productos .card-producto');
    let productosVisibles = 0;

    tarjetas.forEach((tarjeta) => {
        const columna = tarjeta.closest('.col-12');
        const textoTarjeta = tarjeta.textContent.toLowerCase();
        const coincide = textoTarjeta.includes(termino);

        if (columna) {
            columna.classList.toggle('d-none', !coincide);
        }

        if (coincide) {
            productosVisibles += 1;
        }
    });

    if (termino === '') {
        mostrarMensaje('Mostrando todos los productos disponibles.', 'info');
    } else if (productosVisibles > 0) {
        mostrarMensaje(`Se encontraron ${productosVisibles} producto(s) para "${termino}".`, 'exito');
    } else {
        mostrarMensaje(`No se encontraron productos para "${termino}".`, 'error');
    }
}

/**
 * Carga noticias desde una API pública usando Fetch API.
 * Maneja la promesa con then/catch y muestra errores en la interfaz.
 */
function cargarNoticiasAPI() {
    const estadoAPI = document.getElementById('estado-api');
    const listaNoticias = document.getElementById('lista-noticias');

    if (!estadoAPI || !listaNoticias) {
        return;
    }

    estadoAPI.textContent = 'Cargando noticias desde la API...';

    fetch('https://jsonplaceholder.typicode.com/posts?_limit=3')
        .then((respuesta) => {
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            return respuesta.json();
        })
        .then((noticias) => {
            estadoAPI.textContent = 'Noticias cargadas correctamente.';
            listaNoticias.innerHTML = '';

            noticias.forEach((noticia) => {
                listaNoticias.appendChild(crearElementoNoticia(noticia));
            });
        })
        .catch((error) => {
            console.error('Error al cargar noticias:', error);
            estadoAPI.textContent = 'No se pudieron cargar las noticias. Revisa tu conexión e intenta nuevamente.';
            mostrarMensaje('Error al cargar datos externos con Fetch API.', 'error');
        });
}

/**
 * Crea una tarjeta de noticia con createElement y appendChild.
 * @param {{title: string, body: string}} noticia Noticia obtenida desde la API.
 * @returns {HTMLDivElement} Columna Bootstrap lista para insertar en el DOM.
 */
function crearElementoNoticia(noticia) {
    const columna = document.createElement('div');
    columna.classList.add('col-12', 'col-md-4');

    const articulo = document.createElement('article');
    articulo.classList.add('card', 'card-producto', 'h-100', 'noticia-api');

    const cuerpo = document.createElement('div');
    cuerpo.classList.add('card-body');

    const titulo = document.createElement('h3');
    titulo.classList.add('card-title', 'fs-5');
    titulo.textContent = noticia.title;

    const texto = document.createElement('p');
    texto.classList.add('card-text');
    texto.textContent = noticia.body;

    cuerpo.appendChild(titulo);
    cuerpo.appendChild(texto);
    articulo.appendChild(cuerpo);
    columna.appendChild(articulo);

    return columna;
}

/**
 * Muestra mensajes dinámicos accesibles para el usuario.
 * @param {string} texto Mensaje a mostrar.
 * @param {'info'|'exito'|'error'} tipo Tipo visual del mensaje.
 */
function mostrarMensaje(texto, tipo = 'info') {
    const mensaje = document.getElementById('mensaje-interaccion');

    if (!mensaje) {
        return;
    }

    mensaje.textContent = texto;
    mensaje.className = `mensaje-interaccion mensaje-${tipo}`;
}

/**
 * Recalcula y muestra el total actual del carrito.
 */
function actualizarTotalCarrito() {
    const totalCarrito = document.getElementById('total-carrito');
    const total = carrito.reduce((acumulado, producto) => acumulado + producto.precio, 0);

    if (totalCarrito) {
        totalCarrito.textContent = `Total: ${formatearPrecio(total)}`;
    }
}

/**
 * Formatea un número como precio en pesos chilenos.
 * @param {number} valor Valor numérico del precio.
 * @returns {string} Precio formateado para mostrar en pantalla.
 */
function formatearPrecio(valor) {
    return `$${valor.toLocaleString('es-CL')} CLP`;
}
