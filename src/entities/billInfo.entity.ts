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
  // @Column('varchar', { comment: '商品ID' })
  // commodityId: string;
  @ManyToMany(type => Commodity)
  @JoinTable()
  commoditys: Commodity[];
  @Column({ comment: '商品个数数组' })
  commodityNum: string;
  @Column('varchar', { comment: '员工id' })
  employeeId: string;
  @ManyToOne((type) => Employee, (employee) => employee.bills, { eager: true })
  @JoinColumn({ name: 'employeeId' })
  billUser: Employee;
  @Column('varchar', { comment: '顾客姓名或ID' })
  customerId;
  @Column('double', { comment: '总金额' })
  totalMoney;
  @Column('int')
  totalNum;
  @CreateDateColumn({ comment: '制单时间' })
  systemTime;
  @CreateDateColumn({ comment: '收银时间' })
  billTime;
}
