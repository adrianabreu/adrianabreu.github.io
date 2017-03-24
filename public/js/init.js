(function ($) {
  $(function () {

    $('.button-collapse').sideNav();
    $('.parallax').parallax();
    $('#introDownArrow').click(function () {
      $('html, body').animate({
        scrollTop: $("#projectWrapper").offset().top
      }, 750);
    });

  }); // end of document ready
})(jQuery); // end of jQuery name space