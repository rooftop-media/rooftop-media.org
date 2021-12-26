function register() {
  var username = document.getElementById('username').value;
  var email = document.getElementById('email').value;
  var phone = document.getElementById('phone').value;
  var password = document.getElementById('password').value;
  var password_confirm = document.getElementById('password_confirm').value;
  if (password != password_confirm) {
    document.getElementById('error').innerHTML = 'Passwords must match.';
    return;
  }
  if (username.length < 2) {
    document.getElementById('error').innerHTML = 'Valid username required.';
    return;
  }

  const http = new XMLHttpRequest();
  http.open("POST", "/api/register");
  http.send(JSON.stringify({
    username: username,
    email,
    phone,
    password
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
        goto('/you/identity')
      }
      console.log("Error:" + response.msg)
      document.getElementById('error').innerHTML = response.msg;
    } else {
      document.getElementById('error').innerHTML = "Error registering this user.";
    }
  }
}