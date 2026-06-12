#include "tagController.h"
#include"Database.h"
#include"config.h"
#include<nlohmann/json.hpp>
using Json = nlohmann::json;

crow::response TagController::tag_statistic(const crow::request& req)
{
	try
	{
		DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, false);
		auto res = db.getStatement()->executeQuery("select * from tag");
		Json json = Json::array();
		while (res->next())
		{
			Json info;
			info["name"] = res->getString("name");
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

crow::response TagController::hotTag(const crow::request& req)
{
	try
	{
		DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, false);
		auto res = db.getStatement()->executeQuery("select * from tag order by `usage` desc limit 0,10");
		Json json = Json::array();
		while (res->next())
		{
			Json info;
			info["name"] = res->getString("name");
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
