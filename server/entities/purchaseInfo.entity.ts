import {
  Column, CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Commodity } from './commodity.entity';
import { Employee } from './employee.entity';
import { IsDate } from 'class-validator';

@Entity()
export class PurchaseInfo {
  @PrimaryGeneratedColumn('uuid')
  purchaseId: string;
  @Column('varchar')
  commodityId: string;
  @ManyToOne((type) => Commodity, (commodity) => commodity.billInfos, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'commodityId' })
  commodity: Commodity;
  @Column('double', { default: 1 })
  commodityNum: number;
  @Column('varchar', { comment: '员工id',nullable:true })
  employeeId: string;
  @ManyToOne((type) => Employee, (employee) => employee.purchases, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'employeeId' })
  purchaseUser: Employee;
  @Column('double')
  totalMoney: number;
  @CreateDateColumn({ comment: '创建日期' })
  @IsDate()
  createDate: string;
  @UpdateDateColumn({comment:"修改日期"})
  @IsDate()
  updateDate:string;
  @Column('text', { nullable: true })
  remark: string;
}
