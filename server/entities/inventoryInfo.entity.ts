import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Commodity } from './commodity.entity';

@Entity()
//库存
export class InventoryInfo {
  @PrimaryColumn('varchar', { comment: '商品ID' })
  commodityId: string;
  @OneToOne((type) => Commodity, (comodity) => comodity.inventoryInfo, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'commodityId' })
  commodity: Commodity;
  @Column('double', { comment: '存量', default: 0 })
  inventoryNum: number;
  @UpdateDateColumn()
  inventoryTime: string;
  @Column('int', { comment: '库存上限', nullable: true })
  quantityUpperLimit: number;
  @Column('int', { comment: '库存下限', nullable: true, default: 0 })
  quantityLowerLimit: number;
  @Column('text', { nullable: true })
  remark: string;
}
