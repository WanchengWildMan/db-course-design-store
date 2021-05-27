import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql';
import * as $util from '../../util/util';
import { $conf } from '../../conf/db';
import { menuSqlMap as $sql } from '../map/menuMap';
const pool = mysql.createPool($util.extend({}, $conf.mysql));
@Injectable()
export class MenuService {
  add(req, res, next) {
    pool.getConnection((err, connection) => {
      //获取参数
      const param = req.body;
      //建立连接，保存值
      connection.query(
        $sql.insert,
        [param.name, param.url, param.fatherMenuId, param.icon, param.level],
        (err, result) => {
          if (result) {
            result = {
              code: true,
              msg: '添加菜单项成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }
  //查询所有菜单
  findAllMenu(req, res, next) {
    pool.getConnection((err, connection) => {
      connection.query($sql.findAllMenu, (err, result) => {
        let r = {};
        if (result) {
          for (let i = 0; i < result.length; i++) {
            result[i].children = [];
          }
          r = {
            code: true,
            result: this.matchMenuTree(result),
          };
          $util.closeConnection(res, r, connection);
        }
      });
    });
  }
  //更新指定菜单项
  updateMenu(req, res, next) {
    pool.getConnection((err, connection) => {
      const param = req.body;
      connection.query(
        $sql.update,
        [param.name, param.url, param.fatherMenuId, param.icon, param.menuId],
        (err, result) => {
          if (result) {
            result = {
              code: true,
              msg: '更新菜单项成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }
  //删除指定菜单项
  deleteMenuById(req, res, next) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      const param = req.params;
      connection.query($sql.deleteMenuById, param.menuId, (err, result) => {
        if (result) {
          result = {
            code: true,
            msg: '删除菜单项成功',
          };
        }
        $util.closeConnection(res, result, connection);
      });
    });
  }
  //获取全部的菜单项
  getAllMenuByBar(req, res, next) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      //const param = req.params;
      connection.query($sql.getAllMenuByBar, (err, result) => {
        let r = {};
        if (result) {
          for (let i = 0; i < result.length; i++) {
            result[i].children = [];
            result[i].icon = 'fa ' + result[i].icon + ' fa-1x';
          }
          r = {
            code: true,
            result: this.matchMenuTree(result),
          };
        }
        $util.closeConnection(res, r, connection);
      });
    });
  }
  //获取指定角色的菜单项
  getAlreadyOwnByRole(req, res, next) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      const param = req.query;
      connection.query(
        $sql.getAlreadyOwnByRole,
        [param.roleId, param.roleId],
        (err, result) => {
          let r = {};
          if (result) {
            for (let i = 0; i < result.length; i++) {
              result[i].children = [];
              result[i].icon = 'fa ' + result[i].icon + ' fa-1x';
            }
            r = {
              code: true,
              result: this.matchMenuTree(result),
            };
          }
          $util.closeConnection(res, r, connection);
        },
      );
    });
  }
  //获取指定角色未授权的菜单项
  getNotOwnByRole(req, res, next) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      const param = req.query;
      connection.query($sql.getNotOwnByRole, param.roleId, (err, result) => {
        let r = {};
        if (result) {
          for (let i = 0; i < result.length; i++) {
            result[i].children = [];
            result[i].icon = 'fa ' + result[i].icon + ' fa-1x';
          }
          r = {
            code: true,
            result: this.matchMenuTree(result),
          };
        }
        $util.closeConnection(res, r, connection);
      });
    });
  }
  //分配好菜单属别
  matchMenuTree(menus) {
    //反序
    menus = menus.sort((param1, param2) => {
      return param2.level - param1.level;
    });
    for (let i = 0; i < menus.length; i++) {
      if (menus[i].fatherMenuId !== null) {
        let menu = menus.find((data) => data.menuId === menus[i].fatherMenuId);
        if (menu !== undefined) {
          menu.children.push(menus[i]);
          menus.splice(i, 1);
          i--;
        }
      }
    }
    //顺序
    menus = menus.sort((param1, param2) => {
      return param1.menuId - param2.menuId;
    });
    return menus;
  }
}
