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
import { EmployeeService } from 'server/dao/impl/user/employee.service';
import { ProvideSerivce } from 'server/dao/impl/user/provide.service';
import { RoleService } from 'server/dao/impl/user/role.service';

const $employeeSql = new EmployeeService();
const $roleSql = new RoleService();
const $provideSql = new ProvideSerivce();

@ApiTags('用户')
@Controller('/api/user')
export class UserController {
  /**
   * 登录
   */
  @Get('/employee/login')
  login(@Req() req, @Res() res, @Next() next) {
    // console.log(req)
    $employeeSql.login(req, res, next);
  }

  @Get('/employee/logout')
  destroy(@Req() req, @Res() res, @Next() next) {
    req.session.destroy();
    res.json({
      result: {
        code: true,
        msg: '已退出系统',
      },
    });
  }

  @Get('/employee/loginUserMessage')
  loginUserMessage(@Req() req, @Res() res, @Next() next) {
    let result = {};
    if (req.session.user) {
      result = {
        code: true,
        result: req.session.user,
      };
    } else {
      result = {
        code: false,
        msg: '未登录，请重新登录',
      };
    }
    res.json({
      result: result,
    });
  }

  /**
   * 添加角色
   */
  @Post('/role/addRole')
  saveRole(@Req() req, @Res() res, @Next() next) {
    $roleSql.saveRole(req, res, next);
  }

  /**
   * 添加员工信息
   */
  @Post('/employee/addEmployee')
  saveEmployee(@Req() req, @Res() res, @Next() next) {
    $employeeSql.saveEmployee(req, res, next);
  }

  /**
   * 添加供应商信息
   */
  @Post('/provide/addProvide')
  saveProvide(@Req() req, @Res() res, @Next() next) {
    $provideSql.saveProvide(req, res, next);
  }

  /**
   * 获取指定页数的所属部门信息
   */
  @Get('/role/getRoleByPage')
  getAllRoleByPage(@Req() req, @Res() res, @Next() next) {
    $roleSql.getAllRoleByPage(req, res, next);
  }

  /**
   * 获取指定页数的员工信息
   */
  @Get('/employee/getEmployeeByPage')
  getEmployeeByPage(@Req() req, @Res() res, @Next() next) {
    $employeeSql.getEmployeeByPage(req, res, next);
  }

  /**
   * 获取指定员工号的员工信息
   */
  @Get('/employee/getEmployeeById')
  getEmployeeById(@Req() req, @Res() res, @Next() next) {
    $employeeSql.getEmployeeById(req, res, next);
  }

  /**
   * 获取指定页数的供应商信息
   */
  @Get('/provide/getProvideByPage')
  getProvideByPage(@Req() req, @Res() res, @Next() next) {
    $provideSql.getProvideByPage(req, res, next);
  }

  /**
   * 获取所有角色信息，用于选择
   */
  @Get('/role/getRoleBySelect')
  getRoleBySelect(@Req() req, @Res() res, @Next() next) {
    $roleSql.getRoleBySelect(req, res, next);
  }

  /**
   * 获取所有供应商信息（用于下拉选择）
   */
  @Get('/provide/getProvideBySelect')
  getProvideBySelect(@Req() req, @Res() res, @Next() next) {
    $provideSql.getProvideBySelect(req, res, next);
  }

  /**
   * 更新一条部门信息
   */
  @Put('/role/updateRoleById')
  updateRoleById(@Req() req, @Res() res, @Next() next) {
    $roleSql.updateRoleById(req, res, next);
  }

  /**
   * 更新一条员工信息
   */
  @Put('/employee/updateEmployeeById')
  updateEmployeeById(@Req() req, @Res() res, @Next() next) {
    $employeeSql.updateEmployeeById(req, res, next);
  }

  /**
   * 更新员工使用状态
   */
  @Put('/employee/updateEmployeeStatusById')
  updateEmployeeStatusById(@Req() req, @Res() res, @Next() next) {
    $employeeSql.updateEmployeeStatusById(req, res, next);
  }

  /**
   * 更新一条供应商信息
   */
  @Put('/provide/updateProvideById')
  updateProvideById(@Req() req, @Res() res, @Next() next) {
    $provideSql.updateProvideById(req, res, next);
  }

  /**
   * 更新指定id的供应商状态
   */
  @Put('/provide/updateProvideStatusById')
  updateProvideStatusById(@Req() req, @Res() res, @Next() next) {
    $provideSql.updateProvideStatusById(req, res, next);
  }

  /**
   * 删除一个部门信息
   */
  @Delete('/role/deleteRoleId/:roleId')
  deleteRoleId(@Req() req, @Res() res, @Next() next) {
    $roleSql.deleteRoleId(req, res, next);
  }

  /**
   * 删除一个员工信息
   */
  @Delete('/employee/deleteEmployeeById/:employeeId')
  deleteEmployeeById(@Req() req, @Res() res, @Next() next) {
    $employeeSql.deleteEmployeeById(req, res, next);
  }

  /**
   * 删除一条供应商信息
   */
  @Delete('/provide/deleteProvideById/:provideId')
  deleteProvideById(@Req() req, @Res() res, @Next() next) {
    $provideSql.deleteProvideById(req, res, next);
  }
}

// // /***
// //  * ***********************    会员信息    ************************
// //  */

// // /**
// //  * 保存一个会员类型
// //  */
// // @Post('/saveMemberDiscount')
// (@Req() req, @Res() res, @Next() next) {
//   //   $sql.member.saveMemberDiscount(req, res, next);
//   // }

//   // /**
//   //  * 更新一个会员类型信息
//   //  */
//   // @Put('/updateMemberDiscountById')
//   (@Req() req, @Res() res, @Next() next) {
//     //   $sql.member.updateMemberDiscountById(req, res, next);
//     // }

//     // /**
//     //  * 删除一个会员类型
//     //  */
//     // @Delete('/deleteMemberDiscountById/:discountId')
//     (@Req() req, @Res() res, @Next() next) {
//       //   $sql.member.deleteMemberDiscountById(req, res, next);
//       // }

//       // /**
//       //  * 获取指定页数的会员类型
//       //  */
//       // @Get('/getMemberDiscountByPage')
//       (@Req() req, @Res() res, @Next() next) {
//         //   $sql.member.getMemberDiscountByPage(req, res, next);
//         // }

//         // /**
//         //  * 获取所有会员类型，用户选择
//         //  */
//         // @Get('/getAllMemberDiscount')
//         (@Req() req, @Res() res, @Next() next) {
//           //   $sql.member.getAllMemberDiscount(req, res, next);
//           // }

//           // /**
//           //  * 获取禁用会员的禁用描述
//           //  */
//           // @Get('/getMemberRemark')
//           (@Req() req, @Res() res, @Next() next) {
//             //   $sql.member.getMemberRemark(req, res, next);
//             // }

//             // /**
//             //  * 获取指定类型的指定用户
//             //  */
//             // @Get('/getMemberByTypeAndPage')
//             (@Req() req, @Res() res, @Next() next) {
//               //   $sql.member.getMemberByTypeAndPage(req, res, next);
//               // }

//               // /**
//               //  * 保存一个会员信息
//               //  */
//               // @Post('/saveMember')
//               (@Req() req, @Res() res, @Next() next) {
//                 //   $sql.member.saveMember(req, res, next);
//                 // }

//                 // /**
//                 //  * 更新指定会员个人信息
//                 //  */
//                 // @Put('/updateMemberById')
//                 (@Req() req, @Res() res, @Next() next) {
//                   //   $sql.member.updateMemberById(req, res, next);
//                   // }

//                   // /**
//                   //  * 更新指定会员的状态
//                   //  */
//                   // @Put('/updateMemberStatus')
//                   (@Req() req, @Res() res, @Next() next) {
//                     //   $sql.member.updateMemberStatus(req, res, next);
//                     // }

//                     // /**
//                     //  * 删除指定会员信息
//                     //  */
//                     // @Delete('/deleteMemberById/:memberId')
//                     (@Req() req, @Res() res, @Next() next) {
//                       //   $sql.member.deleteMemberById(req, res, next);
//                       // }

//                       // /**
//                       //  * 清除禁用状态的会员信息
//                       //  */
//                       // @Delete('/removeMemberByStatus')
//                       (@Req() req, @Res() res, @Next() next) {
//                         //   $sql.member.removeMemberByStatus(req, res, next);
//                         // }

//                         // /**
//                         //  * 获取指定页数的会员信息
//                         //  */
//                         // @Get('/getMemberByPage')
//                         (@Req() req, @Res() res, @Next() next) {
//                           //   $sql.member.getMemberByPage(req, res, next);
//                           // }

//                           // /**
//                           //  * 获取可以使用的会员信息
//                           //  */
//                           // @Get('/findAllBillMember')
//                           (@Req() req, @Res() res, @Next() next) {
//                             //   $sql.member.findAllBillMember(req, res, next);
//                             // }

//                             // /**
//                             //  * 获取指定卡号的会员信息
//                             //  */
//                             // @Get('/getMemberById')
//                             (@Req() req, @Res() res, @Next() next) {
// //   $sql.member.getMemberById(req, res, next);
// // }

// // module.exports = router;
