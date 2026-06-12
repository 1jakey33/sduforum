#include<crow.h>
#include<iostream>
#include"authController.h"
#include"postController.h"
#include"commentController.h"
#include"tagController.h"
#include"userController.h"


int main()
{
	crow::SimpleApp app;

	AuthController auth;
	CROW_ROUTE(app, "/sdu_forum/api/manage/login")
		.methods("POST"_method)
		([&auth](const crow::request& req)
			{
				auto res= auth.login(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/get_total_num")
		.methods("GET"_method)
		([&auth](const crow::request& req)
			{
				auto res = auth.get_total_num(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});

	UserController user;
	CROW_ROUTE(app, "/sdu_forum/api/manage/Add_user_id_to_blackList")
		.methods("POST"_method)
		([&user](const crow::request& req)
			{
				auto res = user.Add_user_id_to_blackList(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/getALLUser")
		.methods("GET"_method)
		([&user](const crow::request& req)
			{
				auto res = user.getALLUser(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/getFeedback")
		.methods("GET"_method)
		([&user](const crow::request& req)
			{
				auto res = user.getFeedback(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/getUserProfile")
		.methods("GET"_method)
		([&user](const crow::request& req)
			{
				auto res = user.getUserProfile(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/Get_blackList_reason_statistic")
		.methods("GET"_method)
		([&user](const crow::request& req)
			{
				auto res = user.Get_blackList_reason_statistic(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/Remove_user_id_from_blackList")
		.methods("POST"_method)
		([&user](const crow::request& req)
			{
				auto res = user.Remove_user_id_from_blackList(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/searchUser")
		.methods("GET"_method)
		([&user](const crow::request& req)
			{
				auto res = user.searchUser(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/getBlacklist")
		.methods("GET"_method)
		([&user](const crow::request& req)
			{
				auto res = user.getBlacklist(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});


	PostController ptc;
	CROW_ROUTE(app, "/sdu_forum/api/manage/post/getAllPost")
		.methods("GET"_method)
		([&ptc](const crow::request& req)
			{
				auto res = ptc.getAllPost(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/post/getPostDetails")
		.methods("GET"_method)
		([&ptc](const crow::request& req)
			{
				auto res = ptc.getPostDetails(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/post/getTodayPost")
		.methods("GET"_method)
		([&ptc](const crow::request& req)
			{
				auto res = ptc.getTodayPost(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/post/search_tag")
		.methods("GET"_method)
		([&ptc](const crow::request& req)
			{
				auto res = ptc.search_tag(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/post/search_user_id")
		.methods("GET"_method)
		([&ptc](const crow::request& req)
			{
				auto res = ptc.search_user_id(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/post/deletePost")
		.methods("POST"_method)
		([&ptc](const crow::request& req)
			{
				auto res = ptc.deletePost(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});


	CommentController cc;
	CROW_ROUTE(app, "/sdu_forum/api/manage/comment/deleteComment")
		.methods("POST"_method)
		([&cc](const crow::request& req)
			{
				auto res = cc.deleteComment(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/comment/getComment")
		.methods("GET"_method)
		([&cc](const crow::request& req)
			{
				auto res = cc.getComment(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});

	TagController tag;
	CROW_ROUTE(app, "/sdu_forum/api/manage/tag/tag_statistic")
		.methods("GET"_method)
		([&tag](const crow::request& req)
			{
				auto res = tag.tag_statistic(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	CROW_ROUTE(app, "/sdu_forum/api/manage/tag/hotTag")
		.methods("GET"_method)
		([&tag](const crow::request& req)
			{
				auto res = tag.hotTag(req);
				res.set_header("Access-Control-Allow-Origin", "*"); // 设置允许跨域请求的源
				res.set_header("Content-Type", "application/json");
				return res;
			});
	
	app.port(8081).multithreaded().run();

	return 0;
}