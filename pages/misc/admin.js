function get_admin_tables() {
  if (!document.getElementById('admin-side-bar')) {
    return;
  }
  const http = new XMLHttpRequest();
  http.open("get", "/api/get-tables");
  http.send();
  http.onreadystatechange = (e) => {
    
    if (http.readyState == 4 && http.status == 200) {
      let tables = JSON.parse(http.responseText);
      document.getElementById('admin-side-bar').innerHTML = `<div class="sidebar-section">Tables<hr /></div>`;
      for (let i = 0; i < tables.length; i++) {
        let link_html = `<div class="sidebar-link" id="${tables[i].snakecase}" onclick="select_table('${tables[i].snakecase}')">${tables[i].name}</div>`
        document.getElementById('admin-side-bar').innerHTML += link_html;
        console.log(tables[i].name)
      }
    }
    
  }
}

//  Select a table.
function select_table(table_name) {
  //  Update sidebar link style.
  var selected_elements = document.getElementsByClassName('selected');
  for (var i = 0; i < selected_elements.length; i++) {
    selected_elements[i].classList.remove('selected');
  }
  document.getElementById(table_name).classList.add('selected');

  //  Get & display data.
  const http = new XMLHttpRequest();
  http.open("get", `/api/${table_name}-table`);
  http.send();
  http.onreadystatechange = (e) => {
    
    if (http.readyState == 4 && http.status == 200) {
      let table = JSON.parse(http.responseText);
      document.getElementById('table-name').innerHTML = table.name
      console.log(table)
      let db_table_html = '<thead><tr>';
      console.log(table.columns)
      for (let i = 0; i < table.columns.columns.length; i++) {
        db_table_html += `<td>${table.columns.columns[i].name}</td>`;
      }
      db_table_html += '</tr></thead><tbody>';
      // rows here
      for (let i = 0; i < table.rows.length; i++) {
        db_table_html += `<tr>`;
        for (let j = 0; j < table.columns.columns.length; j++) {
          let key = table.columns.columns[j].snakecase;
          db_table_html += `<td>${table.rows[i][key]}</td>`;
        }
        db_table_html += `</tr>`;
      }
      document.getElementById('db-table').innerHTML = db_table_html + '</tbody>';
    }
    
  }
}

setTimeout(get_admin_tables, 200)
