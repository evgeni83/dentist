jQuery(function ($) {
    $(".burger-btn").on("click", () => {
        $("html, body").toggleClass("no-scroll");
        $(".nav-menu--header, .burger-btn__item").toggleClass("active");
    });

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

    $(".menu__link").on("click", event => {
        event.preventDefault();
        console.log($(event.currentTarget));
        const targetElementId = $(event.currentTarget).attr("href");
        console.log(targetElementId);
        const offsetFromTopToTargetElement = $(targetElementId).offset().top;
        $("html").animate({ scrollTop: offsetFromTopToTargetElement }, 1000);
    });
});