// js/pago/validaciones.js

// Algoritmo de Luhn para números de tarjeta
export function validarLuhn(numero) {
  const cleanNum = numero.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;
  for (let i = cleanNum.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNum.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return (sum % 10) === 0 && cleanNum.length >= 13;
}

export function detectarMarcaTarjeta(numero) {
  const cleanNum = numero.replace(/\D/g, '');
  if (/^4/.test(cleanNum)) return 'Visa';
  if (/^5[1-5]/.test(cleanNum)) return 'Mastercard';
  if (/^3[47]/.test(cleanNum)) return 'American Express';
  return 'Desconocida';
}

export function validarVencimiento(mes, anio) {
  const ahora = new Date();
  const mesActual = ahora.getMonth() + 1;
  const anioActual = ahora.getFullYear();
  if (anio < anioActual) return false;
  if (anio === anioActual && mes < mesActual) return false;
  return true;
}

export function validarCVV(cvv) {
  return /^\d{3,4}$/.test(cvv);
}

export function validarCelularPE(celular) {
  return /^9\d{8}$/.test(celular);
}