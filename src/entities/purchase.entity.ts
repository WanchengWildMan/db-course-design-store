import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Commodity } from './commodity.entity';

@Entity()
export class Purchase {
  @PrimaryColumn()
  purchaseId: string;
  @Column('double')
  commodityNumber: number;
  @Column('varchar')
  commodityId: string;
  @ManyToOne((type) => Commodity, (commodity) => commodity.purchases, {
    eager: true,
  })
  @JoinColumn({ name: 'commodityId' })
  commodity: Commodity;
  @Column('double')
  totalMoneynu: number;
  @Column('text')
  remark: string;
}
