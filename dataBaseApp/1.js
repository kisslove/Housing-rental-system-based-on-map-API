//创建数据库存储位置
var path = require("path");
var application_root = __dirname;
var dbUserUrl = path.join(application_root, "db/user.db");
var dbHouseRentrUrl = path.join(application_root, "db/houseRent.db");
var dbUserVisitInofoUrl=path.join(application_root,"db/userVisitInfo.db");
var Datastore = require('nedb');
db = {};
//创建数据库
db.houseRent = new Datastore({
	filename: dbHouseRentrUrl,
	autoload: true
});
db.users = new Datastore({
	filename: dbUserUrl,
	autoload: true
});
db.userVisitInfo = new Datastore({
	filename: dbUserVisitInofoUrl,
	autoload: true
});

//var url = require( "url" );
//var queryString = require("querystring");

var express = require('express');
//var connect = require('connect');
var http = require('http');
var multer = require('multer'); //Multer is a node.js middleware for handling multipart/form-data.
//var app = connect();
var app = express();


//
var serveStatic = require('serve-static');
app.use(serveStatic(path.join(application_root, "public")));

//引入发送邮件模块
var nodemailer = require("nodemailer");

// gzip/deflate outgoing responses
//var compression = require('compression');
//app.use(compression());

// store session state in browser cookie
//var cookieSession = require('cookie-session');
//app.use(cookieSession({
//	keys: ['secret1', 'secret2']
//}));

// parse urlencoded request bodies into req.body
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({
	extended: false
});
app.use(multer({
	dest: '../HousingAPP/app/image'
})); //存储文件


//var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Headers", "content-type,my-header");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By", ' 3.2.1');
	res.header("Content-Type", "application/json;charset=utf-8");
	// console.log(path.join(application_root, "public"));
	next();
})



//handle err
var errorhandler = require('errorhandler');
if (process.env.NODE_ENV === 'development') {
	// only use in development
	app.use(errorhandler());
}


/**
 * 获取用户名或者密码
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
app.get('/getuserData', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET");
	var userName = req.param('userName');
	var password = req.param('password');
	var condition = [];
	console.log(req.param.length);
	console.log(userName);
	if (userName !== '')
		condition.push({
			email: userName
		});
	if (password !== '')
		condition.push({
			password: password
		});
	db.users.find({
		$and: condition
	}, function(err, users) {
		if (err || !users) console.log("No users found");
		else {
			res.jsonp(users);
			console.log(users);
		}
	});

});
/*
获取所有用户
 */
app.get('/getAllUserData', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET");
	db.users.find({
		isAdmin: 'false'
	}, function(err, users) {
		if (err || !users) console.log("No users found");
		else {
			res.jsonp(users);
			console.log(users);
		}
	});

});
/**
 * [删除用户]
 */
app.get('/deleteUserData', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET");
	//获取参数
	var _id = req.param('UserID');
	db.users.remove({
		_id: _id
	}, {}, function(err, numRemoved) {
		if (numRemoved == 1)
			res.end('success');
		else
			res.end(err);
	});

});
/**
 * 用户注册
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
app.post('/addUserData', urlencodedParser, function(req, res) {
	console.log("POST: ");
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "POST");
	console.log(req.body);
	console.log(req.body.mydata);
	var jsonData = JSON.parse(req.body.mydata);
	console.log(jsonData.userName);
	console.log(jsonData.password);
	db.users.insert({
		email: jsonData.userName,
		isAdmin: 'false',
		password: jsonData.password,
        realname:"未填写",
        hometown:"未填写",
        contactAddr:"未填写",
        postcode:"未填写",
        signature:"未填写",
		sex:"未设置",
		images:[{"imageName":"man.png"}],
        hostphone:"还未填写",
        Messages:{message:[]}
	}, function(err, saved) {

		if (err || !saved) res.end("User not saved");
		else res.end("User saved");
	});
});

/**
 * [发送消息]
 */
app.post('/sendMessage', urlencodedParser, function(req, res) {
    console.log(req.body);
	var jsonData =req.body;
	console.log(jsonData);
	console.log(jsonData.userID);
	console.log(jsonData.Contents);

	
	db.users.update({
		_id: jsonData.userID
	}, {
		$push: {"Messages.message":jsonData.Contents}
	}, {}, function(err, numReplaced) {
		if (numReplaced>0)
		{   console.log(numReplaced);
			res.jsonp({Message:"success"});
			}
		else {
			res.jsonp({Message:"failed"});
		}
	});
	

});

 /*
 设置消息状态
  */
app.post('/setMessageIsFalse', jsonParser, function(req, res) {
	var jsonData =req.body.params;
db.users.update({
		_id: jsonData.userID
	}, {
		$set: {"Messages.message":jsonData.message}
	}, {}, function(err, numReplaced) {
		if (numReplaced>0)
		{   
            res.jsonp({Message:"success"});
		}
		else {
			res.jsonp({Message:"failed"});
		}
	});

});


/**
 * 根据条件查询房屋出租表
 */
app.get('/getHouseRentInfo', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET");
	var condition = [{
		houseExist: 'true'
	}];
	//获取参数
	var area = req.param('area');
	var city = req.param('city');
	var priceType = req.param('priceType');
	var rentleType = req.param('roomType');
	var key = req.param('key');
	console.log(typeof(area));
	if (area !== "") {
		condition.push({
			area: area
		});
	}
	if (city !== "") {
		condition.push({
			city: city
		});
	}
	if (priceType !== "") {
		condition.push({
			priceType: priceType
		});
	}
	if (rentleType !== "") {
		condition.push({
			rentleType: rentleType
		});
	}

	console.log(condition);
	db.houseRent.find({
		$and: condition
	}, function(err, datas) {
		if (err || !datas) console.log("No datas found");
		else {
			console.log(datas);
			res.jsonp(datas);
			// console.log(res);
		}
	});

});


/**
 * 用户发布房屋信息
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
app.post('/addHouseInfo', function(req, res) {
	console.log("POST: ");
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "my-header");
	console.log(req.body);
	console.log(req.files);
	var images = [];
	if(typeof(req.files.file)!='undefined')
	{ 
		console.log(req.files.file);
		if(req.files.file.length > 1)
		for (var i = 0; i < req.files.file.length; i++) {

			images.push({
				imageName: req.files.file[i].name
			});
		} else
			images.push({
				imageName: req.files.file.name
			});	
	}
	else
	{
		images.push({imageName:'default.jpg'});
	}
	var jsonData = req.body;
	console.log(req.body.rentleType);
	db.houseRent.insert({
		rentleType: jsonData.rentleType,
		communityName: jsonData.communityName,
		houseDoorModel: jsonData.houseDoorModel,
		floor: jsonData.floor,
		title: jsonData.title,
		describle: jsonData.describle,
		roomArea: jsonData.roomArea,
		datetime: jsonData.datetime,
		hostphone: jsonData.hostphone,
		hostname: jsonData.hostname,
		rentlePrice: jsonData.rentlePrice,
		price: jsonData.price,
		priceType: jsonData.priceType,
		thumbnail: images,
		longitude: jsonData.longitude,
		latitude: jsonData.latitude,
		city: jsonData.city,
		area: jsonData.area,
		roomKind: jsonData.roomKind,
		gender: jsonData.gender,
		roomToward: jsonData.roomToward,
		decorateSituation: jsonData.decorateSituation,
		houseKind: jsonData.houseKind,
		roomThing: jsonData.roomThing,
		totalPingmi: jsonData.totalPingmi,
		userName: jsonData.userName,
		houseToward: jsonData.houseToward,
		houseExist: 'true',
		shi: jsonData.shi,
		ting: jsonData.ting,
		wei: jsonData.wei,
		louceng: jsonData.louceng,
		totalLouceng: jsonData.totalLouceng,
		//yuezu:jsonData.yuezu,
		zujinMethod: jsonData.zujinMethod,
		chuang: jsonData.chuang,
		yigui: jsonData.yigui,
		shafa: jsonData.shafa,
		dianshi: jsonData.dianshi,
		bingxiang: jsonData.bingxiang,
		xiyiji: jsonData.xiyiji,
		kongtiao: jsonData.kongtiao,
		reshuiqi: jsonData.reshuiqi,
		kuandai: jsonData.kuandai,
		nuanqi: jsonData.nuanqi
	}, function(err, saved) {
		if (err || !saved) res.status(400).send('Bad Request');
		else res.end('Info saved');
	});
});


/**
 * 获取近期发布信息
 * @type {Array}
 */
app.get('/getRecentPublishInfo', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET");
	var condition = [];
	//获取参数
	var userName = req.param('userName');
	var datetime = req.param('datetime');
	console.log(datetime);
	if (userName !== '') {
		condition.push({
			userName: userName
		});
	}
	if (datetime !== '') {
		condition.push({
			datetime: datetime
		});
	}
	console.log(condition);

	db.houseRent.find({
		$and: [{
			userName: userName
		}, {
			houseExist: 'true'
		}]
	}).sort({
		datetime: -1
	}).limit(5).exec(function(err, docs) {
		if (err || !docs) console.log("No datas found");
		else {
			console.log(docs);
			res.jsonp(docs);
		}
	});

});

/**
 * 获取详细页面
 */
app.get('/getdetailPage', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET");
	//var condition = [];
	//获取参数
	var detailPageID = req.param('detailPageID');
	console.log(detailPageID);
	db.houseRent.findOne({
		_id: detailPageID
	}, function(err, datas) {
		if (err || !datas) console.log("No datas found");
		else {
			console.log(datas);
			res.jsonp(datas);
		}
	});

});



/**
 * 删除或恢复已发布房屋信息
 */
app.get('/deleteOrRecoveryPublishHouseInfo', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET");
	//var condition = [];
	//获取参数
	var detailPageID = req.param('detailPageID');
	var datetime = req.param('datetime');
	var houseExist = req.param('houseExist');
	console.log(detailPageID);
	db.houseRent.update({
		_id: detailPageID
	}, {
		$set: {
			houseExist: houseExist,
			datetime: datetime
		}
	}, {}, function(err, numReplaced) {
		if (err) console.log("delete failed");
		else {
			console.log(numReplaced);
			res.end('success');
		}
	});

});

/**
 * 修改发布租房信息
 */
app.post('/updatePublishHouseInfo', urlencodedParser,function(req, res) {
	var content = {};
	console.log(req.body);
	//获取参数
	var jsonData = req.body;
	if (jsonData.rentleType == '整套出租') {
		content = {
			houseDoorModel: jsonData.houseDoorModel,
			title: jsonData.title,
			describle: jsonData.describle,
			datetime: jsonData.datetime,
			hostphone: jsonData.hostphone,
			hostname: jsonData.hostname,
			rentlePrice: jsonData.rentlePrice, //"rentlePrice":"2112元/月(押一付二)",
			price: jsonData.price,
			priceType: jsonData.priceType,
			//thumbnail: images,
			decorateSituation: jsonData.decorateSituation,
			houseKind: jsonData.houseKind,
			totalPingmi: jsonData.totalPingmi,
			houseToward: jsonData.houseToward,
			shi: jsonData.shi,
			ting: jsonData.ting,
			wei: jsonData.wei,
			//yuezu:jsonData.yuezu,
			zujinMethod: jsonData.zujinMethod
		};
	}

	if (jsonData.rentleType == '单间出租') {
		content = {
			houseDoorModel: jsonData.houseDoorModel,
			title: jsonData.title,
			describle: jsonData.describle,
			datetime: jsonData.datetime,
			hostphone: jsonData.hostphone,
			hostname: jsonData.hostname,
			rentlePrice: jsonData.rentlePrice, //"rentlePrice":"2112元/月(押一付二)",
			price: jsonData.price,
			priceType: jsonData.priceType,
			//thumbnail: images,
			decorateSituation: jsonData.decorateSituation,
			houseKind: jsonData.houseKind,
			totalPingmi: jsonData.totalPingmi,
			roomArea: jsonData.roomArea,
			roomToward: jsonData.roomToward,
			shi: jsonData.shi,
			ting: jsonData.ting,
			wei: jsonData.wei,
			//yuezu: jsonData.yuezu,
			zujinMethod: jsonData.zujinMethod,
			chuang: jsonData.chuang,
			yigui: jsonData.yigui,
			shafa: jsonData.shafa,
			dianshi: jsonData.dianshi,
			bingxiang: jsonData.bingxiang,
			xiyiji: jsonData.xiyiji,
			kongtiao: jsonData.kongtiao,
			reshuiqi: jsonData.reshuiqi,
			kuandai: jsonData.kuandai,
			nuanqi: jsonData.nuanqi,
			roomThing: jsonData.roomThing,
			roomKind: jsonData.roomKind,
			gender: jsonData.gender
		};
	}

	if (jsonData.rentleType == '床位出租') {
		content = {
			title: jsonData.title,
			describle: jsonData.describle,
			datetime: jsonData.datetime,
			hostphone: jsonData.hostphone,
			hostname: jsonData.hostname,
			rentlePrice: jsonData.rentlePrice, //"rentlePrice":"2112元/月(押一付二)",
			price: jsonData.price,
			priceType: jsonData.priceType,
			//thumbnail: images,
			//yuezu:jsonData.yuezu,
			zujinMethod: jsonData.zujinMethod,
			chuang: jsonData.chuang,
			yigui: jsonData.yigui,
			shafa: jsonData.shafa,
			dianshi: jsonData.dianshi,
			bingxiang: jsonData.bingxiang,
			xiyiji: jsonData.xiyiji,
			kongtiao: jsonData.kongtiao,
			reshuiqi: jsonData.reshuiqi,
			kuandai: jsonData.kuandai,
			nuanqi: jsonData.nuanqi,
			roomThing: jsonData.roomThing,
			gender: jsonData.gender
		};
	}

	db.houseRent.update({
		_id: jsonData.updateHouseID
	}, {
		$set: content
	}, {}, function(err, numReplaced) {
		if (numReplaced>0)
		{   console.log(numReplaced);
			res.end('update success');}
		else {
			res.end('update failed');
		}
	});

});
/**
 * 查询已删除房屋信息
 */
app.get('/getDeletedHouseInfo', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET");
	//获取参数
	var userName = req.param('userName');
	db.houseRent.find({
		$and: [{
			userName: userName
		}, {
			houseExist: 'false'
		}]
	}).sort({
		datetime: -1
	}).exec(function(err, docs) {
		if (err || !docs) console.log("No datas found");
		else {
			console.log(docs);
			res.jsonp(docs);
		}
	});

});

/**
 * 彻底删除房屋信息
 */
app.get('/removeHouseInfo', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET");
	//获取参数
	var _id = req.param('HouseID');
	db.houseRent.remove({
		_id: _id
	}, {}, function(err, numRemoved) {
		if (numRemoved == 1)
			res.end('success');
		else
			res.end(err);
	});

});

/**
 * 修改个人资料
 */
app.post('/updatePersonalInfo', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "post");
	//获取参数
	var jsonData = req.body;
	var images = [];
	var content;
	if(typeof(req.files.file)!='undefined')
	{ 
		console.log(req.files.file);
		images.push({
				imageName: req.files.file.name
			});
		content = {
    	realname:jsonData.realname,
    	hometown:jsonData.hometown,
		contactAddr:jsonData.contactAddr,
		postcode:jsonData.postcode,
		signature:jsonData.signature,
		sex:jsonData.sex,
		images:images,
		hostphone:jsonData.hostphone
		
    };	
	}
	else
	{
		content = {
    	realname:jsonData.realname,
    	hometown:jsonData.hometown,
		contactAddr:jsonData.contactAddr,
		postcode:jsonData.postcode,
		signature:jsonData.signature,
		sex:jsonData.sex,
		hostphone:jsonData.hostphone	
    };
	}
	
    console.log(jsonData.userID);
	db.users.update({
		_id: jsonData.userID
	}, {
		$set: content
	}, {}, function(err, numReplaced) {
		if (numReplaced>0)
		{   console.log(numReplaced);
			res.end('update success');}
		else {
			console.log("update failed");
		}
	});

});

/**
 * 修改密码
 */
app.post('/updatePassword',urlencodedParser, function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "post");
	
	db.users.update({
		_id: req.body.userID
	}, {
		$set: {password:req.body.password}
	}, {}, function(err, numReplaced) {
		if (numReplaced>0)
		{   console.log(numReplaced);
			res.end('update success');}
		else {
			console.log("update failed");
		}
	});

});

/**
 * 修改密保问题
 */
app.post('/updateSecureProtecion', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "post");
	console.log(req.body);
	var jsonData=req.body;
	var content={
		question1:jsonData.question1,
		question2:jsonData.question2,
		question3:jsonData.question3,
		answer1:jsonData.answer1,
		answer2:jsonData.answer2,
		answer3:jsonData.answer3,
	};
		db.users.update({
		_id: req.body.userID
	}, {
		$set: content
	}, {}, function(err, numReplaced) {
		if (numReplaced>0)
		{   console.log(numReplaced);
			res.end('update success');}
		else {
			console.log("update failed");
		}
	});
});

//发送邮件
// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'QQ',
    auth: {
        user: '676022504@qq.com',
        pass: 'HUBIN520.'
    }  
});

app.get('/sendMail', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET");
	//获取参数
	//var _id = req.param('HouseID');
    var receiver=req.param('receiver');
    console.log(receiver);
// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails
   var serverIp=req.headers.origin;
   var senddatetime=new Date();
// setup e-mail data with unicode symbols
var mailOptions = {
    from: '<676022504@qq.com>', // sender address
    to: receiver, // list of receivers
    subject: '你好'+receiver+'！', // Subject line
    text: '请点击下面的链接完成修改：', // plaintext body
    html: "<strong>点击下面的链接导向修改界面：</strong><br/><a href='" + serverIp + "/HB#/resetPass?email="+receiver+"'>重置密码</a>"
};
// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
        db.users.update({
		email: receiver
	}, {
		$set: {senddatetime:senddatetime}
	}, {}, function(err, numReplaced) {
		if (numReplaced>0)
		{   console.log(numReplaced);
            res.end('success');
        }
		else {
			console.log("failed");
		}
	});

      
    }
});
});


/**
 * 查询访问用户信息
 */
app.get('/getUserVisitInfoByIP', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET");
	//获取参数
	var userVisitID = req.param('userVisitID');
	db.userVisitInfo.find({
			userVisitID: userVisitID
	}).sort({
		lastVisitTime: -1
	}).exec(function(err, docs) {
		if (err || !docs) console.log("No datas found");
		else {
			console.log(docs);
			res.jsonp(docs);
		}
	});

});

/*
 *增加用户访问记录
 */
app.get('/addUserVisitInfo', urlencodedParser, function(req, res) {
	console.log("GET: ");
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET");
	db.userVisitInfo.insert({
		userVisitID: req.query.userVisitID
	}, function(err, saved) {
		if (err || !saved) res.end("User not saved");
		else res.end("success");
	});
});


/**
 * 
 */
app.post('/remberUserHistory',urlencodedParser, function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "post");
	
	db.users.update({
		_id: req.body.userID
	}, {
		$set: {password:req.body.password}
	}, {}, function(err, numReplaced) {
		if (numReplaced>0)
		{   console.log(numReplaced);
			res.end('update success');}
		else {
			console.log("update failed");
		}
	});

});








console.log('database is on the port:1212');
//create node.js http server and listen on port
http.createServer(app).listen(1212);