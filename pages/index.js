// Memory
var current_page  = window.location.pathname;
var pages = ['/home', '/you/identity', '/you/job', '/storefront', '/about-us'];

//  Navigate to a different page.
function goto(page) {
  //  Changing the page's URL without triggering HTTP call...
  window.history.pushState({page: "/"}, "Rooftop Media", page);
  //  Now we'll do the HTTP call here, to keep the SPA frame...
  const http = new XMLHttpRequest();
  http.open("GET", page + ".html");
  http.send();
  http.onreadystatechange = (e) => {
    console.log("Response recieved! Updating page content.")
    document.getElementById('main-content').innerHTML = http.responseText;
    current_page = page;
  }
  //  Finally, update the sidebar's selected link.
  var selected_elements = document.getElementsByClassName('selected');
  for (var i = 0; i < selected_elements.length; i++) {
    selected_elements[i].classList.remove('selected');
  }
  var linkParts = page.split('/');
  var linkId = linkParts[1] + '-' + linkParts[2];
  if (document.getElementById(linkId)) {
    document.getElementById(linkId).classList.add('selected');
  }
}
//  Boot the page.
function boot() {
  goto(current_page);
}