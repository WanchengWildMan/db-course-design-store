import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity()
export class BillInfo {
  @PrimaryColumn('varchar', { comment: '收银单ID' })
  billId: string;
  @Column('varchar', { comment: '商品ID' })
  commodityId: string;
  @Column('int', { comment: '商品个数' })
  commodityNum: number;
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
  @Column('datetime', { comment: '制单时间' })
  systemTime;
  @Column('datetime', { comment: '收银时间' })
  billTime;
}
