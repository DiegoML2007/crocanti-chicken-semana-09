// js/comprobante/comprobante.js
import { sql } from '../config/neon-config.js';

const params = new URLSearchParams(window.location.search);
const codOp = params.get('codOp');

async function cargarComprobante() {
  const datos = await sql`
    SELECT p.*, r.codigo_seguimiento, r.combo, r.cantidad, u.nombre as cliente, u.dni
    FROM pagos p
    JOIN pedidos_recojo r ON p.id_registro = r.id
    LEFT JOIN usuarios u ON p.id_usuario = u.id
    WHERE p.codigo_operacion = ${codOp}
  `;

  if (datos.length === 0) {
    alert('Comprobante no encontrado');
    return;
  }

  const p = datos[0];
  document.querySelector('#comp-operacion').textContent = p.codigo_operacion;
  document.querySelector('#comp-fecha').textContent = new Date(p.fecha_pago).toLocaleString();
  document.querySelector('#comp-cliente').textContent = p.cliente || 'Cliente Presencial';
  document.querySelector('#comp-dni').textContent = p.dni || 'S/D';
  document.querySelector('#comp-detalle').textContent = `Combo ${p.combo} (x${p.cantidad})`;
  document.querySelector('#comp-monto').textContent = p.monto;
  document.querySelector('#comp-metodo').textContent = `${p.canal.toUpperCase()} - ${p.metodo}`;
}

cargarComprobante();