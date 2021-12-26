//  Server script
//  Run "node server.js" to host rooftop-media.org locally.

console.log("\x1b[32m >\x1b[0m Starting the rooftop server, at \x1b[36mlocalhost:8080\x1b[0m !");

//  Importing libraries
var http = require('http');
var path = require('path');
var fs   = require('fs');

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
		var file = "";
		try {
			file = fs.readFileSync( __dirname + "/../pages" + url );
		} catch {
			file = fs.readFileSync( __dirname + "/../pages/misc/404.html" );
		}
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(file);
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
	console.log(`api route: ${api_route}`);

	if (api_route == "/api/get-tables") {
		let all_tables = DataBase.all_tables();
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(JSON.stringify(all_tables));
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
		req_data = JSON.parse(req_data);
    
		if (api_route == "/api/register") {
			//  Make sure the user submitted doesn't have duplicate info...
			let user_data = fs.readFileSync(__dirname + '/database/table_data/users.json', 'utf8')
			user_data = JSON.parse(user_data);
			let response = {
				error: false,
				msg: '',
				session_id: ''
			}
			let is_unique = true;
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
			//  If it's not a duplicate, add an id, encrypt the pass, and save it. 
			if (!response.error) {
				req_data.id = user_data.length;
				req_data.salt = crypto.randomBytes(16).toString('hex');
				req_data.password = crypto.pbkdf2Sync(req_data.password, req_data.salt, 1000, 64, `sha512`).toString(`hex`);
				
				// DataBase.table('users').insert(req_data);
				user_data.push(req_data);
				fs.writeFileSync(__dirname + '/database/table_data/users.json', JSON.stringify(user_data));
			}
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(JSON.stringify(response));
			res.end();
		
		} else if (api_route == "/api/login") {

		}
  })
	
}