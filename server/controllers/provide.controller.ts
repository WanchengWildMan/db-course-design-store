import {
  Controller,

  Delete,

  Get,



  Next, Post,




  Req,
  Res
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProvideSerivce } from 'server/dao/service/provide.service';

@ApiTags('供应商')
@Controller('/api/provide')
export class ProvideController {
  constructor(private readonly $sql: ProvideSerivce) {}

  @Post('/saveProvide')
  saveProvide(@Req() req, @Res() res, @Next() next) {
    this.$sql.saveProvide(req, res, next);
  }

  @Get('/findProvideByPage')
  findProvideByPage(@Req() req, @Res() res, @Next() next) {
    this.$sql.findProvideByPage(req, res, next);
  }
  @Delete('/deleteProvideById')
  deleteProvideById(@Req() req, @Res() res, @Next() next) {
    this.$sql.deleteProvideById(req, res, next);
  }
}
