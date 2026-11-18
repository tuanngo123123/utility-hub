// Trò chuyện AI (bản demo miễn phí): chat với AI qua Pollinations
// (miễn phí, không cần key) — endpoint tương thích OpenAI đã kiểm
// CORS mở (Access-Control-Allow-Origin: *) ngày 18/11/2026, gọi POST
// trực tiếp từ trình duyệt được. Giới hạn 20 tin/ngày/người để dịch
// vụ miễn phí công khai không bị lạm dụng; lỗi báo bằng tiếng Việt.
export const meta = {
  id: 'tro-chuyen-ai',
  name: 'Trò chuyện AI',
  category: 'Học tập',
  categorySlug: 'hoc-tap',
  desc: 'Chat thử với AI miễn phí ngay trên web: hỏi đáp, giải thích, dịch câu, viết nháp email — không cần tài khoản, không cần cài đặt. Bản demo: 20 tin mỗi ngày.',
  keywords: 'chat ai, trò chuyện ai, hỏi ai, chatbot miễn phí, chat với ai, ai trả lời, hỏi đáp ai',
  icon: '💬',
  seoTitle: 'Trò chuyện AI miễn phí — hỏi đáp ngay trên web, không cần tài khoản',
  seoDesc: 'Chat thử với AI miễn phí trên Tiện Ích Hub: hỏi đáp, giải thích kiến thức, dịch câu, viết nháp email. Không cần đăng ký, 20 tin miễn phí mỗi ngày.',
};

export function body() {
  return `
<div class="tool-panel">
  <div class="tool-head">
    <p class="muted">Hỏi AI bất cứ điều gì — giải thích kiến thức, dịch câu, viết nháp email, gợi ý ý tưởng. Bản demo miễn phí, không cần tài khoản.</p>
    <p class="muted" id="ai-quota"></p>
  </div>
  <div id="ai-log" style="display:flex;flex-direction:column;gap:10px;max-height:420px;overflow-y:auto;padding:12px;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--bg-soft);margin-bottom:12px;"></div>
  <div id="ai-suggest" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
    <button type="button" class="chip" data-q="Giải thích lãi kép thật đơn giản, ví dụ cụ thể">Giải thích lãi kép đơn giản</button>
    <button type="button" class="chip" data-q="Viết giúp tôi email xin nghỉ phép 2 ngày, lịch sự, ngắn gọn">Viết email xin nghỉ phép</button>
    <button type="button" class="chip" data-q="Dịch câu này sang tiếng Anh: Tôi muốn đặt phòng khách sạn 2 đêm cho 2 người lớn và 1 trẻ em.">Dịch câu sang tiếng Anh</button>
    <button type="button" class="chip" data-q="Cho tôi 3 ý tưởng tiết kiệm tiền mỗi tháng cho người đi làm">3 ý tưởng tiết kiệm tiền</button>
  </div>
  <div style="display:flex;gap:8px;align-items:flex-start;">
    <div class="field" style="flex:1;min-width:0;margin:0;">
      <input id="ai-input" type="text" maxlength="500" placeholder="Nhập câu hỏi của bạn… (tối đa 500 ký tự)" autocomplete="off">
    </div>
    <button type="button" class="btn btn-primary" id="ai-send" style="flex:none;">Gửi</button>
  </div>
  <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
    <button type="button" class="btn" id="ai-new" data-uh-reset="1">Đoạn chat mới</button>
  </div>
  <p class="note" style="margin-top:12px;">Bản demo chạy trên AI miễn phí công khai — chất lượng có thể thay đổi, lúc đông người có thể trả lời chậm. Đừng gửi thông tin cá nhân nhạy cảm (mật khẩu, số tài khoản, giấy tờ tùy thân).</p>
</div>`;
}

export function init(root) {
  const $ = (id) => root.querySelector('#' + id);
  const URL = 'https://text.pollinations.ai/openai/v1/chat/completions';
  const MODEL = 'openai';
  const SYSTEM = 'Bạn là trợ lý AI thân thiện của trang web Tiện Ích Hub (tienichhub.io.vn). Trả lời bằng tiếng Việt, trừ khi người dùng hỏi bằng ngôn ngữ khác. Trả lời ngắn gọn, rõ ràng, dễ hiểu. Không bịa số liệu, ngày tháng hay thông tin không chắc chắn — nếu không biết thì nói là không biết. Không tự nhận mình là ChatGPT hay mô hình của công ty khác.';
  const MAX_PER_DAY = 20;
  const MAX_LEN = 500;
  const MAX_CTX = 6;
  const TIMEOUT_MS = 60000;
  const KEY = 'uh_ai_chat_quota';
  const WELCOME = 'Chào bạn! Tôi là trợ lý AI của Tiện Ích Hub. Hỏi tôi bất cứ điều gì nhé — giải thích, dịch câu, viết nháp, gợi ý ý tưởng…';

  let history = [];
  let busy = false;

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function loadQuota() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { date: today(), count: 0 };
      const q = JSON.parse(raw);
      if (q.date !== today()) return { date: today(), count: 0 };
      return q;
    } catch (e) { return { date: today(), count: 0 }; }
  }

  function saveQuota(q) {
    try { localStorage.setItem(KEY, JSON.stringify(q)); } catch (e) { /* localStorage không khả dụng */ }
  }

  function remaining() {
    return Math.max(0, MAX_PER_DAY - loadQuota().count);
  }

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Render Markdown-lite cho câu trả lời của AI: escape HTML trước rồi
  // mới đổi **đậm**, *nghiêng*, `code`, đầu dòng "- " thành dấu •.
  // Chỉ dùng cho tin AI thật, không dùng cho tin lỗi/đang gõ.
  function mdLite(s) {
    let t = escHtml(s);
    t = t.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    t = t.replace(/^[-*] (.+)$/gm, '• $1');
    return t;
  }

  function bubble(role, text, kind) {
    const div = document.createElement('div');
    const isUser = role === 'user';
    let bg = isUser ? 'var(--accent-soft)' : 'var(--surface)';
    let align = isUser ? 'align-self:flex-end;' : 'align-self:flex-start;';
    if (kind === 'error') { bg = 'var(--bad-soft)'; align = 'align-self:flex-start;'; }
    if (kind === 'typing') { bg = 'var(--surface)'; align = 'align-self:flex-start;'; }
    div.setAttribute('style', align + 'max-width:88%;padding:10px 12px;border-radius:12px;background:' + bg + ';color:var(--ink);white-space:pre-wrap;word-break:break-word;line-height:1.55;font-size:15px;');
    div.innerHTML = (role === 'ai' && !kind) ? mdLite(text) : escHtml(text);
    $('ai-log').appendChild(div);
    $('ai-log').scrollTop = $('ai-log').scrollHeight;
    return div;
  }

  function updateQuotaUI() {
    const left = remaining();
    $('ai-quota').textContent = 'Hôm nay bạn còn ' + left + '/' + MAX_PER_DAY + ' lượt chat miễn phí.';
    const out = left <= 0;
    $('ai-input').disabled = out;
    $('ai-send').disabled = out;
    if (out) $('ai-input').placeholder = 'Hôm nay bạn đã hết lượt chat miễn phí, mai quay lại nhé.';
  }

  function setBusy(v) {
    busy = v;
    $('ai-send').disabled = v || remaining() <= 0;
    $('ai-input').disabled = v || remaining() <= 0;
  }

  async function send(text) {
    const msg = (text || '').trim();
    if (!msg || busy) return;
    if (msg.length > MAX_LEN) {
      bubble('ai', 'Câu hỏi dài quá 500 ký tự rồi, bạn rút ngắn lại nhé.', 'error');
      return;
    }
    if (remaining() <= 0) {
      bubble('ai', 'Hôm nay bạn đã hết 20 lượt chat miễn phí, mai quay lại nhé.', 'error');
      updateQuotaUI();
      return;
    }
    bubble('user', msg);
    history.push({ role: 'user', content: msg });
    $('ai-input').value = '';
    setBusy(true);
    const typing = bubble('ai', 'AI đang trả lời…', 'typing');
    const messages = [{ role: 'system', content: SYSTEM }].concat(history.slice(-MAX_CTX));
    let reply = '';
    let errKind = '';
    try {
      const res = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, messages, temperature: 0.3, max_tokens: 1024 }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) {
        errKind = (res.status === 429 || res.status === 503) ? 'busy' : 'other';
      } else {
        const data = await res.json();
        reply = data && data.choices && data.choices[0] && data.choices[0].message
          ? (data.choices[0].message.content || '').trim()
          : '';
        if (!reply) errKind = 'other';
      }
    } catch (e) {
      errKind = 'network';
    }
    typing.remove();
    setBusy(false);
    if (errKind) {
      // Lần gửi lỗi không tính vào lượt chat.
      history.pop();
      const text = errKind === 'busy'
        ? 'AI đang bận, thử lại sau ít giây nhé.'
        : errKind === 'network'
          ? 'Không kết nối được, kiểm tra mạng rồi thử lại nhé.'
          : 'AI trả lời lỗi, thử lại sau ít giây nhé.';
      bubble('ai', text, 'error');
      return;
    }
    bubble('ai', reply);
    history.push({ role: 'assistant', content: reply });
    const q = loadQuota();
    q.count += 1;
    saveQuota(q);
    updateQuotaUI();
  }

  function newChat() {
    history = [];
    $('ai-log').innerHTML = '';
    bubble('ai', WELCOME);
  }

  $('ai-send').addEventListener('click', () => send($('ai-input').value));
  $('ai-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); send($('ai-input').value); }
  });
  $('ai-new').addEventListener('click', newChat);
  root.querySelectorAll('#ai-suggest .chip').forEach((btn) => {
    btn.addEventListener('click', () => send(btn.getAttribute('data-q')));
  });

  bubble('ai', WELCOME);
  updateQuotaUI();
}
