jQuery(function ($) {
  $(".burger-btn").on("click", () => {
    $("html, body").toggleClass("no-scroll");
    $(".nav-menu--header, .burger-btn__item").toggleClass("active");
  })

  $(".services-section__slider").slick({
    infinite: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });
});