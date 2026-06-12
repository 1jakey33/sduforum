#include "postController.h"
#include"config.h"
#include"Database.h"
#include<nlohmann/json.hpp>
using Json = nlohmann::json;

crow::response PostController::getTodayPost(const crow::request& req)
{
	try
	{
		int start, limit;
		try
		{
			start = std::stoi(req.url_params.get("start"));
			limit = std::stoi(req.url_params.get("limit"));
		}
		catch (std::exception& e)
		{
			std::cerr << e.what() << std::endl;
			return crow::response(400, "Invalid Data");
		}

		DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, true);
		auto pstmt = db.getConnection()->prepareStatement("select * from post where DATE(created_at)=CURDATE() order by id desc limit ?,?");
		pstmt->setInt(1, start);
		pstmt->setInt(2, limit);
		auto res = pstmt->executeQuery();
		Json json = Json::array();
		while (res->next())
		{
			Json info;
			info["id"] = res->getInt("id");
			info["author_id"] = res->getInt("author_id");
			info["content"] = res->getString("content");
			info["favorite_count"] = res->getInt("favorite_count");
			info["comment_count"] = res->getInt("comment_count");
			info["created_at"] = res->getString("created_at");

			pstmt = db.getConnection()->prepareStatement("select nickName,avatar_image_url from user_profile where account_id=?");
			pstmt->setInt(1, res->getInt("author_id"));
			auto rres = pstmt->executeQuery();
			if (rres->next())
			{
				info["nickName"] = rres->getString("nickName");
				info["avatar_image_url"] = rres->getString("avatar_image_url");
			}
			else
			{
				info["nickName"] = "";
				info["avatar_image_url"] = "";
			}

			json.push_back(info);
		}

		Json response;
		response["state"] = true;
		response["result"] = json;
		return crow::response(response.dump(4));
	}
	catch (std::exception& e)
	{
		std::cerr << e.what() << std::endl;
		return crow::response(500, "Internal Server Error");
	}
}

crow::response PostController::getAllPost(const crow::request& req)
{
	try
	{
		int start, limit;
		try
		{
			start = std::stoi(req.url_params.get("start"));
			limit = std::stoi(req.url_params.get("limit"));
		}
		catch (std::exception& e)
		{
			std::cerr << e.what() << std::endl;
			return crow::response(400, "Invalid Data");
		}

		DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, true);
		auto pstmt = db.getConnection()->prepareStatement("select * from post order by id desc limit ?,?");
		pstmt->setInt(1, start);
		pstmt->setInt(2, limit);
		auto res = pstmt->executeQuery();
		Json json = Json::array();
		while (res->next())
		{
			Json info;
			info["id"] = res->getInt("id");
			info["author_id"] = res->getInt("author_id");
			info["content"] = res->getString("content");
			info["favorite_count"] = res->getInt("favorite_count");
			info["comment_count"] = res->getInt("comment_count");
			info["created_at"] = res->getString("created_at");

			pstmt = db.getConnection()->prepareStatement("select nickName,avatar_image_url from user_profile where account_id=?");
			pstmt->setInt(1, res->getInt("author_id"));
			auto rres = pstmt->executeQuery();
			if (rres->next())
			{
				info["nickName"] = rres->getString("nickName");
				info["avatar_image_url"] = rres->getString("avatar_image_url");
			}
			else
			{
				info["nickName"] = "";
				info["avatar_image_url"] = "";
			}

			json.push_back(info);
		}

		Json response;
		response["state"] = true;
		response["result"] = json;
		return crow::response(response.dump(4));
	}
	catch (std::exception& e)
	{
		std::cerr << e.what() << std::endl;
		return crow::response(500, "Internal Server Error");
	}
}

pair<Json, int> get_post_base_data(int post_id)
{
	Json json;
	DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, true);
	auto pstmt = db.getConnection()->prepareStatement("select * from post where id=?");
	pstmt->setInt(1, post_id);
	auto res = pstmt->executeQuery();
	if (res->next())
	{
		json["author_id"] = res->getInt("author_id");
		json["content"] = res->getString("content");
		json["favorite_count"] = res->getInt("favorite_count");
		json["comment_count"] = res->getInt("comment_count");
		json["created_at"] = res->getString("created_at");

		return make_pair(json, json["author_id"]);
	}
	return make_pair(json, -1);
}

Json get_post_tags(int post_id)
{
	Json json = Json::array();
	DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, true);
	auto pstmt = db.getConnection()->prepareStatement("select t.name as name from tag t join post_tag pt on t.id=pt.tag_id where pt.post_id=?");
	pstmt->setInt(1, post_id);
	auto res = pstmt->executeQuery();
	while (res->next())
	{
		json.push_back(res->getString("name"));
	}
	return json;
}

Json get_post_image(int post_id)
{
	Json json = Json::array();
	DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, true);
	auto pstmt = db.getConnection()->prepareStatement("select image_url from post_image where post_id=?");
	pstmt->setInt(1, post_id);
	auto res = pstmt->executeQuery();
	while (res->next())
	{
		json.push_back(res->getString("image_url"));
	}
	return json;
}

Json get_user_profile(int author_id)
{
	Json json;
	DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, true);
	auto pstmt = db.getConnection()->prepareStatement("select nickName,avatar_image_url from user_profile where account_id=?");
	pstmt->setInt(1, author_id);
	auto res = pstmt->executeQuery();
	if (res->next())
	{
		json["nickName"] = res->getString("nickName");
		json["avatar_image_url"] = res->getString("avatar_image_url");
	}
	return json;
}

crow::response PostController::getPostDetails(const crow::request& req)
{
	try
	{
		int post_id;
		try
		{
			post_id = std::stoi(req.url_params.get("post_id"));
		}
		catch (std::exception& e)
		{
			return crow::response(400, "Invalid Data!");
		}

		Json resData;
		resData["state"] = true;
		//先获取贴子的基本信息
		auto tt = get_post_base_data(post_id);
		resData["base_data"] = tt.first;
		//获取标签
		resData["tags"] = get_post_tags(post_id);
		//获取图片
		resData["images"] = get_post_image(post_id);
		//获取用户信息
		resData["user_profile"] = get_user_profile(tt.second);

		return crow::response(resData.dump(4));

	}
	catch (std::exception& e)
	{
		std::cerr << e.what() << std::endl;
		return crow::response(500, "Internal Server Error");
	}

}

crow::response PostController::search_tag(const crow::request& req)
{
	try
	{
		std::string tag;
		int start, pageSize;
		try
		{
			tag = req.url_params.get("tag");
			start = std::stoi(req.url_params.get("start"));
			pageSize = std::stoi(req.url_params.get("pageSize"));
		}
		catch (std::exception& e)
		{
			return crow::response(400, "Invalid Data!");
		}

		DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, true);
		auto pstmt = db.getConnection()->prepareStatement(
			"SELECT DISTINCT p.* "
			"FROM post p "
			"WHERE p.id IN( "
			"SELECT pt.post_id "
			"FROM post_tag pt "
			"JOIN tag t ON pt.tag_id = t.id "
			"WHERE t.name = ? "
			") "
			"ORDER BY p.id DESC "
			"LIMIT ? , ?");
		pstmt->setString(1, tag);
		pstmt->setInt(2, start);
		pstmt->setInt(3, pageSize);
		auto res = pstmt->executeQuery();

		Json ResData = Json::array();
		while (res->next())
		{
			Json info;
			info["id"] = res->getInt("id");
			info["author_id"] = res->getInt("author_id");
			info["content"] = res->getString("content");
			info["favorite_count"] = res->getInt("favorite_count");
			info["comment_count"] = res->getInt("comment_count");
			info["created_at"] = res->getString("created_at");

			pstmt = db.getConnection()->prepareStatement("select nickName,avatar_image_url from user_profile where account_id=?");
			pstmt->setInt(1, res->getInt("author_id"));
			auto rres = pstmt->executeQuery();
			if (rres->next())
			{
				info["nickName"] = rres->getString("nickName");
				info["avatar_image_url"] = rres->getString("avatar_image_url");
			}
			else
			{
				info["nickName"] = "";
				info["avatar_image_url"] = "";
			}
			ResData.push_back(info);

		}

		Json response;
		response["state"] = true;
		response["result"] = ResData;
		return crow::response(response.dump(4));

	}
	catch (std::exception& e)
	{
		std::cerr << e.what() << std::endl;
		return crow::response(500, "Internal Server Error");
	}
}

crow::response PostController::search_user_id(const crow::request& req)
{
	try
	{
		string  user_id;
		try
		{
			user_id = req.url_params.get("user_id");
		}
		catch (std::exception& e)
		{
			return crow::response(400, "Invalid Data!");
		}

		Json resData = Json::array();
		int author_id = get_account_id(user_id);

		DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, true);
		auto pstmt = db.getConnection()->prepareStatement("select * from post where author_id =? order by id desc");
		pstmt->setInt(1, author_id);
		auto res = pstmt->executeQuery();
		while (res->next())
		{
			Json info;
			info["id"] = res->getInt("id");
			info["author_id"] = res->getInt("author_id");
			info["content"] = res->getString("content");
			info["favorite_count"] = res->getInt("favorite_count");
			info["comment_count"] = res->getInt("comment_count");
			info["created_at"] = res->getString("created_at");

			pstmt = db.getConnection()->prepareStatement("select nickName,avatar_image_url from user_profile where account_id=?");
			pstmt->setInt(1, res->getInt("author_id"));
			auto rres = pstmt->executeQuery();
			if (rres->next())
			{
				info["nickName"] = rres->getString("nickName");
				info["avatar_image_url"] = rres->getString("avatar_image_url");
			}
			else
			{
				info["nickName"] = "";
				info["avatar_image_url"] = "";
			}

			resData.push_back(info);
		}

		return crow::response(resData.dump(4));

	}
	catch (std::exception& e)
	{
		std::cerr << e.what() << endl;
		return crow::response(500, "Internal Server Error");
	}
}

crow::response PostController::deletePost(const crow::request& req)
{
	try
	{
		auto data = crow::json::load(req.body);
		int post_id = data["post_id"].i();
	
		DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, true);
		
		auto pstmt = db.getConnection()->prepareStatement("delete from post where id=?");
		pstmt->setInt(1, post_id);
		int affected_rows = pstmt->executeUpdate();

		if (affected_rows > 0)
		{
			Json response;
			response["state"] = true;
			return crow::response(response.dump(4));
		}
		else 
		{
			Json response;
			response["state"] = false;
			return crow::response(response.dump(4));
		}
	}
	catch (std::exception& e)
	{
		std::cerr << e.what() << std::endl;
		return crow::response(500, "Internal Server Error");
	}
}
