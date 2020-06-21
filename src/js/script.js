$(document).ready(function () {
  $(".burger-btn").on("click", () => {
    $("html, body").toggleClass("no-scroll");
    $(".nav-menu--header, .burger-btn__item").toggleClass("active");
  })
});