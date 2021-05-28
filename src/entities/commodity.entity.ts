import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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

@Entity()
export class Commodity {
  @PrimaryGeneratedColumn('uuid')
  commodityId: string;

  // @Column('varchar', { comment: '种类编号' })
  // categoryId: string;
  @ManyToOne((type) => Category, (category) => category.commoditys, {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
  @Column('varchar')
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
  @Column('int', { comment: '库存上限', nullable: true })
  quantityUpperLimit: number;
  @Column('int', { comment: '库存下限', nullable: true, default: 0 })
  quantityLowerLimit: number;
  @CreateDateColumn({ comment: '日期' })
  createDate: string;
  @Column('varchar', { comment: '供应商编号' ,nullable:true})
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
