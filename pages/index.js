//  Main website memory
var _current_page  = window.location.pathname;
var _session_id = localStorage.getItem('session_id');
var _current_user = null;

//  Navigate to a different page.
function goto(page) {
  
  //  Changing the page's URL without triggering HTTP call...
  window.history.pushState({page: "/"}, "Rooftop Media", page);
  if (page == '/') {
    page = '/misc/landing';
  }

  //  Now we'll do the HTTP call here, to keep the SPA frame...
  const http = new XMLHttpRequest();
  http.open("GET", page + ".html");
  http.send();
  http.onreadystatechange = (e) => {
    document.getElementById('main-content').innerHTML = http.responseText;
    _current_page = page;
  }

  update_app_frame();
}

//  Update the sidebar & menu buttons on the app frame.
function update_app_frame() {
  //  Update the sidebar's selected link.
  var selected_elements = document.getElementsByClassName('selected');
  for (var i = 0; i < selected_elements.length; i++) {
    selected_elements[i].classList.remove('selected');
  }
  var linkParts = _current_page.split('/');
  var linkId = linkParts[1] + '-' + linkParts[2];
  if (document.getElementById(linkId)) {
    document.getElementById(linkId).classList.add('selected');
  }

  //  Hide the sidebar for pages without a side bar. 
  if (linkParts[1] == 'misc') {
    document.getElementById('side-bar').style.display = "none";
  } else {
    document.getElementById('side-bar').style.display = "block";
  }
  
  //  Set up admin page.
  if (linkParts[2] == 'admin') {
    get_admin_tables()
  }

  //  Update the user buttons.
  if (_current_user && _current_user.username && _session_id) {
    document.getElementById('user-buttons').innerHTML = `<button onclick="logout()">Log out</button>`;
    document.getElementById('user-buttons').innerHTML += `<button>${_current_user.username}</button>`;
    document.getElementById('user-buttons').innerHTML += `<button onclick="goto('/misc/admin')">Admin Page</button>`;
  } else {
    document.getElementById('user-buttons').innerHTML = `<button onclick="goto('/misc/login')">Log in</button>`;
    document.getElementById('user-buttons').innerHTML += `<button onclick="goto('/misc/register')">Register</button>`;
    document.getElementById('user-buttons').innerHTML += `<button onclick="goto('/misc/admin')">Admin Page</button>`;
  }
}

//  Boot the page.
function boot() {
  
  //  Log user in if they have a session id. 
  if (_session_id) {
    const http = new XMLHttpRequest();
    http.open("POST", "/api/user-by-session");
    http.send(_session_id);
    http.onreadystatechange = (e) => {
      if (http.readyState == 4 && http.status == 200) {
        _current_user = JSON.parse(http.responseText);
        update_app_frame()
      }
    }
  }
  
  //  Redirect away from register or login if we're logged in.
  if ((_current_page == '/misc/register' || _current_page == '/misc/login') && _session_id != '') {
    _current_page = '/you/identity';
  }

  //  Go to the page. 
  goto(_current_page);
}
window.addEventListener('load', (event) => {
  boot()
});

//  Log out
function logout() {
  localStorage.setItem('session_id', '')
  _session_id = null;
  _current_user = null;
  goto('/misc/login');
}
