// js/registro/tarifario.js
// Funciones puras para el cálculo de tarifa - Caso 20 (Crocanti Chicken Perú)

/**
 * Redondea un valor numérico a 2 decimales.
 * @param {number} valor 
 * @returns {number}
 */
export function redondear(valor) {
  return Math.round(valor * 100) / 100;
}

/**
 * Formatea un monto numérico a formato de moneda peruana (Soles PE).
 * @param {number} monto 
 * @returns {string}
 */
export function formatearSoles(monto) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto);
}

/**
 * Evalúa si un valor recibido del formulario equivale a un check activado.
 * @param {string|boolean} valor 
 * @returns {boolean}
 */
export const marcado = (valor) => valor === 'on' || valor === true;

/**
 * Calcula el monto total del servicio de pedido para recojo.
 * Caso 20: Crocanti Chicken Perú
 * 
 * Precios base por combo:
 * - personal: S/ 18.00
 * - duo:      S/ 32.00
 * - familiar: S/ 58.00
 * 
 * Adicionales:
 * - Empaque térmico: + S/ 3.00
 * 
 * @param {Object} d - Datos del formulario
 * @param {string} d.combo - 'personal' | 'duo' | 'familiar'
 * @param {number|string} d.cantidad - Cantidad de combos (1 a 20)
 * @param {string|boolean} d.empaque_termico - 'on' | true | false
 * @returns {number} Monto final calculado redondeado a 2 decimales
 */
export function calcularMontoServicio(d = {}) {
  const PRECIOS_COMBOS = {
    personal: 18.00,
    duo: 32.00,
    familiar: 58.00
  };

  const comboSeleccionado = d.combo || 'personal';
  const precioBase = PRECIOS_COMBOS[comboSeleccionado] ?? 0;
  const cantidadValida = Math.max(1, Math.min(20, Number(d.cantidad) || 1));

  const subtotal = precioBase * cantidadValida;
  const adicionalEmpaque = marcado(d.empaque_termico) ? 3.00 : 0.00;

  return redondear(subtotal + adicionalEmpaque);
}