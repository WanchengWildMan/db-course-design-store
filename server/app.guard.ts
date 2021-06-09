import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'express-session';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { idText } from 'typescript';
import { EmployeeService } from './dao/service/user/employee.service';
import { RoleService } from './dao/service/user/role.service';
import { Employee } from './entities/employee.entity';
import { Role } from './entities/role.entity';
import { NO_AUTH_METADATA, ROLES_METADATA } from './shop.decl';

@Injectable()
export class AppGuard implements CanActivate {
  private readonly logger = new Logger('AppGuard');

  constructor(
    private reflector: Reflector,
    @InjectRepository(Role)
    private readonly $role: Repository<Role>,
    @InjectRepository(Employee)
    private readonly $employee: Repository<Employee>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('Guard');
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const session = req.session;
    const user = session.user;
    const roleRequired = this.reflector.get(
      ROLES_METADATA,
      context.getHandler(),
    );
    const isNoAuth = this.reflector.get(NO_AUTH_METADATA, context.getHandler());
    this.logger.debug(user);
    this.logger.log(req.url);
    this.logger.log(req.body);
    this.logger.log(req.querys);
    return true; //!!!

    if (isNoAuth) return true;
    if (!user) throw new ForbiddenException('请先登录！');
    let result = await this.$employee.findOne({
      where: `name='${user.name}' OR employeeId='${user.name}'`,
    });
    const findUser = result ? result : null;
    if (!findUser) throw new ForbiddenException('用户不存在！');
    const findRole = await this.$role.findOne({ roleId: findUser.roleId });
    if (findUser.password != user.password)
      throw new ForbiddenException('用户为伪造！');
    else if (Date.now() > session.cookie._expires)
      throw new ForbiddenException('登录已过期！');
    else if (roleRequired > findRole.roleLevel) {
      throw new ForbiddenException('权限不足！');
    }
    req.session.cookie.maxAge = 100000;
    return true;
  }
}
