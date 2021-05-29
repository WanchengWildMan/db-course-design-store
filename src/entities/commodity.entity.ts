import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany, OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import DateTimeFormat = Intl.DateTimeFormat;
import { inflate } from 'zlib';
import { Category } from './category.entity';
import { Unit } from './unit.entity';
import { Provide } from './provide.entity';
import { Purchase } from './purchase.entity';
import { type } from 'os';
import { BillInfo } from './billInfo.entity';
import { InventoryInfo } from './inventoryInfo.entity';
import { IsEmail, Length } from 'class-validator';
import { inventoryMap } from '../dao/map/inventoryMap';

@Entity()
export class Commodity {
  @PrimaryGeneratedColumn('uuid')
  commodityId: string;
  @Column('int', { comment: '种类编号', nullable: true })
  categoryId: number;
  @ManyToOne((type) => Category, (category) => category.commoditys, {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('char', { length: 13, comment: '条形码', unique: true })
  barcode: string;
  @Column('varchar', { comment: '商品名' })
  name: string;
  @Column('varchar', { comment: '规格型号', nullable: true })
  format: string;
  @Column('varchar', { comment: '产地', nullable: true })
  place: number;
  @Column('varchar', { comment: '单位ID', nullable: true })
  unitId: number;
  //单位编号(个：1)
  @ManyToOne((type) => Unit, (unit) => unit.commoditys, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;
  @Column('double', { comment: '定价' })
  costPrice: number;
  @OneToOne(type => InventoryInfo, inventory => inventory.commodity, { eager: true })
  inventoryInfo: InventoryInfo;
  @Column('int', { comment: '库存上限', nullable: true })
  quantityUpperLimit: number;
  @Column('int', { comment: '库存下限', nullable: true, default: 0 })
  quantityLowerLimit: number;
  @CreateDateColumn({ comment: '日期' })
  createDate: string;
  @Column('varchar', { comment: '供应商编号', nullable: true })
  provideId: string;
  @OneToMany((type) => Purchase, (purchase) => purchase.commodity)
  purchases: Purchase[];
  @ManyToOne((type) => Provide, (provide) => provide.commoditys, {
    eager: true,
  })
  @JoinColumn({ name: 'provideId' })
  provide: Provide;
  @Column({ default: 1 })
  Status: number;
  @Column('text', { comment: '备注', nullable: true })
  remark: string;
  @Column('double', { comment: '折扣率', default: 1 })
  discountRate: number;

}
