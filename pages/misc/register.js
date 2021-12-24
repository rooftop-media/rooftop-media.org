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
  http.send({
    username,
    email,
    phone,
    password
  });
  http.onreadystatechange = (e) => {
    console.log("Response recieved! Updating page content.")
    document.getElementById('main-content').innerHTML = http.responseText;
    current_page = page;
  }
}