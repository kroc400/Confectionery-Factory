const burger = document.querySelector('header .hd-right .hd-burger');
const burgerMenu = document.querySelector('.burger-menu')

burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    burgerMenu.classList.toggle('active');

})