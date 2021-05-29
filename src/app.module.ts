import { Module } from '@nestjs/common';
import { forwardRef } from 'react';
import { BillController } from './controllers/bill.controller';

import { InventoryController } from './controllers/inventory.controller';
import { AppController } from './app.controller';

import { AppService } from './app.service';
import { BillService } from './dao/service/bill.service';
import { CommodityService } from './dao/service/commodity.service';
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
import { InventoryService } from './dao/service/inventory.service';

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
          Provide,
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
    BillController,
    InventoryController,
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
    BillService,
    InventoryService,
    // MenuService,
  ],
})
export class AppModule {
}
