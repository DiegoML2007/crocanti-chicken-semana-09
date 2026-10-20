// js/caja/caja.js
import { sql } from '../config/neon-config.js';
import { exigirRol } from '../auth/auth.js';

const cajero = exigirRol(['cajero', 'administrador']);

// 1. Cobro presencial
document.querySelector('#btn-buscar').addEventListener('click', async () => {
  const query = document.querySelector('#buscar-seguimiento').value;
  const resultados = await sql`
    SELECT * FROM pedidos_recojo 
    WHERE codigo_seguimiento ILIKE ${'%' + query + '%'} AND estado_pago = 'pendiente'
  `;

  const cont = document.querySelector('#resultado-busqueda');
  if (resultados.length === 0) {
    cont.innerHTML = '<p>No se encontraron pedidos pendientes.</p>';
    return;
  }

  const p = resultados[0];
  cont.innerHTML = `
    <p><strong>Código:</strong> ${p.codigo_seguimiento}</p>
    <p><strong>Monto a cobrar:</strong> S/ ${p.monto_calculado}</p>
    <button id="btn-cobrar-efectivo">Cobrar Efectivo</button>
  `;

  document.querySelector('#btn-cobrar-efectivo').onclick = async () => {
    const codOp = 'PAG-CAJA-' + Date.now().toString().slice(-6);
    await sql`
      INSERT INTO pagos (codigo_operacion, id_registro, canal, metodo, monto, estado, id_cajero)
      VALUES (${codOp}, ${p.id}, 'caja', 'efectivo', ${p.monto_calculado}, 'aprobado', ${cajero.id})
    `;
    await sql`
      UPDATE pedidos_recojo 
      SET estado_pago = 'pagado', canal_pago = 'caja', fecha_pago = NOW() 
      WHERE id = ${p.id}
    `;
    alert('Cobro registrado');
    window.location.href = `comprobante.html?codOp=${codOp}`;
  };
});

// 2. Verificación de pagos en línea del día (Refresco cada 15s)
async function cargarPagosLinea() {
  const pagos = await sql`
    SELECT p.*, r.codigo_seguimiento 
    FROM pagos p
    JOIN pedidos_recojo r ON p.id_registro = r.id
    WHERE p.canal = 'pasarela' AND p.fecha_pago::date = CURRENT_DATE
    ORDER BY p.fecha_pago DESC
  `;

  const tbody = document.querySelector('#tabla-verificacion tbody');
  tbody.innerHTML = pagos.map(p => `
    <tr>
      <td>${p.codigo_operacion}</td>
      <td>${p.codigo_seguimiento}</td>
      <td>S/ ${p.monto}</td>
      <td>${p.metodo}</td>
      <td>${p.verificado ? 'Verificado' : 'Pendiente'}</td>
      <td>
        ${!p.verificado ? `<button onclick="verificar('${p.id}')">Verificar</button>` : 'OK'}
      </td>
    </tr>
  `).join('');
}

window.verificar = async (idPago) => {
  await sql`
    UPDATE pagos 
    SET verificado = true, verificado_por = ${cajero.id}, fecha_verificacion = NOW() 
    WHERE id = ${idPago}
  `;
  cargarPagosLinea();
};

cargarPagosLinea();
setInterval(cargarPagosLinea, 15000);