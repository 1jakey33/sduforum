#pragma once
#include<crow.h>
#include"Database.h"
#include"config.h"


class PostController
{
public:
	PostController() {}

	crow::response getTodayPost(const crow::request& req);

	crow::response getAllPost(const crow::request& req);

	crow::response getPostDetails(const crow::request& req);

	crow::response search_tag(const crow::request& req);

	crow::response search_user_id(const crow::request& req);

	crow::response deletePost(const crow::request& req);

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