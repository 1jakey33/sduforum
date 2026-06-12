#pragma once
#include<crow.h>

class TagController
{
public:

	TagController(){}

	crow::response tag_statistic(const crow::request& req);

	crow::response hotTag(const crow::request& req);
};