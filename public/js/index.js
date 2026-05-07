$(".clear-cookie").on("click", function() {
  Cookies.remove('colorboxShown');
});

$(".order-cheezburger").on("click", function() {
  $.colorbox.close();
});

function onPopupOpen() {
  $("#modal-content").show();
  $("#yurEmail").focus();
}

function onPopupClose() {
  $("#modal-content").hide();
  Cookies.set('colorboxShown', 'yes', {
    expires: 1
  });
  $(".clear-cookie").fadeIn();
  lastFocus.focus();
}

function displayPopup() {
  $.colorbox({
    inline: true,
    href: "#modal-content",
    className: "cta",
    width: 600,
    height: 350,
    onComplete: onPopupOpen,
    onClosed: onPopupClose
  });
}

var lastFocus;
var popupShown = Cookies.get('colorboxShown');

if (popupShown) {
  console.log("Cookie found. No action necessary");
  $(".clear-cookie").show();
} else {
  console.log("No cookie found. Opening popup in 3 seconds");
  setTimeout(function() {
    lastFocus = document.activeElement;
    displayPopup();
  }, 3000);
}