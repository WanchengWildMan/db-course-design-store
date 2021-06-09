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
  UseFilters,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { exception } from 'console';
import { AppFilter } from 'server/app.filter';
import { AppGuard } from 'server/app.guard';

import { ProvideSerivce } from 'server/dao/service/provide.service';
import { EmployeeService } from 'server/dao/service/user/employee.service';
import { RoleService } from 'server/dao/service/user/role.service';

import { NoAuth, Roles } from 'server/roles.decorator';

@ApiTags('用户')
@Controller('/api/user')
// @UseFilters(new AppFilter())
// @UseGuards(AppGuard)
export class UserController {
  constructor(
    private readonly $employeeSql: EmployeeService,
    private readonly $provideSql: ProvideSerivce,
    private readonly $roleSql: RoleService,
  ) {}
  /**
   * 登录
   */
  @NoAuth()
  @Get('/employee/login')
  login(@Req() req, @Res() res, @Next() next) {
    // console.log(req)
    this.$employeeSql.login(req, res, next);
  }

  @Get('/employee/logout')
  logout(@Req() req, @Res() res, @Next() next) {
    console.log(req.session);
    req.session.destroy();
    res.json({
      errors: [],
      result: '已退出系统',
    });
  }
  @Get('/employee/loginUserMessage')
  loginUserMessage(@Req() req, @Res() res, @Next() next) {
    if (req.session.user)
      res.json({
        errors: [],
        result: req.session.user,
      });
  }
  /**
   * 保存员工信息
   */
  @Roles(3)
  @Post('/employee/saveEmployee')
  saveEmployee(@Req() req, @Res() res, @Next() next) {
    this.$employeeSql.saveEmployee(req, res, next);
  }
  /**
   * 添加角色
   */
  @Post('/role/saveRole')
  @Roles(3)
  saveRole(@Req() req, @Res() res, @Next() next) {
    this.$roleSql.saveRole(req, res, next);
  }

  /**
   * 获取指定页数的所属角色信息
   */
  @Roles(3)
  @Get('/role/findRoleByPage')
  findRoleByPage(@Req() req, @Res() res, @Next() next) {
    this.$roleSql.findRoleByPage(req, res, next);
  }
  @Roles(3)
  @Delete('role/deleteRoleById')
  deleteRoleById(@Req() req, @Res() res, @Next() next) {
    this.$roleSql.deleteRoleById(req, res, next);
  }
  /**
   * 获取指定页数的员工信息
   */
  @Roles(3)
  @Get('/employee/findEmployeeByPage')
  getEmployeeByPage(@Req() req, @Res() res, @Next() next) {
    this.$employeeSql.findEmployeeByPage(req, res, next);
  }

  /**
   * 获取指定员工号的员工信息
   */
  @Get('/employee/findEmployeeById')
  findEmployeeById(@Req() req, @Res() res, @Next() next) {
    this.$employeeSql.findEmployeeById(req, res, next);
  }
  @Delete('/employee/deleteEmployeeById')
  deleteEmployeeById(@Req() req, @Res() res, @Next() next) {
    this.$employeeSql.deleteEmployeeById(req, res, next);
  }
}
