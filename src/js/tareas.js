// IIFE son funciones que se llaman inmediatamente y se usa para proteger el contenido de un script
(function() {
    obtenerTareas();

    // Boton para mostrar Modal de agregar tarea
    const nuevaTaraBtn = document.querySelector('#agregar-tarea');
    nuevaTaraBtn.addEventListener('click', mostrarFormulario);

    async function obtenerTareas() {
        try {
            const id = obtenerProyecto();
            const url = `/api/tareas?id=${id}`;
            const respuesta = await fetch(url);
            const resultado = await respuesta.json();
            mostrarTareas(resultado.tareas);

        } catch (error) {
            console.log(error);
        }
    }

    function mostrarTareas(tareas) {
        if(tareas.length === 0) {
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

        tareas.forEach(tarea => {
            const contenedorTarea = document.createElement('LI')
            contenedorTarea.dataset.tareaId = tarea.id;
            contenedorTarea.classList.add('tarea');

            const nombreTarea = document.createElement('P');
            nombreTarea.textContent = tarea.nombre;

            const opcDiv = document.createElement('DIV');
            opcDiv.classList.add('opciones');

            // Botones
            const btnEstadoTarea = document.createElement('BUTTON');
            btnEstadoTarea.classList.add('estado-tarea');
            btnEstadoTarea.classList.add(`${estado[tarea.estado].toLowerCase()}`);
            btnEstadoTarea.textContent = estado[tarea.estado];
            btnEstadoTarea.dataset.estadoTarea = tarea.estado;

            const btnEliminarTarea = document.createElement('button');
            btnEliminarTarea.classList.add('eliminar-tarea');
            btnEliminarTarea.dataset.idTarea = tarea.id;
            btnEliminarTarea.textContent = 'Eliminar';

            opcDiv.appendChild(btnEstadoTarea);
            opcDiv.appendChild(btnEliminarTarea);

            contenedorTarea.appendChild(nombreTarea);
            contenedorTarea.appendChild(opcDiv);

            const listadoTareas = document.querySelector('#listado-tareas');
            listadoTareas.appendChild(contenedorTarea);
        });
    }

    function mostrarFormulario() {
        const modal = document.createElement('DIV');
        modal.classList.add('modal');
        modal.innerHTML = `
            <form class="formulario nueva-tarea">
                <legend>Añade una nueva tarea</legend>
                <div class="campo">
                    <label>Tarea</label>
                    <input
                        type="text"
                        name="tarea"
                        id="tarea"
                        placeholder="Añadir tarea al proyecto actual"
                    />
                </div>
                <div class="opciones">
                    <input 
                        type="submit"
                        class="submit-nueva-tarea"
                        value="Añadir Tarea"
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
                submitFormNewTarea();
            }
        });

        document.querySelector('.dashboard').appendChild(modal);
    }

    function submitFormNewTarea() {
        const tarea = document.querySelector('#tarea').value.trim();
        if(tarea === '') {
            // Mostrar alerta de error
            mostrarAlerta('El nombre de la tarea es obligatorio', 'error', 
                document.querySelector('.formulario legend')
            );
            return; // Evita que se siga ejecutando el código
        } else {
            agregarTarea(tarea);
        }
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

        } catch (error) {
            console.log(error);
        }

    }

    function obtenerProyecto() {
        const proyectoParams = new URLSearchParams(window.location.search);
        const proyecto = Object.fromEntries(proyectoParams.entries());
        return proyecto.id;
    }

})(); // El parentesis hace que la funcion se ejecute inmediatamente