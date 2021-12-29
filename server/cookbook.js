//  Script tools to add and edit records in the database.

var path = require('path');
var fs   = require('fs');

class Cookbook {
  constructor(page_name) {
    this.page_name = page_name;
    try {
      this.full_text = fs.readFileSync( __dirname + "/../pages" + page_name, 'utf8' );
    } catch {
      this.full_text = fs.readFileSync( __dirname + "/../pages/misc/404.html", 'utf8' );
    }
    this.template = this.full_text.split('<template>')[1];
    this.template = this.template.split('</template>')[0];

    this.js = this.full_text.split('<script>')[1];
    if (this.js) {
      this.js = this.js.split('</script>')[0];
    }

    this.css = this.full_text.split('<style>')[1];
    if (this.css) {
      this.css = this.css.split('<style>')[0];
    }

  }

  
}

module.exports = {
  cook(file_name) {
    return new Cookbook(file_name);
  }
}