//  Script tools to add and edit records in the database.

var path = require('path');
var fs   = require('fs');

class Table {
  constructor(name) {
    this.name = name;
    this.columns = JSON.parse(fs.readFileSync(`${__dirname}/table_columns/${name}.json`, 'utf8'));
    this.rows = JSON.parse(fs.readFileSync(`${__dirname}/table_rows/${name}.json`, 'utf8'));
  }

  find(query) {
    let query_keys = Object.keys(query);
    let results = [];
    for (let i = 0; i < this.rows.length; i++) {
      let is_result = true;
      for (let j = 0; j < query_keys.length; j++) {
        let key = query_keys[j];
        if (this.rows[i][key] != query[key]) {
          is_result = false;
        }
      }
      if (is_result) {
        results.push(this.rows[i]);
      }
    }
    return results;
  }

  insert(row_data) {
    row_data.id = this.columns.max_id;
    this.columns.max_id++;
    this.rows.push(row_data);
    fs.writeFileSync(`${__dirname}/table_rows/${this.name}.json`, JSON.stringify(this.rows, null, 2));
    fs.writeFileSync(`${__dirname}/table_columns/${this.name}.json`, JSON.stringify(this.columns, null, 2));
    return row_data.id;
  }

  add_or_update(query, update) {
    //  Look for row to update...
    let query_keys = Object.keys(query);
    console.log('Looking for...')
    console.log(query);
    for (let i = 0; i < this.rows.length; i++) {
      let is_row = true;
      for (let j = 0; j < query_keys.length; j++) {
        let key = query_keys[j];
        if (this.rows[i][key] != query[key]) {
          is_row = false;
        }
      }
      if (is_row) {
        let update_keys = Object.keys(update);
        for (let j = 0; j < update_keys.length; j++) {
          this.rows[i][update_keys[j]] = update[update_keys[j]];
        }
        fs.writeFileSync(`${__dirname}/table_rows/${this.name}.json`, JSON.stringify(this.rows, null, 2));
        return;
      }
    }
    //  If we didn't find it, insert a new record.
    this.insert(update);
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
    let table_files = fs.readdirSync(__dirname + '/table_columns')
		let all_tables = [];
		for (let i = 0; i < table_files.length; i++) {
			let table_file = table_files[i];
			let table_data = fs.readFileSync(__dirname + '/table_columns/' + table_file, 'utf8')
			all_tables.push(JSON.parse(table_data));
		}
    return all_tables;
  }
}