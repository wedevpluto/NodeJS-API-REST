export interface ArqueoProps {
  cajeroId: number;

  billetes1000?: number;
  billetes2000?: number;
  billetes5000?: number;
  billetes10000?: number;
  billetes20000?: number;
  billetes50000?: number;

  totalEfectivo: number;
  totalDebito?: number;
  totalCredito?: number;
  totalTransferencia?: number;
  totalQr?: number;
  totalPedidosYaCtaCte?: number;
  totalPedidosYaEfectivo?: number;
  totalRappiCtaCte?: number;
  totalRappiEfectivo?: number;

  observaciones?: string;
}