import { IsEmail, IsPhoneNumber } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Commodity } from './commodity.entity';

@Entity()
export class Provide {
  @PrimaryGeneratedColumn('uuid', { comment: '供应商ID' })
  provideId: string;
  @Column({ unique: true })
  name: string;
  @Column()
  contactPerson: string;
  @Column('varchar', { length: 30 })
  @IsPhoneNumber()
  contactPhone: string;
  @Column()
  contactAddress: string;
  @Column()
  @IsEmail()
  contactEmail: string;
  @OneToMany((type) => Commodity, (commodity) => commodity.provide)
  commoditys: Commodity[];
  @Column('int', { default: 1 })
  Status: number;
  @Column({ default: '' })
  remark: string;
}
