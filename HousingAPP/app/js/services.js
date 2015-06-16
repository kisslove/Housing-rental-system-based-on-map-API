routerApp.factory('AdminMessageService', ['$http', function($http){
	return {
		getAdminMessage:function(email,password){
		 return  $http.get(HB.dataBaseIp + '/getuserData', {
				params: {
					userName: email,
					password: password
				}
			});

	},
         setMessageIsFalse:function(_id,message) {
         	return  $http.post(HB.dataBaseIp + '/setMessageIsFalse',{ 
				params: {
					userID:_id,
					message:message
				}
			}
			);
         }
}
}])
.factory('getLocalDataService', ['$http',function ($http) {
	return {
        getProvinces:function() {
        	return $http.get('/localData/provinces.json');
        },
        getAllCityAreas:function() {
        	return $http.get('/localData/allCityAreas.json');
        }

	};
}])