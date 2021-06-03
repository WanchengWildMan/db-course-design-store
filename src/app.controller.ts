import { Controller, Get, Req, Res, Next, UseFilters } from '@nestjs/common';
import { AppFilter } from './app.filter';
import { AppService } from './app.service';

@Controller()
@UseFilters()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
 }
}