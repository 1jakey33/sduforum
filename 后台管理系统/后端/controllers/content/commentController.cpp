#include "commentController.h"
#include"Database.h"

crow::response CommentController::getComment(const crow::request& req)
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
			std::cerr << e.what() << std::endl;
		}
		Json data = Json::array();
		std::string tableName = "comment_" + std::to_string(post_id);
		DataBase db(HOSTNAME, USERNAME_COMMENT, DBNAME_COMMENT, PASSWORD, false);
		auto res = db.getStatement()->executeQuery("select * from " + tableName );
		while (res->next())
		{
			//std::cout << 1111 << endl;
			Json info;
			info["id"] = res->getInt("id");
			info["father"] = res->getInt("father");
			info["nickName"] = res->getString("nickName");
			info["account_id"] = res->getInt("account_id");
			info["releaseTime"] = res->getString("releaseTime");
			info["text"] = res->getString("text");
			info["like_num"] = res->getInt("like_num");
			
			data.push_back(info);
		}
		Json response;
		response["state"] = true;
		response["result"] = data;
		return crow::response(response.dump(4));
	}
	catch (std::exception& e)
	{
		std::cerr << e.what() << std::endl;
		return crow::response(500, "Internal Server Error");
	}
}

crow::response CommentController::deleteComment(const crow::request& req)
{
	try
	{
		auto data = crow::json::load(req.body);
		if (!data)
		{
			return crow::response(400, "Invalid Json Data");
		}

		int post_id = data["post_id"].i();
		int id = data["id"].i();

		std::string tableName = "comment_" + std::to_string(post_id);
		DataBase db(HOSTNAME, USERNAME_COMMENT, DBNAME_COMMENT, PASSWORD, true);
		auto pstmt = db.getConnection()->prepareStatement("delete from " + tableName + " where id=?");
		pstmt->setInt(1, id);
		int row = pstmt->executeUpdate();
		if (row == 1)
		{
			Json response;
			response["state"] = true;
			return crow::response(response.dump(4));
		}
	}
	catch (std::exception& e)
	{
		std::cerr << e.what() << std::endl;
		return crow::response(500, "Internal Server Error");
	}
}
