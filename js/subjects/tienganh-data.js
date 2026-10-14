/* Tiếng Anh 2 – Global Success: từ vựng, chữ cái – âm và mẫu câu của 16 Unit.
   - Hình minh họa: emoji (chỉ dùng emoji từ bản 12 trở về trước để máy tính bảng đời cũ vẫn hiện được),
     hoặc hình SVG tự vẽ cho những từ không có emoji phù hợp (cát, mứt, thạch, sữa chua, cái bàn, ấm trà, cái chăn…).
   - Muốn thêm từ: thêm vào "words" (u = số Unit, vi = nghĩa, pic = hình, ph = chữ/âm trọng tâm đặt trong [ ]). */
(function (App) {
  'use strict';

  // ================= Hình SVG tự vẽ (khung 100 × 100) =================
  const svg = {
    sand:
      '<path d="M4 88 C14 60 32 46 50 46 C68 46 86 60 96 88 Z" fill="#f4cf7a"/>' +
      '<path d="M16 88 C24 68 37 58 50 58 C63 58 76 68 84 88 Z" fill="#f8dc95"/>' +
      '<g fill="#d9a441"><circle cx="28" cy="78" r="1.8"/><circle cx="40" cy="68" r="1.8"/><circle cx="55" cy="75" r="1.8"/>' +
      '<circle cx="68" cy="67" r="1.8"/><circle cx="75" cy="80" r="1.8"/><circle cx="46" cy="83" r="1.8"/><circle cx="34" cy="58" r="1.6"/></g>' +
      '<rect x="2" y="86" width="96" height="6" rx="3" fill="#e9b85c"/>' +
      '<path d="M60 31 H82 L78 53 H64 Z" fill="#ff6b6b"/><rect x="58" y="28" width="26" height="5" rx="2.5" fill="#e04848"/>' +
      '<path d="M61 31 C63 17 79 17 81 31" fill="none" stroke="#e04848" stroke-width="2.5"/>',
    square:
      '<rect x="17" y="17" width="66" height="66" rx="5" fill="#5aa2ff" stroke="#2263c9" stroke-width="5"/>',
    jam:
      '<rect x="28" y="11" width="44" height="15" rx="4" fill="#ff6b6b"/>' +
      '<path d="M34 11 v15 M42 11 v15 M50 11 v15 M58 11 v15 M66 11 v15" stroke="#fff" stroke-width="2.6" opacity=".7"/>' +
      '<rect x="25" y="25" width="50" height="7" rx="3" fill="#dfe6f2"/>' +
      '<rect x="21" y="30" width="58" height="60" rx="14" fill="#b8243f"/>' +
      '<rect x="21" y="30" width="58" height="60" rx="14" fill="none" stroke="#cfe3ff" stroke-width="3"/>' +
      '<rect x="30" y="47" width="40" height="30" rx="6" fill="#fff6dc"/>' +
      '<path d="M50 73 C40 66 39 56 43.5 54 C47 52.5 50 54.5 50 57 C50 54.5 53 52.5 56.5 54 C61 56 60 66 50 73 Z" fill="#e53935"/>' +
      '<path d="M43.5 53.5 L50 50 L56.5 53.5 L50 56 Z" fill="#43a047"/>' +
      '<g fill="#ffe08a"><circle cx="46.5" cy="60" r="1"/><circle cx="53.5" cy="60" r="1"/><circle cx="50" cy="65.5" r="1"/></g>' +
      '<path d="M28 38 C26 52 26 66 29 80" stroke="#fff" stroke-opacity=".4" stroke-width="4" fill="none" stroke-linecap="round"/>',
    jelly:
      '<ellipse cx="50" cy="85" rx="42" ry="9" fill="#dfe6f2"/><ellipse cx="50" cy="83" rx="36" ry="6.5" fill="#fff"/>' +
      '<path d="M20 81 C18 59 24 41 34 35 C44 29 56 29 66 35 C76 41 82 59 80 81 C74 85 68 81 65 79 C60 84 54 84 50 80 ' +
      'C46 84 40 84 35 79 C32 81 26 85 20 81 Z" fill="#ff4f8b"/>' +
      '<path d="M28 45 C40 37 60 37 72 45" stroke="#ff9cc0" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M22 63 C40 69 60 69 78 63" stroke="#e23b76" stroke-width="3" fill="none" opacity=".6"/>' +
      '<ellipse cx="34" cy="53" rx="4" ry="8" fill="#fff" opacity=".55"/>' +
      '<circle cx="50" cy="27" r="7" fill="#d62828"/><circle cx="47.5" cy="24.5" r="2" fill="#fff" opacity=".6"/>' +
      '<path d="M50 20 C52 13 57 9 63 8" stroke="#5a8f29" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    yogurt:
      '<path d="M24 30 H76 L69 88 C58 93 42 93 31 88 Z" fill="#fff" stroke="#8fa3c0" stroke-width="3"/>' +
      '<path d="M26.6 50 H73.4 L71.3 68 H28.7 Z" fill="#7cc4ff"/>' +
      '<path d="M35 60 C39 55 43 55 47 60 C51 65 55 65 59 60 C61 58 63 57 65 58" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="50" cy="30" rx="28" ry="7.5" fill="#ff7eb6"/><ellipse cx="50" cy="28.5" rx="23" ry="5" fill="#ffc2dc"/>' +
      '<path d="M33 74 C34 80 36 84 38 86" stroke="#e8edf5" stroke-width="3" fill="none" stroke-linecap="round"/>',
    zoo:
      '<text x="33" y="66" font-size="30" text-anchor="middle">🦁</text><text x="67" y="60" font-size="34" text-anchor="middle">🦒</text>' +
      '<rect x="8" y="26" width="9" height="66" rx="2" fill="#8d5524"/><rect x="83" y="26" width="9" height="66" rx="2" fill="#8d5524"/>' +
      '<path d="M4 30 C30 6 70 6 96 30 L96 38 C70 16 30 16 4 38 Z" fill="#22b573"/>' +
      '<rect x="38" y="7" width="24" height="12" rx="4" fill="#ffc531"/>' +
      '<g fill="#8d5524"><circle cx="45" cy="13" r="2"/><circle cx="50" cy="11.5" r="2"/><circle cx="55" cy="13" r="2"/></g>' +
      '<g fill="#c98a4b"><rect x="17" y="68" width="66" height="4"/><rect x="17" y="81" width="66" height="4"/>' +
      '<rect x="26" y="64" width="4" height="28"/><rect x="40" y="64" width="4" height="28"/><rect x="56" y="64" width="4" height="28"/><rect x="70" y="64" width="4" height="28"/></g>',
    table:
      '<rect x="27" y="48" width="5" height="30" rx="2" fill="#7a4a1e"/><rect x="68" y="48" width="5" height="30" rx="2" fill="#7a4a1e"/>' +
      '<path d="M18 38 H82 L92 48 H8 Z" fill="#d39556"/><rect x="8" y="48" width="84" height="8" rx="2" fill="#a86b32"/>' +
      '<rect x="13" y="56" width="7" height="34" rx="2" fill="#8d5524"/><rect x="80" y="56" width="7" height="34" rx="2" fill="#8d5524"/>',
    teapot:
      '<path d="M30 63 C18 61 12 51 10 41 L17 39 C20 48 25 53 33 55 Z" fill="#1f9e90"/>' +
      '<path d="M70 50 C86 46 92 56 88 66 C85 74 78 76 70 74" fill="none" stroke="#1a8a7e" stroke-width="7" stroke-linecap="round"/>' +
      '<ellipse cx="50" cy="64" rx="27" ry="23" fill="#2bb3a3"/><rect x="33" y="82" width="34" height="7" rx="3.5" fill="#1a8a7e"/>' +
      '<path d="M32 46 C38 36 62 36 68 46 Z" fill="#1a8a7e"/><circle cx="50" cy="35" r="5" fill="#ffc531"/>' +
      '<g fill="#fff" opacity=".85"><circle cx="40" cy="64" r="3.2"/><circle cx="52" cy="58" r="3.2"/><circle cx="60" cy="70" r="3.2"/><circle cx="46" cy="75" r="3.2"/></g>' +
      '<path d="M32 58 C33 52 37 48 42 47" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none" stroke-linecap="round"/>',
    blanket:
      '<rect x="10" y="28" width="80" height="56" rx="9" fill="#ffb3cf"/>' +
      '<g fill="#ff7eb6" opacity=".55"><rect x="24" y="28" width="9" height="56"/><rect x="46" y="28" width="9" height="56"/><rect x="68" y="28" width="9" height="56"/>' +
      '<rect x="10" y="40" width="80" height="8"/><rect x="10" y="62" width="80" height="8"/></g>' +
      '<rect x="10" y="28" width="80" height="56" rx="9" fill="none" stroke="#d9558f" stroke-width="3"/>' +
      '<path d="M10 52 H90" stroke="#d9558f" stroke-width="2" stroke-dasharray="4 3" opacity=".7"/>' +
      '<path d="M16 84 v6 M24 84 v6 M32 84 v6 M40 84 v6 M48 84 v6 M56 84 v6 M64 84 v6 M72 84 v6 M80 84 v6" stroke="#d9558f" stroke-width="2.5" stroke-linecap="round"/>',
    tent:
      '<rect x="2" y="87" width="96" height="4" rx="2" fill="#7fd18b"/>' +
      '<path d="M8 88 L50 20 L92 88 Z" fill="#ff9f43"/><path d="M50 20 L92 88 H72 Z" fill="#e67e22"/>' +
      '<path d="M50 30 L29 88 H71 Z" fill="#7a3b00"/>' +
      '<path d="M50 21 V10" stroke="#8d5524" stroke-width="3"/><path d="M50 10 L61 13.5 L50 17 Z" fill="#ff6b6b"/>',
  };
  // Cầu trượt (Unit 11): một bạn đang trượt / hai bạn cùng chơi
  const slide = (kids) =>
    '<rect x="4" y="90" width="92" height="5" rx="2.5" fill="#7fd18b"/>' +
    '<rect x="70" y="24" width="4.5" height="67" rx="2" fill="#3d8bff"/><rect x="86" y="24" width="4.5" height="67" rx="2" fill="#3d8bff"/>' +
    '<g fill="#2263c9"><rect x="70" y="38" width="20" height="3.5"/><rect x="70" y="52" width="20" height="3.5"/><rect x="70" y="66" width="20" height="3.5"/><rect x="70" y="80" width="20" height="3.5"/></g>' +
    '<rect x="60" y="20" width="32" height="7" rx="3" fill="#ff9f43"/>' +
    '<path d="M64 24 C46 36 38 52 32 70 C28 82 20 86 6 86 L6 92 C26 92 34 86 38 74 C44 56 52 42 70 30 Z" fill="#ffc531"/>' +
    '<path d="M64 24 C46 36 38 52 32 70 C28 82 20 86 6 86" stroke="#ff9f43" stroke-width="3" fill="none"/>' +
    `<text x="44" y="53" font-size="24" text-anchor="middle">${kids[0]}</text>` +
    (kids[1] ? `<text x="78" y="20" font-size="20" text-anchor="middle">${kids[1]}</text>` : '');
  svg.slide1 = slide(['👧']);
  svg.slide2 = slide(['🧒', '👧']);

  // ================= Từ vựng =================
  // u: Unit · vi: nghĩa · vs: cách nói trong câu (nếu khác vi) · pic: hình · ph: chữ/âm trọng tâm trong [ ]
  // syl: chia phần để xếp chữ (từ dài) · a: mạo từ "an" · pl: số nhiều (dùng "are") · pr: He/She
  // grp: nhóm hình dễ nhầm (không cho cùng xuất hiện trong một câu) · extra: từ thêm, không phải từ chính của bài
  const words = {
    pasta: { u: 1, vi: 'mì Ý', pic: '🍝', ph: '[p]asta' },
    popcorn: { u: 1, vi: 'bỏng ngô', pic: '🍿', ph: '[p]opcorn', syl: 'pop-corn' },
    pizza: { u: 1, vi: 'bánh pizza', pic: '🍕', ph: '[p]izza' },
    yummy: { u: 1, vi: 'ngon', pic: '😋', extra: true },

    kite: { u: 2, vi: 'cái diều', pic: '🪁', ph: '[k]ite' },
    bike: { u: 2, vi: 'chiếc xe đạp', pic: '🚲', ph: 'bi[k]e' },
    kitten: { u: 2, vi: 'chú mèo con', pic: '🐱', ph: '[k]itten' },

    sail: { u: 3, vi: 'cánh buồm', pic: '⛵', ph: '[s]ail' },
    sand: { u: 3, vi: 'cát', vs: 'bãi cát', pic: 'svg:sand', ph: '[s]and' },
    sea: { u: 3, vi: 'biển', pic: '🌊', ph: '[s]ea' },

    rainbow: { u: 4, vi: 'cầu vồng', pic: '🌈', ph: '[r]ainbow', syl: 'rain-bow' },
    river: { u: 4, vi: 'dòng sông', pic: '🏞️', ph: '[r]iver' },
    road: { u: 4, vi: 'con đường', pic: '🛣️', ph: '[r]oad' },

    question: { u: 5, vi: 'câu hỏi', pic: '❓', ph: '[qu]estion', syl: 'ques-tion' },
    square: { u: 5, vi: 'hình vuông', pic: 'svg:square', ph: 's[qu]are' },
    quiz: { u: 5, vi: 'bài đố', pic: '📝', ph: '[qu]iz' },

    box: { u: 6, vi: 'cái hộp', pic: '📦', ph: 'bo[x]' },
    fox: { u: 6, vi: 'con cáo', pic: '🦊', ph: 'fo[x]' },
    ox: { u: 6, vi: 'con bò', pic: '🐂', ph: 'o[x]', a: 'an', grp: 'bo' },

    juice: { u: 7, vi: 'nước ép', pic: '🧃', ph: '[j]uice' },
    jelly: { u: 7, vi: 'thạch', pic: 'svg:jelly', ph: '[j]elly' },
    jam: { u: 7, vi: 'mứt', vs: 'lọ mứt', pic: 'svg:jam', ph: '[j]am' },

    village: { u: 8, vi: 'ngôi làng', pic: '🏘️', ph: '[v]illage', syl: 'vil-lage' },
    van: { u: 8, vi: 'xe tải nhỏ', pic: '🚐', ph: '[v]an' },
    volleyball: { u: 8, vi: 'quả bóng chuyền', pic: '🏐', ph: '[v]olleyball', syl: 'vol-ley-ball' },

    yogurt: { u: 9, vi: 'sữa chua', pic: 'svg:yogurt', ph: '[y]ogurt', syl: 'yo-gurt' },
    yams: { u: 9, vi: 'khoai lang', pic: '🍠', ph: '[y]ams', pl: true },
    'yo-yos': { u: 9, vi: 'cái yo-yo', vs: 'mấy cái yo-yo', pic: '🪀', ph: '[y]o-yos', pl: true },

    zoo: { u: 10, vi: 'sở thú', pic: 'svg:zoo', ph: '[z]oo' },
    zebu: { u: 10, vi: 'con bò u', pic: '🐄', ph: '[z]ebu', grp: 'bo' },
    zebra: { u: 10, vi: 'con ngựa vằn', pic: '🦓', ph: '[z]ebra' },

    sliding: { u: 11, vi: 'chơi cầu trượt', pic: 'svg:slide1', ph: 'sl[i]ding', syl: 'slid-ing' },
    riding: { u: 11, vi: 'đạp xe', pic: '🚴', ph: 'r[i]ding' },
    driving: { u: 11, vi: 'lái ô tô', pic: '🚗', ph: 'dr[i]ving', syl: 'driv-ing' },

    grapes: { u: 12, vi: 'quả nho', vs: 'nho', pic: '🍇', ph: 'gr[a]pes', pl: true },
    cake: { u: 12, vi: 'bánh ngọt', pic: '🍰', ph: 'c[a]ke' },
    table: { u: 12, vi: 'cái bàn', pic: 'svg:table', ph: 't[a]ble' },
    apple: { u: 12, vi: 'quả táo', pic: '🍎', a: 'an', extra: true },
    bananas: { u: 12, vi: 'quả chuối', vs: 'chuối', pic: '🍌', syl: 'ba-na-nas', pl: true, extra: true },

    eleven: { u: 13, vi: 'mười một', num: 11, ph: 'eleve[n]', syl: 'e-lev-en' },
    twelve: { u: 13, vi: 'mười hai', num: 12 },
    thirteen: { u: 13, vi: 'mười ba', num: 13, ph: 'thirtee[n]', syl: 'thir-teen' },
    fourteen: { u: 13, vi: 'mười bốn', num: 14, ph: 'fourtee[n]', syl: 'four-teen' },
    fifteen: { u: 13, vi: 'mười lăm', num: 15, ph: 'fiftee[n]', syl: 'fif-teen' },

    sister: { u: 14, vi: 'chị/em gái', vs: 'chị gái', pic: '👧', ph: 'sist[er]', syl: 'sis-ter', pr: 'She' },
    brother: { u: 14, vi: 'anh/em trai', vs: 'anh trai', pic: '👦', ph: 'broth[er]', syl: 'broth-er', pr: 'He' },
    grandmother: { u: 14, vi: 'bà', pic: '👵', ph: 'grandmoth[er]', syl: 'grand-moth-er', pr: 'She' },
    sixteen: { u: 14, vi: 'mười sáu', num: 16, syl: 'six-teen' },
    seventeen: { u: 14, vi: 'mười bảy', num: 17, syl: 'sev-en-teen' },
    eighteen: { u: 14, vi: 'mười tám', num: 18, syl: 'eigh-teen' },
    nineteen: { u: 14, vi: 'mười chín', num: 19, syl: 'nine-teen' },
    twenty: { u: 14, vi: 'hai mươi', num: 20, syl: 'twen-ty' },

    shirts: { u: 15, vi: 'áo sơ mi', pic: '👔', ph: '[sh]irts', pl: true },
    shorts: { u: 15, vi: 'quần soóc', pic: '🩳', ph: '[sh]orts', pl: true },
    shoes: { u: 15, vi: 'đôi giày', pic: '👟', ph: '[sh]oes', pl: true },

    tent: { u: 16, vi: 'cái lều', pic: '⛺', ph: '[t]ent' },
    teapot: { u: 16, vi: 'ấm trà', pic: 'svg:teapot', ph: '[t]eapot', syl: 'tea-pot' },
    blanket: { u: 16, vi: 'cái chăn', pic: 'svg:blanket', ph: 'blanke[t]', syl: 'blan-ket' },
  };

  // ================= Các Unit =================
  const units = {
    1: { title: 'At my birthday party', vi: 'Ở bữa tiệc sinh nhật', icon: '🎂', icon2: '😋', ph: 'p', words: ['pasta', 'popcorn', 'pizza'] },
    2: { title: 'In the backyard', vi: 'Ở sân sau nhà', icon: '🪁', icon2: '🚲', ph: 'k', words: ['kite', 'bike', 'kitten'] },
    3: { title: 'At the seaside', vi: 'Ở bờ biển', icon: '🏖️', icon2: '⛵', ph: 's', words: ['sail', 'sand', 'sea'] },
    4: { title: 'In the countryside', vi: 'Ở vùng quê', icon: '🌈', icon2: '🏞️', ph: 'r', words: ['rainbow', 'river', 'road'] },
    5: { title: 'In the classroom', vi: 'Trong lớp học', icon: '✏️', icon2: '🖍️', ph: 'qu', words: ['question', 'square', 'quiz'] },
    6: { title: 'On the farm', vi: 'Ở nông trại', icon: '🚜', icon2: '🦊', ph: 'x', words: ['box', 'fox', 'ox'] },
    7: { title: 'In the kitchen', vi: 'Trong nhà bếp', icon: '🍳', icon2: '🧃', ph: 'j', words: ['juice', 'jelly', 'jam'] },
    8: { title: 'In the village', vi: 'Ở làng quê', icon: '🏘️', icon2: '🚐', ph: 'v', words: ['village', 'van', 'volleyball'] },
    9: { title: 'In the grocery store', vi: 'Ở cửa hàng thực phẩm', icon: '🛒', icon2: '🍠', ph: 'y', words: ['yogurt', 'yams', 'yo-yos'] },
    10: { title: 'At the zoo', vi: 'Ở sở thú', icon: '🦓', icon2: '🦁', ph: 'z', words: ['zoo', 'zebu', 'zebra'] },
    11: { title: 'In the playground', vi: 'Ở sân chơi', icon: '🎠', icon2: '🚴', ph: 'i', words: ['sliding', 'riding', 'driving'] },
    12: { title: 'At the café', vi: 'Ở quán cà phê', icon: '☕', icon2: '🍰', ph: 'a', words: ['grapes', 'cake', 'table'] },
    13: { title: 'In the maths class', vi: 'Trong giờ Toán', icon: '🔢', icon2: '🧮', ph: 'n', words: ['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'] },
    14: { title: 'At home', vi: 'Ở nhà', icon: '🏠', icon2: '👵', ph: 'er', words: ['sister', 'brother', 'grandmother'] },
    15: { title: 'In the clothes shop', vi: 'Ở cửa hàng quần áo', icon: '👗', icon2: '👟', ph: 'sh', words: ['shirts', 'shorts', 'shoes'] },
    16: { title: 'At the campsite', vi: 'Ở khu cắm trại', icon: '⛺', icon2: '🏕️', ph: 't', words: ['tent', 'teapot', 'blanket'] },
  };

  // ================= Mẫu câu =================
  // Mẫu có {w}: thay bằng từng từ trong ws. {aw}: "a/an + từ" · {be}: is/are · {P}: He/She · {vi}/{Vi}: nghĩa (viết hoa chữ đầu)
  // q/qvi: câu hỏi đi kèm (dạng hỏi – đáp). list: các câu viết sẵn khi mỗi câu khác nhau nhiều.
  // blank: phần để trống khi bé điền từ · pic: hình của câu ('{w}' = hình của từ)
  const tpl = {
    'u1.yummy': { u: 1, en: 'The {w} is yummy.', vi: '{Vi} ngon quá!', ws: ['pizza', 'pasta', 'popcorn'], pic: ['{w}', '😋'] },
    'u1.like': { u: 1, en: 'I like {w}.', vi: 'Tớ thích {vi}.', ws: ['pizza', 'pasta', 'popcorn'], pic: ['❤️', '{w}'] },
    'u2.have': { u: 2, en: 'I have a {w}.', vi: 'Tớ có một {vi}.', ws: ['kite', 'bike', 'kitten'] },
    'u2.act': { u: 2, list: [
      { key: 'kite', en: "She's flying a kite.", vi: 'Bạn ấy đang thả diều.', pic: ['👧', '🪁'], blank: 'flying a kite',
        q: 'Is she flying a kite?', qvi: 'Bạn ấy đang thả diều phải không?' },
      { key: 'bike', en: "He's riding a bike.", vi: 'Bạn ấy đang đạp xe.', pic: ['👦', '🚲'], blank: 'riding a bike',
        q: 'Is he riding a bike?', qvi: 'Bạn ấy đang đạp xe phải không?' },
      { key: 'kitten', en: "She's playing with a kitten.", vi: 'Bạn ấy đang chơi với mèo con.', pic: ['👧', '🐱'], blank: 'playing with a kitten',
        q: 'Is she playing with a kitten?', qvi: 'Bạn ấy đang chơi với mèo con phải không?' },
    ] },
    'u3.look': { u: 3, en: "Let's look at the {w}.", vi: 'Chúng mình cùng ngắm {vi} nhé!', ws: ['sea', 'sand', 'sail'] },
    'u3.see': { u: 3, en: 'I can see the {w}.', vi: 'Tớ nhìn thấy {vi}.', ws: ['sea', 'sand', 'sail'] },
    'u4.see': { u: 4, q: 'What can you see?', qvi: 'Bạn nhìn thấy gì?', en: 'I can see a {w}.', vi: 'Tớ nhìn thấy {vi}.', ws: ['rainbow', 'river', 'road'] },
    'u4.there': { u: 4, en: "There's a {w}.", vi: 'Ở đó có {vi}.', ws: ['rainbow', 'river', 'road'] },
    'u5.doing': { u: 5, list: [
      { key: 'square', en: "She's colouring a square.", vi: 'Bạn ấy đang tô màu hình vuông.', pic: ['👧', '🖍️', 'svg:square'], blank: 'colouring a square',
        q: "What's she doing?", qvi: 'Bạn ấy đang làm gì?' },
      { key: 'quiz', en: "He's doing a quiz.", vi: 'Bạn ấy đang làm bài đố.', pic: ['👦', '📝'], blank: 'doing a quiz',
        q: "What's he doing?", qvi: 'Bạn ấy đang làm gì?' },
      { key: 'question', en: "She's answering a question.", vi: 'Bạn ấy đang trả lời câu hỏi.', pic: ['👧', '✋', '❓'], blank: 'answering a question',
        q: "What's she doing?", qvi: 'Bạn ấy đang làm gì?' },
    ] },
    'u6.see': { u: 6, en: 'I can see {aw}.', vi: 'Tớ nhìn thấy {vi}.', ws: ['box', 'fox', 'ox'] },
    'u7.pass': { u: 7, en: 'Pass me the {w}, please.', vi: 'Làm ơn đưa giúp tớ {vi}.', ws: ['juice', 'jelly', 'jam'], pic: ['🤲', '{w}'] },
    'u7.like': { u: 7, en: 'I like {w}.', vi: 'Tớ thích {vi}.', ws: ['juice', 'jelly', 'jam'], pic: ['❤️', '{w}'] },
    'u8.this': { u: 8, en: 'This is {aw}.', vi: 'Đây là {vi}.', ws: ['village', 'van', 'volleyball'] },
    'u9.want': { u: 9, q: 'What do you want?', qvi: 'Bạn muốn gì?', en: 'I want some {w}.', vi: 'Tớ muốn {vi}.', ws: ['yogurt', 'yams', 'yo-yos'] },
    'u10.that': { u: 10, en: "That's {aw}.", vi: 'Kia là {vi}.', ws: ['zebra', 'zebu', 'zoo'] },
    'u11.they': { u: 11, list: [
      { key: 'sliding', en: "They're sliding.", vi: 'Các bạn ấy đang chơi cầu trượt.', pic: ['svg:slide2'], blank: 'sliding' },
      { key: 'riding', en: "They're riding bikes.", vi: 'Các bạn ấy đang đạp xe.', pic: ['🚴', '🚴'], blank: 'riding bikes' },
      { key: 'driving', en: "They're driving cars.", vi: 'Các bạn ấy đang lái ô tô.', pic: ['🚗', '🚙'], blank: 'driving cars' },
    ] },
    'u11.she': { u: 11, list: [
      { key: 'sliding', en: "She's sliding.", vi: 'Bạn ấy đang chơi cầu trượt.', pic: ['svg:slide1'], blank: 'sliding' },
      { key: 'riding', en: "She's riding a bike.", vi: 'Bạn ấy đang đạp xe.', pic: ['👧', '🚲'], blank: 'riding a bike' },
      { key: 'driving', en: "She's driving a car.", vi: 'Bạn ấy đang lái ô tô.', pic: ['👧', '🚗'], blank: 'driving a car' },
    ] },
    'u12.on': { u: 12, en: 'The {w} {be} on the table.', vi: '{Vi} ở trên bàn.', ws: ['cake', 'grapes', 'apple', 'bananas'], pic: ['scene:table:on:{w}'] },
    'u13.num': { u: 13, q: 'What number is it?', qvi: 'Đó là số mấy?', en: "It's {w}.", vi: 'Đó là số {vi}.', ws: ['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'] },
    'u14.my': { u: 14, en: "{P}'s my {w}.", vi: 'Đây là {vi} của tớ.', ws: ['brother', 'sister', 'grandmother'] },
    'u15.look': { u: 15, en: 'Look at the {w}.', vi: 'Nhìn {vi} kìa!', ws: ['shirts', 'shorts', 'shoes'] },
    // 'u16.pos' (cái chăn, ấm trà ở trong / gần lều, ở trên / gần bàn) được tạo trong tienganh-gen.js
  };

  // Các cặp hỏi – đáp để ôn (không cần hình). form: kiểu câu hỏi – các câu trả lời cùng kiểu không dùng làm đáp án nhiễu
  const pairs = [
    { u: 2, form: 'is-she', q: 'Is she flying a kite?', a: 'Yes, she is.', qvi: 'Bạn ấy đang thả diều phải không?', avi: 'Đúng vậy.' },
    { u: 2, form: 'is-she', q: 'Is he riding a bike?', a: "No, he isn't.", qvi: 'Bạn ấy đang đạp xe phải không?', avi: 'Không phải.' },
    { u: 5, form: 'doing', q: "What's she doing?", a: "She's doing a quiz.", qvi: 'Bạn ấy đang làm gì?', avi: 'Bạn ấy đang làm bài đố.' },
    { u: 5, form: 'doing', q: "What's he doing?", a: "He's colouring a square.", qvi: 'Bạn ấy đang làm gì?', avi: 'Bạn ấy đang tô màu hình vuông.' },
    { u: 6, form: 'there', q: 'Is there a fox?', a: 'Yes, there is.', qvi: 'Có con cáo không?', avi: 'Có.' },
    { u: 6, form: 'there', q: 'Is there an ox?', a: "No, there isn't.", qvi: 'Có con bò không?', avi: 'Không có.' },
    { u: 7, form: 'pass', q: 'Pass me the jam, please.', a: 'Here you are.', qvi: 'Làm ơn đưa giúp tớ lọ mứt.', avi: 'Của bạn đây.' },
    { u: 7, form: 'pass', q: 'Pass me the juice, please.', a: 'Here you are.', qvi: 'Làm ơn đưa giúp tớ nước ép.', avi: 'Của bạn đây.' },
    { u: 8, form: 'can', q: 'Can you draw a van?', a: 'Yes, I can.', qvi: 'Bạn có vẽ được xe tải nhỏ không?', avi: 'Có, tớ vẽ được.' },
    { u: 8, form: 'can', q: 'Can you draw a village?', a: "No, I can't.", qvi: 'Bạn có vẽ được ngôi làng không?', avi: 'Không, tớ không vẽ được.' },
    { u: 9, form: 'can', q: 'Can you see the yo-yos?', a: 'Yes, I can.', qvi: 'Bạn có nhìn thấy mấy cái yo-yo không?', avi: 'Có, tớ nhìn thấy.' },
    { u: 10, form: 'do', q: 'Do you like the zoo?', a: 'Yes, I do.', qvi: 'Bạn có thích sở thú không?', avi: 'Có, tớ thích.' },
    { u: 10, form: 'do', q: 'Do you like zebras?', a: "No, I don't.", qvi: 'Bạn có thích ngựa vằn không?', avi: 'Không, tớ không thích.' },
    { u: 14, form: 'age', q: 'How old is your brother?', a: "He's nineteen.", qvi: 'Anh trai của bạn bao nhiêu tuổi?', avi: 'Anh ấy mười chín tuổi.' },
    { u: 14, form: 'age', q: 'How old is your sister?', a: "She's sixteen.", qvi: 'Chị gái của bạn bao nhiêu tuổi?', avi: 'Chị ấy mười sáu tuổi.' },
    { u: 15, form: 'where', q: 'Where are the shoes?', a: 'Over there.', qvi: 'Đôi giày ở đâu?', avi: 'Ở đằng kia.' },
    { u: 15, form: 'where', q: 'Where are the shirts?', a: 'Over there.', qvi: 'Những chiếc áo sơ mi ở đâu?', avi: 'Ở đằng kia.' },
    { u: 16, form: 'is-it', q: 'Is the blanket near the tent?', a: "No, it isn't. It's in the tent.", qvi: 'Cái chăn có ở gần cái lều không?', avi: 'Không. Nó ở trong lều.' },
    { u: 16, form: 'is-it', q: 'Is the teapot on the table?', a: 'Yes, it is.', qvi: 'Ấm trà có ở trên bàn không?', avi: 'Có.' },
  ];

  App.TAData = { svg, words, units, tpl, pairs };
})(window.App);
