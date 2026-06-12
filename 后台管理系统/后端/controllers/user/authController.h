#pragma once
#include<crow.h>
#include"Database.h"

class AuthController
{
public:
	 AuthController(){}

	 crow::response login(const crow::request& req);

	 crow::response get_total_num(const crow::request& req);

};