// menu toggle
$(function () {
  $(".menu-toggle").on("click", function () {
    var $toggle = $(this);

    $toggle.toggleClass("active").siblings(".menu-sub").slideToggle();

    $toggle.siblings(".menu-mega").children(".menu-sub").slideToggle();

    $toggle.parent().siblings(".menu-item-group").children(".menu-sub").slideUp();

    $toggle.parent().siblings(".menu-item-group").children(".menu-mega").children(".menu-sub").slideUp();

    $toggle.parent().siblings(".menu-item-group").children(".menu-toggle").removeClass("active");
  });

  $(".menu-item-group > .menu-link, .menu-item-mega > .menu-link").on("click", function (e) {
    if ($(window).width() < 1200 || !mobileAndTabletCheck()) return;

    e.preventDefault();
  });
});

// navbar mobile toggle
$(function () {
  var $body = $("html, body");
  var $navbar = $(".js-navbar");
  var $navbarToggle = $(".js-navbar-toggle");

  $navbarToggle.on("click", function () {
    $navbarToggle.toggleClass("active");
    $navbar.toggleClass("is-show");
    $body.toggleClass("overflow-hidden");
  });
});

$(function () {
  var $moveTop = $(".btn-movetop");
  var $window = $(window);
  var $body = $("html");

  if (!$moveTop.length) return;

  $window.on("scroll", function () {
    if ($window.scrollTop() > 150) {
      $moveTop.addClass("show");

      return;
    }

    $moveTop.removeClass("show");
  });

  $moveTop.on("click", function () {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  });
});

const gameControl = {

  arr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],

  playing: false,

  time: 60,

  interval: null,

  isCompleted: false,

  currentStage: 1,

  stageCount: 1,

  stageTime: 0,

  stagePoint: 0,

  totalTime: 0,

  totalPoint: 0

};

const classesToRemove = gameControl.arr.reduce((carry, item, index) => {

  return carry + ' ' + 'cell--' + index;
}, '');

$(function () {

  const $game = $('.game');

  gameControl.isCompleted = false;

  gameControl.currentStage = 1;

  gameControl.stageCount = Number($game.data('stage-count'));

  gameControl.stageTime = Number($game.data('stage-time'));

  gameControl.stagePoint = Number($game.data('stage-point'));

  gameControl.totalTime = 0;

  gameControl.totalPoint = 0;

  $('.cell').on('click', function (e) {

    e.preventDefault();

    const index = Number($(this).data('index'));

    const value = gameControl.arr[index];

    if (value === 0 || value === 1 || value === 2) return false;

    if (isSlideAble(index)) {

      const zeroIndex = getZeroIndex();

      gameControl.arr[zeroIndex] = value;

      gameControl.arr[index] = 0;

      reIndexing();

      if (checkResult()) {

        gameControl.isCompleted = true;

        gameFinish();
      }
    }
  });

  $('.game__start').on('click', gameStart);
});

function gameStart() {

  const $timeRemaining = $('.game__remaining');

  $('.game').addClass('unlock');

  shuffle();

  clearInterval(gameControl.interval);

  gameControl.isCompleted = false;

  gameControl.playing = true;

  gameControl.time = gameControl.stageTime;

  gameControl.interval = setInterval(() => {

    gameControl.time--;

    $timeRemaining.text(gameControl.time + 's');

    if (!gameControl.time) gameFinish();
  }, 1000);
}

function gameFinish() {

  gameControl.playing = false;

  gameControl.totalPoint += gameControl.isCompleted ? gameControl.stagePoint : 0;

  gameControl.totalTime += gameControl.stageTime - gameControl.time;

  let seconds = Math.floor(gameControl.totalTime % 60);

  let minutes = Math.floor(gameControl.totalTime / 60 % 60);

  let timeText = minutes + ':' + seconds;

  clearInterval(gameControl.interval);

  $('.summary__total-point').text(gameControl.totalPoint);

  $('.summary__total-time').text(timeText);

  if (gameControl.isCompleted && gameControl.currentStage < gameControl.stageCount) {

    const $game = $('.game');

    gameControl.currentStage++;

    $game.removeClass('game--stage-1 game--stage-2 game--stage-3 game--stage-4 game--stage-5 game--stage-6 game--stage-7 game--stage-8 game--stage-9 game--stage-10');

    $game.addClass('game--stage-' + gameControl.currentStage);

    gameStart();
  } else {

    $('.game').removeClass('unlock').addClass('finish');

    if (window.onFinishAllStages && typeof window.onFinishAllStages === 'function') {

      window.onFinishAllStages(gameControl);
    }
  }
}

function reIndexing() {

  const $cell = $('.cell');

  $cell.removeClass(classesToRemove);

  gameControl.arr.forEach((value, index) => {

    $cell.eq(value).addClass('cell--' + index).data('index', index);
  });
}

function isSlideAble(index) {

  const sideBySide = getSideBySide(index);

  const zeroIndex = getZeroIndex();

  return sideBySide.includes(zeroIndex);
}

function getZeroIndex() {

  for (let i = 0; i < gameControl.arr.length; i++) {

    if (gameControl.arr[i] === 0) return i;
  }

  return 0;
}

function getSideBySide(index) {

  const items = [];

  if (index - 3 >= 0) items.push(index - 3);

  if (index % 3 > 0) items.push(index - 1);

  if (index % 3 < 2) items.push(index + 1);

  if (index + 3 < 12) items.push(index + 3);

  return items.filter(index => index !== 1 && index !== 2);
}

function checkResult() {

  let maxValue = 0;

  let errorIndex = gameControl.arr.findIndex(item => {

    if (item < maxValue) return true;

    maxValue = item;

    return false;
  });

  return errorIndex < 0;
}

function shuffle() {

  for (let i = 0; i < 1000; i++) {

    randomMove();
  }

  reIndexing();
}

function randomMove() {

  const zeroIndex = getZeroIndex();

  const sideBySide = getSideBySide(zeroIndex);

  const randomIndex = sideBySide[Math.floor(Math.random() * sideBySide.length)];

  gameControl.arr[zeroIndex] = gameControl.arr[randomIndex];

  gameControl.arr[randomIndex] = 0;
}