var mysql = require('mysql');
var config = require('./config')
var connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
});

connection.connect();

module.exports = connection;
/**
 *
 select * from costs
 right join projects on projects.ID=costs.Project_ID
 right join clients on projects.Client_ID=projects.Client_ID
 where clients.Id in (1, 2)
 having projects.Id in (1, 2)
 */