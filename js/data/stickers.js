/* Bộ sưu tập sticker & huy hiệu */
(function (App) {
  'use strict';
  App.Data = App.Data || {};

  // Mỗi sticker: [id, emoji, tên tiếng Việt, tên tiếng Anh]
  App.Data.stickerSets = [
    { id: 'animals', name: 'Động vật', icon: '🦁', items: [
      ['lion', '🦁', 'Sư tử', 'Lion'], ['tiger', '🐯', 'Hổ', 'Tiger'], ['elephant', '🐘', 'Voi', 'Elephant'],
      ['giraffe', '🦒', 'Hươu cao cổ', 'Giraffe'], ['zebra', '🦓', 'Ngựa vằn', 'Zebra'], ['monkey', '🐵', 'Khỉ', 'Monkey'],
      ['penguin', '🐧', 'Chim cánh cụt', 'Penguin'], ['koala', '🐨', 'Gấu túi', 'Koala'], ['kangaroo', '🦘', 'Chuột túi', 'Kangaroo'],
      ['turtle', '🐢', 'Rùa', 'Turtle'], ['owl', '🦉', 'Cú mèo', 'Owl'], ['dolphin', '🐬', 'Cá heo', 'Dolphin'],
    ] },
    { id: 'fruits', name: 'Trái cây', icon: '🍓', items: [
      ['strawberry', '🍓', 'Dâu tây', 'Strawberry'], ['watermelon', '🍉', 'Dưa hấu', 'Watermelon'], ['banana', '🍌', 'Chuối', 'Banana'],
      ['grapes', '🍇', 'Nho', 'Grapes'], ['pineapple', '🍍', 'Dứa', 'Pineapple'], ['mango', '🥭', 'Xoài', 'Mango'],
      ['peach', '🍑', 'Đào', 'Peach'], ['cherry', '🍒', 'Anh đào', 'Cherry'], ['coconut', '🥥', 'Dừa', 'Coconut'],
      ['pear', '🍐', 'Lê', 'Pear'], ['orange', '🍊', 'Cam', 'Orange'], ['kiwi', '🥝', 'Kiwi', 'Kiwi'],
    ] },
    { id: 'vehicles', name: 'Xe cộ', icon: '🚀', items: [
      ['car', '🚗', 'Ô tô', 'Car'], ['bus', '🚌', 'Xe buýt', 'Bus'], ['police', '🚓', 'Xe cảnh sát', 'Police car'],
      ['ambulance', '🚑', 'Xe cứu thương', 'Ambulance'], ['firetruck', '🚒', 'Xe cứu hỏa', 'Fire truck'], ['tractor', '🚜', 'Máy cày', 'Tractor'],
      ['plane', '✈️', 'Máy bay', 'Plane'], ['rocket', '🚀', 'Tên lửa', 'Rocket'], ['train', '🚂', 'Tàu hỏa', 'Train'],
      ['ship', '🚢', 'Tàu thủy', 'Ship'], ['helicopter', '🚁', 'Trực thăng', 'Helicopter'], ['bike', '🚲', 'Xe đạp', 'Bike'],
    ] },
    { id: 'nature', name: 'Thiên nhiên', icon: '🌈', items: [
      ['sun', '🌞', 'Mặt trời', 'Sun'], ['moon', '🌙', 'Mặt trăng', 'Moon'], ['star', '⭐', 'Ngôi sao', 'Star'],
      ['rainbow', '🌈', 'Cầu vồng', 'Rainbow'], ['cloud', '☁️', 'Đám mây', 'Cloud'], ['lightning', '⚡', 'Tia chớp', 'Lightning'],
      ['snowflake', '❄️', 'Bông tuyết', 'Snowflake'], ['volcano', '🌋', 'Núi lửa', 'Volcano'], ['wave', '🌊', 'Sóng biển', 'Wave'],
      ['sunflower', '🌻', 'Hoa hướng dương', 'Sunflower'], ['mushroom', '🍄', 'Cây nấm', 'Mushroom'], ['cactus', '🌵', 'Xương rồng', 'Cactus'],
    ] },
    { id: 'magic', name: 'Phép thuật', icon: '🦄', items: [
      ['trex', '🦖', 'Khủng long bạo chúa', 'T-rex'], ['sauropod', '🦕', 'Khủng long cổ dài', 'Dinosaur'], ['dragon', '🐉', 'Rồng', 'Dragon'],
      ['unicorn', '🦄', 'Kỳ lân', 'Unicorn'], ['fairy', '🧚', 'Cô tiên', 'Fairy'], ['ghost', '👻', 'Ma vui vẻ', 'Ghost'],
      ['alien', '👽', 'Người ngoài hành tinh', 'Alien'], ['robot', '🤖', 'Rô-bốt', 'Robot'], ['wizard', '🧙', 'Phù thủy', 'Wizard'],
      ['hero', '🦸', 'Siêu anh hùng', 'Superhero'], ['genie', '🧞', 'Thần đèn', 'Genie'], ['castle', '🏰', 'Lâu đài', 'Castle'],
    ] },
    { id: 'food', name: 'Món ngon', icon: '🍰', items: [
      ['pizza', '🍕', 'Bánh pizza', 'Pizza'], ['burger', '🍔', 'Bánh mì kẹp', 'Burger'], ['fries', '🍟', 'Khoai tây chiên', 'Fries'],
      ['donut', '🍩', 'Bánh vòng', 'Donut'], ['cake', '🍰', 'Bánh ngọt', 'Cake'], ['lollipop', '🍭', 'Kẹo mút', 'Lollipop'],
      ['chocolate', '🍫', 'Sô-cô-la', 'Chocolate'], ['popcorn', '🍿', 'Bỏng ngô', 'Popcorn'], ['cupcake', '🧁', 'Bánh cupcake', 'Cupcake'],
      ['noodles', '🍜', 'Mì', 'Noodles'], ['riceball', '🍙', 'Cơm nắm', 'Rice ball'], ['dumpling', '🥟', 'Bánh bao', 'Dumpling'],
    ] },
  ];

  // Huy hiệu thành tích (huy hiệu hoàn thành chủ đề được tạo tự động từ chương trình học)
  App.Data.badges = [
    { id: 'first',      emoji: '🌱', name: 'Bước đầu tiên',  desc: 'Hoàn thành chặng đầu tiên' },
    { id: 'streak3',    emoji: '🔥', name: 'Chăm chỉ',        desc: 'Học 3 ngày liên tiếp' },
    { id: 'streak7',    emoji: '🌟', name: 'Siêu chăm chỉ',   desc: 'Học 7 ngày liên tiếp' },
    { id: 'stars30',    emoji: '⭐', name: 'Nhà sưu tầm sao', desc: 'Đạt 30 ngôi sao' },
    { id: 'stars100',   emoji: '🌠', name: 'Bầu trời sao',    desc: 'Đạt 100 ngôi sao' },
    { id: 'perfect5',   emoji: '💯', name: 'Hoàn hảo',        desc: '5 chặng đạt 3 sao' },
    { id: 'pet5',       emoji: '🐾', name: 'Bạn thân',        desc: 'Thú cưng đạt cấp 5' },
    { id: 'stickers20', emoji: '📒', name: 'Album đẹp',       desc: 'Sưu tập 20 sticker' },
  ];
})(window.App);
