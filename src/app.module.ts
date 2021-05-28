import { Module } from '@nestjs/common';
import { forwardRef } from 'react';
import { BillController } from './api/bill.controller';

import { InventoryController } from './api/inventory.controller';
import { MenuController } from './api/menu.controller';
import { UserController } from './api/user.controller';
import { AppController } from './app.controller';

import { AppService } from './app.service';
import { BillService } from './dao/impl/bill.service';
import { CommodityService } from './dao/service/commodity.service';
import { MenuService } from './dao/impl/menu.service';

import { PurchaseService } from './dao/impl/purchase.service';
import { EmployeeService } from './dao/impl/user/employee.service';
import { ProvideSerivce } from './dao/impl/user/provide.service';
import { RoleService } from './dao/impl/user/role.service';
import { PurchaseController } from './api/purchase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommodityController } from './controllers/commodity.controller';
import { Commodity } from './entities/commodity.entity';
import { Category } from './entities/category.entity';
import { BillInfo } from './entities/billInfo.entity';
import { Unit } from './entities/unit.entity';
import { Employee } from './entities/employee.entity';
import { InventoryInfo } from './entities/inventoryInfo.entity';
import { Purchase } from './entities/purchase.entity';
import { Role } from './entities/role.entity';
import { Provide } from './entities/provide.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'test',
        password: 'test',
        database: 'test',
        synchronize: true,
        logging: true,
        entities: [
          Commodity,
          Category,
          Unit,
          BillInfo,
          Employee,
          InventoryInfo,
          Purchase,
          Role,
          Provide
        ],
        migrations: ['../migration/**/*.ts'],
        subscribers: ['../subscriber/**/*.ts'],
      }),
    }),

    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([
      Commodity,
      Category,
      Unit,
      BillInfo,
      Employee,
      InventoryInfo,
      Purchase,
      Role,
    ]),
  ],
  controllers: [
    AppController,
    CommodityController,
    // BillController,
    // InventoryController,
    // MenuController,
    // UserController,
    // PurchaseController,
  ],
  providers: [
    AppService,
    CommodityService,
    // ProvideSerivce,
    // EmployeeService,
    // PurchaseService,
    // RoleService,
    // BillService,
    // MenuService,
  ],
})
export class AppModule {}
