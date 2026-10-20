// js/pago/pasarela.js
import { sql } from '../config/neon-config.js';

export async function procesarPagoTarjeta({ idRegistro, idUsuario, monto, numeroTarjeta, titular, mesVenc, anioVenc, cvv, marca }) {
  // 1. Validar fondos y estado en banco simulado
  const tarjetas = await sql`
    SELECT t.*, c.saldo_disponible 
    FROM banco_tarjetas t
    JOIN banco_cuentas c ON t.id_cuenta = c.id
    WHERE t.numero = ${numeroTarjeta.replace(/\D/g, '')}
      AND t.cvv = ${cvv}
      AND t.mes_venc = ${mesVenc}
      AND t.anio_venc = ${anioVenc}
      AND t.estado = 'activa'
  `;

  if (tarjetas.length === 0) {
    throw new Error('Tarjeta no encontrada o datos inválidos');
  }

  const tarjeta = tarjetas[0];
  if (parseFloat(tarjeta.saldo_disponible) < monto) {
    throw new Error('Saldo insuficiente en la tarjeta');
  }

  const codOp = 'PAG-' + Date.now().toString().slice(-8);

  // 2. Transacción de Cobro
  await sql`
    UPDATE banco_cuentas 
    SET saldo_disponible = saldo_disponible - ${monto} 
    WHERE id = ${tarjeta.id_cuenta}
  `;

  await sql`
    INSERT INTO pagos (codigo_operacion, id_registro, id_usuario, canal, metodo, marca_tarjeta, monto, estado)
    VALUES (${codOp}, ${idRegistro}, ${idUsuario}, 'pasarela', 'tarjeta_debito', ${marca}, ${monto}, 'aprobado')
  `;

  await sql`
    UPDATE pedidos_recojo 
    SET estado_pago = 'pagado', canal_pago = 'pasarela', fecha_pago = NOW() 
    WHERE id = ${idRegistro}
  `;

  return codOp;
}

export async function procesarPagoBilletera({ idRegistro, idUsuario, monto, proveedor, celular, codigoAprobacion }) {
  const billeteras = await sql`
    SELECT * FROM billeteras 
    WHERE proveedor = ${proveedor} AND celular = ${celular} AND codigo_aprobacion = ${codigoAprobacion}
  `;

  if (billeteras.length === 0) {
    throw new Error('Datos de billetera o código de aprobación incorrectos');
  }

  const billetera = billeteras[0];
  if (parseFloat(billetera.saldo_disponible) < monto) {
    throw new Error('Saldo insuficiente en la billetera');
  }

  const codOp = 'PAG-' + Date.now().toString().slice(-8);

  await sql`
    UPDATE billeteras 
    SET saldo_disponible = saldo_disponible - ${monto} 
    WHERE id = ${billetera.id}
  `;

  await sql`
    INSERT INTO pagos (codigo_operacion, id_registro, id_usuario, canal, metodo, proveedor_billetera, monto, estado)
    VALUES (${codOp}, ${idRegistro}, ${idUsuario}, 'pasarela', 'billetera', ${proveedor}, ${monto}, 'aprobado')
  `;

  await sql`
    UPDATE pedidos_recojo 
    SET estado_pago = 'pagado', canal_pago = 'pasarela', fecha_pago = NOW() 
    WHERE id = ${idRegistro}
  `;

  return codOp;
}