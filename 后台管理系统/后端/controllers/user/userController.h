#pragma once
#include<crow.h>
#include"config.h"
#include"Database.h"

class UserController
{
public:
	UserController(){}

	crow::response getALLUser(const crow::request& req);

	crow::response searchUser(const crow::request& req);

	crow::response getUserProfile(const crow::request& req);

	crow::response Add_user_id_to_blackList(const crow::request& req);

	crow::response Remove_user_id_from_blackList(const crow::request& req);

	crow::response getBlacklist(const crow::request& req);

	crow::response Get_blackList_reason_statistic(const crow::request& req);

	crow::response getFeedback(const crow::request& req);

private:
	int get_account_id(const std::string& user_id)
	{
		DataBase db(HOSTNAME, USERNAME_USERDB, DBNAME_USERDB, PASSWORD, true);
		auto pstmt = db.getConnection()->prepareStatement("select id from account where user_id=?");
		pstmt->setString(1, user_id);
		auto res = pstmt->executeQuery();
		if (res->next())
		{
			return res->getInt("id");
		}
		return -1;
	}
};