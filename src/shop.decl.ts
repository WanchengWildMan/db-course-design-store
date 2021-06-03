import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export type PageInfo = { page?: number; currentPage?: number };

export class commodityInfo {
  @IsNotEmpty()
  @IsString()
  commodityId?: string;

  @IsNotEmpty()
  @IsNumber()
  num?: number;

  @IsNumber()
  totalMoney?: number;
}

export const ROLE_LEVEL_ADMIN = 3;
export const MATADATA_PRE = 'Metadata';
export const ROLES_METADATA = `${MATADATA_PRE}:role`;
export const NO_AUTH_METADATA = `${MATADATA_PRE}:no-auth`;
