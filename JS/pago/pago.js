// js/pago/pago.js
import { sql } from '../config/neon-config.js';
import { exigirRol } from '../auth/auth.js';
import { validarLuhn, detectarMarcaTarjeta, validarVencimiento, validarCVV, validarCelularPE } from './validaciones.js';
import { procesarPagoTarjeta, procesarPagoBilletera } from './pasarela.js';

const usuario = exigirRol('cliente');
const params = new URLSearchParams(window.location.search);
const idRegistro = params.get('id');

let pedido = null;

async function cargarPedido() {
  const datos = await sql`SELECT * FROM pedidos_recojo WHERE id = ${idRegistro} AND id_usuario = ${usuario.id}`;
  if (datos.length === 0) {
    alert('Pedido no encontrado');
    window.location.href = 'consulta.html';
    return;
  }
  pedido = datos[0];
  document.querySelector('#info-pedido').textContent = `Código: ${pedido.codigo_seguimiento} | Combo: ${pedido.combo} (x${pedido.cantidad})`;
  document.querySelector('#monto-pago').textContent = `Total a pagar: S/ ${pedido.monto_calculado}`;
}

const selectMetodo = document.querySelector('#metodo');
selectMetodo.addEventListener('change', () => {
  document.querySelector('#seccion-tarjeta').style.display = selectMetodo.value.includes('tarjeta') ? 'block' : 'none';
  document.querySelector('#seccion-billetera').style.display = selectMetodo.value === 'billetera' ? 'block' : 'none';
});

document.querySelector('#form-pago').addEventListener('submit', async (e) => {
  e.preventDefault();
  const metodo = selectMetodo.value;
  const monto = parseFloat(pedido.monto_calculado);

  try {
    let codOp = '';
    if (metodo.includes('tarjeta')) {
      const num = document.querySelector('#numero_tarjeta').value;
      const mes = parseInt(document.querySelector('#mes_venc').value);
      const anio = parseInt(document.querySelector('#anio_venc').value);
      const cvv = document.querySelector('#cvv').value;

      if (!validarLuhn(num)) return alert('Número de tarjeta inválido.');
      if (!validarVencimiento(mes, anio)) return alert('Tarjeta vencida.');
      if (!validarCVV(cvv)) return alert('CVV inválido.');

      codOp = await procesarPagoTarjeta({
        idRegistro: pedido.id,
        idUsuario: usuario.id,
        monto,
        numeroTarjeta: num,
        titular: document.querySelector('#titular_tarjeta').value,
        mesVenc: mes,
        anioVenc: anio,
        cvv,
        marca: detectarMarcaTarjeta(num)
      });

    } else if (metodo === 'billetera') {
      const cel = document.querySelector('#celular').value;
      if (!validarCelularPE(cel)) return alert('Celular debe tener 9 dígitos y empezar con 9.');

      codOp = await procesarPagoBilletera({
        idRegistro: pedido.id,
        idUsuario: usuario.id,
        monto,
        proveedor: document.querySelector('#proveedor_billetera').value,
        celular: cel,
        codigoAprobacion: document.querySelector('#codigo_aprobacion').value
      });
    }

    alert('¡Pago procesado con éxito!');
    window.location.href = `comprobante.html?codOp=${codOp}`;
  } catch (err) {
    alert('Error al pagar: ' + err.message);
  }
});

cargarPedido();