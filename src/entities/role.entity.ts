import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity()
export class Role {
  @PrimaryColumn()
  roleId: number;
  @Column()
  roleLevel: number;
  @Column({ nullable: false, unique: true })
  roleName: string;
  @OneToMany((type) => Employee, (employee) => employee.role)
  employees: Employee[];
}
