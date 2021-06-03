import {
  Controller,
  Post,
  Delete,
  Put,
  Get,
  Logger,
  Req,
  Res,
  Next,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmployeeService } from 'src/dao/impl/user/employee.service';
import { ProvideSerivce } from 'src/dao/service/provide.service';
import { RoleService } from 'src/dao/impl/user/role.service';

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
