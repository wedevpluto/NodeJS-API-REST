import { calcularTotales } from './arqueos.calculations';

describe('calcularTotales', () => {
  it('debe calcular correctamente el totalGeneral', () => {
    const result = calcularTotales({
      totalEfectivo: 21000,
      totalDebito: 8000,
      totalCredito: 5000,
    });

    expect(result.totalGeneral).toBe(34000);
  });

  it('debe calcular correctamente el efectivo contado', () => {
    const result = calcularTotales({
      billetes1000: 5,
      billetes2000: 3,
      billetes5000: 2,
      billetes10000: 1,
    });

    expect(result.efectivoContado).toBe(31000);
  });

  it('debe calcular correctamente la diferencia', () => {
    const result = calcularTotales({
      totalEfectivo: 21000,
      billetes1000: 5,
      billetes2000: 3,
      billetes5000: 2,
      billetes10000: 1,
    });

    expect(result.diferencia).toBe(10000);
  });

  it('debe usar 0 si no se proveen valores', () => {
    const result = calcularTotales({});

    expect(result.totalGeneral).toBe(0);
    expect(result.efectivoContado).toBe(0);
    expect(result.diferencia).toBe(0);
  });
});