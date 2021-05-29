import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn, PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { Role } from './role.entity';
import { BillInfo } from './billInfo.entity';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn("uuid")
  employeeId: string;
  @Column('varchar')
  name: string;
  @Column('int')
  roleId: number;
  //员工，普通管理层，高级管理层，董事会...
  @ManyToOne((type) => Role, (role) => role.employees)
  @JoinColumn({ name: 'roleId' })
  role: Role;
  @OneToMany((type) => BillInfo, (bill) => bill.billUser)
  bills: BillInfo[];
  @Column('varchar', { comment: '职位' })
  position: string;
  @Column('char', { length: 11 })
  contactPhone: string;
  @Column('varchar', { nullable: true })
  contactAddress: string;
  @Column('char', { length: 18, comment: '身份证号' })
  IdCard: string;
  @Column('date', { comment: '入职时间' })
  entryTime: Date;
  @Column('int')
  sex: number;
  @Column('int', { default: 1 })
  Status:number;
}
