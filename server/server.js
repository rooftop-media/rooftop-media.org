//  Server script
//  Run "node server.js" to host rooftop-media.org locally.

console.log("Starting the rooftop server, at localhost:8080 !");

//  Importing libraries
var http = require('http');
var path = require('path');
var fs   = require('fs');

//  This function will fire upon every request to our server.
function server_request(req, res) {
	var url = req.url;
	console.log("New request: " + url);
	var extname = String(path.extname(url)).toLowerCase();
	
	/*  Routes that start with 'api' are handled by the api_routes function, below.  */
	if (extname.length == 0 && url.split('/')[1] == 'api') {
		api_routes(url, res);
	
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
		console.log("Fetching asset at")
		console.log(__dirname + '/..' + url)
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


//  This function fires when an /api/ route is requested. 
function api_routes(api_route, res) {
	console.log(`api route: ${api_route}`);

	if (api_route == "/api/get-tables") {
		let table_files = fs.readdirSync(__dirname + '/database/table_headers')
		var all_tables = [];
		for (let i = 0; i < table_files.length; i++) {
			let table_file = table_files[i];
			console.log(table_file)
			let table_data = fs.readFileSync(__dirname + '/database/table_headers/' + table_file, 'utf8')
			console.log(JSON.parse(table_data));
			all_tables.push(JSON.parse(table_data));
		}
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(JSON.stringify(all_tables));
		res.end();
	}
}