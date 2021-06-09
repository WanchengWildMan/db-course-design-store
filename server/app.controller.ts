import { Controller, Get, Post, Res, Next, UseFilters, UseGuards, Req, Body } from '@nestjs/common';
import { AppFilter } from './app.filter';
import { AppService } from './app.service';
import { Roles } from './roles.decorator';
import { AppGuard } from './app.guard';
import { InventoryService } from './dao/service/inventory.service';

@Controller()
@UseFilters()
@UseGuards(AppGuard)
export class AppController {
  constructor(private readonly appService: AppService,private readonly inventoryService:InventoryService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
 }
 @Roles(3)
 @Post("/api/admin/forceUpdateInventory")
 async forceUpdateInventory(@Body() body){
    console.log(body)
    return await this.inventoryService.forceUpdateInventory(body.inventoryInfo);
 }
}