import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Commodity } from './commodity.entity';
import { commoditySqlMap } from '../dao/map/commodityMap';

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
  @CreateDateColumn()
  inventoryTime: string;
  @Column('text', { nullable: true })
  remark: string;
}
