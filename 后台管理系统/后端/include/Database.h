#pragma once
#pragma once
#include <jdbc/cppconn/statement.h>
#include <jdbc/cppconn/resultset.h>
#include <jdbc/cppconn/exception.h>
#include <jdbc/mysql_driver.h>
#include<jdbc/mysql_connection.h>
#include<jdbc/cppconn/prepared_statement.h>
#include<iostream>
#include<string>

using namespace sql;
using namespace std;


class DataBase
{
private:
	Driver* driver;
	unique_ptr<sql::Connection> con;
	unique_ptr<PreparedStatement> pstmt;
	unique_ptr<Statement> stmt;


public:
	DataBase(const string& hostName, const string& userName,
		const string& dbName, const string& password, bool pre)
	{
		try {
			driver = get_driver_instance();
			con.reset(driver->connect(hostName, userName, password));
			con->setSchema(dbName);

			if (!pre) {
				stmt.reset(con->createStatement());
			}
		}
		catch (sql::SQLException& e) {
			std::cerr << "SQL Error: " << e.what() << std::endl;
			throw;
		}
	}
	~DataBase() = default;


	Driver* getDriver() const { return driver; }
	sql::Connection* getConnection() const { return con.get(); }
	PreparedStatement* getPreparedStatement() const { return pstmt.get(); }
	Statement* getStatement() const { return stmt.get(); }

	
	DataBase(const DataBase&) = delete;
	DataBase& operator=(const DataBase&) = delete;
};