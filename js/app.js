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

  $('.js-survey-form').on('submit', onSurveySubmit);
});

async function onSurveySubmit(e) {

  e.preventDefault();

  const data = $(this).serializeArray().reduce((carry, item) => {

    // const re = new RegExp(/^([a-zA-Z0-9_-]+)\[([a-zA-Z0-9_-]+)\]$/);


    // if (re.test(item.name)) {

    //   const match = item.name.match(re);

    //   const key = match[1];

    //   const subKey = match[2];


    //   if (!carry[key]) carry[key] = {};


    //   carry[key][subKey] = item.value;

    // } else {

    //   carry[item.name] = item.value;

    // }


    carry.push(item.value);

    return carry;
  }, []);

  const surveyResult = await submitSurvey(data);

  $('.js-survey-result').empty().append(`

<div>

  <div class="modal-card"><img src="${surveyResult.image}" alt=""></div>

  <div class="modal-subtitle">${surveyResult.title}</div>

  <div class="modal-desc">${surveyResult.description}</div>

  <div class="modal-button-group"><a class="button" href="${surveyResult.url}">Xem chi tiết</a></div>

</div>

  `);

  showModal('.md-survey-result');
}

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

const GAME_CONTROL = {};

GAME_CONTROL.showResult = () => {
  showModal('.md-game-result');
};

const PUZZLE = {
  arr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  playing: false,
  time: 0,
  timeLimit: 60,
  point: 10,
  interval: null,
  isCompleted: false,
  images: [],
  result: '',
  el: null,
  timeEl: null
};

const classesToRemove = PUZZLE.arr.reduce((carry, item, index) => {
  return carry + ' ' + 'cell--' + index;
}, '');

$(function () {
  puzzleLoading();
});

async function puzzleLoading() {
  try {
    const data = await getPuzzleData();

    if (!data) throw new Error('Puzzle data not found!');

    if (data.error) {
      throw new Error(data.error.message);
    }

    PUZZLE.images = data.piece_jigsaw;
    PUZZLE.result = data.result;

    PUZZLE.el = $('.js-puzzle');

    PUZZLE.timeEl = PUZZLE.el.find('.puzzle__remaining');

    PUZZLE.el.on('click', '.js-puzzle-start', puzzleStart);

    PUZZLE.el.on('click', '.cell', puzzleMove);

    puzzleReset();

    $('.js-puzzle-result, .js-puzzle-guide').on('click', '.js-puzzle-continue', puzzleContinue);
  } catch (error) {
    $('.js-puzzle-error').find('.modal-desc').text(error.message);

    showModal('.md-puzzle-error');
  }
}

function puzzleReset() {
  PUZZLE.arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  PUZZLE.time = 0;
  PUZZLE.interval = null;
  PUZZLE.isCompleted = false;

  const cellImages = [,,, ...PUZZLE.images];

  PUZZLE.el.find('.cell').each(function (index, el) {
    if (!cellImages[index]) return;

    $(el).empty().append(`<img class="cell-img" src="${cellImages[index]}" alt="">`);
  });

  PUZZLE.timeEl.text(`${PUZZLE.timeLimit - PUZZLE.time}s`);

  reIndexing();
}

function puzzleStart() {
  PUZZLE.playing = true;

  shuffle();

  clearInterval(PUZZLE.interval);

  PUZZLE.interval = setInterval(() => {
    PUZZLE.time++;

    let remainingTime = PUZZLE.timeLimit - PUZZLE.time;

    PUZZLE.timeEl.text(remainingTime + 's');

    if (!remainingTime) puzzleFinish();
  }, 1000);

  PUZZLE.el.addClass('unlock');
}

function puzzleContinue() {
  console.log('puzzleContinue');

  if (PUZZLE.isCompleted) {
    if (checkLoggedIn()) {
      showModal('.md-quiz-begin');
    } else {
      PUZZLE.loginRequired = true;
      showModal('.md-login');
    }

    return false;
  }

  PUZZLE.el.removeClass('unlock');

  puzzleReset();

  showModal('.md-puzzle');
}

function puzzleFinish() {
  PUZZLE.playing = false;

  clearInterval(PUZZLE.interval);

  if (PUZZLE.isCompleted) {
    $('.js-puzzle-result').empty().append(`
      <div class="game-result">
        <div class="modal-card"><img src="${PUZZLE.result}" alt=""></div>
        <div class="modal-title">Xin chúc mừng!</div>
        <div class="modal-subtitle">Chúc mừng bạn đã mở khóa Minigame 2 & 3.<br/>Tham gia ngay để trúng giải thưởng!</div>
        <div class="modal-button-group">
            <button class="button js-puzzle-continue" type="button">Tiếp tục</button>
        </div>
      </div>
    `);
  } else {
    $('.js-puzzle-result').empty().append(`
      <div class="game-result">
        <div class="modal-card"><img src="${PUZZLE.result}" alt=""></div>
        <div class="modal-title">Opps,</div>
        <div class="modal-subtitle">Thử lại để nhận cơ hội tiếp tục tham gia Minigame 2 & 3 để trúng giải thưởng từ BIDV</div>
        <div class="modal-button-group">
            <button class="button js-puzzle-continue" type="button">Chơi lại</button>
        </div>
      </div>
    `);
  }

  showModal('.md-puzzle-result');
}

function puzzleMove(e) {
  e.preventDefault();

  const index = Number($(this).data('index'));
  const value = PUZZLE.arr[index];

  if (value === 0 || value === 1 || value === 2) return false;

  if (isSlideAble(index)) {
    const zeroIndex = getZeroIndex();

    PUZZLE.arr[zeroIndex] = value;
    PUZZLE.arr[index] = 0;

    reIndexing();

    if (puzzleCheckResult()) {
      PUZZLE.isCompleted = true;
      puzzleFinish();
    }
  }
}

function reIndexing() {
  const $cell = $('.cell');

  $cell.removeClass(classesToRemove);

  PUZZLE.arr.forEach((value, index) => {
    $cell.eq(value).addClass('cell--' + index).data('index', index);
  });
}

function isSlideAble(index) {
  const sideBySide = getSideBySide(index);
  const zeroIndex = getZeroIndex();

  return sideBySide.includes(zeroIndex);
}

function getZeroIndex() {
  for (let i = 0; i < PUZZLE.arr.length; i++) {
    if (PUZZLE.arr[i] === 0) return i;
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

function puzzleCheckResult() {
  let maxValue = 0;
  let errorIndex = PUZZLE.arr.findIndex(item => {
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

  PUZZLE.arr[zeroIndex] = PUZZLE.arr[randomIndex];
  PUZZLE.arr[randomIndex] = 0;
}

const QUIZ = {
  questions: [],
  current: 0,
  correct: 0,
  maxPoint: 40,
  time: 0, // giây
  timeLimit: 5 * 60, // giây
  timeInterval: null,
  restTime: 3, // giây
  restInterval: null,
  el: null
};

$(function () {
  QUIZ.el = $('.js-quiz');

  if (!QUIZ.el.length) return false;

  QUIZ.timeLimit = Number(QUIZ.el.data('time-limit')) || 0;

  $('.js-quiz-start').on('click', quizStart);

  $('.js-quiz').on('change', '.js-quiz-option', quizSelectOption);

  $('.js-quiz').on('click', '.js-quiz-continue', function () {
    if (window.cardGameLoading && typeof window.cardGameLoading === 'function') {
      window.cardGameLoading();
    }
  });
});

async function quizStart() {
  QUIZ.current = 0;
  QUIZ.correct = 0;
  QUIZ.time = 0;

  const quizQuestions = await getQuizQuestions();

  for (const [, question] of Object.entries(quizQuestions)) {
    QUIZ.questions.push(question);
  }

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
  ${quizRenderAnswer(question.options)}
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
      quizShowResult();
    }
  }, 1000);
}

function quizRenderAnswer(options) {
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

function quizSelectOption(e) {
  clearInterval(QUIZ.timeInterval);

  const question = QUIZ.questions[QUIZ.current];

  const $answer = $(this).closest('.quiz__answer');

  const answerKey = $answer.data('key');

  QUIZ.el.find('.js-quiz-option').prop('disabled', true);
  QUIZ.el.find(`.quiz__answer[data-key="${question.true_option}"]`).addClass('is-correct');

  if (answerKey !== question.true_option) {
    QUIZ.el.find(`.quiz__answer[data-key="${answerKey}"]`).addClass('is-incorrect');
  } else {
    QUIZ.correct++;
  }

  quizNextQuestion();
}

function quizNextQuestion() {
  QUIZ.current++;

  clearInterval(QUIZ.restInterval);

  let rest = 0;

  QUIZ.restInterval = setInterval(() => {
    const message = QUIZ.current >= QUIZ.questions.length ? `Kết quả sẽ xuất hiện sau: ${QUIZ.restTime - rest}s` : `Câu hỏi tiếp theo sẽ xuất hiện sau: ${QUIZ.restTime - rest}s`;

    QUIZ.el.find('.quiz__rest-time').show().text(message);

    rest += 1;

    if (rest > QUIZ.restTime) {
      clearInterval(QUIZ.restInterval);

      if (QUIZ.current >= QUIZ.questions.length) {
        quizShowResult();
      } else {
        renderQuizQuestion();
      }
    }
  }, 1000);
}

function quizShowResult() {
  hideModal();

  const point = QUIZ.correct === QUIZ.questions.length ? QUIZ.maxPoint : QUIZ.correct;

  showModal('.md-quiz-question', function () {
    QUIZ.el.empty().append(`
<div class="quiz-result">
  <div class="modal-title">Xin chúc mừng!<br>Bạn đã trả lời đúng <span class="text-warning">${QUIZ.correct}/${QUIZ.questions.length}</span> câu hỏi</div>
  <div class="quiz-result__score">+${point} điểm</div>
  <div class="modal-button-group">
      <button class="button" type="button js-quiz-continue">Tiếp tục</button>
  </div>
</div>
      `);
  });
}

const CARD_GAME = {};

$(function () {
  $('.js-card-game-finish').on('click', function () {
    GAME_CONTROL.showResult();
  });
});

function cardGameLoading() {
  showModal('.md-card-game-intro');
}