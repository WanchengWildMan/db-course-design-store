import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn, JoinTable, ManyToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Commodity } from './commodity.entity';
import { IsArray } from 'class-validator';

@Entity()
export class BillInfo {
  @PrimaryGeneratedColumn('uuid', { comment: '收银单ID' })
  billId: string;
  @PrimaryColumn('varchar',)
  commodityId: string;
  @ManyToOne(type => Commodity, commodity => commodity.billInfos, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'commodityId' })
  commodity: Commodity;
  @Column({ comment: '商品数量', default: 1 })
  commodityNum: number;
  @Column('varchar', { comment: '员工id' })
  employeeId: string;
  @ManyToOne((type) => Employee, (employee) => employee.bills, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'employeeId' })
  billUser: Employee;
  @Column('varchar', { comment: '顾客姓名或ID' })
  customerId;
  @Column('double', { comment: '总金额，商品单价会变化' })
  totalMoney;
  @CreateDateColumn({ comment: '制单时间' })
  systemTime;
  @CreateDateColumn({ comment: '收银时间' })
  billTime;
}
