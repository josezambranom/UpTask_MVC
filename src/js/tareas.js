// IIFE son funciones que se llaman inmediatamente y se usa para proteger el contenido de un script
(function() {
    obtenerTareas();
    let tareas = [];
    let filtradas = [];

    // Boton para mostrar Modal de agregar tarea
    const nuevaTaraBtn = document.querySelector('#agregar-tarea');
    nuevaTaraBtn.addEventListener('click', function() {
        mostrarFormulario();
    });

    // Filtros de búsqueda
    const filtros = document.querySelectorAll('#filtros input[type="radio"]');
    filtros.forEach(radio => {
        radio.addEventListener('input', filtrarTareas);
    });

    function filtrarTareas(ev) {
        const filtro = ev.target.value;
        if(filtro !== '') {
            filtradas = tareas.filter(tarea => tarea.estado === filtro);
        } else {
            filtradas = [];
        }
        mostrarTareas();
    }

    async function obtenerTareas() {
        try {
            const id = obtenerProyecto();
            const url = `/api/tareas?id=${id}`;
            const respuesta = await fetch(url);
            const resultado = await respuesta.json();

            tareas = resultado.tareas;
            mostrarTareas();

        } catch (error) {
            console.log(error);
        }
    }

    function mostrarTareas() {
        limpiarTareas();
        totalPendientes();
        totalCompletas();

        const arrayTareas = filtradas.length ? filtradas : tareas;

        if(arrayTareas.length === 0) {
            const contenedorTareas = document.querySelector('#listado-tareas');
            const textoNoTareas = document.createElement('LI');
            textoNoTareas.textContent = "No hay tareas";
            textoNoTareas.classList.add('no-tareas');

            contenedorTareas.appendChild(textoNoTareas);
            return;
        }

        const estado = {
            0: 'Pendiente',
            1: 'Completa'
        }

        arrayTareas.forEach(tarea => {
            const contenedorTarea = document.createElement('LI')
            contenedorTarea.dataset.tareaId = tarea.id;
            contenedorTarea.classList.add('tarea');

            const nombreTarea = document.createElement('P');
            nombreTarea.textContent = tarea.nombre;
            nombreTarea.ondblclick = function(){
                mostrarFormulario(true, {...tarea});
            };

            const opcDiv = document.createElement('DIV');
            opcDiv.classList.add('opciones');

            // Botones
            const btnEstadoTarea = document.createElement('BUTTON');
            btnEstadoTarea.classList.add('estado-tarea');
            btnEstadoTarea.classList.add(`${estado[tarea.estado].toLowerCase()}`);
            btnEstadoTarea.textContent = estado[tarea.estado];
            btnEstadoTarea.dataset.estadoTarea = tarea.estado;
            btnEstadoTarea.ondblclick = function () {
                cambiarEstadoTarea({...tarea});
            };

            const btnEliminarTarea = document.createElement('button');
            btnEliminarTarea.classList.add('eliminar-tarea');
            btnEliminarTarea.dataset.idTarea = tarea.id;
            btnEliminarTarea.textContent = 'Eliminar';
            btnEliminarTarea.ondblclick = function() {
                confirmarEliminarTarea({...tarea});
            };

            opcDiv.appendChild(btnEstadoTarea);
            opcDiv.appendChild(btnEliminarTarea);

            contenedorTarea.appendChild(nombreTarea);
            contenedorTarea.appendChild(opcDiv);

            const listadoTareas = document.querySelector('#listado-tareas');
            listadoTareas.appendChild(contenedorTarea);
        });
    }

    function totalPendientes() {
        const totalPendientes = tareas.filter(tarea => tarea.estado === '0');
        const pendientesRadio = document.querySelector('#pendientes');

        if(totalPendientes.length === 0) {
            pendientesRadio.disabled = true;
        } else {
            pendientesRadio.disabled = false;
        }
    }

    function totalCompletas() {
        const totalCompletas = tareas.filter(tarea => tarea.estado === '1');
        const completadasRadio = document.querySelector('#completadas');

        if(totalCompletas.length === 0) {
            completadasRadio.disabled = true;
        } else {
            completadasRadio.disabled = false;
        }
    }

    function mostrarFormulario(editar = false, tarea = {}) {
        const modal = document.createElement('DIV');
        modal.classList.add('modal');
        modal.innerHTML = `
            <form class="formulario nueva-tarea">
                <legend>${editar ? 'Editar tarea' : 'Añade una nueva tarea'}</legend>
                <div class="campo">
                    <label>Tarea</label>
                    <input
                        type="text"
                        name="tarea"
                        id="tarea"
                        placeholder="${tarea.nombre ? 'Edita la tarea' 
                            :'Añadir tarea al proyecto actual'}"
                        value="${tarea.nombre ?? ''}"
                    />
                </div>
                <div class="opciones">
                    <input 
                        type="submit"
                        class="submit-nueva-tarea"
                        value="${tarea.nombre ? 'Guardar cambios' 
                            :'Agregar tarea'}"
                    />
                    <button type="button" class="cerrar-modal">Cancelar</button>
                </div>
            </form>
        `;

        setTimeout(() => {
            const formulario = document.querySelector('.formulario');
            formulario.classList.add('animar');
        }, 0);

        // Delegation
        modal.addEventListener('click', function(ev) {
            ev.preventDefault();
            if(ev.target.classList.contains('cerrar-modal')) {
                const formulario = document.querySelector('.formulario');
                formulario.classList.add('cerrar');
                setTimeout(() => {
                    modal.remove();
                }, 500);
            }

            if(ev.target.classList.contains('submit-nueva-tarea')){
                const nombreTarea = document.querySelector('#tarea').value.trim();
                if(nombreTarea === '') {
                    // Mostrar alerta de error
                    mostrarAlerta('El nombre de la tarea es obligatorio', 'error', 
                        document.querySelector('.formulario legend')
                    );
                    return; // Evita que se siga ejecutando el código
                }
                if(editar) {
                    tarea.nombre = nombreTarea;
                    actualizarTarea(tarea);
                } else {
                    agregarTarea(nombreTarea);
                }
            }
        });

        document.querySelector('.dashboard').appendChild(modal);
    }

    function mostrarAlerta(mensaje, tipo, referencia) {
        // Previene la creación de multiples alertas
        const alertaPrevia = document.querySelector('.alerta');
        if(alertaPrevia) {
            alertaPrevia.remove();
        }

        const alerta = document.createElement('DIV');
        alerta.classList.add('alerta', tipo);
        alerta.textContent = mensaje;
        referencia.appendChild(alerta);

        // InsertBetofe primero se especifica el elemento padre y luego del elemento a añadir
        // el elemento hijo por lo que inserta la alerta antes del legend
        // nextElementSibling se usa para referenciar al siguiente elemento hermano
        referencia.parentElement.insertBefore(alerta, referencia.nextElementSibling);

        // Elminar la alerta
        setTimeout(() => {
            alerta.remove();
        }, 5000);
    }

    // Consultar al servidor
    async function agregarTarea(tarea) {
        // Construir FORM-DATA
        const datos = new FormData();
        datos.append('nombre', tarea);
        datos.append('proyectoId', obtenerProyecto());

        
        try {
            const url = `${location.origin}/api/tarea`;
            const respuesta = await fetch(url, {
                method: 'POST',
                body: datos
            });

            const resultado = await respuesta.json();
            console.log(resultado);

            mostrarAlerta(resultado.mensaje, resultado.tipo, 
                document.querySelector('.formulario legend'));

            if(resultado.tipo === 'exito') {
                const modal = document.querySelector('.modal');
                setTimeout(() => {
                    modal.remove();
                }, 3000);
            }

            // Agregar el objeto de tarea al global de tareas
            const tareaObj = {
                id: String(resultado.id),
                nombre: tarea,
                estado: "0",
                proyectoId: resultado.proyectoId
            }

            tareas = [...tareas, tareaObj];
            mostrarTareas();

        } catch (error) {
            console.log(error);
        }

    }

    function cambiarEstadoTarea(tarea) {
        const nuevoEstado = tarea.estado === "1" ? "0" : "1";
        tarea.estado = nuevoEstado;
        actualizarTarea(tarea);
    }

    async function actualizarTarea(tarea){
        const datos = new FormData();
        datos.append('id', tarea.id);
        datos.append('nombre', tarea.nombre);
        datos.append('estado', tarea.estado);
        datos.append('proyectoId', obtenerProyecto());

        try {
            const url = "/api/tarea/actualizar";
            const respuesta = await fetch(url, {
                method: "POST",
                body: datos
            });
            const resultado = await respuesta.json();

            if(resultado.respuesta.tipo === 'exito') {
                // mostrarAlerta(
                //     resultado.respuesta.mensaje,
                //     resultado.respuesta.tipo,
                //     document.querySelector('.contenedor-nueva-tarea')
                // );

                Swal.fire(
                    resultado.respuesta.mensaje,
                    resultado.respuesta.mensaje,
                    'success'
                );

                const modal = document.querySelector('.modal');
                if(modal) modal.remove();

                // Map crea un nuevo arrego e itera sobre el
                tareas = tareas.map(tareaMemoria => {
                    if(tareaMemoria.id === tarea.id) {
                        tareaMemoria.estado = tarea.estado;
                        tareaMemoria.nombre = tarea.nombre;
                    }

                    return tareaMemoria;
                });
                mostrarTareas();
            }
            console.log(resultado);
        } catch (error) {
            console.log(error);
        }

        // Verifca datos del formData
        // for(let valor of datos.values()){
        //     console.log(valor);
        // }       
    }

    function confirmarEliminarTarea(tarea) {
        Swal.fire({
            title: "¿Eliminar Tarea?",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: 'No'
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                eliminarTarea(tarea);
            }
          });
    }
    
    async function eliminarTarea(tarea) {
        const datos = new FormData();
        datos.append('id', tarea.id);
        datos.append('nombre', tarea.nombre);
        datos.append('estado', tarea.estado);
        datos.append('proyectoId', obtenerProyecto());

        try {
            const url = '/api/tarea/eliminar';
            const respuesta = await fetch(url, {
                method: 'POST',
                body: datos
            });

            const resultado = await respuesta.json();
            if(resultado.resultado) {
                // mostrarAlerta(
                //     resultado.mensaje,
                //     resultado.tipo,
                //     document.querySelector('.contenedor-nueva-tarea')
                // );

                Swal.fire('Eliminado!', resultado.mensaje, 'success');

                // Crea un nuevo arreglo y aplica un filtro
                tareas = tareas.filter(tareaMemoria => tareaMemoria.id !== tarea.id);
                mostrarTareas();
            }

        } catch (error) {
            console.log(error);
        }
    }

    function obtenerProyecto() {
        const proyectoParams = new URLSearchParams(window.location.search);
        const proyecto = Object.fromEntries(proyectoParams.entries());
        return proyecto.id;
    }

    // Limpia el html para no mostrar datos duplicados
    function limpiarTareas() {
        const listadoTareas = document.querySelector('#listado-tareas');
        
        while(listadoTareas.firstChild) {
            listadoTareas.removeChild(listadoTareas.firstChild);
        }
    }

})(); // El parentesis hace que la funcion se ejecute inmediatamente