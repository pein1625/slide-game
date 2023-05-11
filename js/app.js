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

let modalTimeout = null;

function hideModal() {

  const $modal = $('.modal.show');

  if ($modal.length) {

    $modal.modal('hide');
  }
}

function showModal(modalSelector, cb) {

  hideModal();

  const $modal = $(modalSelector);

  if ($modal.length) {

    clearTimeout(modalTimeout);

    modalTimeout = setTimeout(() => {

      if (cb && typeof cb === 'function') cb();

      $modal.modal('show');
    }, 300);
  }
}

function timeFormat(time, type = 1) {

  let seconds = Math.floor(time % 60);

  let minutes = Math.floor(time / 60 % 60);

  if (type === 1) {

    seconds = ('0' + seconds).slice(-2);

    return minutes + ':' + seconds;
  }

  if (type === 2) {

    minutes = minutes ? minutes + ' phút' : '';

    seconds = seconds ? seconds + ' giây' : '';

    return [minutes, seconds].filter(time => time).join(' ');
  }

  return '';
}

// file input

$(function () {

  $(".js-file-input").on("change", function () {

    var fileName = $(this).val().split(/\\|\//).pop();

    $(this).closest(".js-file").find(".js-file-text").text(fileName);

    var target = $(this).data("target");

    if (target) {

      readURL(this, target);
    }
  });

  function readURL(input, target) {

    if (input.files && input.files[0]) {

      var reader = new FileReader();

      reader.onload = function (e) {

        $(target).show();

        $(target).attr("src", e.target.result);
      };

      reader.readAsDataURL(input.files[0]);
    }
  }
});

$(function () {

  $('.js-switch-modal').on('click', function (e) {

    e.preventDefault();

    let target = $(this).attr('href');

    if (!target) {

      target = $(this).data('target');
    }

    $(this).closest('.modal').modal('hide');

    if (target && $(target).length) {

      setTimeout(() => {

        $(target).modal('show');
      }, 300);
    }
  });
});

const GAME = {
  arr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  playing: false,
  time: 0,
  interval: null,
  isCompleted: false,
  currentStage: 0,
  stages: [],
  stageTime: 0,
  stagePoint: 0,
  totalTime: 0,
  totalPoint: 0,
  el: null
};

const classesToRemove = GAME.arr.reduce((carry, item, index) => {
  return carry + ' ' + 'cell--' + index;
}, '');

$(function () {
  gameLoading();
});

async function gameLoading() {
  const slideGameData = await getSlideGameData();

  GAME.stages = slideGameData.stages;
  GAME.stageTime = slideGameData.stageTime;
  GAME.stagePoint = slideGameData.stagePoint;

  GAME.el = $('.js-slide-game');

  GAME.el.on('click', '.js-game-start', gameStart);

  GAME.el.on('click', '.cell', onCellClick);

  GAME.el.on('click', '.js-game-continue', nextStage);

  nextStage();
}

function nextStage() {
  GAME.arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  GAME.time = 0;
  GAME.interval = null;
  GAME.isCompleted = false;

  if (GAME.currentStage === GAME.stages.length) {
    return onAllStageFinish();
  }

  const stage = GAME.stages[GAME.currentStage];
  const cellImages = [,,, ...stage.images];

  GAME.el.find('.cell').each(function (index, el) {
    if (!cellImages[index]) return;

    $(el).empty().append(`<img class="cell-img" src="${cellImages[index]}" alt="">`);
  });

  GAME.el.find('.game__remaining').text(`${GAME.stageTime - GAME.time}s`);

  reIndexing();
}

function onStageFinish() {
  GAME.playing = false;
  GAME.totalTime += GAME.time;
  GAME.totalPoint += GAME.isCompleted ? GAME.stagePoint : 0;

  $('.summary__total-point').text(GAME.totalPoint);
  $('.summary__total-time').text(timeFormat(GAME.totalTime));
  clearInterval(GAME.interval);

  const stageImage = GAME.stages[GAME.currentStage]['stageImage'];
  const stageMessage = GAME.stages[GAME.currentStage]['stageMessage'];

  if (GAME.isCompleted) {
    $('.js-game-result').empty().append(`
      <div class="game-result">
        <div class="modal-card"><img src="${stageMessage}" alt=""></div>
        <div class="modal-title">Xin chúc mừng!</div>
        <div class="modal-subtitle">${stageMessage}</div>
        <div class="game-result__score">+${GAME.stagePoint} điểm
            <div class="modal-button-group">
                <button class="button js-game-continue" type="button">Tiếp tục</button>
            </div>
        </div>
      </div>
    `);

    GAME.currentStage++;
  } else {
    $('.js-game-result').empty().append(`
      <div class="game-result">
        <div class="modal-card"><img src="${stageImage}" alt=""></div>
        <div class="modal-title">Opps,</div>
        <div class="modal-subtitle">Bạn chưa ghép đúng thẻ, hãy thử lại một lần nữa!</div>
        <div class="game-result__score">+0 điểm
            <div class="modal-button-group">
                <button class="button js-game-continue" type="button">Tiếp tục</button>
            </div>
        </div>
      </div>
    `);
  }

  showModal('.md-game-result');
}

function onAllStageFinish() {
  GAME.el.removeClass('unlock').addClass('finish');

  if (window.onFinishAllStages && typeof window.onFinishAllStages === 'function') {
    window.onFinishAllStages(GAME);
  }
}

function gameStart() {
  const $timeRemaining = GAME.el.find('.game__remaining');

  GAME.isCompleted = false;
  GAME.playing = true;
  GAME.time = 0;

  shuffle();

  clearInterval(GAME.interval);

  GAME.interval = setInterval(() => {
    GAME.time++;

    let remainingTime = GAME.stageTime - GAME.time;

    $timeRemaining.text(remainingTime + 's');

    if (!remainingTime) onStageFinish();
  }, 1000);

  GAME.el.addClass('unlock');
}

function onCellClick(e) {
  e.preventDefault();

  const index = Number($(this).data('index'));
  const value = GAME.arr[index];

  if (value === 0 || value === 1 || value === 2) return false;

  if (isSlideAble(index)) {
    const zeroIndex = getZeroIndex();

    GAME.arr[zeroIndex] = value;
    GAME.arr[index] = 0;

    reIndexing();

    if (checkResult()) {
      GAME.isCompleted = true;
      onAllStageFinish();
    }
  }
}

function reIndexing() {
  const $cell = $('.cell');

  $cell.removeClass(classesToRemove);

  GAME.arr.forEach((value, index) => {
    $cell.eq(value).addClass('cell--' + index).data('index', index);
  });
}

function isSlideAble(index) {
  const sideBySide = getSideBySide(index);
  const zeroIndex = getZeroIndex();

  return sideBySide.includes(zeroIndex);
}

function getZeroIndex() {
  for (let i = 0; i < GAME.arr.length; i++) {
    if (GAME.arr[i] === 0) return i;
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
  let errorIndex = GAME.arr.findIndex(item => {
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

  GAME.arr[zeroIndex] = GAME.arr[randomIndex];
  GAME.arr[randomIndex] = 0;
}

// QUIZ

const QUIZ = {
  questions: [],
  current: 0,
  correct: 0,
  time: 0, // Tính bằng giây
  timeLimit: 0, // Tính bằng giây
  timeInterval: null,
  el: null,
  restTime: 3, // Tính bằng giây
  restInterval: null
};

$(function () {
  QUIZ.el = $('.js-quiz');

  if (!QUIZ.el.length) return false;

  QUIZ.timeLimit = Number(QUIZ.el.data('time-limit')) || 0;

  $('.js-quiz-start').on('click', quizStart);

  $('.js-quiz').on('change', '.js-quiz-option', onSelectQuizOption);
});

async function quizStart() {
  QUIZ.current = 0;
  QUIZ.correct = 0;
  QUIZ.time = 0;
  QUIZ.questions = await getQuizQuestions();

  renderQuizQuestion();

  showModal('.md-quiz-question');
}

function renderQuizQuestion() {
  const question = QUIZ.questions[QUIZ.current];

  if (!question) return false;

  QUIZ.el.empty().append(`
<div class="quiz">
  <div class="quiz__title modal-title">Câu hỏi số ${QUIZ.current + 1}</div>
  <div class="quiz__question">${question.question}</div>
  ${renderQuizAnswers(question.options)}
  <div class="quiz__info">
      <div>Câu hỏi đã trả lời:&nbsp;<span class="text-warning">${QUIZ.current}/${QUIZ.questions.length}</span></div>
      <div>Thời gian:&nbsp;<span class="text-warning"><span class="quiz__time">${timeFormat(QUIZ.time)}</span> /${timeFormat(QUIZ.timeLimit, 2)}</span></div>
      <div class="quiz__rest-time" style="display: none">Câu hỏi tiếp theo sẽ xuất hiện sau: s</div>
  </div>
</div>`);

  clearInterval(QUIZ.timeInterval);

  QUIZ.timeInterval = setInterval(() => {
    QUIZ.time++;

    QUIZ.el.find('.quiz__time').text(timeFormat(QUIZ.time));

    if (QUIZ.time >= QUIZ.timeLimit) {
      clearInterval(QUIZ.timeInterval);
      showQuizResult();
    }
  }, 1000);
}

function renderQuizAnswers(options) {
  let answerHTML = '';

  for (const [key, answer] of Object.entries(options)) {
    answerHTML += `
<label class="quiz__answer" data-key="${key}">
    <input class="js-quiz-option" type="radio" name="quiz"><span>${key}. ${answer}</span>
</label>
    `;
  }

  return `<div class="quiz__answers">${answerHTML}</div>`;
}

function onSelectQuizOption(e) {
  clearInterval(QUIZ.timeInterval);

  const question = QUIZ.questions[QUIZ.current];

  const $answer = $(this).closest('.quiz__answer');

  const answerKey = $answer.data('key');

  QUIZ.el.find('.js-quiz-option').prop('disabled', true);
  QUIZ.el.find(`.quiz__answer[data-key="${question.answer}"]`).addClass('is-correct');

  if (answerKey !== question.answer) {
    QUIZ.el.find(`.quiz__answer[data-key="${answerKey}"]`).addClass('is-incorrect');
  } else {
    QUIZ.correct++;
  }

  showNextQuizQuestion();
}

function showNextQuizQuestion() {
  QUIZ.current++;

  if (QUIZ.current >= QUIZ.questions.length) {
    showQuizResult();
    return true;
  }

  clearInterval(QUIZ.restInterval);

  let rest = 0;

  QUIZ.restInterval = setInterval(() => {
    QUIZ.el.find('.quiz__rest-time').show().text(`Câu hỏi tiếp theo sẽ xuất hiện sau: ${QUIZ.restTime - rest}s`);

    rest += 1;

    if (rest > QUIZ.restTime) {
      clearInterval(QUIZ.restInterval);
      renderQuizQuestion();
    }
  }, 1000);
}

function showQuizResult() {
  hideModal();

  showModal('.md-quiz-question', function () {
    QUIZ.el.empty().append(`
<div class="quiz-result">
  <div class="modal-title">Xin chúc mừng!<br>Bạn đã trả lời đúng <span class="text-warning">${QUIZ.correct}/${QUIZ.questions.length}</span> câu hỏi</div>
  <div class="quiz-result__score">+${QUIZ.correct * 10} điểm</div>
  <div class="modal-button-group">
      <button class="button" type="button">Tiếp tục</button>
  </div>
</div>
      `);
  });
}