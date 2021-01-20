﻿export default [
  {
    name: 'loginTest',
    layout: false,
    path: '/user/loginTest',
    component: './login',
    exact: true,
  },
  {
    name: 'login',
    layout: false,
    path: '/user/login',
    component: './user/login',
    exact: true,
  },
  {
    name: 'user',
    path: '/user',
    routes: [
      {
        name: 'user.user-list',
        path: '/user/userList',
        component: './user/UserList',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/user/userInfo/:userId',
        component: './user/UserInfo',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/user/UpdatePwd/:userId',
        component: './user/UpdatePwd',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/user/userView/:userId',
        component: './user/UserView',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/user',
        redirect: '/user/userList',
        exact: true,
      },
    ],
  },
  {
    name: 'dbs',
    path: '/dbs',
    routes: [
      {
        name: 'user.user-list',
        path: '/dbs/dbsList',
        component: './system/dbs/DbsList',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/dbs/dbInfo/:name',
        component: './system/dbs/DbInfo',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/dbs/dbView/:name',
        component: './system/dbs/DbView',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/dbs',
        redirect: '/dbs/dbsList',
        exact: true,
      },
    ],
  },
  {
    name: 'rule',
    path: '/rule',
    routes: [
      {
        name: 'user.user-list',
        path: '/rule/ruleInfo/:roleId',
        component: './system/rule/RuleInfo',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/rule',
        redirect: '/rule/ruleInfo/null',
        exact: true,
      },
    ],
  },
  {
    name: 'Auth',
    path: '/Auth',
    component: './system/auth/Auth',
    exact: true,
  },

  {
    name: 'role',
    path: '/role',
    routes: [
      {
        name: 'user.user-list',
        path: '/rule/ruleInfo/:roleId',
        component: './system/rule/RuleInfo',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/role/roleList',
        component: './system/role/RoleList',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/role/roleInfo/:roleId',
        component: './system/role/RoleInfo',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/role/roleUser/:roleId',
        component: './system/role/RoleUser',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/role',
        redirect: '/role/roleList',
        exact: true,
      },
    ],
  },

  {
    name: 'authType',
    path: '/authType',
    routes: [
      {
        name: 'user.user-list',
        path: '/authType/authTypeList',
        component: './system/authType/AuthTypeList',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/authType/authTypeInfo/:name',
        component: './system/authType/AuthTypeInfo',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/authType',
        redirect: '/authType/authTypeList',
        exact: true,
      },
    ],
  },

  {
    name: 'org',
    path: '/org',
    routes: [
      {
        name: 'user.user-list',
        path: '/org/OrgManager',
        component: './system/org/OrgManager',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/org',
        redirect: 'org/OrgManager',
        exact: true,
      },
    ],
  },
  {
    name: 'menu',
    path: '/menu',
    routes: [
      {
        name: 'user.user-list',
        path: '/menu/menuManager',
        component: './system/menu/MenuManager',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/menu/menuEdit/:action/:id',
        component: './system/menu/menuEdit',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/menu',
        redirect: '/menu/MenuManager',
      },
    ],
  },
  {
    name: 'storage',
    path: '/storage',
    routes: [
      {
        name: 'user.user-list',
        path: '/storage/storageList',
        component: './storage/storage/StorageList',
      },
      {
        name: 'user.user-list',
        path: '/storage/inStorageList',
        component: './storage/inStorage/InStorageList',
      },
      {
        name: 'user.user-list',
        path: '/storage',
        redirect: '/storage/storageList',
      },
    ],
  },
  {
    name: 'inv',
    path: '/transation',
    routes: [
      {
        name: 'user.user-list',
        path: '/transation/storeList/:type',
        component: './inv/store/storeList',
      },
      {
        name: 'user.user-list',
        path: '/transation/store/:action/:id',
        component: './inv/store/store',
      },
      {
        name: 'user.user-list',
        path: '/transation/deliverList',
        component: './inv/deliver/deliverList',
      },
      {
        name: 'user.user-list',
        path: '/transation/deliver/:action/:id',
        component: './inv/deliver/deliver',
      },
      {
        name: 'user.user-list',
        path: '/transation/transferList/:type',
        component: './inv/transfer/transferList',
      },
      {
        name: 'user.user-list',
        path: '/transation/transfer/:type/:action/:id',
        component: './inv/transfer/transfer',
      },
      {
        name: 'user.user-list',
        path: '/transation/countList',
        component: './inv/count/countList',
      },
      {
        name: 'user.user-list',
        path: '/transation/count/:action/:id',
        component: './inv/count/count',
      },
      {
        name: 'user.user-list',
        path: '/transation/onHandList',
        component: './inv/onHand/onHandList',
      },
      {
        name: 'user.user-list',
        path: '/transation/onHand/:action/:id/',
        component: './inv/onHand/onHand',
      },
    ],
  },

  {
    name: 'order',
    path: '/order',
    routes: [
      {
        name: 'user.user-list',
        path: '/order/poList',
        component: './order/po/poList',
        exact: true,
      },
      {
        name: 'user.user-list',
        path: '/order/po/:action/:id',
        component: './order/po/po',
        exact: true,
      }
    ],
  },


  {
    name: 'mdm',
    path: '/mdm',
    routes: [
      {
        name: 'user.user-list',
        path: '/mdm/dict/dictList',
        component: './mdm/dict/dictList',
      },
      {
        name: 'user.user-list',
        path: '/mdm/dict/dict/:dict_id',
        component: './mdm/dict/dict',
      },
      {
        name: 'user.user-list',
        path: '/mdm/item/item/:category_id/:item_id',
        component: './mdm/item/item',
      },
      {
        name: 'user.user-list',
        path: '/mdm/item/itemList/:category_id',
        component: './mdm/item/itemList',
      },
      {
        name: 'user.user-list',
        path: '/mdm/itemCategory/itemCategoryList',
        component: './mdm/itemCategory/itemCategoryList',
      },
      {
        name: 'user.user-list',
        path: '/mdm/itemCategory/itemCategory/:category_pid/:category_id',
        component: './mdm/itemCategory/itemCategory',
      },
    ],
  },
  {
    name: 'customers',
    path: '/customers',
    routes: [
      {
        name: 'user.user-list',
        path: '/customers/customersList',
        component: './customers/customersList',
      },
      {
        name: 'user.user-list',
        path: '/customers/customers/:customer_id',
        component: './customers/customers',
      },
    ]
  },
  {
    name: 'user.user-list',
    path: '/inv/org',
    component: './inv/org/InvOrg',
    exact: true,
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
    exact: true,
  },
  {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    component: './Admin',
    routes: [
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        icon: 'smile',
        component: './Welcome',
        exact: true,
      },
    ],
  },
  {
    name: 'list.table-list',
    icon: 'table',
    path: '/list',
    component: './ListTableList',
    exact: true,
  },
  {
    path: '/',
    //redirect: '/user',
    exact: true,
  },
  {
    component: './404',
    exact: true,
  },
];
