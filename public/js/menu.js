var leftMenu = document.querySelector('.sidebar');
var btnClose = document.querySelector('.sidebar__close');

var burgerMenu = document.querySelector('.inner-page__menu');

burgerMenu.addEventListener('click', function() {
  leftMenu.classList.add('sidebar--show');
  burgerMenu.classList.add('inner-page__menu--closed');
});

btnClose.addEventListener('click', function() {
  if (leftMenu.classList.contains('sidebar--show') && burgerMenu.classList.contains('inner-page__menu--closed')) {
    leftMenu.classList.remove('sidebar--show');
    burgerMenu.classList.remove('inner-page__menu--closed');
  }
});

