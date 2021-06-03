import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { Role } from './role.entity';
import { BillInfo } from './billInfo.entity';
import { PurchaseInfo } from './purchaseInfo.entity';
import { IsPhoneNumber } from 'class-validator';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  employeeId: string;
  @Column('varchar')
  name: string;
  @Column('int')
  roleId: number;
  @Column('varchar')
  password: string;
  //员工，普通管理层，高级管理层，董事会...
  @ManyToOne((type) => Role, (role) => role.employees)
  @JoinColumn({ name: 'roleId' })
  role: Role;
  @OneToMany((type) => BillInfo, (bill) => bill.billUser)
  bills: BillInfo[];
  @OneToMany((type) => PurchaseInfo, (purchase) => purchase.purchaseUser)
  purchases: PurchaseInfo[];
  @Column('varchar', { comment: '职位' })
  position: string;
  @Column('char', { length: 11 })
  @IsPhoneNumber()
  contactPhone: string;
  @Column('varchar', { nullable: true })
  contactAddress: string;
  @Column('char', { length: 18, comment: '身份证号' })
  IdCard: string;
  @CreateDateColumn()
  entryTime: string;
  @Column('int')
  sex: number;
  @Column('int', { default: 1 })
  Status: number;
}
