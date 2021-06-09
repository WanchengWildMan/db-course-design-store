import { SetMetadata } from '@nestjs/common';
import { NO_AUTH_METADATA, ROLES_METADATA } from './shop.decl';
export const Roles = (...role: number[]) => SetMetadata(ROLES_METADATA, role);
export const NoAuth = () => SetMetadata(NO_AUTH_METADATA, true);
