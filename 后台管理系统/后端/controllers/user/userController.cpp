#include "userController.h"
#include"Database.h"
#include"config.h"
#include<nlohmann/json.hpp>
using Json = nlohmann::json;


crow::response UserController::getALLUser(const crow::request& req)
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
		auto pstmt = db.getConnection()->prepareStatement("select id,user_id from account limit ?,?");
		pstmt->setInt(1, start);
		pstmt->setInt(2, limit);
		auto res = pstmt->executeQuery();
		Json json = Json::array();
		while (res->next())
		{
			Json info;
			info["id"] = res->getInt("id");
			info["user_id"] = res->getString("user_id");

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

crow::response UserController::searchUser(const crow::request& req)
{
	try
	{
		std::string user_id;
		try
		{
			user_id = req.url_params.get("user_id");
		}
		catch (std::exception& e)
		{
			std::cerr << e.what() << std::endl;
			return crow::response(400, "Invalid Data");
		}

		DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, true);
		auto pstmt = db.getConnection()->prepareStatement("select id,user_id from account where user_id=?");
		pstmt->setString(1, user_id);
		auto res = pstmt->executeQuery();
		if (res->next())
		{
			crow::json::wvalue response;
			response["state"] = true;
			response["result"]["id"] = res->getInt("id");
			response["result"]["user_id"] = res->getString("user_id");
			return crow::response(response);
		}
		else
		{
			crow::json::wvalue response;
			response["state"] = true;
			return crow::response(response);
		}
	}
	catch (std::exception& e)
	{
		std::cerr << e.what() << std::endl;
		return crow::response(500, "Internal Server Error");
	}
}

crow::response UserController::getUserProfile(const crow::request& req)
{
	try
	{
		std::string user_id = req.url_params.get("user_id");
		int account_id = get_account_id(user_id);

		DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, true);
		auto pstmt = db.getConnection()->prepareStatement("select * from user_profile where account_id=?");
		pstmt->setInt(1, account_id);
		auto res = pstmt->executeQuery();
		if (res->next())
		{
			crow::json::wvalue response;
			response["nickName"] = res->getString("nickName");
			response["major"] = res->getString("major");
			response["join_date"] = res->getString("created_at");
			response["favorite_post_count"] = res->getInt("favorite_post_count");
			response["liked_count"] = res->getInt("liked_count");
			response["published_post_count"] = res->getInt("published_post_count");
			response["background_image_url"] = res->getString("background_image_url");
			response["avatar_image_url"] = res->getString("avatar_image_url");
			return crow::response(response);
		}
	}
	catch (std::exception& e)
	{
		cerr << "Error: " << e.what() << endl;
		return crow::response(500, "Internal Server Error");
	}
}

crow::response UserController::Add_user_id_to_blackList(const crow::request& req)
{
	try
	{
		auto data = crow::json::load(req.body);
		if (!data)
		{
			return crow::response(400, "Invalid Json Data!");
		}
		std::string user_id = data["user_id"].s();
		std::string reason = data["reason"].s();
		std::string end_time = data["end_time"].s();

		DataBase db(HOSTNAME, USERNAME_MANAGE, DBNAME_MANAGE, PASSWORD, true);
		auto pstmt = db.getConnection()->prepareStatement("insert into account_blacklist (user_id,reason,end_time) values (?,?,?)");
		pstmt->setString(1, user_id);
		pstmt->setString(2, reason);
		pstmt->setString(3, end_time);
		int row = pstmt->executeUpdate();
		if (row == 1)
		{
			pstmt = db.getConnection()->prepareStatement("update reason_statistic set `usage`=`usage`+1 where reason=?");
			pstmt->setString(1, reason);
			pstmt->executeUpdate();

			crow::json::wvalue response;
			response["state"] = true;
			return crow::response(response);
		}
		else
		{
			crow::json::wvalue response;
			response["state"] = false;
			return crow::response(response);
		}
	}
	catch (std::exception& e)
	{
		std::cerr << e.what() << std::endl;
		return crow::response(500, "Internal Server Error");
	}
}

crow::response UserController::Remove_user_id_from_blackList(const crow::request& req)
{
	try
	{
		auto data = crow::json::load(req.body);
		if (!data)
		{
			return crow::response(400, "Invalid Json Data");
		}
		std::string user_id = data["user_id"].s();
		DataBase db(HOSTNAME, USERNAME_MANAGE, DBNAME_MANAGE, PASSWORD, true);
		auto pstmt = db.getConnection()->prepareStatement("delete from account_blacklist where user_id=?");
		pstmt->setString(1, user_id);
		int row = pstmt->executeUpdate();
		if (row == 1)
		{
			crow::json::wvalue response;
			response["state"] = true;
			return crow::response(response);
		}
		else
		{
			crow::json::wvalue response;
			response["state"] = false;
			return crow::response(response);
		}
	}
	catch (std::exception& e)
	{
		std::cerr << e.what() << std::endl;
		return crow::response(500, "Internal Server Error");
	}
}

crow::response UserController::getBlacklist(const crow::request& req)
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
		DataBase db(HOSTNAME, USERNAME_MANAGE, DBNAME_MANAGE, PASSWORD, true);
		auto pstmt = db.getConnection()->prepareStatement("select * from account_blacklist limit ?,?");
		pstmt->setInt(1, start);
		pstmt->setInt(2, limit);
		auto res = pstmt->executeQuery();
		Json json = Json::array();
		while (res->next())
		{
			Json info;
			info["id"] = res->getInt("id");
			info["user_id"] = res->getString("user_id");
			info["reason"] = res->getString("reason");
			info["start_time"] = res->getString("start_time");
			info["end_time"] = res->getString("end_time");

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

crow::response UserController::Get_blackList_reason_statistic(const crow::request& req)
{
	try
	{
		DataBase db(HOSTNAME, USERNAME_MANAGE, DBNAME_MANAGE, PASSWORD, false);
		auto res=db.getStatement()->executeQuery("select * from reason_statistic");
		Json json = Json::array();
		while (res->next())
		{
			Json info;
			info["reason"] = res->getString("reason");
			info["usage"] = res->getInt("usage");

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

crow::response UserController::getFeedback(const crow::request& req)
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
		auto pstmt = db.getConnection()->prepareStatement("select * from feedback order by id desc limit ?,?");
		pstmt->setInt(1, start);
		pstmt->setInt(2, limit);
		auto res = pstmt->executeQuery();
		Json json = Json::array();
		while (res->next())
		{
			Json info;
			info["user_id"] = res->getString("user_id");
			info["feedback"] = res->getString("feedback");
			info["time"] = res->getString("time");
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
