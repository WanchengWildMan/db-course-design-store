import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('rowid')
  roleId: number;
  @Column()
  roleLevel: number;
  @Column({ nullable: false, unique: true })
  roleName: string;
  @Column('boolean')
  remove: boolean;
  @Column('boolean')
  edit: boolean;
  @Column('boolean')
  addInto: boolean;
  @OneToMany((type) => Employee, (employee) => employee.role)
  employees: Employee[];
}
