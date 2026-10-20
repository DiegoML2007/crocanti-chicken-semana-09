import { consultarNeon } from '../config/neon-config.js';
import { verificarSesion } from '../auth/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const clienteActivoSpan = document.getElementById('cliente-activo') || document.querySelector('main p span');
  const formPedido = document.getElementById('form-pedido') || document.querySelector('form');
  
  // Captura de inputs
  const inputNombre = document.getElementById('nombre_cliente') || document.querySelector('input[type="text"]');
  const inputProductos = document.getElementById('productos') || document.querySelector('textarea');
  const inputHora = document.getElementById('hora_recojo') || document.querySelector('input[type="time"]');

  // 1. VERIFICAR SESIÓN
  const usuario = verificarSesion();

  if (usuario) {
    if (clienteActivoSpan) clienteActivoSpan.textContent = usuario.nombre || 'Cliente';
    if (inputNombre && !inputNombre.value) {
      inputNombre.value = usuario.nombre || 'Cliente';
    }
  } else {
    alert('Debes iniciar sesión para realizar un pedido.');
    window.location.href = 'login.html';
    return;
  }

  // 2. AUTOCOMPLETAR PRODUCTO SELECCIONADO DESDE INDEX.HTML
  const comboSeleccionado = localStorage.getItem('combo_seleccionado');
  if (comboSeleccionado && inputProductos && !inputProductos.value) {
    inputProductos.value = `Combo Seleccionado: ${comboSeleccionado.toUpperCase()}`;
    // Limpiamos el selector temporal
    localStorage.removeItem('combo_seleccionado');
  }

  // 3. GUARDAR PEDIDO EN NEON DB Y REDIRIGIR A PAGO.HTML
  if (formPedido) {
    formPedido.addEventListener('submit', async (e) => {
      e.preventDefault();

      const valorNombreInput = inputNombre ? inputNombre.value.trim() : '';
      const nombreCliente = valorNombreInput || usuario.nombre || 'Cliente Crocanti';
      
      const productos = inputProductos ? inputProductos.value.trim() : '';
      const horaRecojo = inputHora ? inputHora.value : '';

      if (!productos || !horaRecojo) {
        alert('Por favor completa los productos y la hora estimada de recojo.');
        return;
      }

      const idUsuario = usuario.id || usuario.id_usuario;

      try {
        // RETURNING id nos devuelve el identificador recién creado en Neon
        const resultado = await consultarNeon(
          `INSERT INTO pedidos_recojo (id_usuario, nombre_cliente, productos, hora_recojo, estado)
           VALUES ($1, $2, $3, $4, 'pendiente')
           RETURNING id;`,
          [idUsuario, nombreCliente, productos, horaRecojo]
        );

        if (resultado && resultado.length > 0) {
          const idPedidoCreado = resultado[0].id;
          alert('¡Pedido registrado! Serás redirigido a la pasarela de pago.');
          
          // Enviar directo a la Pasarela con el ID del pedido
          window.location.href = `pago.html?id=${idPedidoCreado}`;
        } else {
          // Fallback en caso de no retornar ID
          window.location.href = 'consulta.html';
        }

      } catch (error) {
        console.error('Error detallado al guardar el pedido:', error);
        alert('Ocurrió un error al registrar el pedido en la base de datos.');
      }
    });
  }
});