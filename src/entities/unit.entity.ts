import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Commodity } from './commodity.entity';
import { commoditySqlMap } from '../dao/map/commodityMap';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  unitId: number;
  //单位名称(个/斤/公斤/吨...)
  @Column('varchar',{unique:true})
  unitName: string;
  @OneToMany((type) => Commodity, (commodity) => commodity.unit)
  commoditys: Commodity[];
}
