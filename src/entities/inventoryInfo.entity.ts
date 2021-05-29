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
  @PrimaryGeneratedColumn()
  inventoryId: string;
  @Column('varchar', { comment: '商品ID' })
  commodityId: string;
  @OneToOne((type) => Commodity,comodity=>comodity.inventoryInfo,{onUpdate:'CASCADE',onDelete:"CASCADE"})
  @JoinColumn({ name: 'commodityId' })
  commodity: Commodity;
  @Column('double', { comment: '存量', default: 0 })
  inventoryNum;
  @CreateDateColumn()
  inventoryTime;
  @Column('double', { default: 0 })
  totalMoney;
  @Column('text', { nullable: true })
  remark;
}
