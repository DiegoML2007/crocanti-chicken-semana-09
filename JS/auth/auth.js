// JS/auth/auth.js

// 1. Obtener usuario actual
export function obtenerUsuarioActual() {
  const usuarioGuardado = localStorage.getItem('usuario_sesion') || localStorage.getItem('usuario_crocanti');
  return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
}

export function verificarSesion() {
  return obtenerUsuarioActual();
}

// 2. Iniciar Sesión (Sincroniza ambas llaves de localStorage)
export function iniciarSesion(usuario) {
  localStorage.setItem('usuario_sesion', JSON.stringify(usuario));
  localStorage.setItem('usuario_crocanti', JSON.stringify(usuario));
}

// 3. Cerrar Sesión
export function cerrarSesion() {
  localStorage.removeItem('usuario_sesion');
  localStorage.removeItem('usuario_crocanti');
  localStorage.removeItem('carrito_crocanti');
  window.location.href = 'login.html';
}

// 4. Exigir Rol en páginas privadas
export function exigirRol(rolesPermitidos = []) {
  const usuario = obtenerUsuarioActual();
  if (!usuario) {
    window.location.href = 'login.html';
    return null;
  }

  const rolActual = (usuario.rol || '').toLowerCase();
  const rolesMinusculas = rolesPermitidos.map(r => r.toLowerCase());

  if (rolesPermitidos.length > 0 && !rolesMinusculas.includes(rolActual)) {
    alert('No tienes permisos para acceder a esta vista.');
    window.location.href = 'index.html';
    return null;
  }

  return usuario;
}

// 5. Renderizar enlaces dinámicos en el menú
export function cargarMenuPanel() {
  const usuario = obtenerUsuarioActual();
  if (!usuario) return;

  const nav = document.querySelector('header nav');
  if (!nav) return;

  const rol = (usuario.rol || '').toLowerCase();

  // Enlace Panel Admin (para Admin y Empleado)
  if (rol === 'administrador' || rol === 'admin' || rol === 'empleado') {
    if (!document.getElementById('link-panel-nav')) {
      const a = document.createElement('a');
      a.id = 'link-panel-nav';
      a.href = 'panel.html';
      a.className = 'btn-nav';
      a.style.backgroundColor = '#2a9d8f';
      a.style.color = '#fff';
      a.style.padding = '0.4rem 0.8rem';
      a.style.borderRadius = '4px';
      a.style.marginRight = '0.5rem';
      a.textContent = '⚙ Panel Admin';
      nav.appendChild(a);
    }
  }

  // Enlace Módulo Caja (para Cajero, Admin y Empleado)
  if (rol === 'cajero' || rol === 'administrador' || rol === 'admin' || rol === 'empleado') {
    if (!document.getElementById('link-caja-nav')) {
      const a = document.createElement('a');
      a.id = 'link-caja-nav';
      a.href = 'caja.html';
      a.className = 'btn-nav';
      a.style.backgroundColor = '#e76f51';
      a.style.color = '#fff';
      a.style.padding = '0.4rem 0.8rem';
      a.style.borderRadius = '4px';
      a.style.marginRight = '0.5rem';
      a.textContent = '🏪 Módulo Caja';
      nav.appendChild(a);
    }
  }
}