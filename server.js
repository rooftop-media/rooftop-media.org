//  Server script
//  Run "node server.js" to host rooftop-media.org locally.

console.log("Starting the rooftop server, at localhost:8080 !");

var http = require('http');
var path = require('path');
var fs   = require('fs');

var server = http.createServer(
    function (req, res) { 
	
	var url = req.url;
	console.log("New request: " + url);
	var extname = String(path.extname(url)).toLowerCase();
	
	/*  Page urls have no extension.   */
	if (extname.length == 0) {
	
	    res.writeHead(200, {'Content-Type': 'text/html'});
	    var main_page = fs.readFileSync('./pages/index.html');
	    res.write(main_page);
	    res.end();

	    if (url == "/") {

	    } else if (url == "/kw" || url == "/kitchenware") {
		
	    }
	}
	/*  It's a single page app -- when it requests html, it uses .html.      */
	else if (extname == ".html") {
	    var file = fs.readFileSync( __dirname + "/pages" + url );
	    res.writeHead(200, {'Content-Type': 'text/html'});
	    res.write(file);
	    res.end();
	}
	/*  We also might be pinged for a .png, or something. Handle that here.  */
	else {
	    fs.readFile( __dirname + url, function(error, content) {
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