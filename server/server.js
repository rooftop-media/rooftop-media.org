//  Server script
//  Run "node server.js" to host rooftop-media.org locally.

console.log("\x1b[32m >\x1b[0m Starting the rooftop server, at \x1b[36mlocalhost:8080\x1b[0m !");

//  Importing libraries
var http = require('http');
var path = require('path');
var fs   = require('fs');
const Cookbook = require('./cookbook.js');

//  This function will fire upon every request to our server.
function server_request(req, res) {
	var url = req.url;
	console.log(`\x1b[36m >\x1b[0m New ${req.method} request: \x1b[34m${url}\x1b[0m`);
	var extname = String(path.extname(url)).toLowerCase();
	
	/*  Routes that start with 'api' are handled by the api_routes function, below.  */
	if (extname.length == 0 && url.split('/')[1] == 'api') {
		if (req.method == "GET") {
			api_GET_routes(url, res);
		} else if (req.method == "POST") {
			api_POST_routes(url, req, res);
		}
		
	
	/*  Routes with no extension get index.html, the SPA frame.   */
	} else if (extname.length == 0) {
	
			res.writeHead(200, {'Content-Type': 'text/html'});
			var main_page = fs.readFileSync(__dirname + '/../pages/index.html');
			res.write(main_page);
			res.end();

			// if (url == "/") {  } else if (url == "/admin") { }
	}

	/*  Getting a page for inside the SPA frame.                   */
	else if (extname == ".html") {
		let page_book = Cookbook.cook(url);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(JSON.stringify(page_book));
		res.end();
	}

	/*  We also might be pinged for a .png, or something. Handle that here.  */
	else {
		fs.readFile( __dirname + '/..' + url, function(error, content) {
			if (error) {
					if(error.code == 'ENOENT') {
						fs.readFile('./404.html', function(error, content) {
							res.writeHead(404, { 'Content-Type': 'text/html' });
							res.end(content, 'utf-8');
						});
					}
					else {
				res.writeHead(500);
				res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
					}
			} else {
					var contentType = mimeTypes[extname] || 'application/octet-stream';
					res.writeHead(200, { 'Content-Type': contentType });
					res.end(content, 'utf-8');
			}
		});
	}

}


//  Creating the server!
var server = http.createServer(
	server_request
);
server.on('close', () => {
	console.log("\x1b[31m >\x1b[0m Shutting down server. Bye!")
})
process.on('SIGINT', function() {
  server.close();
});
server.listen(8080);


//  This dictionary is used in the setup function above. 
var mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};


////
////  API section
////
const DataBase = require('./database/database.js');
var crypto = require('crypto');

//  This function fires when an /api/ route is requested with the GET method. 
function api_GET_routes(api_route, res) {

	if (api_route == "/api/get-tables") {
		let all_tables = DataBase.all_tables();
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(JSON.stringify(all_tables));
		res.end();
	}
	else if (api_route == "/api/users-table") {
		let user_table = DataBase.table('users');
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(JSON.stringify(user_table));
		res.end();
	}
	else if (api_route == "/api/sessions-table") {
		let sessions_table = DataBase.table('sessions');
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(JSON.stringify(sessions_table));
		res.end();
	}
	else if (api_route == "/api/user_jobs-table") {
		let user_jobs_table = DataBase.table('user_jobs');
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(JSON.stringify(user_jobs_table));
		res.end();
	}
	else if (api_route == "/api/user_health-table") {
		let user_health_table = DataBase.table('user_health');
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(JSON.stringify(user_health_table));
		res.end();
	}
	
}

//  HTTP calls with /api/ routes and a POST method. 
function api_POST_routes(api_route, req, res) {
	let req_data = '';
  req.on('data', chunk => {
    req_data += chunk;
  })
  req.on('end', () => {
    
		if (api_route == "/api/register") {
			//  Make sure the user submitted doesn't have duplicate info...
			req_data = JSON.parse(req_data);
			let user_data = fs.readFileSync(__dirname + '/database/table_rows/users.json', 'utf8')
			user_data = JSON.parse(user_data);
			let response = {
				error: false,
				msg: '',
				session_id: ''
			}
			for (let i = 0; i < user_data.length; i++) {
				if (user_data[i].username == req_data.username) {
					response.error = true;
					response.msg = 'Username already taken.';
				} else if (user_data[i].email == req_data.email) {
					response.error = true;
					response.msg = 'Email already taken.';
				} else if (user_data[i].phone == req_data.phone) {
					response.error = true;
					response.msg = 'Phone number already taken.';
				}
			}
			//  If it's not a duplicate, encrypt the pass, and save it. 
			if (!response.error) {
				req_data.salt = crypto.randomBytes(16).toString('hex');
				req_data.password = crypto.pbkdf2Sync(req_data.password, req_data.salt, 1000, 64, `sha512`).toString(`hex`);
				//  Add the user to the db.
				let user_id = DataBase.table('users').insert(req_data);
				//  Add a session to the db.
				let expire_date = new Date()
				expire_date.setDate(expire_date.getDate() + 30);
				response.session_id = DataBase.table('sessions').insert({
					user_id: user_id,
					expires: expire_date
				})
			}
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(JSON.stringify(response));
			res.end();
		} 

		//  Log user in.
		else if (api_route == "/api/login") {
			res.writeHead(200, {'Content-Type': 'text/html'});
			req_data = JSON.parse(req_data);
			let user_data = DataBase.table('users').find({ username: req_data.username });
			let response = {
				error: false,
				msg: '',
				user_data: '',
				session_id: ''
			}
			if (user_data.length < 1) {
				response.error = true;
				response.msg = 'No user found.';
				res.write(JSON.stringify(response));
				res.end();
				return;
			}
			let password = crypto.pbkdf2Sync(req_data.password, user_data[0].salt, 1000, 64, `sha512`).toString(`hex`);
			if (password != user_data[0].password) {
				response.error = true;
				response.msg = 'Incorrect password.';
			} else {
				response.user_data = user_data[0];
				let expire_date = new Date()
				expire_date.setDate(expire_date.getDate() + 30);
				response.session_id = DataBase.table('sessions').insert({
					user_id: user_data[0].id,
					expires: expire_date
				})
			}
			res.write(JSON.stringify(response));
			res.end();
		}

		//  Get user by user session. (Yes this is a POST)
		else if (api_route == "/api/user-by-session") {
			res.writeHead(200, {'Content-Type': 'text/html'});
			let session_data = DataBase.table('sessions').find({ id: req_data });
			if (session_data.length < 1) {
				res.write("No session found.");
				res.end();
				return;
			}
			let user_data = DataBase.table('users').find({ id: session_data[0].user_id });
			if (user_data.length < 1) {
				res.write(`No user found for session ${session_data[0].id}.`);
				res.end();
			} else {
				res.write(JSON.stringify(user_data[0]));
				res.end();
			}
		}

		//  Update user job info.
		else if (api_route == "/api/update-user-job") {
			res.writeHead(200, {'Content-Type': 'text/html'});
			req_data = JSON.parse(req_data);
			DataBase.table('user_jobs').add_or_update(
				{ user_id: req_data.user_id },
				req_data
			);
		}
		//  Get job info by user ID
		else if (api_route == "/api/user-job-by-user") {
			res.writeHead(200, {'Content-Type': 'text/html'});
			let user_job_data = DataBase.table('user_jobs').find({ user_id: req_data });
			if (user_job_data.length < 1) {
				console.log('{error: no job found}')
				res.write("{error: no job found}");
				res.end();
				return;
			}
			res.write(JSON.stringify(user_job_data[0]));
			res.end();
		}

		//  Update user house info.
		else if (api_route == "/api/update-user-house") {
			res.writeHead(200, {'Content-Type': 'text/html'});
			req_data = JSON.parse(req_data);
			DataBase.table('user_houses').add_or_update(
				{ user_id: req_data.user_id },
				req_data
			);
		}
		//  Get house info by user ID
		else if (api_route == "/api/user-house-by-user") {
			res.writeHead(200, {'Content-Type': 'text/html'});
			let user_house_data = DataBase.table('user_houses').find({ user_id: req_data });
			if (user_house_data.length < 1) {
				console.log('{error: no house found}')
				res.write("{error: no house found}");
				res.end();
				return;
			}
			res.write(JSON.stringify(user_house_data[0]));
			res.end();
		}

		//  Update user health info.
		else if (api_route == "/api/update-user-health") {
			res.writeHead(200, {'Content-Type': 'text/html'});
			req_data = JSON.parse(req_data);
			DataBase.table('user_health').add_or_update(
				{ user_id: req_data.user_id },
				req_data
			);
		}
		//  Get health info by user ID
		else if (api_route == "/api/user-health-by-user") {
			res.writeHead(200, {'Content-Type': 'text/html'});
			let user_health_data = DataBase.table('user_health').find({ user_id: req_data });
			if (user_health_data.length < 1) {
				console.log('{error: no health found}')
				res.write("{error: no health found}");
				res.end();
				return;
			}
			res.write(JSON.stringify(user_health_data[0]));
			res.end();
		}

  })
	
}