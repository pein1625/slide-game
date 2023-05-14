async function submitSurvey() {
  return {
    id: 1,
    image: "./images/modal-card-1.png",
    name: "Kết quả 1",
    title: "Xin chúc mừng<br>Bạn phù hợp với thẻ BIDV Napas Smart",
    description: "Vui lòng ấn nút bên dưới để xem thêm thông tin chi tiết",
    url: "https://rangdong.com.vn"
  };
}

async function getPuzzleData() {
  return {
    id: 1,
    name: 'Hình Ghép 1',
    piece_jigsaw: ['./images/cell-3.png', './images/cell-4.png', './images/cell-5.png', './images/cell-6.png', './images/cell-7.png', './images/cell-8.png', './images/cell-9.png', './images/cell-10.png', './images/cell-11.png'],
    result: './images/modal-card-1.png'
  };
}

function checkLoggedIn() {
  return true;
}

function getQuizQuestions() {
  return [{
    question: 'Thẻ BIDV Visa Infinite được hoàn tiền tới bao nhiêu % tại lĩnh vực Golf/Spa/Resort nước ngoài?',
    options: {
      'A': '6%',
      'B': '5%',
      'C': '7%',
      'D': '8%'
    },
    answer: 'A'
  }, {
    question: 'Ai là người đầu tiên đặt chân lên mặt trăng?',
    options: {
      'A': 'Mark Zuckerberg',
      'B': 'Bill Gates',
      'C': 'Neil Amstrong',
      'D': 'Lady Gaga'
    },
    answer: 'C'
  }, {
    question: 'Có một tàu điện đi về hướng nam. Gió hướng tây bắc. Vậy khói từ con tàu sẽ theo hướng nào?',
    options: {
      'A': 'Đông',
      'B': 'Tây',
      'C': 'Bắc',
      'D': 'Không hướng nào'
    },
    answer: 'D'
  }];
}