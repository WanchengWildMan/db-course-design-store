import {
  Column,
  Entity,
  Generated,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Commodity } from './commodity.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('increment')
  categoryId: number;
  @Column('varchar', { unique: true })
  name: string;

  @OneToMany((type) => Commodity, (commodity) => commodity.category)
  commoditys: Commodity[];
}
