import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Commodity } from './commodity.entity';
import { IsArray } from 'class-validator';
import { BillToPeople } from './billToPeople.entity';

@Entity()
export class BillInfo {
  @PrimaryColumn({ comment: '收银单ID' })
  billId: string;
  @PrimaryColumn('varchar')
  commodityId: string;
  @ManyToOne((type) => BillToPeople, (billToPeople) => billToPeople.billInfos, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'billId' })
  bill: BillToPeople;
  @ManyToOne((type) => Commodity, (commodity) => commodity.billInfos, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'commodityId' })
  commodity: Commodity;
  @Column({ comment: '商品数量', default: 1 })
  commodityNum: number;
  @Column('double', { comment: '总金额，商品单价会变化' })
  totalMoney;
  @CreateDateColumn({ comment: '收银时间' })
  createDate: string;
  @UpdateDateColumn({ comment: '修改时间' })
  updateDate: string;
  @Column('varchar', { nullable: true })
  remark: string;
}
