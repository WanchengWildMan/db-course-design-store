import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Commodity } from './commodity.entity';
import { IsArray } from 'class-validator';
import { BillInfo } from './billInfo.entity';

@Entity()
export class BillToPeople {
  @PrimaryGeneratedColumn('uuid')
  billId: string;
  @OneToMany((type) => BillInfo, (billInfo) => billInfo.bill, {
    eager: true,
  })
  billInfos: BillInfo[];
  @Column('varchar', { comment: '顾客姓名或ID' ,nullable:true})
  customerId: string;
  @Column('varchar', { comment: '员工id' })
  employeeId: string;
  //多个账单一个员工
  @ManyToOne((type) => Employee, (employee) => employee.bills, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'employeeId' })
  billUser: Employee;
}
