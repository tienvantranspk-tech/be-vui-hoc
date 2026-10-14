/* Chuyển màn hình. Hỗ trợ nút "Quay lại" của máy Android. */
(function (App) {
  'use strict';
  App.Screens = App.Screens || {};

  const Router = {
    stack: [],          // [{ name, params }]
    currentDef: null,
    skipGuard: false,

    top() { return this.stack[this.stack.length - 1]; },

    // Kiểm tra trước khi mở màn hình (ví dụ: hết giờ học hôm nay) → trả về tên màn hình thay thế
    guard: null,

    // Mở màn hình mới. replace: thay thế màn hình hiện tại (không thêm vào lịch sử)
    go(name, params = {}, { replace = false } = {}) {
      const alt = this.guard && this.guard(name, params);
      if (alt && alt !== name) { name = alt; params = {}; }
      if (replace && this.stack.length) {
        this.stack[this.stack.length - 1] = { name, params };
        history.replaceState({ i: this.stack.length - 1 }, '');
      } else {
        this.stack.push({ name, params });
        history.pushState({ i: this.stack.length - 1 }, '');
      }
      this.render();
    },

    // Quay lại màn hình trước (bỏ qua việc hỏi "có muốn dừng không")
    back() {
      if (this.stack.length > 1) { this.skipGuard = true; history.back(); }
    },

    // Về thẳng trang chủ
    home() {
      const n = this.stack.length - 1;
      if (n > 0) { this.skipGuard = true; history.go(-n); }
      else this.render();
    },

    init(start) {
      this.stack = [{ name: start, params: {} }];
      history.replaceState({ i: 0 }, '');
      window.addEventListener('popstate', (e) => {
        const i = e.state && typeof e.state.i === 'number' ? e.state.i : 0;
        const def = this.currentDef;
        // Màn hình đang chơi có thể chặn nút Quay lại (để hỏi bé trước)
        if (!this.skipGuard && i < this.stack.length - 1 && def && def.canLeave && !def.canLeave()) {
          history.pushState({ i: this.stack.length - 1 }, '');
          if (def.onBlockedBack) def.onBlockedBack();
          return;
        }
        this.skipGuard = false;
        if (i < this.stack.length - 1) {
          this.stack.length = i + 1;
          this.render();
        }
      });
      this.render();
    },

    render() {
      const cur = this.top();
      const def = App.Screens[cur.name];
      if (!def) { console.error('Không có màn hình:', cur.name); return; }
      if (this.currentDef && this.currentDef.leave) this.currentDef.leave();
      App.Speech.stop();
      document.querySelectorAll('#layer .modal-backdrop').forEach((m) => m.remove());
      const root = document.getElementById('app');
      root.innerHTML = '';
      const el = def.render(cur.params || {});
      root.appendChild(el);
      this.currentDef = def;
      if (def.mounted) def.mounted(el, cur.params || {});
    },
  };

  App.Router = Router;
})(window.App);
