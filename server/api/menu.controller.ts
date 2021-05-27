import { MenuService } from 'server/dao/impl/menu.service';
import { Controller, Post, Delete, Put, Get, Logger , Req, Res, Next } from '@nestjs/common';;
import { ApiTags } from '@nestjs/swagger';

const $sql = new MenuService();

@ApiTags('菜单')
@Controller('/api/menu')
export class MenuController {
  /**
   * 添加菜单项
   */
  @Post('/addMenu')
  add(@Req() req,@Res() res,@Next() next){
    $sql.add(req,res,next);
  }

  /**
   * 获取所有菜单项
   */
  @Get('/findAllMenu')
  findAllMenu(@Req() req,@Res() res,@Next() next){
    $sql.findAllMenu(req,res,next);
  }

  /**
   * 更新菜单项内容
   */
  @Put('/updateMenu')
  updateMenu(@Req() req,@Res() res,@Next() next){
    $sql.updateMenu(req,res,next);
  }

  /**
   * 删除指定菜单项
   */
  @Delete('/deleteMenu/:menuId')
  deleteMenuById(@Req() req,@Res() res,@Next() next){
    $sql.deleteMenuById(req,res,next);
  }

  /**
   * 获取指定角色菜单项
   */
  @Get('/getAllMenuByBar')
  getAllMenuByBar(@Req() req,@Res() res,@Next() next){
    $sql.getAllMenuByBar(req,res,next);
  }

  /**
   * 获取指定角色已经授权好的菜单
   */
  @Get('/getAlreadyOwnByRole')
  getAlreadyOwnByRole(@Req() req,@Res() res,@Next() next){
    $sql.getAlreadyOwnByRole(req,res,next);
  }

  /**
   * 获取指定角色未授权好的菜单
   */
  @Get('/getNotOwnByRole')
  getNotOwnByRole(@Req() req,@Res() res,@Next() next){
    $sql.getNotOwnByRole(req,res,next);
  }

  /**
   * 保存设置角色权限菜单
   */
  @Post('/saveEmployeePermission')
  saveEmployeePermission(@Req() req,@Res() res,@Next() next){
    $sql.saveEmployeePermission(req,res,next);
  }

  @Delete('/deleteEmployeePermission')
  deleteEmployeePermission(@Req() req,@Res() res,@Next() next){
    $sql.deleteEmployeePermission(req,res,next);
  }
}
