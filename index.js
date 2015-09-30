var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();

var client = new pg.Client(process.env.DATABASE_URL);
client.connect();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.render('pages/index');
});

app.post('/add', function(request, response) {
	var battle = request.body.battle;

	client.query('CREATE TABLE IF NOT EXISTS ' + battle + ' (name varchar(255), race varchar(255), class varchar(255), ac int, initiative int)');

	for(var key in request.body.participants)
		client.query('INSERT INTO ' + battle + ' VALUES(\'' + request.body.participants[key].name + '\', \'' + request.body.participants[key].race + '\', \'' + request.body.participants[key].class + '\', ' + request.body.participants[key].ac + ', ' + request.body.participants[key].initiative + ')');

	response.send("New character added.");
});

app.post('/update', function(request, response) {
	var battle = request.body.battle;

	for(var key in request.body.participants)
		client.query('UPDATE ' + battle + ' SET initiative=' + request.body.participants[key].initiative + ' WHERE name=' + request.body.participants[key].name);

	response.send("Initiative updated.");
});

app.post('/add-battle', function(request, response) {
	var battle = request.body.battle;

	client.query('CREATE TABLE IF NOT EXISTS ' + battle + ' (name varchar(255), race varchar(255), class varchar(255), ac int, initiative int)');

	response.send("New battle added.");
});

app.post('/get', function(request, response) {
	var battle = request.body.battle;

	var query = client.query('SELECT * FROM ' + battle);

	query.on('row', function(row, result) {
		result.addRow(row);
	});

	query.on('end', function(result) {
		var output = {"battle":battle};
		output["participants"] = {};

		for(var i = 0; i < result.rowCount; i++)
		{
			output["participants"]["participant" + i.toString()] = {};
			output["participants"]["participant" + i.toString()]["name"] = result.rows[i].name;
			output["participants"]["participant" + i.toString()]["race"] = result.rows[i].race;
			output["participants"]["participant" + i.toString()]["class"] = result.rows[i].class;
			output["participants"]["participant" + i.toString()]["ac"] = result.rows[i].ac.toString();
			output["participants"]["participant" + i.toString()]["initiative"] = result.rows[i].initiative.toString();
		}

		response.send(output);
	});
});

app.post('/battles', function(request, response) {
	var query = client.query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE=\'BASE TABLE\'');
	var counter = 0;

	query.on('row', function(row, result) {
		result.addRow(row);
	});

	query.on('end', function(result) {
		var output = {};

		for(var i = 0; i < result.rowCount; i++)
		{
			if(result.rows[i].table_name.indexOf("pg") != 0 && result.rows[i].table_name.indexOf("sql") != 0)
			{
				output['battle' + counter.toString()] = result.rows[i].table_name;
				counter++;
			}
		}

		response.send(output);
	});
})

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});