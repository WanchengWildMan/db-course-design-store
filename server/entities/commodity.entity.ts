import { IsDate, IsNumber, Length } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BillInfo } from './billInfo.entity';
import { Category } from './category.entity';
import { InventoryInfo } from './inventoryInfo.entity';
import { Provide } from './provide.entity';
import { PurchaseInfo } from './purchaseInfo.entity';
import { Unit } from './unit.entity';
import DateTimeFormat = Intl.DateTimeFormat;

@Entity()
export class Commodity {
  constructor() {
    (this.commodityId = ''),
      (this.name = ''),
      (this.categoryId = 0),
      (this.barcode = ''),
      (this.name = ''),
      (this.format = ''),
      (this.place = ''),
      (this.unitId = 1),
      (this.costPrice = 0),
      (this.discountRate = 1);
  }
  @PrimaryGeneratedColumn('uuid')
  commodityId: string;
  @Column('int', { comment: '种类编号', nullable: true })
  @IsNumber()
  categoryId: number;
  @ManyToOne((type) => Category, (category) => category.commoditys, {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('char', { length: 13, comment: '条形码', unique: true })
  @Length(13, 16)
  barcode: string;
  @Column('varchar', { comment: '商品名' })
  name: string;
  @Column('varchar', { comment: '规格型号', nullable: true })
  format: string;
  @Column('varchar', { comment: '产地', nullable: true })
  place: string;
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
  @IsNumber()
  costPrice: number;
  @OneToOne((type) => InventoryInfo, (inventory) => inventory.commodity, {
    eager: true,
  })
  inventoryInfo: InventoryInfo;

  @CreateDateColumn({ comment: '创建日期' })
  @IsDate()
  createDate: string;
  @UpdateDateColumn({ comment: '修改日期' })
  @IsDate()
  updateDate: string;
  @Column('varchar', { comment: '供应商编号', nullable: true })
  provideId: string;
  @ManyToOne((type) => Provide, (provide) => provide.commoditys, {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'provideId' })
  provide: Provide;
  @OneToMany((type) => BillInfo, (bill) => bill.commodity)
  billInfos: BillInfo[];
  @OneToMany((type) => PurchaseInfo, (purchase) => purchase.commodity)
  purchases: PurchaseInfo[];

  @Column({ default: 1 })
  Status: number;
  @Column('text', { comment: '备注', nullable: true })
  remark: string;
  @Column('double', { comment: '折扣率', default: 1 })
  discountRate: number;
}
