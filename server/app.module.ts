import { Module } from '@nestjs/common';
import { forwardRef } from 'react';
import { BillController } from './api/bill.controller';
import { CommodityController } from './api/commodity.controller';
import { InventoryController } from './api/inventory.controller';
import { MenuController } from './api/menu.controller';
import { UserController } from './api/user.controller';
import { AppController } from './app.controller';

import { AppService } from './app.service';
import { BillService } from './dao/impl/bill.service';
import { CommodityService } from './dao/impl/commodity.service';
import { MenuService } from './dao/impl/menu.service';

import { PurchaseService } from './dao/impl/purchase.service';
import { EmployeeService } from './dao/impl/user/employee.service';
import { ProvideSerivce } from './dao/impl/user/provide.service';
import { RoleService } from './dao/impl/user/role.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    CommodityController,
    BillController,
    InventoryController,
    MenuController,
    UserController,
  ],
  providers: [
    AppService,
    CommodityService,
    ProvideSerivce,
    EmployeeService,
    PurchaseService,
    RoleService,
    BillService,
    MenuService,
  ],
})
export class AppModule {}
