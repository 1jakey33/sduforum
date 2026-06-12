#include "authController.h"
#include<string>
#include"config.h"

crow::response AuthController::login(const crow::request& req)
{
	try
	{
		auto data = crow::json::load(req.body);
		if (!data)
		{
			return crow::response(400, "Invalid Json Data!");
		}
		std::string account = data["account"].s();
		std::string password = data["password"].s();

		DataBase db(HOSTNAME, USERNAME_MANAGE, DBNAME_MANAGE, PASSWORD, true);
		auto pstmt = db.getConnection()->prepareStatement("select password from manage_account where account=?");
		pstmt->setString(1, account);
		auto res = pstmt->executeQuery();
		bool state = false;
		if (res->next())
		{
			if (res->getString("password") == password)
			{
				state = true;
			}
		}

		crow::json::wvalue response;
		response["state"] = state;
		return crow::response(response);
	}
	catch (std::exception& e)
	{
		std::cerr << e.what() << std::endl;
		return crow::response(500, "Internal Server Error");
	}
}

crow::response AuthController::get_total_num(const crow::request& req)
{
	try
	{
		crow::json::wvalue data;
		DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, false);
		auto res = db.getStatement()->executeQuery("select COUNT(*) as num from account");
		if (res->next())
		{
			data["user_total_num"] = res->getInt("num");
		}
		else
		{
			data["user_total_num"] = 0;
		}

		res = db.getStatement()->executeQuery("select COUNT(*) as num from post");
		if (res->next())
		{
			data["post_total_num"] = res->getInt("num");
		}
		else
		{
			data["post_total_num"]=0;
		}
		res = db.getStatement()->executeQuery("select SUM(comment_count) as num from post");
		if (res->next())
		{
			data["comment_total_num"] = res->getInt("num");
		}
		DataBase db1(HOSTNAME, USERNAME_MANAGE, DBNAME_MANAGE, PASSWORD, false);
		res = db1.getStatement()->executeQuery("select COUNT(*) as num from account_blacklist");
		if (res->next())
		{
			data["blacklist_total_num"] = res->getInt("num");
		}
		else
		{
			data["blacklist_total_num"] = 0;
		}

		return crow::response(data);
	}
	catch (std::exception& e)
	{
		std::cerr << e.what() << std::endl;
		return crow::response(500, "Internal Server Error");
	}
}
