/* Thú cưng, đồ ăn và phụ kiện */
(function (App) {
  'use strict';
  App.Data = App.Data || {};

  // fav: món khoái khẩu (ăn được thêm nhiều điểm vui)
  App.Data.pets = [
    { id: 'cat',    emoji: '🐱', name: 'Mèo',      names: ['Mimi', 'Miu', 'Bông'],          hello: 'Meo meo!',         fav: 'fish' },
    { id: 'dog',    emoji: '🐶', name: 'Cún',      names: ['Lucky', 'Bơ', 'Mực'],           hello: 'Gâu gâu!',         fav: 'bone' },
    { id: 'bunny',  emoji: '🐰', name: 'Thỏ',      names: ['Mochi', 'Bông', 'Thỏ Ngọc'],    hello: 'Hít hà, hít hà!',  fav: 'carrot' },
    { id: 'panda',  emoji: '🐼', name: 'Gấu trúc', names: ['Tròn', 'Panda', 'Mập'],         hello: 'Ôm cái nào!',      fav: 'bamboo' },
    { id: 'fox',    emoji: '🦊', name: 'Cáo',      names: ['Cam', 'Ruby', 'Lửa'],           hello: 'Hì hì!',           fav: 'grape' },
    { id: 'dragon', emoji: '🐲', name: 'Rồng con', names: ['Rồng Xanh', 'Tí Hon', 'Kem'],   hello: 'Phì… phì lửa nè!', fav: 'pepper' },
  ];

  // full: tăng độ no, happy: tăng độ vui
  App.Data.foods = [
    { id: 'apple',    emoji: '🍎', name: 'Táo',      price: 5,  full: 15, happy: 0 },
    { id: 'banana',   emoji: '🍌', name: 'Chuối',    price: 5,  full: 15, happy: 0 },
    { id: 'milk',     emoji: '🥛', name: 'Sữa',      price: 6,  full: 18, happy: 2 },
    { id: 'carrot',   emoji: '🥕', name: 'Cà rốt',   price: 8,  full: 25, happy: 0 },
    { id: 'bamboo',   emoji: '🎋', name: 'Lá tre',   price: 8,  full: 25, happy: 0 },
    { id: 'grape',    emoji: '🍇', name: 'Nho',      price: 8,  full: 22, happy: 3 },
    { id: 'pepper',   emoji: '🌶️', name: 'Ớt cay',   price: 8,  full: 22, happy: 3 },
    { id: 'fish',     emoji: '🐟', name: 'Cá',       price: 10, full: 30, happy: 0 },
    { id: 'bone',     emoji: '🦴', name: 'Xương',    price: 10, full: 30, happy: 0 },
    { id: 'cookie',   emoji: '🍪', name: 'Bánh quy', price: 8,  full: 12, happy: 10 },
    { id: 'icecream', emoji: '🍦', name: 'Kem',      price: 12, full: 10, happy: 25 },
    { id: 'cupcake',  emoji: '🧁', name: 'Bánh kem', price: 15, full: 20, happy: 25 },
  ];

  // slot: vị trí đeo (đầu / mặt / cổ) – mỗi vị trí đeo 1 món
  App.Data.accessories = [
    { id: 'flower',  emoji: '🌸', name: 'Hoa cài',      slot: 'head', price: 25 },
    { id: 'bow',     emoji: '🎀', name: 'Nơ xinh',      slot: 'head', price: 30 },
    { id: 'glasses', emoji: '👓', name: 'Kính tròn',    slot: 'face', price: 35 },
    { id: 'cap',     emoji: '🧢', name: 'Mũ lưỡi trai', slot: 'head', price: 40 },
    { id: 'scarf',   emoji: '🧣', name: 'Khăn quàng',   slot: 'neck', price: 45 },
    { id: 'shades',  emoji: '🕶️', name: 'Kính râm',     slot: 'face', price: 50 },
    { id: 'tophat',  emoji: '🎩', name: 'Mũ ảo thuật',  slot: 'head', price: 60 },
    { id: 'medal',   emoji: '🏅', name: 'Huy chương',   slot: 'neck', price: 70 },
    { id: 'grad',    emoji: '🎓', name: 'Mũ tiến sĩ',   slot: 'head', price: 80 },
    { id: 'crown',   emoji: '👑', name: 'Vương miện',   slot: 'head', price: 120 },
  ];

  // Danh hiệu theo cấp độ của thú cưng
  App.Data.petTitles = [
    [1, 'Em bé'], [3, 'Tập đi'], [5, 'Mẫu giáo'], [8, 'Học sinh'], [12, 'Thông thái'], [16, 'Siêu sao'],
  ];
})(window.App);
