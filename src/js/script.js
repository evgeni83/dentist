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
        $("html, body").removeClass("no-scroll");
        $(".nav-menu--header, .burger-btn__item").removeClass("active");
        const targetElementId = $(event.currentTarget).attr("href");
        const offsetFromTopToTargetElement = $(targetElementId).offset().top;
        $("html").animate({scrollTop: offsetFromTopToTargetElement}, 1000);
    });

    if ($(window).width() > 991) {
        const firstScreenImage = $(".first-section__content .img-content");
        const windowHalfWidth = $(window).width() / 2;
        const windowHalfHeight = $(window).height() / 2;
        $(document).on("mousemove", event => {
            let x = event.clientX - windowHalfWidth;
            let y = event.clientY - windowHalfHeight;
            firstScreenImage.css({
                "transform": `translate(${ x / -50 }px, ${ y / -50 }px)`
            });
        });
    }

    $(window).on("scroll", () => {
        if ($(this).scrollTop() > 100) {
            $(".scroll-to-top").addClass("active");
        } else {
            $(".scroll-to-top").removeClass("active");
        }
    });

    $(".scroll-to-top").on("click", event => {
        event.preventDefault();
        $("html").animate({
            scrollTop: 0
        }, 1000);
    });
});