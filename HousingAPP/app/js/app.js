var routerApp = angular.module('routerApp', ['ui.router','ngAnimate', 'ngCookies', 'angularFileUpload',
    'ngMessages', 'RoomRecommendModule', 'CityChangeModule', 'ShowMapOrListModule', 'ChoiceByConditionModule', 'RoomListModule', 'UserRegisterModule', 'UserLoginModule',
    'RentForWholeModule', 'RentForRoomModule', 'RentForBedModule', 'RecentPublishModule',
    'DetailPageModule', 'UpdateHouseWholeModule', 'UpdateHouseRoomModule', 'UpdateHouseBedModule',
    'DeletedHouseInfoModule', 'UpdatePersonalInfoMoudle', 'UpdatePasswordMoudle', 'SetSecureProtectModule',
    'FindPassByQueModule', 'FindPassByEmailModule', 'ResetPassModule','AdminMessageModule'
]);
/**
 * 由于整个应用都会和路由打交道，所以这里把$state和$stateParams这两个对象放到$rootScope上，方便其它地方引用和注入。
 * 这里的run方法只会在angular启动的时候运行一次。
 * @param  {[type]} $rootScope
 * @param  {[type]} $state
 * @param  {[type]} $stateParams
 * @return {[type]}
 */
routerApp.run(function($rootScope, $state, $stateParams,$cookieStore) {
    $rootScope.$state = $state;
    $rootScope.isAdmin=$cookieStore.get('currentIsAdmin');
    if(typeof($cookieStore.get('myCurrentCity')!=='undefined'))
        $rootScope.city=$cookieStore.get('myCurrentCity');
    console.log($rootScope.isAdmin);
    $rootScope.$stateParams = $stateParams;
    $rootScope.messageNum = '';
    $rootScope.register = '注册';
    $rootScope.login = '登录';
});

/**
 * 配置路由。
 * 注意这里采用的是ui-router这个路由，而不是ng原生的路由。
 * ng原生的路由不能支持嵌套视图，所以这里必须使用ui-router。
 * @param  {[type]} $stateProvider
 * @param  {[type]} $urlRouterProvider
 * @return {[type]}
 */
routerApp.config(function($stateProvider, $urlRouterProvider) {
    // $urlRouterProvider.otherwise('/home');
    $stateProvider
       //管理员登录路由状态
         .state('admin', {
            url: '/admin',
            views: {
                '': {
                    templateUrl: 'Admin/admin.html'
                }
            }
        })
        .state('admin.houseManage', {
            url: '/houseManage',
            views: {
                'adminRole@admin': {
                    templateUrl: 'Admin/房屋管理/houseManage.html'
                }
            }
        }) 
         .state('admin.usersManagement', {
            url: '/usersManagement',
            views: {
                'adminRole@admin': {
                    templateUrl: 'Admin/用户管理/usersManagement.html'
                }
            }
        }) 
        //用户登录路由状态
        .state('home', {
            url: '/home',
            views: {
                '': {
                    templateUrl: 'User/home.html'
                },
                'list@home': {
                    templateUrl: 'User/list.html'
                },
                'map@home': {
                    templateUrl: 'User/map.html'
                }
            }
        })
        .state('loginForm', {
            url: '/loginForm',
            templateUrl: 'User/loginForm.html'
        })
        .state('register', {
            url: '/register',
            templateUrl: 'User/register.html'
        })
        .state('current', {
            url: '/current',
            templateUrl: 'User/loginForm.html'
        })
        .state('resetPass', {
            url: '/resetPass?email',
            templateUrl: 'User/个人中心/resetPass.html'
        })
        .state('findPass', {
            url: '/findPass',
            controller: function($rootScope) {
                $rootScope.Choice = 1;
            },
            views: {
                '': {
                    templateUrl: 'User/个人中心/findPass.html'
                },
                'findPassword@findPass': {
                    templateUrl: 'User/个人中心/findPassByQue.html'
                }
            }
        })
        .state('exit', {
            url: '/exit',
            controller: function($rootScope, $state, $cookieStore) {
                $rootScope.reg = "http://" + $rootScope.serverIp + ":8080/HB#/register";
                $rootScope.register = '注册';
                $rootScope.log = 'http://' + $rootScope.serverIp + ':8080/HB#/loginForm';
                $rootScope.login = '登录';
                $rootScope.messageNum = '';
                $cookieStore.remove('myusername');
                $cookieStore.remove('mypassword');
                if($cookieStore.get('currentIsAdmin'))
                {
                   $cookieStore.remove('currentIsAdmin');
                   $rootScope.isAdmin='0'; 
                }
                $state.go('home');
            }
        })
        .state('findPassWay', {
            url: '/findPassWay/{findPassWayId:[1-3]}',
            controller: function($rootScope, $state, $stateParams) {
                // expect($stateParams).toBe({myRentleId: 1});
                if ($stateParams.findPassWayId == '1') {
                    $rootScope.Choice = 1;
                    $state.go('findPass.findByEmail');
                    // alert(1);
                }
                if ($stateParams.findPassWayId == '2') {
                    $rootScope.Choice = 2;
                    $state.go('findPass.findByQuestion');
                }
                if ($stateParams.findPassWayId == '3') {
                    $rootScope.Choice = 3;
                    $state.go('findPass.findByAppeal');
                }
            }
        })
        .state('findPass.findByQuestion', {
            url: '/findByQuestion',
            views: {
                '': {
                    templateUrl: 'User/个人中心/findPass.html'
                },
                'findPassword@findPass': {
                    templateUrl: 'User/个人中心/findPassByQue.html'
                }
            }
        })
        .state('findPass.findByEmail', {
            url: '/findByEmail',
            views: {
                '': {
                    templateUrl: 'User/个人中心/findPass.html'
                },
                'findPassword@findPass': {
                    templateUrl: 'User/个人中心/findPassByEmail.html'
                }
            }
        })
        .state('findPass.findByAppeal', {
            url: '/findByAppeal',
            views: {
                '': {
                    templateUrl: 'User/个人中心/findPass.html'
                },
                'findPassword@findPass': {
                    templateUrl: 'User/个人中心/findPassByAppeal.html'
                }
            }
        })
        .state('myRentle', {
            url: '/myRentle/{myRentleId:[0-3]}',
            controller: function($rootScope, $state, $stateParams) {
                // expect($stateParams).toBe({myRentleId: 1});
                if (typeof($rootScope.register) != 'undefined' && $rootScope.register != '注册') {
                    //do something
                    if ($stateParams.myRentleId == '0') {
                        $rootScope.currentChoice = 0;
                        $state.go('registerUserHome');
                    }
                    if ($stateParams.myRentleId == '1') {
                        $rootScope.currentChoice = 1;
                        $state.go('registerUserHome.personalCenter');
                    }
                    if ($stateParams.myRentleId == '2') {
                        $rootScope.currentChoice = 2;
                        $state.go('registerUserHome.messageCenter');
                    }
                    if ($stateParams.myRentleId == '3') {
                        $rootScope.currentChoice = 3;
                        //$state.go('registerUserHome');         
                    }
                } else
                    $state.go('loginForm');
            }
        })
        //房屋出租
        .state('registerUserHome', {
            url: '/registerUserHome',
            controller: function($rootScope, $state, $stateParams) {
                // expect($stateParams).toBe({myRentleId: 1});
                if (typeof($rootScope.register) == 'undefined' || $rootScope.register == '注册')
                    $state.go('loginForm');
            },
            views: {
                '': {
                    templateUrl: 'User/registerUserHome.html'
                },
                'totalItems@registerUserHome': {
                    templateUrl: 'User/出租房屋/rentleHouse.html'
                },
                'detailItemsShow@registerUserHome': {
                    templateUrl: 'User/出租房屋/rentForWhole.html'
                }
            }
        })
        .state('registerUserHome.rentForWhole', {
            url: '/rentForWhole',
            views: {
                'detailItemsShow@registerUserHome': {
                    templateUrl: 'User/出租房屋/rentForWhole.html'
                }
            }
        })
        .state('registerUserHome.rentForRoom', {
            url: '/rentForRoom',
            views: {
                'detailItemsShow@registerUserHome': {
                    templateUrl: 'User/出租房屋/rentForRoom.html'
                }
            }
        })
        .state('registerUserHome.rentForBed', {
            url: '/rentForBed',
            views: {
                'detailItemsShow@registerUserHome': {
                    templateUrl: 'User/出租房屋/rentForBed.html'
                }
            }
        })
        //信息中心
        .state('registerUserHome.messageCenter', {
            url: '/messageCenter',
            views: {
                '': {
                    templateUrl: 'User/registerUserHome.html'
                },
                'totalItems@registerUserHome': {
                    templateUrl: 'User/信息中心/messageCenter.html'
                },
                'detailItemsShow@registerUserHome': {
                    templateUrl: 'User/信息中心/recentPublish.html'
                }
            }
        })
        .state('registerUserHome.recentPublish', {
            url: '/recentPublish',
            views: {
                'totalItems@registerUserHome': {
                    templateUrl: 'User/信息中心/messageCenter.html'
                },
                'detailItemsShow@registerUserHome': {
                    templateUrl: 'User/信息中心/recentPublish.html'
                }
            }
        })
        .state('registerUserHome.adminMessage', {
            url: '/adminMessage',
            views: {
                'totalItems@registerUserHome': {
                    templateUrl: 'User/信息中心/messageCenter.html'
                },
                'detailItemsShow@registerUserHome': {
                    templateUrl: 'User/信息中心/adminMessage.html'
                }
            }
        })
        .state('registerUserHome.deletedHouseInfo', {
            url: '/deletedHouseInfo',
            views: {
                'totalItems@registerUserHome': {
                    templateUrl: 'User/信息中心/messageCenter.html'
                },
                'detailItemsShow@registerUserHome': {
                    templateUrl: 'User/信息中心/deletedHouseInfo.html'
                }
            }
        })
        //详细页面
        .state('houseDetail', {
            url: '/houseDetail/{detailPageID}',
            templateUrl: 'User/详细页面/houseDetail.html'
        })
        .state('houseDetail.detailPageWhole', {
            url: '/detailPageWhole',
            views: {
                'detailPage@houseDetail': {
                    templateUrl: 'User/详细页面/detailPageWhole.html'
                }
            }
        })
        .state('houseDetail.detailPageRoom', {
            url: '/detailPageRoom',
            views: {
                'detailPage@houseDetail': {
                    templateUrl: 'User/详细页面/detailPageRoom.html'
                }
            }
        })
        .state('houseDetail.detailPageBed', {
            url: '/detailPageBed',
            views: {
                'detailPage@houseDetail': {
                    templateUrl: 'User/详细页面/detailPageBed.html'
                }
            }
        })
        //修改页面
        .state('updateHouseWhole', {
            url: '/updateHouseWhole/{updateHouseID}',
            templateUrl: 'User/修改出租房屋信息/updateHouseWhole.html'
        })
        .state('updateHouseRoom', {
            url: '/updateHouseRoom/{updateHouseID}',
            templateUrl: 'User/修改出租房屋信息/updateHouseRoom.html'
        })
        .state('updateHouseBed', {
            url: '/updateHouseBed/{updateHouseID}',
            templateUrl: 'User/修改出租房屋信息/updateHouseBed.html'
        })
        //个人中心
        .state('registerUserHome.personalCenter', {
            url: '/personalCenter',
            views: {
                '': {
                    templateUrl: 'User/registerUserHome.html'
                },
                'totalItems@registerUserHome': {
                    templateUrl: 'User/个人中心/personalCenter.html'
                },
                'detailItemsShow@registerUserHome': {
                    templateUrl: 'User/个人中心/updatePersonalInfo.html'
                }
            }
        })
        .state('registerUserHome.personalCenter.updatePassword', {
            url: '/updatePassword',
            views: {
                'detailItemsShow@registerUserHome': {
                    templateUrl: 'User/个人中心/updatePassword.html'
                }
            }
        })
        .state('registerUserHome.personalCenter.secureProtection', {
            url: '/secureProtection',
            views: {
                'detailItemsShow@registerUserHome': {
                    templateUrl: 'User/个人中心/secureProtection.html'
                }
            }
        });

});