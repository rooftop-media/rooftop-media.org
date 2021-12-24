function get_admin_tables() {
  const http = new XMLHttpRequest();
  http.open("get", "/api/get-tables");
  http.send();
  http.onreadystatechange = (e) => {
    
    if (http.readyState == 4 && http.status == 200) {
      let tables = JSON.parse(http.responseText);
      document.getElementById('admin-side-bar').innerHTML = `<div class="sidebar-section">Tables<hr /></div>`;
      for (let i = 0; i < tables.length; i++) {
        document.getElementById('admin-side-bar').innerHTML += `<div class="sidebar-link">${tables[i].name}</div>`;
      }
      
    }
    
  }
}

get_admin_tables();