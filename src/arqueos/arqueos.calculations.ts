export interface ArqueoCalculoInput {
  totalEfectivo?: number;
  totalDebito?: number;
  totalCredito?: number;
  totalTransferencia?: number;
  totalQr?: number;
  totalPedidosYaCtaCte?: number;
  totalPedidosYaEfectivo?: number;
  totalRappiCtaCte?: number;
  totalRappiEfectivo?: number;

  billetes1000?: number;
  billetes2000?: number;
  billetes5000?: number;
  billetes10000?: number;
  billetes20000?: number;
  billetes50000?: number;
}

export function calcularTotales(input: ArqueoCalculoInput) {
  const totalGeneral =
    (input.totalEfectivo ?? 0) +
    (input.totalDebito ?? 0) +
    (input.totalCredito ?? 0) +
    (input.totalTransferencia ?? 0) +
    (input.totalQr ?? 0) +
    (input.totalPedidosYaCtaCte ?? 0) +
    (input.totalPedidosYaEfectivo ?? 0) +
    (input.totalRappiCtaCte ?? 0) +
    (input.totalRappiEfectivo ?? 0);

  const efectivoContado =
    ((input.billetes1000 ?? 0) * 1000) +
    ((input.billetes2000 ?? 0) * 2000) +
    ((input.billetes5000 ?? 0) * 5000) +
    ((input.billetes10000 ?? 0) * 10000) +
    ((input.billetes20000 ?? 0) * 20000) +
    ((input.billetes50000 ?? 0) * 50000);

  const diferencia = efectivoContado - (input.totalEfectivo ?? 0);

  return {
    totalGeneral,
    efectivoContado,
    diferencia,
  };
}