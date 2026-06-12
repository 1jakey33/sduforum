#pragma once
#pragma once
#include<string>
#include<vector>
#include<iostream>
#include"config.h"
#include<crow.h>
#include<nlohmann/json.hpp>
using Json = nlohmann::json;


class CommentController
{

public:
	explicit CommentController() {}

	crow::response getComment(const crow::request& req);

	crow::response deleteComment(const crow::request& req);
};