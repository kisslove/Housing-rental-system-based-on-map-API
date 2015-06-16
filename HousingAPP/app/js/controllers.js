/**
 * 根据选择的城市加载不同的地区模块
 * @type {[type]}
 */
var cityChangeModule = angular.module('CityChangeModule', []);
cityChangeModule.controller('cityChangeCtrl', function($interval, $rootScope, $scope, $http, $state, $stateParams, $cookieStore, getLocalDataService) {
	//$rootScope.isAsmin=0;
	//$cookieStore.remove('myusername');
	//$cookieStore.remove('mypassword');
	$rootScope.jugeLogin = function() {
		if (typeof($cookieStore.get('myusername')) !== 'undefined') {
			$scope.checkUsername($cookieStore.get('myusername'), $cookieStore.get('mypassword'));
		} else {
			$rootScope.reg = HB.serverIp + "/HB#/register";
			$rootScope.register = '注册';
			$rootScope.log = HB.serverIp + '/HB#/loginForm';
			$rootScope.login = '登录';
		}
	}

	$scope.checkUsername = function(email, password) {
		$http.get(HB.dataBaseIp + '/getuserData', {
				params: {
					userName: email,
					password: password,
				}
			})
			.success(function(data) {
				if (data.length >= 1) {
					var newMessage = [];
					if (typeof(data[0].Messages) !== 'undefined') {
						if (typeof(data[0].Messages.message) === 'object') {
							for (var i = 0; i < data[0].Messages.message.length; i++) {
								var Message = $.parseJSON(data[0].Messages.message[i]);
								if (Message.isNew === true) {
									newMessage.push(Message);
								}
							}
						}
					}

					$cookieStore.put('mypassword', password);
					$cookieStore.put('myusername', email);
					$rootScope.reg = HB.serverIp + "/HB#/registerUserHome/messageCenter";
					$rootScope.register = email;
					$rootScope.log = HB.serverIp + '/HB#/exit';
					if (typeof(data[0].Messages) === 'undefined'||newMessage.length===0)
						$rootScope.messageNum = '';
					else
						$rootScope.messageNum = newMessage.length;
					$rootScope.login = '退出';
				} else {
					alert("用户名或密码错误,请重新登录！");
					$cookieStore.remove('myusername');
					$cookieStore.remove('mypassword');
					$rootScope.reg = HB.serverIp + "/HB#/register";
					$rootScope.register = '注册';
					$rootScope.log = HB.serverIp + '/HB#/loginForm';
					$rootScope.login = '登录';
					$state.go('loginForm');

				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	}

	$rootScope.jugeLogin();
	$rootScope.choiceArea = '';
	$rootScope.choicePrice = '';
	$rootScope.choiceRoomType = '';
	$rootScope.choicePriceType = '';
	$rootScope.items = [];
	//$rootScope.city='';
	$scope.cityChange = function() {
		$rootScope.areas = [];
		$rootScope.city = $rootScope.vm.value;
		$cookieStore.put('myCurrentCity', $rootScope.vm.value);
		for (var i = 0; i < $rootScope.allAreas.length; i++) {

			if ($rootScope.allAreas[i].city == $rootScope.city) {
				$rootScope.areas = $rootScope.allAreas[i].areas;
			}
		};
		//HB.loadding.show("加载数据中");
		$rootScope.getData();
		//HB.loadding.close();
		$state.go('home');

	};
	/**
	 * 根据选择条件查询数据
	 * @return {[type]} [description]
	 */

	$rootScope.getData = function() {
			$http.get(HB.dataBaseIp + '/getHouseRentInfo', {
					params: {
						area: $rootScope.choiceArea,
						city: $rootScope.city,
						priceType: $rootScope.choicePriceType,
						roomType: $rootScope.choiceRoomType,
						key: $scope.keySearch
					}
				})
				.success(function(data) {
					if (data.length == 0) {

						$rootScope.listDiv.addClass('hidden');
						$rootScope.mapDiv.addClass('hidden');
						$rootScope.message = {
							name: '没有数据！'
						};
						$rootScope.items = [];
					} else {
						console.log(data);
						$rootScope.items = data;
						$rootScope.listDiv.removeClass('hidden');
						$rootScope.mapDiv.addClass('hidden');
						$rootScope.message = {
							name: '列表显示'
						};
						$rootScope.initList();
					}

				})
				.error(function(data) {
					alert('网络错误。。。');
				});
		}
		/**
		 * 省份城市数据
		 * @type {[type]}
		 */
	var vm = $rootScope.vm = {};
	vm.provinces = [];
	getLocalDataService.getProvinces().success(function(response) {
		vm.provinces = response;
	});


	getLocalDataService.getAllCityAreas().success(function(response) {
		$rootScope.allAreas = response;
		/**
		 * 初始化城市
		 * @type {String}
		 */
		//$rootScope.city = '北京市';
		$rootScope.areas = [];
		for (var i = 0; i < $rootScope.allAreas.length; i++) {

			if ($rootScope.allAreas[i].city == $rootScope.city) {
				$rootScope.areas = $rootScope.allAreas[i].areas;
			}
		};
		//$rootScope.getData();
	});
	//$rootScope.getData();

	/**
	 * 获取当前时间，并格式化时间
	 */
	$rootScope.CurrentTime = function() {
		var now = new Date();

		var year = now.getFullYear(); //年
		var month = now.getMonth() + 1; //月
		var day = now.getDate(); //日

		var hh = now.getHours(); //时
		var mm = now.getMinutes(); //分

		var clock = year + "-";

		if (month < 10)
			clock += "0";

		clock += month + "-";

		if (day < 10)
			clock += "0";

		clock += day + " ";

		if (hh < 10)
			clock += "0";

		clock += hh + ":";
		if (mm < 10) clock += '0';
		clock += mm;
		return (clock);
	};

});

var roomRecommendModule = angular.module('RoomRecommendModule', []);
roomRecommendModule.controller('roomRecommendCtrl', ['$rootScope', '$scope', '$cookieStore', '$state', '$interval', '$http', function($rootScope, $scope, $cookieStore, $state, $interval, $http) {
	var userVisitID = '';
	$rootScope.showHouseRecommend = 1;
	$rootScope.specialFlag = 1;
	$rootScope.recomItem = [];
	$rootScope.hiddenProl = function() {
		$rootScope.showHouseRecommend = 0;
	};

	$scope.getUserVisitInfo = function() {
		$http.get(HB.dataBaseIp + '/getUserVisitInfoByIP', {
				params: {
					userVisitID: userVisitID
				}
			})
			.success(function(data) {
				if (data.length == 0) {
					//$scope.propelMessageRand();
					console.log('没有历史数据');
					$rootScope.showHouseRecommend = 0;

				} else if (data.length > 0) {
					console.log('历史记录');
					console.log(data);
					$scope.propelMessage(data);

				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	}

	$scope.searchHouseInfo = function(area, city, priceType, roomType, key) {
		$http.get(HB.dataBaseIp + '/getHouseRentInfo', {
				params: {
					area: area,
					city: city,
					priceType: priceType,
					roomType: roomType,
					key: key
				}
			})
			.success(function(data) {
				if (data.length == 0) {
					$rootScope.showHouseRecommend = 0;
				} else if (data.length > 0) {
					console.log('返回数据');
					//alert(data);
					console.log(data);
					if (data.length <= 3) {
						for (var i = 0; i < data.length; i++) {
							$rootScope.recomItem.push(data[i]);
						}
					} else {
						//var array = new Array();
						function generateRandom(count) {
							var rand = parseInt(Math.random() * count);
							for (var i = 0; i < $rootScope.recomItem.length; i++) {
								if ($rootScope.recomItem[i] == data[rand]) {
									return false;
								}
							}
							$rootScope.recomItem.push(data[rand]);
						}

						for (var i = 0;; i++) {
							// 只生成3个随机数 
							if ($rootScope.recomItem.length < 3) {
								generateRandom(data.length);
							} else {
								break;
							}
						}
						$interval(function() {
							$rootScope.recomItem = [];
							for (var i = 0;; i++) {
								// 只生成3个随机数 
								if ($rootScope.recomItem.length < 3) {
									generateRandom(data.length);
								} else {
									break;
								}
							}
						}, 5000);
					}

				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	}

	$rootScope.showProl = function() {
		$rootScope.showHouseRecommend = 1;
	};

	$interval(function() {
		// $rootScope.specialFlag表示推荐可以再次显示
		if ($rootScope.showHouseRecommend == 0 && $rootScope.specialFlag == 1) {
			$rootScope.showHouseRecommend = 1;
		}
	}, 8000);



	//根据用户历史记录推荐
	$scope.propelMessage = function(data) {
			if (typeof(data[0].choiceArea) == 'undefined')
				data[0].choiceArea = '';
			if (typeof(data[0].choicePriceType) == 'undefined')
				data[0].choicePriceType = '';
			if (typeof(data[0].choiceType) == 'undefined')
				data[0].choiceType = '';
			$scope.searchHouseInfo(data[0].choiceArea, '', data[0].choicePriceType, data[0].choiceType, '');
		}
		//随机推荐
	$scope.propelMessageRand = function(data) {
		var id = ((Math.ceil(Math.random() * 10))) % 9; //随机生成0-8的整数
		console.log("id" + id);
		var roomType = '';
		var priceType = '';
		if (id == 0)
			priceType = '5';
		if (id == 1)
			roomType = '整套出租';
		if (id == 2)
			priceType = '3';
		if (id == 3)
			priceType = '1';
		if (id == 4)
			roomType = '床位出租';
		if (id == 5)
			priceType = '2';
		if (id == 6)
			roomType = '单间出租';
		if (id == 7)
			priceType = '4';
		if (id == 8)
			priceType = '0';
		var area = '';
		var city = $rootScope.city;
		var key = '';
		console.log('发送');
		$scope.searchHouseInfo(area, city, priceType, roomType, key);
		console.log('结束');
	}

	$scope.remberUserHistory = function(timestamp) {
		$http.get(HB.dataBaseIp + '/addUserVisitInfo', {
				params: {
					userVisitID: timestamp
				}
			})
			.success(function(data) {
				if (data == 'success') {
					//$scope.propelMessageRand();
					console.log('success');

				} else {
					console.log('failed');
				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	}
	if (typeof($cookieStore.get('userVisitID')) !== 'undefined') {
		userVisitID = $cookieStore.get('userVisitID');
		//$cookieStore.remove('userVisitID');
		$scope.getUserVisitInfo();

	} else {
		var timestamp = "FWZL" + new Date().getTime();
		console.log(timestamp);
		$interval($scope.propelMessageRand(), 5000);
		console.log(123);
		var Days = 365;
		var exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = 'userVisitID' + "=" + '%22' + escape(timestamp) + '%22' + ";expires=" + exp.toGMTString();
		$scope.remberUserHistory(timestamp);
	}
}]);
/**
 * 导航栏右侧模块
 * @type {[type]}
 */
/*
var righrNavModule = angular.module("RighrNavModule", []);
righrNavModule.controller('righrNavCtrl', function($scope, $http, $state, $stateParams) {
	// body...
})
 */

/**
 * 用地图或者列表展示房屋信息
 * @type {[type]}
 */
var showMapOrListModule = angular.module('ShowMapOrListModule', []);
showMapOrListModule.controller('showMapOrListCtrl', function($filter, $rootScope, $scope, $http, $state, $stateParams, $cookieStore) {
	$rootScope.mapDiv = angular.element(document.querySelector('#mapDiv'));
	$rootScope.listDiv = angular.element(document.querySelector('#listDiv'));
	$rootScope.mapDiv.addClass('hidden');
	$rootScope.listDiv.addClass('hidden');
	$rootScope.jugeLogin();
	$rootScope.message = {
		name: '请选择城市！'
	};
	$rootScope.specialFlag = 1;
	/*-----------地图显示或隐藏----------*/
	$scope.showMap = function() {
		//alert('dd');
		if ($rootScope.mapDiv.hasClass('hidden')) {
			if ($rootScope.items.length !== 0) {
				$rootScope.mapDiv.removeClass('hidden');
				$rootScope.listDiv.addClass('hidden');
				$rootScope.message = {
					name: '地图展示'
				};

				var map = new BMap.Map("allmap");
				$scope.createMap(map, $rootScope.city + $rootScope.choiceArea);
				map.clearOverlays();
				var opts = [];
				//alert($rootScope.items[0].thumbnail[0].imageName);
				for (var i = 0; i < $rootScope.items.length; i++) {
					var marker = new BMap.Marker(new BMap.Point($rootScope.items[i].longitude, $rootScope.items[i].latitude)); // 创建标注
					var content = '<div style="margin:0;line-height:20px;padding:2px;">' +
						'<img src="./image/' + $rootScope.items[i].thumbnail[0].imageName + '" alt="" style="float:right;zoom:1;overflow:hidden;width:100px;height:100px;margin-left:3px;"/>' +
						'地址：' + $rootScope.items[i].communityName + '<br/>电话：' + $rootScope.items[i].hostphone + '<br/>月租：￥' + $rootScope.items[i].price + '<br/>简介：' + $rootScope.items[i].describle + '' +
						'</div>';

					opts.push({
						title: $rootScope.items[i].title, //标题
						width: 350, //宽度
						height: 105, //高度
						panel: "panel", //检索结果面板
						enableAutoPan: true, //自动平移
						searchTypes: [
							BMAPLIB_TAB_SEARCH, //周边检索
							BMAPLIB_TAB_TO_HERE, //到这里去
							BMAPLIB_TAB_FROM_HERE //从这里出发
						]
					});
					map.addOverlay(marker); // 将标注添加到地图中
					addClickHandler(content, marker, opts[i]);
				}
			} else {
				alert('没有相关数据');
			}
		} else {
			$rootScope.mapDiv.addClass('hidden');
			$rootScope.listDiv.removeClass('hidden');
			$rootScope.message = {
				name: '列表展示'
			};
		}

		function addClickHandler(content, marker, opt) {
			marker.addEventListener("click", function(e) {
				openInfo(content, e, opt, marker)
			});
		}

		function openInfo(content, e, opt, marker) {
			var p = e.target;
			var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
			var searchInfoWindow = new BMapLib.SearchInfoWindow(map, content, opt); // 创建信息窗口对象 
			//map.openInfoWindow(infoWindow,point); //开启信息窗口
			searchInfoWindow.open(marker, point);
		}

	};

	$scope.createMap = function(map, center) {
		// 百度地图API功能
		map.centerAndZoom(center, 14);
		map.enableScrollWheelZoom(true);
		// 添加带有定位的导航控件
		var navigationControl = new BMap.NavigationControl({
			// 靠左上角位置
			anchor: BMAP_ANCHOR_TOP_LEFT,
			// LARGE类型
			type: BMAP_NAVIGATION_CONTROL_LARGE,
			// 启用显示定位
			enableGeolocation: true
		});
		map.addControl(navigationControl);
		// 添加定位控件
		var geolocationControl = new BMap.GeolocationControl();
		geolocationControl.addEventListener("locationSuccess", function(e) {
			// 定位成功事件
			var address = '';
			address += e.addressComponent.province;
			address += e.addressComponent.city;
			address += e.addressComponent.district;
			address += e.addressComponent.street;
			address += e.addressComponent.streetNumber;
			alert("当前定位地址为：" + address);
		});
		geolocationControl.addEventListener("locationError", function(e) {
			// 定位失败事件
			alert(e.message);
		});
		map.addControl(geolocationControl);
	}

	/**
	 * 选择条件发生变化
	 * @return {[type]} [description]
	 */
	$scope.closeArea = function() {
		$rootScope.areaID.addClass('hidden');
		$rootScope.choiceArea = '';
		$rootScope.getData();
	}

	$scope.closePrice = function() {
		$rootScope.priceID.addClass('hidden');
		$rootScope.choicePriceType = '';
		$rootScope.getData();
	}

	$scope.closeRoomType = function() {
		$rootScope.roomTypeID.addClass('hidden');
		$rootScope.choiceRoomType = '';
		$rootScope.getData();
	}

	/**
	 * 分页部分
	 */

	/*************分页函数****************/
	$scope.itemsPerPage = 12;
	$scope.currentPage = 0;
	$scope.prevPage = function() {
		if ($scope.currentPage > 0) {
			$scope.currentPage--;
		}
		console.log($scope.currentPage);
		var watch = $scope.$watch('currentPage', function(newVal, oldVal) {
			watch();
			console.log(newVal);
			if ((newVal + 1) % 5 == 0) {
				$scope.pageNumRange = [];
				if (newVal + 1 > 4) {
					for (var i = newVal - 4; i <= newVal; i++)
						$scope.pageNumRange.push({
							id: i
						});
				}

			};
			if ($scope.pageCount() < 4) {
				$scope.pageNumRange = [];
				for (var i = 0; i <= $scope.pageCount(); i++)
					$scope.pageNumRange.push({
						id: i
					});

			};
		});
	};

	$scope.firstPage = function() {
		$scope.currentPage = 0;
		$scope.initList();
	};

	$scope.firstPageDisabled = function() {
		return $scope.currentPage === 0 ? "disabled" : "";
	}

	$scope.lastPage = function() {
		if ($scope.pageCount() != -1) {
			$scope.currentPage = $scope.pageCount();
			console.log($scope.currentPage);
			$scope.pageNumRange = [];
			if ($scope.currentPage < 5) {
				for (var i = 0; i <= $scope.pageCount(); i++)
					$scope.pageNumRange.push({
						id: i
					});
			} else {
				for (var i = $scope.currentPage - 4; i <= $scope.currentPage; i++)
					$scope.pageNumRange.push({
						id: i
					});
			}
		}
	};

	$scope.lastPageDisabled = function() {
		return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
	}

	$scope.setPage = function(arg) {
		$scope.currentPage = arg;
	};

	$scope.prevPageDisabled = function() {
		return $scope.currentPage === 0 ? "disabled" : "";
	};

	$scope.pageCount = function() {
		return Math.ceil($rootScope.items.length / $scope.itemsPerPage) - 1; //从0开始
	};

	$scope.nextPage = function() {
		if ($scope.currentPage < $scope.pageCount()) {
			$scope.currentPage++;
		};

		var watch = $scope.$watch('currentPage', function(newVal, oldVal) {
			watch();
			var count = $scope.pageCount() + 1;
			if (newVal % 5 === 0) {
				$scope.pageNumRange = [];
				if (newVal + 5 > count) {
					for (var i = newVal; i < count; i++)
						$scope.pageNumRange.push({
							id: i
						});
				} else {

					for (var i = newVal; i <= 4 + newVal; i++)
						$scope.pageNumRange.push({
							id: i
						});
				};

			};
		});
	};
	$scope.nextPageDisabled = function() {
		return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
	};
	$scope.query = "";
	$scope.$watch('query', function(newValue, oldValue, scope) {
		if (newValue !== oldValue && newValue.trim() === "") {
			$rootScope.getData();
		}
		if (newValue !== oldValue && newValue.trim() !== "") {

			//$rootScope.getData();
			$scope.itemData = 0;
			console.log("items1:" + $rootScope.items.length);
			$rootScope.items = $filter('filter')($rootScope.items, $scope.query);
			if ($rootScope.items.length === 0) {
				$scope.pageNumRange = [];
				$scope.itemData = 1;
				return;
			};

			var pageTotal = Math.ceil($rootScope.items.length / $scope.itemsPerPage) - 1;
			console.log("pageTotal:" + pageTotal);
			$scope.setPage(0);
			console.log("currentPage:" + $scope.currentPage);
			$scope.pageNumRange = [];
			console.log("items2:" + $rootScope.items.length);
			if (pageTotal <= 4) {
				for (var i = 0; i <= pageTotal; i++) {
					$scope.pageNumRange.push({
						id: i
					});
				};
			} else {

				for (var i = 0; i <= 4; i++) {
					$scope.pageNumRange.push({
						id: i
					});

				}
			};
			console.log("_______");
		}


	});

	$rootScope.initList = function() {
		var pageTotal = $scope.pageCount();
		$scope.pageNumRange = [];
		if (pageTotal <= 4) {
			for (var i = 0; i <= pageTotal; i++) {
				$scope.pageNumRange.push({
					id: i
				});
			};
		} else {

			for (var i = 0; i <= 4; i++) {
				$scope.pageNumRange.push({
					id: i
				});

			}
		};
	}

});

/**
 * 根据选择的筛选条件显示数据
 */
var choiceByConditionModule = angular.module('ChoiceByConditionModule', []);
choiceByConditionModule.controller('choiceByConditionCtrl', function($rootScope, $scope, $http, $state, $stateParams) {
	$rootScope.areaID = angular.element(document.querySelector('#areaID'));
	$rootScope.priceID = angular.element(document.querySelector('#priceID'));
	$rootScope.roomTypeID = angular.element(document.querySelector('#roomTypeID'));
	$rootScope.specialFlag = 1;

	$rootScope.getData();
	$scope.choiceArea = function(data) {
		$rootScope.areaID.removeClass('hidden');
		$rootScope.choiceArea = data;
		$rootScope.getData();
	};

	$scope.choicePrice = function(data) {

		if (data === 0) {
			$rootScope.choicePriceType = data;
			$rootScope.choicePrice = '500以下';
		}
		if (data === 1) {
			$rootScope.choicePriceType = data;
			$rootScope.choicePrice = '501-800元';
		}
		if (data === 2) {
			$rootScope.choicePriceType = data;
			$rootScope.choicePrice = '801-1000元';
		}
		if (data === 3) {
			$rootScope.choicePriceType = data;
			$rootScope.choicePrice = '1001-1500元';
		}
		if (data === 4) {
			$rootScope.choicePriceType = data;
			$rootScope.choicePrice = '1501-2000元';
		}
		if (data === 5) {
			$rootScope.choicePriceType = data;
			$rootScope.choicePrice = '2001元以上';
		}
		$rootScope.priceID.removeClass('hidden');
		$rootScope.getData();
	};

	$scope.choiceRoomType = function(data) {
		$rootScope.choiceRoomType = data;
		$rootScope.roomTypeID.removeClass('hidden');
		$rootScope.getData();
	};

});

/**
 * 这里是房屋列表分页模块
 * @type {[type]}
 */
var roomListModule = angular.module("RoomListModule", []);
roomListModule.controller('roomListCtrl', function($scope, $http, $state, $stateParams) {
	$scope.filterOptions = {
		filterText: "",
		useExternalFilter: true
	};
	$scope.totalServerItems = 0;
	$scope.pagingOptions = {
		pageSizes: [5, 10, 20],
		pageSize: 5,
		currentPage: 1
	};
	$scope.setPagingData = function(data, page, pageSize) {
		var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
		$scope.books = pagedData;
		$scope.totalServerItems = data.length;
		if (!$scope.$$phase) {
			$scope.$apply();
		}
	};

	//这里可以根据路由上传递过来的bookType参数加载不同的数据
	console.log($stateParams);
	$scope.getPagedDataAsync = function(pageSize, page, searchText) {
		setTimeout(function() {
			var data;
			if (searchText) {
				var ft = searchText.toLowerCase();
				$http.get('../data/books' + $stateParams.bookType + '.json')
					.success(function(largeLoad) {
						data = largeLoad.filter(function(item) {
							return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
						});
						$scope.setPagingData(data, page, pageSize);
					});
			} else {
				$http.get('../data/books' + $stateParams.bookType + '.json')
					.success(function(largeLoad) {
						$scope.setPagingData(largeLoad, page, pageSize);
					});
			}
		}, 100);
	};
	$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
});

/**
 * 用户整套出租模块
 */

var rentForWholeModule = angular.module("RentForWholeModule", []);
rentForWholeModule.controller('rentForWholeCtrl', function($rootScope, $timeout, $upload, $scope, $http, $state, $stateParams) {
	$rootScope.communityName = '';
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	var latitude, longitude, city, area;
	$scope.$watch('communityName', function(newVal, oldVal) {
		if (newVal) {
			//获取小区经纬度
			// 创建地址解析器实例
			var myGeo = new BMap.Geocoder();
			// 将地址解析结果显示在地图上,并调整地图视野
			myGeo.getPoint($rootScope.communityName, function(point) {
				if (point) {
					latitude = point.lat;
					longitude = point.lng;
					myGeo.getLocation(point, function(rs) {
						var addComp = rs.addressComponents;
						city = addComp.city;
						area = addComp.district;
					});
				} else {
					alert('请输入正确地址！');
				}
			}, $rootScope.vm.value);

		} else {

		}
	});

	$scope.handInWhole = function(valid) {
			if (valid) {
				var communityName = $scope.communityName;
				var houseToward = $scope.houseToward;
				var title = $scope.title;
				var describle = $scope.describle;
				var hostphone = $scope.hostphone;
				var hostname = $scope.hostname;
				var rentleType = '整套出租';
				var houseDoorModel = $scope.shi + '室' + $scope.ting + '厅' + $scope.wei + '卫';
				var floor = '第' + $scope.louceng + '层' + '' + '共' + $scope.totalLouceng + '层';
				var datetime = $rootScope.CurrentTime();
				var rentlePrice = $scope.price + '元/月' + '(' + $scope.zujinMethod + ')';
				var price = $scope.price;
				var totalPingmi = $scope.totalPingmi;
				var priceType = '';
				if (price <= 500) {
					priceType = 0;
				} else if (price <= 800) {
					priceType = 1;
				} else if (price <= 100) {
					priceType = 2;
				} else if (price <= 1500) {
					priceType = 3;
				} else if (price <= 2000) {
					priceType = 4
				} else {
					priceType = 5;
				};

				var params = {
						rentleType: rentleType,
						communityName: communityName,
						houseDoorModel: houseDoorModel,
						floor: floor,
						describle: describle,
						totalPingmi: totalPingmi,
						datetime: datetime,
						hostphone: hostphone,
						hostname: hostname,
						rentlePrice: rentlePrice,
						price: price,
						priceType: priceType,
						longitude: longitude,
						latitude: latitude,
						city: city,
						area: area,
						title: title,
						userName: $rootScope.register,
						houseToward: houseToward,
						decorateSituation: $scope.decorateSituation,
						houseKind: $scope.houseKind,
						houseExist: 'true',
						shi: $scope.shi,
						ting: $scope.ting,
						wei: $scope.wei,
						louceng: $scope.louceng,
						totalLouceng: $scope.totalLouceng,
						//price: $scope.price,
						zujinMethod: $scope.zujinMethod
					}
					//提取文件
				var image = [];
				if (typeof($scope.files) == "undefined" || $scope.files.length == 0) {
					//上传文件和数据
					$scope.upload = $upload.upload({
						url: HB.dataBaseIp + '/addHouseInfo',
						method: 'POST',
						headers: {
							'my-header': 'my-header-value'
						},
						data: params
					}).success(function(data, status, headers, config) {
						$timeout(function() {
							if (data === 'Info saved') {
								$scope.result = data;
								alert('发布成功');
								$state.go('registerUserHome.recentPublish'); //导向信息发布页面
							}
						});
						console.log('file is uploaded successfully. Response: ' + data);
					}).error(function(data, status, headers, config) {
						$timeout(function() {
							if (status > 0) {
								$scope.errorMsg = status + ': ' + data;
							}
						})
					});
				} else {
					for (var i = 0; i < $scope.files.length; i++) {
						if ($scope.files[i].type.indexOf("image") == 0) {
							if ($scope.files[i].size >= 512000 * 8) {
								alert('您这张"' + $scope.files[i].name + '"图片大小过大，应小于4M');
								return;
							} else {
								image.push($scope.files[i]);

							}
						} else {
							alert('文件"' + $scope.files[i].name + '"不是图片。');
							return;
						}
					}
					//上传文件和数据
					$scope.upload = $upload.upload({
						url: HB.dataBaseIp + '/addHouseInfo',
						method: 'POST',
						headers: {
							'my-header': 'my-header-value'
						},
						data: params,
						file: image,
					}).progress(function(evt) {
						console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total));
						$scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
					}).success(function(data, status, headers, config) {
						$timeout(function() {
							if (data === 'Info saved') {
								$scope.result = data;
								alert('发布成功');
								$state.go('registerUserHome.recentPublish'); //导向信息发布页面
							}
						});
						console.log('file is uploaded successfully. Response: ' + data);
					}).error(function(data, status, headers, config) {
						$timeout(function() {
							if (status > 0) {
								$scope.errorMsg = status + ': ' + data;
							}
						})
					});

				}
			} else {
				alert('非法输入！');
			}
		}
		/**
		 * 生成缩略图
		 * @param  {[type]} file [description]
		 * @return {[type]}      [description]
		 */
	$scope.generateThumb = function(file) {
		if (file != null) {
			if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {
				$timeout(function() {
					var fileReader = new FileReader();
					fileReader.readAsDataURL(file);
					fileReader.onload = function(e) {
						$timeout(function() {
							file.dataUrl = e.target.result;
						});
					}
				});
			}
		}
	}

	var wholeForm = angular.element(document.querySelector('#wholeForm'));
	var mapDiv = angular.element(document.querySelector('#mapDiv'));
	$scope.showMap = function() {
		//var wholeForm = angular.element(document.querySelector('#wholeForm'));
		//var mapDiv = angular.element(document.querySelector('#mapDiv'));
		wholeForm.addClass('hidden');
		mapDiv.removeClass('hidden');
	}

	$scope.cityChange2 = function() {
		$scope.areas2 = [];
		for (var i = 0; i < $rootScope.allAreas.length; i++) {

			if ($rootScope.allAreas[i].city == $rootScope.vm.value) {
				$scope.areas2 = $rootScope.allAreas[i].areas;
			}
		};
	}
	$scope.cityChange2();
	var myAddressId = angular.element(document.querySelector('#myAddressId'));
	$scope.areaChange2 = function() {

			var myGeo = new BMap.Geocoder();
			// 将地址解析结果显示在地图上,并调整地图视野
			myGeo.getPoint($scope.specialArea.value + $scope.myAddress, function(point) {
				if (point) {
					supperMap.clearOverlays();
					supperPanorama.setPosition(new BMap.Point(point.lng, point.lat)); //根据经纬度坐标展示全景图
					supperPanorama.setPov({
						heading: -40,
						pitch: 6
					});

					var testpoint = new BMap.Point(point.lng, point.lat);
					supperMap.centerAndZoom(testpoint, 14);
					var marker = new BMap.Marker(testpoint);
					marker.enableDragging();
					supperMap.addOverlay(marker);
					//拖动marker后，全景图位置也随着改变
					marker.addEventListener('dragend', function(e) {
						supperPanorama.setPosition(e.point);
						supperPanorama.setPov({
							heading: -40,
							pitch: 6
						});
						var pt = e.point;
						myGeo.getLocation(pt, function(rs) {
							var addComp = rs.addressComponents;
							$scope.myAddress = addComp.street + addComp.streetNumber;
							myAddressId.focus();
							myAddressId.blur();
						});
					});
					//全景图位置改变后，普通地图中心点也随之改变
					supperPanorama.addEventListener('position_changed', function(e) {
						var pos = supperPanorama.getPosition();
						supperMap.setCenter(new BMap.Point(pos.lng, pos.lat));
						marker.setPosition(pos);
						var pt = pos;
						myGeo.getLocation(pt, function(rs) {
							console.log(pt);
							var addComp = rs.addressComponents;
							$scope.myAddress = addComp.street + addComp.streetNumber;
							myAddressId.focus();
							myAddressId.blur();
						});
					});
				}
			}, $rootScope.vm.value);
		}
		/**
		 * 查看地址变化
		 * @param  {[type]} newVal [description]
		 * @param  {[type]} oldVal [description]
		 * @return {[type]}        [description]
		 */
	$scope.$watch('myAddress', function(newVal, oldVal) {
		if (newVal) {
			$scope.areaChange2();
		} else {

		}
	});

	$scope.closeMap = function() {
		if ($scope.myAddress) {
			$rootScope.communityName = $rootScope.vm.value + $scope.specialArea.value + $scope.myAddress;
			wholeForm.removeClass('hidden');
			mapDiv.addClass('hidden');
		} else {
			alert('还未选择小区！');
		}
	}

});

/**
 * 用户单间出租模块
 */

var rentForRoomModule = angular.module("RentForRoomModule", []);
rentForRoomModule.controller('rentForRoomCtrl', function($rootScope, $timeout, $scope, $upload, $http, $state, $stateParams) {
	$rootScope.communityName = '';
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	var latitude, longitude, city, area;
	$scope.$watch('communityName', function(newVal, oldVal) {
		if (newVal) {
			//获取小区经纬度
			// 创建地址解析器实例
			var myGeo = new BMap.Geocoder();
			// 将地址解析结果显示在地图上,并调整地图视野
			myGeo.getPoint($rootScope.communityName, function(point) {
				if (point) {
					latitude = point.lat;
					longitude = point.lng;
					myGeo.getLocation(point, function(rs) {
						var addComp = rs.addressComponents;
						city = addComp.city;
						area = addComp.district;
					});
				} else {
					alert('请输入正确地址！');
				}
			}, $rootScope.vm.value);

		} else {

		}
	});

	$scope.handInRoom = function(valid) {
			if (valid) {
				var communityName = $scope.communityName;
				var totalPingmi = $scope.totalPingmi;
				var describle = $scope.describle;
				var hostphone = $scope.hostphone;
				var hostname = $scope.hostname;
				var rentleType = '单间出租';
				var houseDoorModel = $scope.shi + '室' + $scope.ting + '厅' + $scope.wei + '卫';
				var floor = '第' + $scope.louceng + '层' + '' + '共' + $scope.totalLouceng + '层';
				var datetime = $rootScope.CurrentTime();
				var rentlePrice = $scope.price + '元/月' + '(' + $scope.zujinMethod + ')';
				var price = $scope.price;
				var pingmi = $scope.pingmi;
				var priceType = '';
				if (price <= 500) {
					priceType = 0;
				} else if (price <= 800) {
					priceType = 1;
				} else if (price <= 100) {
					priceType = 2;
				} else if (price <= 1500) {
					priceType = 3;
				} else if (price <= 2000) {
					priceType = 4
				} else {
					priceType = 5;
				};

				var roomKind = $scope.roomKind;
				var gender = $scope.gender;
				var roomToward = $scope.roomToward;
				var decorateSituation = $scope.decorateSituation;
				var houseKind = $scope.houseKind;
				var title = $scope.title;
				var roomThing = '';
				if ($scope.chuang)
					roomThing += '床、';
				if ($scope.yigui)
					roomThing += '衣柜、';
				if ($scope.shafa)
					roomThing += '沙发、';
				if ($scope.dianshi)
					roomThing += '电视、';
				if ($scope.bingxiang)
					roomThing += '冰箱、';
				if ($scope.xiyiji)
					roomThing += '洗衣机、';
				if ($scope.kongtiao)
					roomThing += '空调、';
				if ($scope.reshuiqi)
					roomThing += '热水器、';
				if ($scope.kuandai)
					roomThing += '宽带、';
				if ($scope.nuanqi)
					roomThing += '暖气、';

				var params = {
						rentleType: rentleType,
						communityName: communityName,
						houseDoorModel: houseDoorModel,
						floor: floor,
						describle: describle,
						roomArea: pingmi,
						datetime: datetime,
						hostphone: hostphone,
						hostname: hostname,
						rentlePrice: rentlePrice,
						price: price,
						priceType: priceType,
						longitude: longitude,
						latitude: latitude,
						city: city,
						area: area,
						roomKind: roomKind,
						gender: gender,
						roomToward: roomToward,
						decorateSituation: decorateSituation,
						houseKind: houseKind,
						roomThing: roomThing,
						title: title,
						totalPingmi: totalPingmi,
						userName: $rootScope.register,
						houseExist: 'true',
						shi: $scope.shi,
						ting: $scope.ting,
						wei: $scope.wei,
						//price: $scope.price,
						zujinMethod: $scope.zujinMethod,
						chuang: $scope.chuang,
						yigui: $scope.yigui,
						shafa: $scope.shafa,
						dianshi: $scope.dianshi,
						bingxiang: $scope.bingxiang,
						xiyiji: $scope.xiyiji,
						kongtiao: $scope.kongtiao,
						reshuiqi: $scope.reshuiqi,
						kuandai: $scope.kuandai,
						nuanqi: $scope.nuanqi,
						louceng: $scope.louceng,
						totalLouceng: $scope.totalLouceng
					}
					//提取文件
				var image = [];
				if (typeof($scope.files) == "undefined" || $scope.files.length == 0) {
					//上传文件和数据
					$scope.upload = $upload.upload({
						url: HB.dataBaseIp + '/addHouseInfo',
						method: 'POST',
						headers: {
							'my-header': 'my-header-value'
						},
						data: params
					}).success(function(data, status, headers, config) {
						$timeout(function() {
							if (data === 'Info saved') {
								$scope.result = data;
								alert('发布成功');
								$state.go('registerUserHome.recentPublish'); //导向信息发布页面
							}
						});
						console.log('file is uploaded successfully. Response: ' + data);
					}).error(function(data, status, headers, config) {
						$timeout(function() {
							if (status > 0) {
								$scope.errorMsg = status + ': ' + data;
							}
						})
					});
				} else {
					for (var i = 0; i < $scope.files.length; i++) {
						if ($scope.files[i].type.indexOf("image") == 0) {
							if ($scope.files[i].size >= 512000 * 8) {
								alert('您这张"' + $scope.files[i].name + '"图片大小过大，应小于4M');
								return;
							} else {
								image.push($scope.files[i]);
							}
						} else {
							alert('文件"' + $scope.files[i].name + '"不是图片。');
							return;
						}
					}
					//上传文件和数据
					$scope.upload = $upload.upload({
						url: HB.dataBaseIp + '/addHouseInfo',
						method: 'POST',
						headers: {
							'my-header': 'my-header-value'
						},
						data: params,
						file: image,
					}).progress(function(evt) {
						console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total));
						$scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
					}).success(function(data, status, headers, config) {
						$timeout(function() {
							if (data === 'Info saved') {
								$scope.result = data;
								alert('发布成功');
								$state.go('registerUserHome.recentPublish'); //导向信息发布页面
							}
						});
						console.log('file is uploaded successfully. Response: ' + data);
					}).error(function(data, status, headers, config) {
						$timeout(function() {
							if (status > 0) {
								$scope.errorMsg = status + ': ' + data;
							}
						})
					});
				}

			} else {
				alert('非法输入！');
			}
		}
		/**
		 * 生成缩略图
		 * @param  {[type]} file [description]
		 * @return {[type]}      [description]
		 */
	$scope.generateThumb = function(file) {
		if (file != null) {
			if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {
				$timeout(function() {
					var fileReader = new FileReader();
					fileReader.readAsDataURL(file);
					fileReader.onload = function(e) {
						$timeout(function() {
							file.dataUrl = e.target.result;
						});
					}
				});
			}
		}
	}

	var roomForm = angular.element(document.querySelector('#roomForm'));
	var mapDiv = angular.element(document.querySelector('#mapDiv'));
	$scope.showMap = function() {
		//var wholeForm = angular.element(document.querySelector('#wholeForm'));
		//var mapDiv = angular.element(document.querySelector('#mapDiv'));
		roomForm.addClass('hidden');
		mapDiv.removeClass('hidden');
	}

	$scope.cityChange2 = function() {
		$scope.areas2 = [];
		for (var i = 0; i < $rootScope.allAreas.length; i++) {

			if ($rootScope.allAreas[i].city == $rootScope.vm.value) {
				$scope.areas2 = $rootScope.allAreas[i].areas;
			}
		};
	}
	$scope.cityChange2();
	var myAddressId = angular.element(document.querySelector('#myAddressId'));
	$scope.areaChange2 = function() {
		var myGeo = new BMap.Geocoder();
		// 将地址解析结果显示在地图上,并调整地图视野
		myGeo.getPoint($scope.specialArea.value + $scope.myAddress, function(point) {
			if (point) {
				supperMap.clearOverlays();
				supperPanorama.setPosition(new BMap.Point(point.lng, point.lat)); //根据经纬度坐标展示全景图
				supperPanorama.setPov({
					heading: -40,
					pitch: 6
				});

				var testpoint = new BMap.Point(point.lng, point.lat);
				supperMap.centerAndZoom(testpoint, 14);
				var marker = new BMap.Marker(testpoint);
				marker.enableDragging();
				supperMap.addOverlay(marker);
				//拖动marker后，全景图位置也随着改变
				marker.addEventListener('dragend', function(e) {
					supperPanorama.setPosition(e.point);
					supperPanorama.setPov({
						heading: -40,
						pitch: 6
					});
					var pt = e.point;
					myGeo.getLocation(pt, function(rs) {
						var addComp = rs.addressComponents;
						$scope.myAddress = addComp.street + addComp.streetNumber;
						myAddressId.focus();
						myAddressId.blur();
					});
				});
				//全景图位置改变后，普通地图中心点也随之改变
				supperPanorama.addEventListener('position_changed', function(e) {
					var pos = supperPanorama.getPosition();
					supperMap.setCenter(new BMap.Point(pos.lng, pos.lat));
					marker.setPosition(pos);
					var pt = pos;
					myGeo.getLocation(pt, function(rs) {
						console.log(pt);
						var addComp = rs.addressComponents;
						$scope.myAddress = addComp.street + addComp.streetNumber;
						myAddressId.focus();
						myAddressId.blur();
					});
				});
			}
		}, $rootScope.vm.value);

	}
	$scope.$watch('myAddress', function(newVal, oldVal) {
		if (newVal) {
			$scope.areaChange2();
		} else {

		}
	});

	$scope.closeMap = function() {
			if ($scope.myAddress) {
				$rootScope.communityName = $rootScope.vm.value + $scope.specialArea.value + $scope.myAddress;
				roomForm.removeClass('hidden');
				mapDiv.addClass('hidden');
			} else {
				alert('还未选择小区！');
			}
		}
		/**
		 * 格式化当前时间
		 */

});

/**
 * 用户床位出租模块
 */

var rentForBedModule = angular.module("RentForBedModule", []);
rentForBedModule.controller('rentForBedCtrl', function($rootScope, $timeout, $scope, $upload, $http, $state, $stateParams) {
	$rootScope.communityName = '';
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	var latitude, longitude, city, area;
	$scope.$watch('communityName', function(newVal, oldVal) {
		if (newVal) {
			//获取小区经纬度
			// 创建地址解析器实例
			var myGeo = new BMap.Geocoder();
			// 将地址解析结果显示在地图上,并调整地图视野
			myGeo.getPoint($rootScope.communityName, function(point) {
				if (point) {
					latitude = point.lat;
					longitude = point.lng;
					myGeo.getLocation(point, function(rs) {
						var addComp = rs.addressComponents;
						city = addComp.city;
						area = addComp.district;
					});
				} else {
					alert('请输入正确地址！');
				}
			}, $rootScope.vm.value);

		} else {

		}
	});

	$scope.handInBed = function(valid) {
			if (valid) {
				var communityName = $scope.communityName;
				var title = $scope.title;
				var describle = $scope.describle;
				var hostphone = $scope.hostphone;
				var hostname = $scope.hostname;
				var rentleType = '床位出租';
				//var houseDoorModel = $scope.shi + '室' + $scope.ting + '厅' + $scope.wei + '卫';
				//var floor = '第' + $scope.louceng + '层' + '' + '共' + $scope.totalLouceng + '层';
				var datetime = $rootScope.CurrentTime();
				var rentlePrice = $scope.price + '元/月' + '(' + $scope.zujinMethod + ')';
				var price = $scope.price;
				var pingmi = $scope.pingmi;
				var priceType = '';
				if (price <= 500) {
					priceType = 0;
				} else if (price <= 800) {
					priceType = 1;
				} else if (price <= 100) {
					priceType = 2;
				} else if (price <= 1500) {
					priceType = 3;
				} else if (price <= 2000) {
					priceType = 4
				} else {
					priceType = 5;
				};
				var gender = $scope.gender;
				var roomThing = '';
				if ($scope.chuang)
					roomThing += '床、';
				if ($scope.yigui)
					roomThing += '衣柜、';
				if ($scope.shafa)
					roomThing += '沙发、';
				if ($scope.dianshi)
					roomThing += '电视、';
				if ($scope.bingxiang)
					roomThing += '冰箱、';
				if ($scope.xiyiji)
					roomThing += '洗衣机、';
				if ($scope.kongtiao)
					roomThing += '空调、';
				if ($scope.reshuiqi)
					roomThing += '热水器、';
				if ($scope.kuandai)
					roomThing += '宽带、';
				if ($scope.nuanqi)
					roomThing += '暖气、';

				var params = {
						rentleType: rentleType,
						communityName: communityName,
						describle: describle,
						//roomArea: pingmi,
						datetime: datetime,
						hostphone: hostphone,
						hostname: hostname,
						rentlePrice: rentlePrice,
						price: price,
						priceType: priceType,
						longitude: longitude,
						latitude: latitude,
						city: city,
						area: area,
						gender: gender,
						roomThing: roomThing,
						title: title,
						userName: $rootScope.register,
						houseExist: 'true',
						zujinMethod: $scope.zujinMethod,
						chuang: $scope.chuang,
						yigui: $scope.yigui,
						shafa: $scope.shafa,
						dianshi: $scope.dianshi,
						bingxiang: $scope.bingxiang,
						xiyiji: $scope.xiyiji,
						kongtiao: $scope.kongtiao,
						reshuiqi: $scope.reshuiqi,
						kuandai: $scope.kuandai,
						nuanqi: $scope.nuanqi
					}
					//提取文件
				var image = [];
				if (typeof($scope.files) == "undefined" || $scope.files.length == 0) {
					//上传文件和数据
					$scope.upload = $upload.upload({
						url: HB.dataBaseIp + '/addHouseInfo',
						method: 'POST',
						headers: {
							'my-header': 'my-header-value'
						},
						data: params
					}).success(function(data, status, headers, config) {
						$timeout(function() {
							if (data === 'Info saved') {
								$scope.result = data;
								alert('发布成功');
								$state.go('registerUserHome.recentPublish'); //导向信息发布页面
							}
						});
						console.log('file is uploaded successfully. Response: ' + data);
					}).error(function(data, status, headers, config) {
						$timeout(function() {
							if (status > 0) {
								$scope.errorMsg = status + ': ' + data;
							}
						})
					});
				} else {

					for (var i = 0; i < $scope.files.length; i++) {
						if ($scope.files[i].type.indexOf("image") == 0) {
							if ($scope.files[i].size >= 512000 * 8) {
								alert('您这张"' + $scope.files[i].name + '"图片大小过大，应小于4M');
								return;
							} else {
								image.push($scope.files[i]);
							}
						} else {
							alert('文件"' + $scope.files[i].name + '"不是图片。');
							return;
						}
					}
					//上传文件和数据
					$scope.upload = $upload.upload({
						url: HB.dataBaseIp + '/addHouseInfo',
						method: 'POST',
						headers: {
							'my-header': 'my-header-value'
						},
						data: params,
						file: image,
					}).progress(function(evt) {
						console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total));
						$scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
					}).success(function(data, status, headers, config) {
						$timeout(function() {
							if (data === 'Info saved') {
								$scope.result = data;
								alert('发布成功');
								$state.go('registerUserHome.recentPublish'); //导向信息发布页面
							}
						});
						console.log('file is uploaded successfully. Response: ' + data);
					}).error(function(data, status, headers, config) {
						$timeout(function() {
							if (status > 0) {
								$scope.errorMsg = status + ': ' + data;
							}
						})
					});
				}

			} else {
				alert('非法输入！');
			}
		}
		/**
		 * 生成缩略图
		 * @param  {[type]} file [description]
		 * @return {[type]}      [description]
		 */
	$scope.generateThumb = function(file) {
		if (file != null) {
			if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {
				$timeout(function() {
					var fileReader = new FileReader();
					fileReader.readAsDataURL(file);
					fileReader.onload = function(e) {
						$timeout(function() {
							file.dataUrl = e.target.result;
						});
					}
				});
			}
		}
	}

	var bedForm = angular.element(document.querySelector('#bedForm'));
	var mapDiv = angular.element(document.querySelector('#mapDiv'));
	$scope.showMap = function() {

		bedForm.addClass('hidden');
		mapDiv.removeClass('hidden');
	}

	$scope.cityChange2 = function() {
		$scope.areas2 = [];
		for (var i = 0; i < $rootScope.allAreas.length; i++) {

			if ($rootScope.allAreas[i].city == $rootScope.vm.value) {
				$scope.areas2 = $rootScope.allAreas[i].areas;
			}
		};
	}
	$scope.cityChange2();
	var myAddressId = angular.element(document.querySelector('#myAddressId'));
	$scope.areaChange2 = function() {

		var myGeo = new BMap.Geocoder();
		// 将地址解析结果显示在地图上,并调整地图视野
		myGeo.getPoint($scope.specialArea.value + $scope.myAddress, function(point) {
			if (point) {
				supperMap.clearOverlays();
				supperPanorama.setPosition(new BMap.Point(point.lng, point.lat)); //根据经纬度坐标展示全景图
				supperPanorama.setPov({
					heading: -40,
					pitch: 6
				});

				var testpoint = new BMap.Point(point.lng, point.lat);
				supperMap.centerAndZoom(testpoint, 14);
				var marker = new BMap.Marker(testpoint);
				marker.enableDragging();
				supperMap.addOverlay(marker);
				//拖动marker后，全景图位置也随着改变
				marker.addEventListener('dragend', function(e) {
					supperPanorama.setPosition(e.point);
					supperPanorama.setPov({
						heading: -40,
						pitch: 6
					});
					var pt = e.point;
					myGeo.getLocation(pt, function(rs) {
						var addComp = rs.addressComponents;
						$scope.myAddress = addComp.street + addComp.streetNumber;
						myAddressId.focus();
						myAddressId.blur();
					});
				});
				//全景图位置改变后，普通地图中心点也随之改变
				supperPanorama.addEventListener('position_changed', function(e) {
					var pos = supperPanorama.getPosition();
					supperMap.setCenter(new BMap.Point(pos.lng, pos.lat));
					marker.setPosition(pos);
					var pt = pos;
					myGeo.getLocation(pt, function(rs) {
						console.log(pt);
						var addComp = rs.addressComponents;
						$scope.myAddress = addComp.street + addComp.streetNumber;
						myAddressId.focus();
						myAddressId.blur();
					});
				});
			}
		}, $rootScope.vm.value);

	}
	$scope.$watch('myAddress', function(newVal, oldVal) {
		if (newVal) {
			$scope.areaChange2();
		} else {

		}
	});

	$scope.closeMap = function() {
		if ($scope.myAddress) {
			$rootScope.communityName = $rootScope.vm.value + $scope.specialArea.value + $scope.myAddress;
			bedForm.removeClass('hidden');
			mapDiv.addClass('hidden');
		} else {
			alert('还未选择小区！');
		}
	}
});

/**
 * 近期发布信息
 * @type {[type]}
 */
var recentPublishModule = angular.module("RecentPublishModule", []);
recentPublishModule.controller('recentPublishCtrl', function($rootScope, $scope, $upload, $http, $state, $stateParams) {
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	$scope.getData = function() {
		$http.get(HB.dataBaseIp + '/getRecentPublishInfo', {
				params: {
					userName: $rootScope.register,
					//datetime: $rootScope.CurrentTime(),
				}
			})
			.success(function(data) {
				if (data.length == 0) {
					$scope.items = [];
				} else {
					console.log(data);
					$scope.items = data;
				}

			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	};
	$scope.getData();
	$scope.delPublishHouseInfo = function(_id) {
		//发送删除请求  deletePublishHouseInfo
		$http.get(HB.dataBaseIp + '/deleteOrRecoveryPublishHouseInfo', {
				params: {
					detailPageID: _id,
					datetime: $rootScope.CurrentTime(),
					houseExist: 'false'
				}
			})
			.success(function(data) {
				if (data == 'success') {
					alert('删除成功');
					$scope.getData();
				} else {
					alert('失败');
				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
		$('.bs-example-modal-sm').modal('hide');
	}

	$scope.updateHouseInfo = function(_id, rentleType) {
		if (rentleType == "整套出租")
			$state.go('updateHouseWhole', {
				updateHouseID: _id
			});
		if (rentleType == "单间出租")
			$state.go('updateHouseRoom', {
				updateHouseID: _id
			});
		if (rentleType == "床位出租")
			$state.go('updateHouseBed', {
				updateHouseID: _id
			});
	}

	//}
});

/**
 * 已删除信息
 * @type {[type]}
 */
var deletedHouseInfoModule = angular.module("DeletedHouseInfoModule", []);
deletedHouseInfoModule.controller('deletedHouseInfoCtrl', function($rootScope, $scope, $upload, $http, $state, $stateParams) {
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	$scope.getData = function() {
		$http.get(HB.dataBaseIp + '/getDeletedHouseInfo', {
				params: {
					userName: $rootScope.register,
				}
			})
			.success(function(data) {
				if (data.length == 0) {
					$scope.items = [];
				} else {
					console.log(data);
					$scope.items = data;
				}

			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	};
	$scope.getData();
	$scope.removeHouseInfo = function(_id) {
		//发送删除请求  deletePublishHouseInfo
		$http.get(HB.dataBaseIp + '/removeHouseInfo', {
				params: {
					HouseID: _id
				}
			})
			.success(function(data) {
				if (data == 'success') {
					alert('删除成功！');
					$scope.getData();
				} else {
					alert(data);
				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
		$('.bs-example-modal-sm').modal('hide');
	}

	$scope.recoveryHouseInfo = function(_id) {
		//发送删除请求  deletePublishHouseInfo
		$http.get(HB.dataBaseIp + '/deleteOrRecoveryPublishHouseInfo', {
				params: {
					detailPageID: _id,
					datetime: $rootScope.CurrentTime(),
					houseExist: 'true'
				}
			})
			.success(function(data) {
				if (data == 'success') {
					alert('恢复成功！');
					$scope.getData();
				} else {
					alert(data);
				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
		$('.bs-example-modal-sm').modal('hide');
	}

	//}
});


/**
 * 查看详细页面
 * @type {[type]}
 */
var detailPageModule = angular.module("DetailPageModule", []);
detailPageModule.controller('detailPageCtrl', function($rootScope, $scope, $http, $state, $stateParams) {

	if ($stateParams.detailPageID !== null) {
		$http.get(HB.dataBaseIp + '/getdetailPage', {
				params: {
					detailPageID: $stateParams.detailPageID
				}
			})
			.success(function(data) {

				if (data) {
					$scope.item = data;;
					$scope.images = [];
					for (var i = 1; i < data.thumbnail.length; i++) {
						$scope.images.push(data.thumbnail[i]);
					}
					$scope.img = [];
					for (var i = 1; i < data.thumbnail.length; i++) {
						$scope.img.push({
							name: i
						});
					}
					console.log($scope.img);
					$scope.panoramaFun(data.longitude, data.latitude);

					if (data.rentleType == "整套出租")
						$state.go('houseDetail.detailPageWhole');
					if (data.rentleType == "单间出租")
						$state.go('houseDetail.detailPageRoom');
					if (data.rentleType == "床位出租")
						$state.go('houseDetail.detailPageBed');
				} else {
					alert('没有相关数据');
				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	};

	//全景图展示
	var panorama = new BMap.Panorama('panorama');
	$scope.panoramaFun = function(longitude, latitude) {
		panorama.setPosition(new BMap.Point(longitude, latitude)); //根据经纬度坐标展示全景图
		panorama.setPov({
			heading: -40,
			pitch: 6
		});

		panorama.addEventListener('position_changed', function(e) { //全景图位置改变后，普通地图中心点也随之改变
			var pos = panorama.getPosition();
			map.setCenter(new BMap.Point(pos.lng, pos.lat));
			marker.setPosition(pos);
		});
		//普通地图展示
		var mapOption = {
			mapType: BMAP_NORMAL_MAP,
			maxZoom: 18,
			drawMargin: 0,
			enableFulltimeSpotClick: true,
			enableHighResolution: true
		}
		var map = new BMap.Map("normal_map", mapOption);
		var testpoint = new BMap.Point(longitude, latitude);
		map.centerAndZoom(testpoint, 18);
		var marker = new BMap.Marker(testpoint);
		marker.enableDragging();
		map.addOverlay(marker);
		marker.addEventListener('dragend', function(e) {
			panorama.setPosition(e.point); //拖动marker后，全景图位置也随着改变
			panorama.setPov({
				heading: -40,
				pitch: 6
			});
		});
	}

	$scope.POIKindChange = function() {
		var selectValue = $scope.POIKind;
		switch (selectValue) {
			case '0':
				panorama.setPanoramaPOIType(BMAP_PANORAMA_POI_NONE); //无(隐藏所有POI)
				break;
			case '1':
				panorama.setPanoramaPOIType(BMAP_PANORAMA_POI_HOTEL); //酒店
				panorama.setPov({
					pitch: 6,
					heading: 138
				}); //手动参数，场景内已有该室内景，旋转后可见，现调整角度到该POI点的位置，方便开发者可见
				//alert(1);
				break;
			case '2':
				panorama.setPanoramaPOIType(BMAP_PANORAMA_POI_CATERING); //餐饮
				panorama.setPov({
					pitch: 6,
					heading: 138
				});
				break;
			case '3':
				panorama.setPanoramaPOIType(BMAP_PANORAMA_POI_MOVIE); //电影院
				panorama.setPov({
					pitch: 6,
					heading: 138
				});
				break;
			case '4':
				panorama.setPanoramaPOIType(BMAP_PANORAMA_POI_TRANSIT); //公交站点，该场景（id为0100220000130902152251545J3）附近无站点POI
				break;
			case '5':
				panorama.setPanoramaPOIType(BMAP_PANORAMA_POI_INDOOR_SCENE); //室内景点
				panorama.setPov({
					pitch: 18.960000000000015,
					heading: 350.16741512558605
				});
				break;
			default:
				//无
		}
	};
});


/**
 * 修改整套出租页面
 * @type {[type]}
 */

var updateHouseWholeModule = angular.module("UpdateHouseWholeModule", []);
updateHouseWholeModule.controller('updateHouseWholeCtrl', function($upload, $rootScope, $scope, $http, $state, $stateParams) {
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	$scope.item = [];
	$http.get(HB.dataBaseIp + '/getdetailPage', {
			params: {
				detailPageID: $stateParams.updateHouseID,
			}
		})
		.success(function(data) {
			if (data.length == 0) {
				$scope.item = [];
			} else {
				console.log(data);
				$scope.item = data;
				$scope.item.houseKind = data.houseKind;
			}

		})
		.error(function(data) {
			alert('网络错误。。。')
		});


	$scope.updateWhole = function(valid) {
		if (valid) {
			var houseDoorModel = $scope.item.shi + '室' + $scope.item.ting + '厅' + $scope.item.wei + '卫';
			var datetime = $rootScope.CurrentTime();
			var rentlePrice = $scope.item.price + '元/月' + '(' + $scope.item.zujinMethod + ')';
			var price = $scope.item.price;
			var priceType = '';
			if (price <= 500) {
				priceType = 0;
			} else if (price <= 800) {
				priceType = 1;
			} else if (price <= 100) {
				priceType = 2;
			} else if (price <= 1500) {
				priceType = 3;
			} else if (price <= 2000) {
				priceType = 4
			} else {
				priceType = 5;
			};

			var params = {
				rentleType: '整套出租',
				updateHouseID: $scope.item._id,
				houseDoorModel: houseDoorModel,
				title: $scope.item.title,
				describle: $scope.item.describle,
				datetime: datetime,
				hostphone: $scope.item.hostphone,
				hostname: $scope.item.hostname,
				rentlePrice: rentlePrice, //"rentlePrice":"2112元/月(押一付二)",
				price: $scope.item.price,
				priceType: priceType,
				//thumbnail: images,
				decorateSituation: $scope.item.decorateSituation,
				houseKind: $scope.item.houseKind,
				totalPingmi: $scope.item.totalPingmi,
				houseToward: $scope.item.houseToward,
				shi: $scope.item.shi,
				ting: $scope.item.ting,
				wei: $scope.item.wei,
				//price: $scope.item.price,
				zujinMethod: $scope.item.zujinMethod
			}

			$scope.upload = $upload.upload({
					url: HB.dataBaseIp + '/updatePublishHouseInfo',
					method: 'POST',
					headers: {
						'my-header': 'my-header-value'
					},
					data: params
				})
				.success(function(data, status, headers, config) {
					if (data === 'update success') {
						//$scope.result = data;
						alert('修改成功');
						$state.go('registerUserHome.recentPublish'); //导向信息发布页面
					}
				}).error(function(data, status, headers, config) {
					alert('修改出错！');
				});
		} else {
			alert('输入不合法')
		}
	}
});

//updateHouseRoomCtrl
/**
 * 修改单间出租页面
 * @type {[type]}
 */
var updateHouseRoomModule = angular.module("UpdateHouseRoomModule", []);
updateHouseRoomModule.controller('updateHouseRoomCtrl', function($upload, $rootScope, $scope, $http, $state, $stateParams) {
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	$scope.item = [];
	$http.get(HB.dataBaseIp + '/getdetailPage', {
			params: {
				detailPageID: $stateParams.updateHouseID,
			}
		})
		.success(function(data) {
			if (data.length == 0) {
				$scope.item = [];
			} else {
				console.log(data);
				$scope.item = data;
				//$scope.item.houseKind = data.houseKind;
				if (data.chuang == "true")
					$scope.item.chuang = true;
				if (data.yigui == "true")
					$scope.item.yigui = true;
				if (data.shafa == "true")
					$scope.item.shafa = true;
				if (data.dianshi == "true")
					$scope.item.dianshi = true;
				if (data.bingxiang == "true")
					$scope.item.bingxiang = true;
				if (data.xiyiji == "true")
					$scope.item.xiyiji = true;
				if (data.kongtiao == "true")
					$scope.item.kongtiao = true;
				if (data.reshuiqi == "true")
					$scope.item.reshuiqi = true;
				if (data.kuandai == "true")
					$scope.item.kuandai = true;
				if (data.nuanqi == "true")
					$scope.item.nuanqi = true;
			}

		})
		.error(function(data) {
			alert('网络错误。。。')
		});


	$scope.updateRoom = function(valid) {
		if (valid) {
			var houseDoorModel = $scope.item.shi + '室' + $scope.item.ting + '厅' + $scope.item.wei + '卫';
			var datetime = $rootScope.CurrentTime();
			var rentlePrice = $scope.item.price + '元/月' + '(' + $scope.item.zujinMethod + ')';
			var price = $scope.item.price;
			var priceType = '';
			if (price <= 500) {
				priceType = 0;
			} else if (price <= 800) {
				priceType = 1;
			} else if (price <= 100) {
				priceType = 2;
			} else if (price <= 1500) {
				priceType = 3;
			} else if (price <= 2000) {
				priceType = 4
			} else {
				priceType = 5;
			};

			var roomThing = '';
			if ($scope.item.chuang)
				roomThing += '床、';
			if ($scope.item.yigui)
				roomThing += '衣柜、';
			if ($scope.item.shafa)
				roomThing += '沙发、';
			if ($scope.item.dianshi)
				roomThing += '电视、';
			if ($scope.item.bingxiang)
				roomThing += '冰箱、';
			if ($scope.item.xiyiji)
				roomThing += '洗衣机、';
			if ($scope.item.kongtiao)
				roomThing += '空调、';
			if ($scope.item.reshuiqi)
				roomThing += '热水器、';
			if ($scope.item.kuandai)
				roomThing += '宽带、';
			if ($scope.item.nuanqi)
				roomThing += '暖气、';
			var params = {
				rentleType: '单间出租',
				updateHouseID: $scope.item._id,
				houseDoorModel: houseDoorModel,
				title: $scope.item.title,
				describle: $scope.item.describle,
				datetime: $scope.item.datetime,
				hostphone: $scope.item.hostphone,
				hostname: $scope.item.hostname,
				rentlePrice: rentlePrice, //"rentlePrice":"2112元/月(押一付二)",
				price: $scope.item.price,
				priceType: priceType,
				//thumbnail: images,
				decorateSituation: $scope.item.decorateSituation,
				houseKind: $scope.item.houseKind,
				totalPingmi: $scope.item.totalPingmi,
				roomArea: $scope.item.roomArea,
				roomToward: $scope.item.roomToward,
				shi: $scope.item.shi,
				ting: $scope.item.ting,
				wei: $scope.item.wei,
				//price: $scope.item.price,
				zujinMethod: $scope.item.zujinMethod,
				chuang: $scope.item.chuang,
				yigui: $scope.item.yigui,
				shafa: $scope.item.shafa,
				dianshi: $scope.item.dianshi,
				bingxiang: $scope.item.bingxiang,
				xiyiji: $scope.item.xiyiji,
				kongtiao: $scope.item.kongtiao,
				reshuiqi: $scope.item.reshuiqi,
				kuandai: $scope.item.kuandai,
				nuanqi: $scope.item.nuanqi,
				roomThing: roomThing,
				roomKind: $scope.item.roomKind,
				gender: $scope.item.gender
			}

			$scope.upload = $upload.upload({
					url: HB.dataBaseIp + '/updatePublishHouseInfo',
					method: 'POST',
					headers: {
						'my-header': 'my-header-value'
					},
					data: params
				})
				.success(function(data, status, headers, config) {
					if (data === 'update success') {
						//$scope.result = data;
						alert('修改成功');
						$state.go('registerUserHome.recentPublish'); //导向信息发布页面
					}
				}).error(function(data, status, headers, config) {
					alert('修改出错！');
				});
		} else {
			alert('输入不合法')
		}
	}
});

//updateHouseBedCtrl
/**
 * 修改床位出租页面
 * @type {[type]}
 */
var updateHouseBedModule = angular.module("UpdateHouseBedModule", []);
updateHouseBedModule.controller('updateHouseBedCtrl', function($upload, $rootScope, $scope, $http, $state, $stateParams) {
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	$scope.item = [];
	$http.get(HB.dataBaseIp + '/getdetailPage', {
			params: {
				detailPageID: $stateParams.updateHouseID,
			}
		})
		.success(function(data) {
			if (data.length == 0) {
				$scope.item = [];
			} else {
				console.log(data);
				$scope.item = data;
				//$scope.item.houseKind = data.houseKind;
				if (data.chuang == "true")
					$scope.item.chuang = true;
				if (data.yigui == "true")
					$scope.item.yigui = true;
				if (data.shafa == "true")
					$scope.item.shafa = true;
				if (data.dianshi == "true")
					$scope.item.dianshi = true;
				if (data.bingxiang == "true")
					$scope.item.bingxiang = true;
				if (data.xiyiji == "true")
					$scope.item.xiyiji = true;
				if (data.kongtiao == "true")
					$scope.item.kongtiao = true;
				if (data.reshuiqi == "true")
					$scope.item.reshuiqi = true;
				if (data.kuandai == "true")
					$scope.item.kuandai = true;
				if (data.nuanqi == "true")
					$scope.item.nuanqi = true;
			}

		})
		.error(function(data) {
			alert('网络错误。。。')
		});


	$scope.updateBed = function(valid) {
		if (valid) {
			var datetime = $rootScope.CurrentTime();
			var rentlePrice = $scope.item.price + '元/月' + '(' + $scope.item.zujinMethod + ')';
			var price = $scope.item.price;
			var priceType = '';
			if (price <= 500) {
				priceType = 0;
			} else if (price <= 800) {
				priceType = 1;
			} else if (price <= 100) {
				priceType = 2;
			} else if (price <= 1500) {
				priceType = 3;
			} else if (price <= 2000) {
				priceType = 4
			} else {
				priceType = 5;
			};

			var roomThing = '';
			if ($scope.item.chuang)
				roomThing += '床、';
			if ($scope.item.yigui)
				roomThing += '衣柜、';
			if ($scope.item.shafa)
				roomThing += '沙发、';
			if ($scope.item.dianshi)
				roomThing += '电视、';
			if ($scope.item.bingxiang)
				roomThing += '冰箱、';
			if ($scope.item.xiyiji)
				roomThing += '洗衣机、';
			if ($scope.item.kongtiao)
				roomThing += '空调、';
			if ($scope.item.reshuiqi)
				roomThing += '热水器、';
			if ($scope.item.kuandai)
				roomThing += '宽带、';
			if ($scope.item.nuanqi)
				roomThing += '暖气、';
			var params = {
				rentleType: '床位出租',
				updateHouseID: $scope.item._id,
				title: $scope.item.title,
				describle: $scope.item.describle,
				datetime: $scope.item.datetime,
				hostphone: $scope.item.hostphone,
				hostname: $scope.item.hostname,
				rentlePrice: rentlePrice, //"rentlePrice":"2112元/月(押一付二)",
				price: $scope.item.price,
				priceType: priceType,
				//thumbnail: images,
				zujinMethod: $scope.item.zujinMethod,
				chuang: $scope.item.chuang,
				yigui: $scope.item.yigui,
				shafa: $scope.item.shafa,
				dianshi: $scope.item.dianshi,
				bingxiang: $scope.item.bingxiang,
				xiyiji: $scope.item.xiyiji,
				kongtiao: $scope.item.kongtiao,
				reshuiqi: $scope.item.reshuiqi,
				kuandai: $scope.item.kuandai,
				nuanqi: $scope.item.nuanqi,
				roomThing: roomThing,
				gender: $scope.item.gender
			}

			$scope.upload = $upload.upload({
					url: HB.dataBaseIp + '/updatePublishHouseInfo',
					method: 'POST',
					headers: {
						'my-header': 'my-header-value'
					},
					data: params
				})
				.success(function(data, status, headers, config) {
					if (data === 'update success') {
						//$scope.result = data;
						alert('修改成功');
						$state.go('registerUserHome.recentPublish'); //导向信息发布页面
					}
				}).error(function(data, status, headers, config) {
					alert('修改出错！');
				});
		} else {
			alert('输入不合法')
		}
	}
});



/**
 * 用户注册模块
 */
var userRegisterModule = angular.module("UserRegisterModule", []);
userRegisterModule.controller('userRegisterCtrl', function($rootScope, $scope, $http, $state, $stateParams, $cookieStore) {
	$scope.user = {
		email: ''
	};
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	$scope.register = function(valid) {
		//alert(valid);
		if (valid) {
			if ($scope.passMessage === "" && $scope.uniqueName === "") {
				$scope.addUserData();
			} else
				return;
		} else {
			alert('failed');
		}

	}

	$scope.unique = function() {
		if ($scope.user.email !== '')
			$scope.getUserData();
	}

	$scope.validatePass = function() {
		if ($scope.user.password == $scope.user.againPass) {
			$scope.passMessage = "";
		} else {
			$scope.passMessage = "*两次输入的密码不一致";

		}
	};

	$scope.getUserData = function() {
		$http.get(HB.dataBaseIp + '/getuserData', {
				params: {
					userName: $scope.user.email,
					password: ''
				}
			})
			.success(function(data) {

				if (data.length >= 1) {
					$scope.uniqueName = "*该邮箱已被注册过！";

				} else {
					$scope.uniqueName = "";
				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	};

	$scope.addUserData = function() {
		var params = {
			'userName': $scope.user.email,
			'password': $scope.user.password,
		};
		var jdata = 'mydata=' + JSON.stringify(params);
		$http({
			method: 'post',
			url: HB.dataBaseIp + '/addUserData',
			data: jdata,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			} //重点
		}).
		success(function(response) {

			if (response === "User saved") {
				//alert('恭喜您，注册成功!');
				$cookieStore.put('mypassword', $scope.user.password);
				$cookieStore.put('myusername', $scope.user.email);
				$rootScope.reg = HB.serverIp + "/HB#/registerUserHome";
				$rootScope.register = $scope.user.email;
				$rootScope.log = HB.serverIp + '/HB#/exit';
				$rootScope.messageNum = '12';
				$rootScope.login = '退出';
				$state.go('home');
			} else {
				alert('注册失败了');
			}

		}).
		error(function(response) {

			alert('出错了');
		});
	};

});
/**
 * 用户登录
 * @type {[type]}
 */
var userLoginModule = angular.module("UserLoginModule", []);
userLoginModule.controller('userLoginCtrl', function($rootScope, $scope, $http, $state, $stateParams, $cookieStore) {
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	$scope.user = {
		email: '',
		password: ''
	};
	$scope.message = '';

	$scope.valiRember = function(data) {
		if (data === $cookieStore.get('myusername'))
			$scope.user.password = $cookieStore.get('mypassword');

	}

	$scope.login = function(valid) {
		if (valid) {

			$scope.getUserData();
		} else {
			alert('failed');
		}

	}

	$scope.getUserData = function() {
		$http.get(HB.dataBaseIp + '/getuserData', {
				params: {
					userName: $scope.user.email,
					password: $scope.user.password,
				}
			})
			.success(function(data) {

				if (data.length >= 1) {
					$scope.message = "";
					var newMessage = [];
					if (typeof(data[0].Contents) !== 'undefined') {
						for (var i = 0; i < data[0].Contents.length; i++) {
							var Message = $.parseJSON(data[0].Contents[i]);
							if (Message.isNew === true) {
								newMessage.push(Message);
							}
						};
					}

					if ($scope.rember === true) {
						var Days = 1;
						var exp = new Date();
						exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
						document.cookie = 'myusername' + "=" + '%22' + escape($scope.user.email) + '%22' + ";expires=" + exp.toGMTString();
						document.cookie = 'mypassword' + "=" + '%22' + escape($scope.user.password) + '%22' + ";expires=" + exp.toGMTString();
					} else {
						$cookieStore.put('mypassword', $scope.user.password);
						$cookieStore.put('myusername', $scope.user.email);
					}
					$rootScope.reg = HB.serverIp + "/HB#/registerUserHome";
					$rootScope.register = $scope.user.email;
					$rootScope.log = HB.serverIp + '/HB#/exit';
					if (typeof(data[0].Contents) === 'undefined'||newMessage.length===0)
						$rootScope.messageNum = '';
					else
						$rootScope.messageNum = newMessage.length;
					//console.log(data[0].Contents.length);
					$rootScope.login = '退出';
					if (data[0].isAdmin == "true") {
						$cookieStore.put('currentIsAdmin', "1");
						$rootScope.isAdmin = "1";
						$state.go('admin');
						return;
					}
					$state.go('home');
				} else {
					$scope.message = "用户名或密码错误";
				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	};

});

/**
 * 修改个人资料
 * @type {[type]}
 */
var updatePersonalInfoMoudle = angular.module("UpdatePersonalInfoMoudle", []);
updatePersonalInfoMoudle.controller('updatePersonalInfoCtrl', function($upload, $rootScope, $scope, $http, $state, $stateParams, $timeout) {
	$scope.cities = [];
	$scope.user = [];
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	var vm = $rootScope.vm;
	for (var i = 0; i < vm.provinces.length; i++) {
		for (var j = 0; j < vm.provinces[i].cities.length; j++) {
			$scope.cities.push({
				'name': vm.provinces[i].cities[j].label
			});
		}
	}

	$scope.uploadPic = function(files) {

		if (files != null) {
			var file = files[0];
			$scope.generateThumb(file);
		}
	}
	$scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);
	$scope.generateThumb = function(file) {
		if (file != null) {
			console.log($scope.fileReaderSupported);
			if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {

				$timeout(function() {
					var fileReader = new FileReader();
					fileReader.readAsDataURL(file);
					fileReader.onload = function(e) {
						$timeout(function() {
							file.dataUrl = e.target.result;
						});
					}
				});
			}
		}
	}
	$scope.getUserData = function() {
		$http.get(HB.dataBaseIp + '/getuserData', {
				params: {
					userName: $rootScope.register,
					password: ''
				}
			})
			.success(function(data) {

				if (data.length >= 1) {
					$scope.user = data[0];
					console.log($scope.user.images[0].imageName);
					if ($scope.user.images[0].imageName != 'man.png') {
						$scope.headImage = $scope.user.images[0].imageName;
					} else {
						if ($scope.user.sex == '男') {
							$scope.headImage = 'man.png';
						} else {
							$scope.headImage = 'woman.png';
						}
					}
				} else {}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	};
	$scope.getUserData();

	$scope.updatePersonalInfo = function() {
		var sex;
		if ($scope.user.sex == '男') {
			sex = '男';
		} else {
			sex = '女';
		}
		var params = {
			userID: $scope.user._id,
			realname: $scope.user.realname,
			hometown: $scope.user.hometown,
			contactAddr: $scope.user.contactAddr,
			postcode: $scope.user.postcode,
			signature: $scope.user.signature,
			sex: sex,
			hostphone:$scope.user.hostphone
		}

		var image = [];
		if (typeof($scope.files) == "undefined" || $scope.files.length == 0) {
			//上传文件和数据
			$scope.upload = $upload.upload({
					url: HB.dataBaseIp + '/updatePersonalInfo',
					method: 'POST',
					headers: {
						'my-header': 'my-header-value'
					},
					data: params
				})
				.success(function(data, status, headers, config) {
					if (data === 'update success') {
						//$scope.result = data;
						alert('修改成功');
						//$state.go('registerUserHome.recentPublish'); //导向信息发布页面
					}
				}).error(function(data, status, headers, config) {
					alert('修改失败！');
				});
		} else {

			for (var i = 0; i < $scope.files.length; i++) {
				if ($scope.files[i].type.indexOf("image") == 0) {
					if ($scope.files[i].size >= 512000 * 8) {
						alert('您这张"' + $scope.files[i].name + '"图片大小过大，应小于4M');
						return;
					} else {
						image.push($scope.files[i]);
						//上传文件和数据
						$scope.upload = $upload.upload({
								url: HB.dataBaseIp + '/updatePersonalInfo',
								method: 'POST',
								headers: {
									'my-header': 'my-header-value'
								},
								data: params,
								file: image
							})
							.success(function(data, status, headers, config) {
								if (data === 'update success') {
									//$scope.result = data;
									alert('修改成功');
									//$state.go('registerUserHome.recentPublish'); //导向信息发布页面
								}
							}).error(function(data, status, headers, config) {
								alert('修改失败！');
							});
					}
				} else {
					alert('文件"' + $scope.files[i].name + '"不是图片。');
					return;
				}
			}
		}



	}
});

/**
 * 修改密码
 * @type {[type]}
 */
var updatePasswordMoudle = angular.module("UpdatePasswordMoudle", []);
updatePasswordMoudle.controller('updatePasswordCtrl', function($upload, $rootScope, $scope, $http, $state, $stateParams, $cookieStore) {
	$scope.user = [];
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	$scope.getUserData = function() {
		$http.get(HB.dataBaseIp + '/getuserData', {
				params: {
					userName: $rootScope.register,
					password: ''
				}
			})
			.success(function(data) {

				if (data.length >= 1) {
					$scope.user = data[0];
				} else {

				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	};
	$scope.getUserData();

	$scope.confirmPass = function() {
		if ($scope.oldPassword == $scope.user.password) {

			$scope.passErr = "*密码正确";

		} else {
			$scope.passErr = "*密码错误";
			return;
		}
	}

	$scope.validatePass = function() {
		if ($scope.newPassword == $scope.againPassword) {
			$scope.passMessage = '';
		} else {
			$scope.passMessage = "*两次输入的密码不一致";
			return;
		}
	}
	$scope.updatePass = function(valid) {
		if (valid && $scope.passMessage == '' && $scope.passErr == '*密码正确') {
			var params = {
				userID: $scope.user._id,
				password: $scope.againPassword
			}
			$scope.upload = $upload.upload({
					url: HB.dataBaseIp + '/updatePassword',
					method: 'POST',
					headers: {
						'my-header': 'my-header-value'
					},
					data: params
				})
				.success(function(data, status, headers, config) {
					if (data === 'update success') {
						$cookieStore.put('mypassword', $scope.againPassword);
						alert('修改成功');
						//$state.go('registerUserHome.recentPublish'); //导向信息发布页面
					}
				}).error(function(data, status, headers, config) {
					alert('修改失败！');
				});
		} else {
			alert('输入有误！');
		}
	}
});

/**
 * 安全设置
 * @type {[type]}
 */
var setSecureProtectModule = angular.module("SetSecureProtectModule", []);
setSecureProtectModule.controller('setSecureProtectCtrl', function($upload, $rootScope, $scope, $http, $state, $stateParams, $cookieStore) {
	$scope.user = [];
	var params = {};
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	$scope.getUserData = function() {
		$http.get(HB.dataBaseIp + '/getuserData', {
				params: {
					userName: $rootScope.register,
					password: ''
				}
			})
			.success(function(data) {

				if (data.length >= 1) {
					$scope.user = data[0];
				} else {}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	};
	$scope.getUserData();
	var question1, question2, question3;
	var answer1, answer2, answer3;
	$scope.setmibao = function() {
		if ($scope.user.question1 != '' && $scope.user.answer1 != '') {

			question1 = $scope.user.question1;
			answer1 = $scope.user.answer1;
		}
		if ($scope.user.question2 != '' && $scope.user.answer2 != '') {

			question2 = $scope.user.question2;
			answer2 = $scope.user.answer2;
		}
		if ($scope.user.question3 != '' && $scope.user.answer3 != '') {
			question3 = $scope.user.question3;
			answer3 = $scope.user.answer3;
		}
		params = {
			userID: $scope.user._id,
			question1: question1,
			question2: question2,
			question3: question3,
			answer1: answer1,
			answer2: answer2,
			answer3: answer3
		};
		$scope.upload = $upload.upload({
				url: HB.dataBaseIp + '/updateSecureProtecion',
				method: 'POST',
				headers: {
					'my-header': 'my-header-value'
				},
				data: params
			})
			.success(function(data, status, headers, config) {
				if (data === 'update success') {
					$cookieStore.put('mypassword', $scope.againPassword);
					alert('设置成功!');
					//$state.go('registerUserHome.recentPublish'); //导向信息发布页面
				}
			}).error(function(data, status, headers, config) {
				alert('设置失败！');
			});

	}
});

/**
 * 使用密保问题找回密码
 * @type {[type]}
 */
var findPassByQueModule = angular.module("FindPassByQueModule", []);
findPassByQueModule.controller('findPassByQueCtrl', function($upload, $rootScope, $scope, $http, $state, $stateParams, $cookieStore) {
	$scope.user = [];
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	$scope.step = 1;
	$scope.vm.showLabel = true;
	var mibao = [];
	$scope.questions = [];
	$scope.choiceQue = '';
	$scope.getUserData = function() {
		$http.get(HB.dataBaseIp + '/getuserData', {
				params: {
					userName: $scope.user.username,
					password: ''
				}
			})
			.success(function(data) {
				if (data.length >= 1) {
					$scope.user = data[0];

					if (typeof($scope.user.question1) == 'undefined' && typeof($scope.user.question1) == 'undefined' && typeof($scope.user.question1) == 'undefined') {
						alert('您还未设置密保问题，请通过其他方式找回密码');
						$state.go('findPass');
						return;
					}
					$scope.step = 2;
					$scope.vm.value = 34;
					if (typeof($scope.user.question1) != 'undefined') {
						$scope.questions.push({
							'question': $scope.user.question1
						});
						mibao.push({
							'question': $scope.user.question1,
							'answer': $scope.user.answer1
						});
					}
					if (typeof($scope.user.question2) != 'undefined') {
						$scope.questions.push({
							'question': $scope.user.question2
						});
						mibao.push({
							'question': $scope.user.question2,
							'answer': $scope.user.answer2
						});
					}
					if (typeof($scope.user.question3) != 'undefined') {
						$scope.questions.push({
							'question': $scope.user.question3
						});
						mibao.push({
							'question': $scope.user.question3,
							'answer': $scope.user.answer3
						});
					}

				} else {
					//alert(1);
					$scope.errorMsg = "用户不存在！";
					return;

				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	};

	$scope.checkUsername = function() {
		$scope.getUserData();
	}

	$scope.checkAnswer = function() {
		if (!$scope.userAnswer) {
			$scope.errorMsg1 = '请输入答案!';
			return;
		}
		for (var i = 0; i < mibao.length; i++) {
			if (mibao[i].question == $scope.choiceQue) {
				if (mibao[i].answer == $scope.userAnswer) {
					$scope.step = 3;
					$scope.vm.value = 65;
				} else {
					$scope.errorMsg1 = '请输入正确答案!';
					return;
				}
			}
		}
	}

	$scope.updatePassword = function() {
		if ($scope.againPass != $scope.newPass) {
			$scope.errorMsg2 = "两次输入的密码不一致";
			return;
		}
		var params = {
			userID: $scope.user._id,
			password: $scope.againPass
		}
		$scope.upload = $upload.upload({
				url: HB.dataBaseIp + '/updatePassword',
				method: 'POST',
				headers: {
					'my-header': 'my-header-value'
				},
				data: params
			})
			.success(function(data, status, headers, config) {
				if (data === 'update success') {
					$scope.vm.value = 100;
					$scope.step = 3;
					$scope.errorMsg2 = '修改成功!';
					//alert($scope.againPass + $scope.user.email);
					$cookieStore.put('mypassword', $scope.againPass);
					$cookieStore.put('myusername', $scope.user.email);
					//$state.go('registerUserHome.recentPublish'); //导向信息发布页面
				}
			}).error(function(data, status, headers, config) {
				alert('修改失败！');
			});
	}
});

/**
 * 通过邮箱找回密码
 * @type {[type]}
 */
var findPassByEmailModule = angular.module("FindPassByEmailModule", []);
findPassByEmailModule.controller('findPassByEmailCtrl', function($upload, $rootScope, $scope, $http, $state, $stateParams, $cookieStore) {
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	$scope.getUserData = function(username) {
		$http.get(HB.dataBaseIp + '/getuserData', {
				params: {
					userName: username,
					password: ''
				}
			})
			.success(function(data) {
				if (data.length >= 1) {
					//$scope.user = data[0];
					$scope.errorMsg = '';
					$scope.sendEmail(username);
				} else {
					//alert(1);
					$scope.errorMsg = "用户不存在！";
					return;

				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	};

	$scope.checkUsername = function(username) {
		$scope.getUserData(username);
	}

	$scope.sendEmail = function(username) {
		//alert(username);
		$http.get(HB.dataBaseIp + '/sendMail', {
				params: {
					receiver: username
				}
			})
			.success(function(data) {
				if (data == 'success')
					alert('已发送到注册邮箱,请登录邮箱验证！');
				$state.go('home');
			})
			.error(function(data) {
				alert('网络错误。。。');
			});

	}
});
/**
 * 重置密码
 * @type {[type]}
 */
var resetPassModule = angular.module("ResetPassModule", []);
resetPassModule.controller('resetPassCtrl', function($upload, $rootScope, $scope, $http, $state, $stateParams, $cookieStore) {
	$scope.user = [];
	$rootScope.specialFlag = 0;
	$rootScope.showHouseRecommend = 0;
	$scope.getUserData = function() {
		$http.get(HB.dataBaseIp + '/getuserData', {
				params: {
					userName: $stateParams.email,
					password: ''
				}
			})
			.success(function(data) {
				if (data.length >= 1) {
					$scope.user = data[0];
					console.log($scope.user.senddatetime);
					if ($scope.compareTime($scope.user.senddatetime)) {

					} else {
						alert('链接已过时，请重新申请！');
						$state.go('home');
					}


				} else {
					alert('用户不合法！');
					$state.go('home');
				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			});
	};
	$scope.getUserData();
	$scope.resetPassword = function() {
		if ($scope.againPass != $scope.newPass) {
			$scope.errorMsg2 = "两次输入的密码不一致";
			return;
		}
		var params = {
			userID: $scope.user._id,
			password: $scope.againPass
		}
		$scope.upload = $upload.upload({
				url: HB.dataBaseIp + '/updatePassword',
				method: 'POST',
				headers: {
					'my-header': 'my-header-value'
				},
				data: params
			})
			.success(function(data, status, headers, config) {
				if (data === 'update success') {
					$scope.errorMsg2 = '修改成功!';
					$cookieStore.put('mypassword', $scope.againPass);
					$cookieStore.put('myusername', $scope.user.email);
					//$state.go('registerUserHome.recentPublish'); //导向信息发布页面
				}
			}).error(function(data, status, headers, config) {
				alert('修改失败！');
			});
	}

	$scope.compareTime = function(date1) {
		var date1 = new Date(date1);

		var date2 = new Date(); //当前时间
		var date3 = date2.getTime() - date1.getTime(); //时间差的毫秒数

		var leave1 = date3 % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
		//计算相差分钟数
		var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
		var minutes = Math.floor(leave2 / (60 * 1000));
		if (minutes >= 30)
			return false;
		else
			return true;
	}

});

var adminMessageModule = angular.module("AdminMessageModule", []);
adminMessageModule.controller('adminMessageCtrl', function($rootScope, $scope, $cookieStore, AdminMessageService) {
	$scope.messages = [];
	if (typeof($cookieStore.get('myusername')) !== 'undefined' || typeof($cookieStore.get('mypassword')) !== 'undefined') {
		AdminMessageService.getAdminMessage($cookieStore.get('myusername'), $cookieStore.get('mypassword'))
			.success(function(data) {
				if (data.length >= 1) {
					console.log(data[0].Messages.message);
					var messages = [];
					if (typeof(data[0].Messages.message) !== 'undefined') {
						if (typeof(data[0].Messages.message) === 'object') {
							for (var i = data[0].Messages.message.length - 1; i >= 0; i--) {
								var content = $.parseJSON(data[0].Messages.message[i]);
								content.isNew = false;
								$scope.messages.push(content);
								messages.push(angular.toJson(content));
							}
						}
					};
					console.log(messages);
					setMessageIsFalse(data[0]._id, messages);
				} else {
					alert("用户名或密码错误,请重新登录！");
					return 0;
				}
			})
			.error(function(data) {
				alert('网络错误。。。');
			})

	}

	function setMessageIsFalse(_id, messages) {
		AdminMessageService.setMessageIsFalse(_id, messages).success(function(data) {
			if (data.Message === 'success') {
				$rootScope.messageNum = '';
			}
		})
	}
});