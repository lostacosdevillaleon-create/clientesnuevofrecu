// CÓDIGO PRINCIPAL DE LA APLICACIÓN - VERSIÓN OPTIMIZADA

// Datos en memoria
let clients = [];
let premiosConfig = [];
let metricasData = {
    cobrosPremios: [],
    totalClientes: 0
};

// Credenciales de administrador
const adminCredentials = {
    username: "admin",
    password: "villaleon2023"
};

// Control de búsqueda
let busquedaActiva = false;
let terminoBusqueda = '';
let clientesFiltrados = [];

// Variable para controlar la actualización automática
let autoUpdateInterval = null;
let isAdminLoggedIn = false;
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 30000; // 30 segundos (en lugar de 10)

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando aplicación optimizada...');
    inicializarAplicacion();
});

function inicializarAplicacion() {
    console.log('🔧 Inicializando aplicación VillaLeon optimizada...');
    
    inicializarTabsPrincipales();
    inicializarLoginAdmin();
    inicializarCliente();
    
    console.log('✅ Aplicación inicializada correctamente');
}

// =============================================
// INICIALIZACIÓN DE COMPONENTES
// =============================================

function inicializarTabsPrincipales() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Actualizar pestañas activas
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

function inicializarLoginAdmin() {
    const loginForm = document.getElementById('login-form');
    const adminLogout = document.getElementById('admin-logout');

    if (!loginForm) {
        console.error('❌ No se encontró el formulario de login');
        return;
    }

    // Inicio de sesión de administrador
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('🔐 Intentando login de administrador...');
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === adminCredentials.username && password === adminCredentials.password) {
            console.log('✅ Login exitoso');
            isAdminLoggedIn = true;
            document.getElementById('admin-login').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
            showMessage('Sesión iniciada correctamente', 'success');
            
            // Inicializar panel de administrador
            inicializarPanelAdmin();
            
            // Cargar datos iniciales
            loadClientsTable().catch(error => {
                console.error('Error cargando clientes:', error);
                showMessage('Error cargando datos: ' + error.message, 'error');
            });

            // Iniciar actualización automática (optimizada)
            iniciarActualizacionAutomaticaOptimizada();
            
        } else {
            console.log('❌ Login fallido');
            showMessage('Credenciales incorrectas. Usuario: admin, Contraseña: villaleon2023', 'error');
        }
    });

    // Cerrar sesión de administrador
    if (adminLogout) {
        adminLogout.addEventListener('click', function() {
            isAdminLoggedIn = false;
            detenerActualizacionAutomatica();
            document.getElementById('admin-login').style.display = 'block';
            document.getElementById('admin-panel').style.display = 'none';
            loginForm.reset();
            busquedaActiva = false;
            terminoBusqueda = '';
            showMessage('Sesión cerrada', 'success');
        });
    }
}

function inicializarCliente() {
    const accessOptions = document.querySelectorAll('.access-option');
    const registerForm = document.getElementById('register-form');
    const emailOnlyForm = document.getElementById('email-only-form');
    const backToAccess = document.getElementById('back-to-access');
    const verPremiosBtn = document.getElementById('ver-premios');
    const backToInfo = document.getElementById('back-to-info');

    // Opciones de acceso (nuevo vs cliente registrado)
    accessOptions.forEach(option => {
        option.addEventListener('click', function() {
            const accessType = this.getAttribute('data-access');
            
            // Actualizar opciones activas
            accessOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar formulario correspondiente
            document.querySelectorAll('.access-form').forEach(form => {
                form.classList.remove('active');
            });
            
            if (accessType === 'new') {
                document.getElementById('new-client-form').classList.add('active');
            } else {
                document.getElementById('returning-client-form').classList.add('active');
            }
        });
    });

    // Registro de nuevo cliente
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            
            try {
                const result = await registerClient(name, email);
                
                if (result.success) {
                    showClientInfo(result.client);
                    showMessage(result.message, 'success');
                } else {
                    if (result.message.includes('ya está registrado')) {
                        // Si el email ya existe, mostrar información del cliente
                        const clientResult = await getClientByEmail(email);
                        if (clientResult.success) {
                            showClientInfo(clientResult.client);
                            showMessage('Bienvenido de nuevo! Aquí están tus puntos.', 'success');
                        } else {
                            showMessage(result.message, 'error');
                        }
                    } else {
                        showMessage(result.message, 'error');
                    }
                }
            } catch (error) {
                console.error('Error en registro:', error);
                showMessage('Error en el registro: ' + error.message, 'error');
            }
        });
    }

    // Acceso con solo email (cliente registrado)
    if (emailOnlyForm) {
        emailOnlyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email-only').value;
            
            if (!email) {
                showMessage('Por favor ingresa tu email', 'error');
                return;
            }
            
            try {
                const result = await getClientByEmail(email);
                
                if (result.success) {
                    showClientInfo(result.client);
                    showMessage('¡Bienvenido de nuevo! Aquí están tus puntos.', 'success');
                } else {
                    showMessage('Email no encontrado. Por favor regístrate primero.', 'error');
                }
            } catch (error) {
                console.error('Error accediendo con email:', error);
                showMessage('Error accediendo a tu cuenta: ' + error.message, 'error');
            }
        });
    }

    // Navegación del cliente
    if (backToAccess) {
        backToAccess.addEventListener('click', function() {
            document.getElementById('client-access').style.display = 'block';
            document.getElementById('client-info').style.display = 'none';
            if (registerForm) registerForm.reset();
            if (emailOnlyForm) emailOnlyForm.reset();
        });
    }

    if (verPremiosBtn) {
        verPremiosBtn.addEventListener('click', function() {
            document.getElementById('client-info').style.display = 'none';
            document.getElementById('premios-section').style.display = 'block';
            actualizarProgresoPremios();
        });
    }

    if (backToInfo) {
        backToInfo.addEventListener('click', function() {
            document.getElementById('premios-section').style.display = 'none';
            document.getElementById('client-info').style.display = 'block';
        });
    }
}

// =============================================
// ACTUALIZACIÓN AUTOMÁTICA OPTIMIZADA
// =============================================

function iniciarActualizacionAutomaticaOptimizada() {
    // Detener cualquier intervalo existente
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
    }
    
    // Actualizar cada 30 segundos (reducido de 10s para ahorrar recursos)
    autoUpdateInterval = setInterval(() => {
        if (isAdminLoggedIn) {
            const ahora = Date.now();
            // Solo actualizar si han pasado al menos 30 segundos desde la última actualización
            if (ahora - lastUpdateTime >= UPDATE_INTERVAL) {
                console.log('🔄 Actualización automática optimizada...');
                actualizarListaClientesOptimizada();
                lastUpdateTime = ahora;
            }
        }
    }, 10000); // Chequear cada 10s, pero solo actualizar si cumple condición
    
    console.log('📊 Actualización automática configurada (optimizada para Vercel)');
}

function detenerActualizacionAutomatica() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        autoUpdateInterval = null;
        console.log('⏹️ Actualización automática detenida');
    }
}

async function actualizarListaClientesOptimizada() {
    try {
        // Solo actualizar si el admin está viendo la pestaña de clientes
        const clientesTab = document.getElementById('admin-clientes');
        if (!clientesTab || clientesTab.style.display === 'none') {
            return; // No actualizar si no está viendo clientes
        }
        
        const result = await getAllClients();
        
        if (result.success) {
            const cambios = detectarCambiosClientes(result.clients);
            clients = result.clients;
            
            if (cambios > 0) {
                console.log(`🔄 ${cambios} cambios detectados en clientes`);
                
                if (busquedaActiva && terminoBusqueda) {
                    searchClients(terminoBusqueda);
                } else {
                    mostrarTodosLosClientes();
                }
                
                // Mostrar notificación sutil de actualización
                mostrarNotificacionActualizacion(cambios);
            }
            
            // Actualizar métricas solo si están visibles
            const metricasTab = document.getElementById('admin-metricas');
            if (metricasTab && metricasTab.style.display !== 'none') {
                cargarMetricas();
            }
        }
    } catch (error) {
        console.error('Error en actualización optimizada:', error);
    }
}

// Detectar si hubo cambios reales para evitar actualizaciones innecesarias
function detectarCambiosClientes(nuevosClientes) {
    if (clients.length !== nuevosClientes.length) {
        return Math.abs(clients.length - nuevosClientes.length);
    }
    
    // Comparar cambios en puntos o nuevos clientes
    let cambios = 0;
    nuevosClientes.forEach(nuevoCliente => {
        const clienteExistente = clients.find(c => c.id === nuevoCliente.id);
        if (!clienteExistente) {
            cambios++; // Cliente nuevo
        } else if (clienteExistente.points !== nuevoCliente.points) {
            cambios++; // Cambio en puntos
        } else if (clienteExistente.name !== nuevoCliente.name || 
                   clienteExistente.email !== nuevoCliente.email) {
            cambios++; // Cambio en datos
        }
    });
    
    return cambios;
}

function mostrarNotificacionActualizacion(cambios) {
    // Crear notificación sutil
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    notificacion.textContent = `✅ ${cambios} actualización${cambios !== 1 ? 'es' : ''} detectada${cambios !== 1 ? 's' : ''}`;
    
    document.body.appendChild(notificacion);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notificacion.remove(), 300);
        }
    }, 3000);
    
    // Agregar estilos CSS para animaciones si no existen
    if (!document.getElementById('animations-styles')) {
        const style = document.createElement('style');
        style.id = 'animations-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// =============================================
// PANEL DE ADMINISTRADOR
// =============================================

function inicializarPanelAdmin() {
    console.log('🔧 Inicializando panel de administrador optimizado...');
    
    // Inicializar pestañas internas del admin
    inicializarTabsAdmin();
    
    // Inicializar botones de gestión de premios
    inicializarGestionPremios();
    
    // Inicializar botones de métricas
    inicializarMetricas();
    
    // Inicializar botón de actualizar clientes
    const actualizarClientesBtn = document.getElementById('actualizar-clientes');
    if (actualizarClientesBtn) {
        actualizarClientesBtn.addEventListener('click', function() {
            console.log('🔄 Actualizando lista de clientes manualmente...');
            actualizarListaClientesOptimizada();
            showMessage('Lista de clientes actualizada manualmente', 'success');
        });
    }
}

function inicializarTabsAdmin() {
    const adminTabs = document.querySelectorAll('.admin-tab');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');

    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-admin-tab');
            console.log(`📁 Cambiando a pestaña: ${tabId}`);
            
            // Actualizar pestañas activas
            adminTabs.forEach(t => t.classList.remove('active'));
            adminTabContents.forEach(tc => tc.style.display = 'none');
            
            tab.classList.add('active');
            const targetTab = document.getElementById(`admin-${tabId}`);
            if (targetTab) {
                targetTab.style.display = 'block';
                
                // Cargar contenido específico de cada pestaña
                switch(tabId) {
                    case 'premios':
                        console.log('🔄 Cargando gestión de premios...');
                        cargarPremiosAdmin();
                        break;
                    case 'metricas':
                        console.log('📊 Cargando métricas...');
                        cargarMetricas();
                        break;
                    case 'clientes':
                        console.log('👥 Cargando clientes...');
                        // Los clientes ya se cargan automáticamente
                        break;
                }
            }
        });
    });
}

function inicializarGestionPremios() {
    const agregarPremioBtn = document.getElementById('agregar-premio');
    
    if (agregarPremioBtn) {
        agregarPremioBtn.addEventListener('click', function() {
            console.log('➕ Click en agregar premio');
            mostrarFormularioPremio();
        });
    } else {
        console.error('❌ No se encontró el botón agregar-premio');
    }
}

function inicializarMetricas() {
    const actualizarMetricasBtn = document.getElementById('actualizar-metricas');
    
    if (actualizarMetricasBtn) {
        actualizarMetricasBtn.addEventListener('click', function() {
            console.log('🔄 Actualizando métricas...');
            cargarMetricas();
            showMessage('Métricas actualizadas', 'success');
        });
    }
}

// =============================================
// GESTIÓN DE PREMIOS - ADMINISTRADOR
// =============================================

async function cargarPremiosAdmin() {
    try {
        console.log('🔄 Cargando premios para administrador...');
        
        const premiosAdminContainer = document.querySelector('.premios-admin-container');
        if (!premiosAdminContainer) {
            console.error('❌ No se encontró el contenedor de premios admin');
            return;
        }
        
        premiosConfig = await cargarConfiguracionPremios();
        premiosAdminContainer.innerHTML = '';
        
        if (premiosConfig.length === 0) {
            premiosAdminContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--color-gris);">
                    <h3>No hay premios configurados</h3>
                    <p>Haz clic en "Agregar Premio" para comenzar</p>
                </div>
            `;
            return;
        }
        
        premiosConfig.forEach((premio) => {
            const premioCard = document.createElement('div');
            premioCard.className = `premio-admin-card ${premio.premium ? 'premium' : ''}`;
            
            premioCard.innerHTML = `
                <div class="premio-admin-header">
                    <div class="premio-admin-icon">${premio.icono}</div>
                    <div class="premio-admin-info">
                        <h4>${premio.nombre}</h4>
                        <p><strong>${premio.puntosRequeridos} puntos</strong></p>
                        ${premio.descripcion ? `<p>${premio.descripcion}</p>` : ''}
                    </div>
                </div>
                <div class="premio-admin-actions">
                    <button class="btn btn-secondary editar-premio" data-id="${premio.id}">Editar</button>
                    <button class="btn btn-secondary eliminar-premio" data-id="${premio.id}">Eliminar</button>
                </div>
            `;
            
            premiosAdminContainer.appendChild(premioCard);
        });
        
        // Agregar event listeners a los botones de premios
        document.querySelectorAll('.editar-premio').forEach(btn => {
            btn.addEventListener('click', function() {
                const premioId = this.getAttribute('data-id');
                console.log(`✏️ Editando premio: ${premioId}`);
                editarPremio(premioId);
            });
        });
        
        document.querySelectorAll('.eliminar-premio').forEach(btn => {
            btn.addEventListener('click', function() {
                const premioId = this.getAttribute('data-id');
                console.log(`🗑️ Eliminando premio: ${premioId}`);
                eliminarPremio(premioId);
            });
        });
        
        console.log('✅ Premios cargados exitosamente:', premiosConfig.length);
        
    } catch (error) {
        console.error('💥 Error cargando premios admin:', error);
        showMessage('Error cargando premios: ' + error.message, 'error');
    }
}

function mostrarFormularioPremio(premio = null) {
    const premiosAdminContainer = document.querySelector('.premios-admin-container');
    if (!premiosAdminContainer) return;
    
    const formularioHTML = `
        <div class="premio-admin-form">
            <h4>${premio ? 'Editar Premio' : 'Agregar Nuevo Premio'}</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>Nombre del Premio</label>
                    <input type="text" id="premio-nombre" value="${premio ? premio.nombre : ''}" required>
                </div>
                <div class="form-group">
                    <label>Icono (emoji)</label>
                    <input type="text" id="premio-icono" value="${premio ? premio.icono : '🎁'}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Puntos Requeridos</label>
                    <input type="number" id="premio-puntos" value="${premio ? premio.puntosRequeridos : '100'}" required>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <input type="text" id="premio-descripcion" value="${premio ? premio.descripcion : ''}">
                </div>
            </div>
            <div class="form-checkbox">
                <input type="checkbox" id="premio-premium" ${premio && premio.premium ? 'checked' : ''}>
                <label>Premio Premium (diseño especial)</label>
            </div>
            <div class="premio-admin-actions" style="margin-top: 20px;">
                <button class="btn" id="guardar-premio">${premio ? 'Actualizar' : 'Guardar'} Premio</button>
                <button class="btn btn-secondary" id="cancelar-premio">Cancelar</button>
            </div>
        </div>
    `;
    
    // Insertar formulario al inicio
    premiosAdminContainer.insertAdjacentHTML('afterbegin', formularioHTML);
    
    // Event listeners del formulario
    document.getElementById('guardar-premio').addEventListener('click', function() {
        guardarPremio(premio);
    });
    
    document.getElementById('cancelar-premio').addEventListener('click', function() {
        document.querySelector('.premio-admin-form').remove();
    });
}

async function guardarPremio(premioExistente = null) {
    try {
        const nuevoPremio = {
            id: premioExistente ? premioExistente.id : Date.now(),
            nombre: document.getElementById('premio-nombre').value,
            icono: document.getElementById('premio-icono').value,
            puntosRequeridos: parseInt(document.getElementById('premio-puntos').value),
            descripcion: document.getElementById('premio-descripcion').value,
            premium: document.getElementById('premio-premium').checked
        };
        
        if (premioExistente) {
            // Editar premio existente
            const index = premiosConfig.findIndex(p => p.id == premioExistente.id);
            if (index !== -1) {
                premiosConfig[index] = nuevoPremio;
            }
        } else {
            // Agregar nuevo premio
            premiosConfig.push(nuevoPremio);
        }
        
        // Guardar en Supabase
        const guardado = await guardarConfiguracionPremios(premiosConfig);
        
        if (guardado) {
            // Recargar la vista
            document.querySelector('.premio-admin-form').remove();
            await cargarPremiosAdmin();
            showMessage(`Premio ${premioExistente ? 'actualizado' : 'agregado'} correctamente`, 'success');
        } else {
            throw new Error('Error guardando en base de datos');
        }
    } catch (error) {
        console.error('Error guardando premio:', error);
        showMessage('Error guardando premio: ' + error.message, 'error');
    }
}

function editarPremio(premioId) {
    const premio = premiosConfig.find(p => p.id == premioId);
    if (premio) {
        mostrarFormularioPremio(premio);
    }
}

async function eliminarPremio(premioId) {
    if (confirm('¿Estás seguro de que deseas eliminar este premio?')) {
        try {
            premiosConfig = premiosConfig.filter(p => p.id != premioId);
            const guardado = await guardarConfiguracionPremios(premiosConfig);
            
            if (guardado) {
                await cargarPremiosAdmin();
                showMessage('Premio eliminado correctamente', 'success');
            } else {
                throw new Error('Error guardando cambios');
            }
        } catch (error) {
            console.error('Error eliminando premio:', error);
            showMessage('Error eliminando premio: ' + error.message, 'error');
        }
    }
}

// =============================================
// SISTEMA DE MÉTRICAS SIMPLIFICADO
// =============================================

async function cargarMetricas() {
    try {
        console.log('📊 Cargando métricas simplificadas...');
        
        // Usar datos locales si están disponibles para reducir llamadas a la API
        if (clients.length > 0 && metricasData.cobrosPremios.length > 0) {
            console.log('📊 Usando datos locales para métricas');
            actualizarInterfazMetricas();
        } else {
            // Solo cargar desde Supabase si no hay datos locales
            metricasData = await obtenerMetricas();
            actualizarInterfazMetricas();
        }
    } catch (error) {
        console.error('💥 Error cargando métricas:', error);
        showMessage('Error cargando métricas: ' + error.message, 'error');
    }
}

function actualizarInterfazMetricas() {
    const metricasContainer = document.getElementById('metricas-container');
    if (!metricasContainer) {
        console.error('❌ No se encontró el contenedor de métricas');
        return;
    }
    
    const totalClientes = clients.length;
    const totalPremiosCanjeados = metricasData.cobrosPremios.length;
    
    const clientesConPremios = clients.filter(client => 
        premiosConfig.some(premio => client.points >= premio.puntosRequeridos)
    ).length;

    metricasContainer.innerHTML = `
        <div class="metricas-grid">
            <div class="metrica-card">
                <div class="metrica-icon">👥</div>
                <div class="metrica-info">
                    <h3>${totalClientes}</h3>
                    <p>Clientes Registrados</p>
                </div>
            </div>
            
            <div class="metrica-card">
                <div class="metrica-icon">🏆</div>
                <div class="metrica-info">
                    <h3>${clientesConPremios}</h3>
                    <p>Clientes con Premios Disponibles</p>
                </div>
            </div>
        </div>

        <!-- SECCIÓN: EXPORTACIÓN SIMPLIFICADA -->
        <div class="metrica-section" style="margin-bottom: 25px;">
            <h3>📤 Exportar Datos</h3>
            
            <!-- Selector de fechas personalizado -->
            <div style="background: var(--color-gris-claro); padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="color: var(--color-gris-oscuro); margin-bottom: 15px;">Exportar por Período</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label style="font-size: 14px;">Fecha Inicio</label>
                        <input type="date" id="fecha-inicio" class="form-control" style="padding: 8px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label style="font-size: 14px;">Fecha Fin</label>
                        <input type="date" id="fecha-fin" class="form-control" style="padding: 8px;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn" id="exportar-excel">
                            <i class="fas fa-download"></i> Exportar Excel
                        </button>
                        <button class="btn btn-secondary" id="limpiar-fechas">
                            <i class="fas fa-broom"></i> Limpiar
                        </button>
                    </div>
                </div>
                <div id="info-fechas" style="margin-top: 10px; font-size: 12px; color: var(--color-gris);"></div>
            </div>

            <!-- Botón para exportar todo -->
            <div style="margin-bottom: 15px;">
                <button class="btn" id="exportar-todo">
                    <i class="fas fa-database"></i> Exportar Todo el Historial
                </button>
                <button class="btn btn-secondary" id="exportar-reporte" style="margin-left: 10px;">
                    <i class="fas fa-chart-bar"></i> Reporte Estadístico
                </button>
            </div>

            <!-- Información del historial -->
            <div style="background: var(--color-gris-claro); padding: 15px; border-radius: 8px; font-size: 14px; margin-top: 20px;">
                <p><strong>Información del Historial:</strong></p>
                <p>• Total de registros: <strong>${totalPremiosCanjeados}</strong> canjes</p>
                <p>• Los datos se actualizan automáticamente cada 30 segundos</p>
            </div>
        </div>
    `;

    // Inicializar botones de exportación
    inicializarBotonesExportacion();
    inicializarFiltrosFecha();
}

// Inicializar filtros de fecha
function inicializarFiltrosFecha() {
    // Establecer fechas por defecto (últimos 30 días)
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaFin.getDate() - 30);
    
    const fechaInicioInput = document.getElementById('fecha-inicio');
    const fechaFinInput = document.getElementById('fecha-fin');
    
    if (fechaInicioInput && fechaFinInput) {
        fechaInicioInput.value = fechaInicio.toISOString().split('T')[0];
        fechaFinInput.value = fechaFin.toISOString().split('T')[0];
    }
    
    actualizarInfoFechas();

    // Exportar todo el historial
    document.getElementById('exportar-todo')?.addEventListener('click', async function() {
        const todosLosCobros = await obtenerTodosLosCobros();
        if (todosLosCobros.length === 0) {
            alert('No hay datos para exportar');
            return;
        }
        exportarAExcel(todosLosCobros, `historial_completo_canjes_${formatearFechaArchivo(new Date())}.xls`);
    });

    // Exportación por fecha personalizada
    document.getElementById('exportar-excel')?.addEventListener('click', async function() {
        const fechaInicio = document.getElementById('fecha-inicio').value;
        const fechaFin = document.getElementById('fecha-fin').value;
        
        if (!fechaInicio || !fechaFin) {
            alert('Por favor selecciona ambas fechas');
            return;
        }
        
        if (fechaInicio > fechaFin) {
            alert('La fecha de inicio no puede ser mayor que la fecha fin');
            return;
        }
        
        const cobros = await obtenerCobrosPorFecha(fechaInicio, fechaFin);
        if (cobros.length === 0) {
            alert('No hay datos para el período seleccionado');
            return;
        }
        
        const nombreArchivo = `canjes_${fechaInicio.replace(/-/g, '')}_a_${fechaFin.replace(/-/g, '')}.xls`;
        exportarAExcel(cobros, nombreArchivo);
    });

    // Limpiar fechas
    document.getElementById('limpiar-fechas')?.addEventListener('click', function() {
        document.getElementById('fecha-inicio').value = '';
        document.getElementById('fecha-fin').value = '';
        document.getElementById('info-fechas').innerHTML = '';
    });

    // Actualizar info cuando cambien las fechas
    document.getElementById('fecha-inicio')?.addEventListener('change', actualizarInfoFechas);
    document.getElementById('fecha-fin')?.addEventListener('change', actualizarInfoFechas);

    // Reporte estadístico
    document.getElementById('exportar-reporte')?.addEventListener('click', function() {
        generarReporteEstadistico();
    });
}

// Actualizar información de fechas seleccionadas
function actualizarInfoFechas() {
    const fechaInicio = document.getElementById('fecha-inicio')?.value;
    const fechaFin = document.getElementById('fecha-fin')?.value;
    const infoFechas = document.getElementById('info-fechas');
    
    if (!infoFechas) return;
    
    if (fechaInicio && fechaFin) {
        const dias = Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24)) + 1;
        infoFechas.innerHTML = `Período seleccionado: <strong>${dias} días</strong> (${fechaInicio} a ${fechaFin})`;
    } else if (fechaInicio || fechaFin) {
        infoFechas.innerHTML = 'Selecciona ambas fechas para exportar';
    } else {
        infoFechas.innerHTML = '';
    }
}

// Inicializar botones de exportación
function inicializarBotonesExportacion() {
    // Ya están inicializados en inicializarFiltrosFecha
}

// =============================================
// FUNCIONES PRINCIPALES
// =============================================

// Mostrar información del cliente
function showClientInfo(client) {
    const displayName = document.getElementById('display-name');
    const displayEmail = document.getElementById('display-email');
    const displayPoints = document.getElementById('display-points');
    const clientAccess = document.getElementById('client-access');
    const clientInfo = document.getElementById('client-info');
    
    if (displayName) displayName.textContent = client.name;
    if (displayEmail) displayEmail.textContent = client.email;
    if (displayPoints) displayPoints.textContent = client.points;
    
    if (clientAccess) clientAccess.style.display = 'none';
    if (clientInfo) clientInfo.style.display = 'block';
    
    actualizarProgresoPremios();
}

// Cargar tabla de clientes
async function loadClientsTable() {
    console.log('📊 Cargando tabla de clientes...');
    
    try {
        const result = await getAllClients();
        
        if (result.success) {
            clients = result.clients;
            console.log(`✅ ${clients.length} clientes cargados`);
            
            // Crear buscador si no existe
            if (!document.getElementById('search-client')) {
                crearBuscador();
            }
            
            mostrarTodosLosClientes();
            
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('❌ Error cargando clientes:', error);
        showMessage('Error cargando clientes: ' + error.message, 'error');
    }
}

// Función para mostrar todos los clientes
function mostrarTodosLosClientes() {
    const clientsTable = document.querySelector('#clients-table tbody');
    if (!clientsTable) return;
    
    clientsTable.innerHTML = '';
    
    const searchResultsInfo = document.getElementById('search-results-info');
    if (searchResultsInfo) {
        searchResultsInfo.style.display = 'none';
    }
    
    busquedaActiva = false;
    terminoBusqueda = '';
    
    clients.forEach(client => {
        const puedeCanjear = premiosConfig.some(premio => client.points >= premio.puntosRequeridos);
        const canjearBtnClass = puedeCanjear ? 'btn' : 'btn btn-secondary';
        const canjearBtnText = puedeCanjear ? 'Canjear Premio' : 'Sin premios';
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.email}</td>
            <td>
                <div class="points-control">
                    <button class="points-btn minus" data-id="${client.id}">-5</button>
                    <span class="points-value">${client.points}</span>
                    <button class="points-btn" data-id="${client.id}">+5</button>
                </div>
            </td>
            <td>
                <button class="${canjearBtnClass} cobrar-premio" data-id="${client.id}" style="margin-bottom: 5px;" ${!puedeCanjear ? 'disabled' : ''}>
                    ${canjearBtnText}
                </button>
                <button class="btn btn-secondary delete-client" data-id="${client.id}">Eliminar</button>
            </td>
        `;
        
        clientsTable.appendChild(row);
    });
    
    addTableEventListeners();
}

// Agregar event listeners a la tabla
function addTableEventListeners() {
    // Botones de puntos
    document.querySelectorAll('.points-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const clientId = parseInt(this.getAttribute('data-id'));
            const isAdding = !this.classList.contains('minus');
            updateClientPoints(clientId, isAdding);
        });
    });
    
    // Botón de eliminar
    document.querySelectorAll('.delete-client').forEach(btn => {
        btn.addEventListener('click', function() {
            const clientId = parseInt(this.getAttribute('data-id'));
            deleteClient(clientId);
        });
    });
    
    // Botón de cobrar premio
    document.querySelectorAll('.cobrar-premio').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled) {
                const clientId = parseInt(this.getAttribute('data-id'));
                cobrarPremioCliente(clientId);
            }
        });
    });
}

// Actualizar puntos del cliente
async function updateClientPoints(clientId, isAdding) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    const newPoints = isAdding ? client.points + 5 : Math.max(0, client.points - 5);
    
    try {
        const result = await updateClientPointsInDB(clientId, newPoints);
        
        if (result.success) {
            client.points = newPoints;
            
            if (busquedaActiva && terminoBusqueda) {
                searchClients(terminoBusqueda);
            } else {
                mostrarTodosLosClientes();
            }
            
            showMessage('Puntos actualizados correctamente', 'success');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error actualizando puntos:', error);
        showMessage('Error actualizando puntos: ' + error.message, 'error');
    }
}

// Eliminar cliente
async function deleteClient(clientId) {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
        try {
            const result = await deleteClientFromDB(clientId);
            
            if (result.success) {
                clients = clients.filter(client => client.id !== clientId);
                
                if (busquedaActiva && terminoBusqueda) {
                    searchClients(terminoBusqueda);
                } else {
                    mostrarTodosLosClientes();
                }
                
                showMessage(result.message, 'success');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            showMessage('Error eliminando cliente: ' + error.message, 'error');
        }
    }
}

// =============================================
// SISTEMA DE BÚSQUEDA
// =============================================

function crearBuscador() {
    const adminClientes = document.getElementById('admin-clientes');
    if (!adminClientes) return;
    
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;';
    
    searchContainer.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center;">
            <input type="text" id="search-client" placeholder="Buscar por nombre o email..." style="padding: 10px; border: 1px solid var(--color-gris); border-radius: 5px; min-width: 250px;">
            <button class="btn btn-secondary" id="clear-search">Limpiar</button>
        </div>
    `;
    
    const tablaContainer = adminClientes.querySelector('.table-container');
    adminClientes.insertBefore(searchContainer, tablaContainer);
    
    // Agregar event listeners
    const searchClientInput = document.getElementById('search-client');
    const clearSearchBtn = document.getElementById('clear-search');
    
    if (searchClientInput && clearSearchBtn) {
        searchClientInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            if (searchTerm.length >= 2) {
                searchClients(searchTerm);
            } else if (searchTerm.length === 0) {
                mostrarTodosLosClientes();
            }
        });
        
        clearSearchBtn.addEventListener('click', function() {
            searchClientInput.value = '';
            mostrarTodosLosClientes();
        });
    }
}

function searchClients(searchTerm) {
    terminoBusqueda = searchTerm;
    busquedaActiva = true;
    
    clientesFiltrados = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm)
    );
    
    displaySearchResults(clientesFiltrados, searchTerm);
}

function displaySearchResults(filteredClients, searchTerm) {
    const clientsTable = document.querySelector('#clients-table tbody');
    if (!clientsTable) return;
    
    clientsTable.innerHTML = '';
    
    if (filteredClients.length === 0) {
        clientsTable.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: var(--color-gris);">
                    <h4>No se encontraron clientes</h4>
                    <p>No hay resultados para: "<strong>${searchTerm}</strong>"</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredClients.forEach(client => {
        const puedeCanjear = premiosConfig.some(premio => client.points >= premio.puntosRequeridos);
        const canjearBtnClass = puedeCanjear ? 'btn' : 'btn btn-secondary';
        const canjearBtnText = puedeCanjear ? 'Canjear Premio' : 'Sin premios';
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${highlightText(client.name, searchTerm)}</td>
            <td>${highlightText(client.email, searchTerm)}</td>
            <td>
                <div class="points-control">
                    <button class="points-btn minus" data-id="${client.id}">-5</button>
                    <span class="points-value">${client.points}</span>
                    <button class="points-btn" data-id="${client.id}">+5</button>
                </div>
            </td>
            <td>
                <button class="${canjearBtnClass} cobrar-premio" data-id="${client.id}" style="margin-bottom: 5px;" ${!puedeCanjear ? 'disabled' : ''}>
                    ${canjearBtnText}
                </button>
                <button class="btn btn-secondary delete-client" data-id="${client.id}">Eliminar</button>
            </td>
        `;
        
        clientsTable.appendChild(row);
    });
    
    addTableEventListeners();
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark style="background-color: #FFEB3B; padding: 2px 4px; border-radius: 3px;">$1</mark>');
}

// =============================================
// SISTEMA DE PREMIOS PARA CLIENTES
// =============================================

async function actualizarProgresoPremios() {
    const displayPoints = document.getElementById('display-points');
    const premiosContainer = document.querySelector('.premios-container');
    
    if (!displayPoints || !premiosContainer) return;
    
    const puntos = parseInt(displayPoints.textContent);
    premiosConfig = await cargarConfiguracionPremios();
    premiosContainer.innerHTML = '';
    
    premiosConfig.forEach((premio) => {
        const progreso = Math.min((puntos / premio.puntosRequeridos) * 100, 100);
        const premioCard = document.createElement('div');
        premioCard.className = `premio-card ${premio.premium ? 'premium' : ''}`;
        
        premioCard.innerHTML = `
            <div class="premio-icon">${premio.icono}</div>
            <div class="premio-info">
                <h3>${premio.nombre}</h3>
                <p>${premio.puntosRequeridos} puntos</p>
                ${premio.descripcion ? `<p style="font-size: 12px; color: var(--color-gris); margin-bottom: 10px;">${premio.descripcion}</p>` : ''}
                <div class="premio-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progreso}%"></div>
                    </div>
                    <span>${puntos}/${premio.puntosRequeridos} puntos</span>
                </div>
            </div>
        `;
        
        if (puntos >= premio.puntosRequeridos) {
            premioCard.style.borderColor = '#4CAF50';
            premioCard.style.background = 'linear-gradient(135deg, #E8F5E8, var(--color-blanco))';
            
            const badge = document.createElement('div');
            badge.className = 'premio-badge';
            badge.textContent = '¡Disponible!';
            premioCard.appendChild(badge);
        }
        
        premiosContainer.appendChild(premioCard);
    });
}

// =============================================
// COBRO DE PREMIOS
// =============================================

async function cobrarPremioCliente(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    const premiosDisponibles = premiosConfig.filter(premio => client.points >= premio.puntosRequeridos);
    
    if (premiosDisponibles.length === 0) {
        showMessage(`${client.name} no tiene puntos suficientes para canjear ningún premio`, 'error');
        return;
    }
    
    let selectorHTML = `<p>Selecciona el premio a canjear para <strong>${client.name}</strong> (${client.points} puntos disponibles):</p>`;
    
    premiosDisponibles.forEach((premio, index) => {
        const puntosRestantes = client.points - premio.puntosRequeridos;
        selectorHTML += `
            <div style="margin: 10px 0; padding: 10px; border: 1px solid var(--color-gris); border-radius: 5px;">
                <input type="radio" id="premio-${index}" name="premioSeleccionado" value="${premio.id}" ${index === 0 ? 'checked' : ''}>
                <label for="premio-${index}" style="margin-left: 10px;">
                    <strong>${premio.nombre}</strong> - ${premio.puntosRequeridos} puntos
                    ${premio.descripcion ? `<br><small>${premio.descripcion}</small>` : ''}
                    <br><small style="color: #4CAF50; font-weight: bold;">Puntos restantes después del canje: ${puntosRestantes}</small>
                </label>
            </div>
        `;
    });
    
    const premioSeleccionado = await mostrarDialogoCobro(selectorHTML);
    
    if (!premioSeleccionado) return;
    
    const premio = premiosConfig.find(p => p.id == premioSeleccionado);
    const nuevosPuntos = client.points - premio.puntosRequeridos;

    if (confirm(`¿Confirmar canje de premio "${premio.nombre}" por ${premio.puntosRequeridos} puntos para ${client.name}?\n\nPuntos actuales: ${client.points}\nPuntos después del canje: ${nuevosPuntos}`)) {
        try {
            // Registrar el cobro
            await registrarCobroPremio(client.id, client.name, premio.id, premio.nombre, premio.puntosRequeridos, nuevosPuntos);
            
            // Actualizar puntos (restar solo los puntos del premio canjeado)
            const result = await updateClientPointsInDB(clientId, nuevosPuntos);
            
            if (result.success) {
                client.points = nuevosPuntos;
                
                if (busquedaActiva && terminoBusqueda) {
                    searchClients(terminoBusqueda);
                } else {
                    mostrarTodosLosClientes();
                }
                
                showMessage(`¡Premio "${premio.nombre}" canjeado exitosamente para ${client.name}! Se descontaron ${premio.puntosRequeridos} puntos. Puntos restantes: ${nuevosPuntos}`, 'success');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error en cobro:', error);
            showMessage('Error en el cobro: ' + error.message, 'error');
        }
    }
}

function mostrarDialogoCobro(htmlContent) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <h3 style="margin-bottom: 20px; color: var(--color-rojo);">Canjear Premio</h3>
                ${htmlContent}
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                    <button id="confirmar-cobro" class="btn">Confirmar Canje</button>
                    <button id="cancelar-cobro" class="btn btn-secondary">Cancelar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('confirmar-cobro').addEventListener('click', function() {
            const selected = document.querySelector('input[name="premioSeleccionado"]:checked');
            resolve(selected ? selected.value : null);
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancelar-cobro').addEventListener('click', function() {
            resolve(null);
            document.body.removeChild(modal);
        });
    });
}

// =============================================
// FUNCIÓN DE MENSAJES
// =============================================

function showMessage(text, type) {
    // Eliminar mensajes existentes
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Crear nuevo mensaje
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Insertar mensaje
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel && adminPanel.style.display !== 'none') {
        adminPanel.insertBefore(message, adminPanel.querySelector('h2').nextSibling);
    } else {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            activeTab.insertBefore(message, activeTab.firstChild);
        }
    }
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 5000);
}

// Función auxiliar para formatear fechas en nombres de archivo
function formatearFechaArchivo(fecha) {
    return fecha.toISOString().split('T')[0].replace(/-/g, '');
}

console.log('🚀 Aplicación VillaLeon optimizada para Vercel');