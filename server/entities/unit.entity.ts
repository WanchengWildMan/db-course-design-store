import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Commodity } from './commodity.entity';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  unitId: number;
  //单位名称(个/斤/公斤/吨...)
  @Column('varchar', { unique: true })
  unitName: string;
  @OneToMany((type) => Commodity, (commodity) => commodity.unit)
  commoditys: Commodity[];
}
