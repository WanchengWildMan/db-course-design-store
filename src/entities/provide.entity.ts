import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Commodity } from './commodity.entity';
import { IsEmail, IsPhoneNumber, Length } from 'class-validator';

@Entity()
export class Provide {
  @PrimaryGeneratedColumn('uuid', { comment: '供应商ID' })
  provideId: string;
  @Column()
  name: string;
  @Column()
  contactPerson: string;
  @Column('char', { length: 11 })
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
