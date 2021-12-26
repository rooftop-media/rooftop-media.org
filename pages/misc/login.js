function login() {
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  if (username.length < 2) {
    document.getElementById('error').innerHTML = 'Valid username required.';
    return;
  }

  const http = new XMLHttpRequest();
  http.open("POST", "/api/login");
  http.send(JSON.stringify({
    username: username,
    password: password
  }));
  http.onreadystatechange = (e) => {
    console.log(http.responseText)
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText)
      if (!response.error) {
        console.log("Response recieved! Logging you in.")
        localStorage.setItem('session_id', response.session_id);
        _session_id = response.session_id;
        _current_user = response.user_data;
        goto('/you/identity')
      } else {
        document.getElementById('error').innerHTML = response.msg;
      }
    } else {
      document.getElementById('error').innerHTML = "Error registering this user.";
    }
  }
}