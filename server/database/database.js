//  Script tools to add and edit records in the database.

var path = require('path');
var fs   = require('fs');

class Table {
  constructor(name) {
    this.name = name;
    this.columns = fs.readFileSync(__dirname + '/table_headers/' + name, 'utf8');
    this.rows = fs.readFileSync(__dirname + '/table_data/' + name, 'utf8');
  }

  find(query) {

  }

  insert(row_data) {

  }

  update(query, update) {

  }

  delete(query) {

  }
}

module.exports = {

  table: function(table_name) {
    return new Table(table_name);
  },

  all_tables: function() {
    let table_files = fs.readdirSync(__dirname + '/table_headers')
		var all_tables = [];
		for (let i = 0; i < table_files.length; i++) {
			let table_file = table_files[i];
			let table_data = fs.readFileSync(__dirname + '/table_headers/' + table_file, 'utf8')
			all_tables.push(JSON.parse(table_data));
		}
    return all_tables;
  }
}