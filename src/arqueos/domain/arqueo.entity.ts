import { ArqueoProps } from './arqueo.types';

export class Arqueo {
  private totalGeneral: number;
  private diferencia: number;

  private constructor(private props: ArqueoProps) {
    this.calcular();
  }

  static crear(props: ArqueoProps): Arqueo {
    if (props.totalEfectivo < 0) {
      throw new Error('Total efectivo inválido');
    }

    return new Arqueo(props);
  }

  private calcular() {
    this.totalGeneral =
      (this.props.totalEfectivo ?? 0) +
      (this.props.totalDebito ?? 0) +
      (this.props.totalCredito ?? 0) +
      (this.props.totalTransferencia ?? 0) +
      (this.props.totalQr ?? 0) +
      (this.props.totalPedidosYaCtaCte ?? 0) +
      (this.props.totalPedidosYaEfectivo ?? 0) +
      (this.props.totalRappiCtaCte ?? 0) +
      (this.props.totalRappiEfectivo ?? 0);

    const efectivoContado =
      ((this.props.billetes1000 ?? 0) * 1000) +
      ((this.props.billetes2000 ?? 0) * 2000) +
      ((this.props.billetes5000 ?? 0) * 5000) +
      ((this.props.billetes10000 ?? 0) * 10000) +
      ((this.props.billetes20000 ?? 0) * 20000) +
      ((this.props.billetes50000 ?? 0) * 50000);

    this.diferencia =
      efectivoContado - (this.props.totalEfectivo ?? 0);
  }

  toPersistence() {
    return {
      ...this.props,
      totalGeneral: this.totalGeneral,
      diferencia: this.diferencia,
    };
  }
}