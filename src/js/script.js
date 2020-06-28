jQuery(function ($) {
    const htmlBodyElements = $("html, body"),
        windowElement = $(window),
        documentElement = $(document),
        burgerButton = $(".burger-btn"),
        burgerButtonItem = $(".burger-btn__item"),
        headerNavMenu = $(".nav-menu--header"),
        menuLinks = $(".menu__link"),
        scrollToTopButton = $(".scroll-to-top"),
        firstScreenImage = $(".first-section__content .img-content"),
        openPopupButtons = $(".first-section__btn, #send-request, .about-section__btn, .slide__btn"),
        closePopupButton = $(".popup__close-btn"),
        popupWrapper = $(".popup-wrapper"),
        viewportWidth = document.documentElement.clientWidth,
        browserWidth = window.innerWidth,
        diff = (browserWidth - viewportWidth),
        popupElement = document.querySelector(".popup"),
        docElement = document.documentElement;

    const removeNoScrollJump = () => {
        if ($("html").hasClass("no-scroll")) {
            popupElement.style.left = "0";
            docElement.style.paddingRight = diff + "px";
        } else {
            popupElement.style.left = diff + "px";
            docElement.style.paddingRight = "0";
        }
    };

    burgerButton.on("click", () => {
        htmlBodyElements.toggleClass("no-scroll");
        burgerButtonItem.toggleClass("active");
        headerNavMenu.toggleClass("active");
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

    menuLinks.on("click", event => {
        event.preventDefault();
        htmlBodyElements.removeClass("no-scroll");
        burgerButtonItem.removeClass("active");
        headerNavMenu.removeClass("active");
        const targetElementId = $(event.currentTarget).attr("href");
        const offsetFromTopToTargetElement = $(targetElementId).offset().top;
        htmlBodyElements.animate({scrollTop: offsetFromTopToTargetElement}, 1000);
    });

    if (windowElement.width() > 991) {
        const windowHalfWidth = windowElement.width() / 2;
        const windowHalfHeight = windowElement.height() / 2;
        documentElement.on("mousemove", event => {
            let x = event.clientX - windowHalfWidth;
            let y = event.clientY - windowHalfHeight;
            firstScreenImage.css({
                "transform": `translate(${ x / -50 }px, ${ y / -50 }px)`
            });
        });
    }

    windowElement.on("scroll", () => {
        if ($(this).scrollTop() > 100) {
            scrollToTopButton.addClass("active");
        } else {
            scrollToTopButton.removeClass("active");
        }
    });

    scrollToTopButton.on("click", event => {
        event.preventDefault();
        htmlBodyElements.animate({
            scrollTop: 0
        }, 1000);
    });

    openPopupButtons.on("click", event => {
        event.preventDefault();
        popupWrapper.removeClass("hidden");
        htmlBodyElements.addClass("no-scroll");
        removeNoScrollJump();
    });

    popupWrapper.on("click", event => {
        if (event.currentTarget === event.target) {
            $(event.currentTarget).addClass("hidden");
            htmlBodyElements.removeClass("no-scroll");
            removeNoScrollJump();
        }
    });

    closePopupButton.on("click", event => {
        popupWrapper.addClass("hidden");
        htmlBodyElements.removeClass("no-scroll");
        removeNoScrollJump();
    });
});