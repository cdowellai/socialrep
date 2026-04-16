/**
 * SocialRep AI Chatbot – Standalone Embed Widget
 * Zero dependencies. Works on any website via a single <script> tag.
 */
(function () {
  "use strict";

  /* ── Config from script tag ─────────────────────────────────── */
  var script =
    document.currentScript ||
    document.querySelector("script[data-user-id]");
  if (!script) return;

  var USER_ID = script.getAttribute("data-user-id");
  if (!USER_ID) return;

  var SUPABASE_URL = "https://emtszbalffrreubybfek.supabase.co";
  var ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtdHN6YmFsZmZycmV1YnliZmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzMwNDIsImV4cCI6MjA4NTcwOTA0Mn0.TPMlJ3nPU9XBHXUkA2QO75eoC4xuePVjenpNq5TozrM";

  var VISITOR_ID =
    "visitor_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

  /* ── State ──────────────────────────────────────────────────── */
  var messages = [];
  var conversationId = null;
  var isOpen = false;
  var isLoading = false;
  var handedOff = false;
  var visitorName = "";
  var visitorEmail = "";
  var settings = null;
  var currentView = "home"; // "home" | "chat"

  /* ── Persistent DOM references (avoid full rebuilds) ────────── */
  var bodyRef = null;
  var streamingBubbleRef = null;
  var rafPending = false;
  var pendingStreamContent = null;

  /* ── Shadow DOM container ───────────────────────────────────── */
  var host = document.createElement("div");
  host.id = "socialrep-chatbot-host";
  document.body.appendChild(host);
  var shadow = host.attachShadow({ mode: "closed" });

  /* ── Styles ─────────────────────────────────────────────────── */
  var style = document.createElement("style");
  style.textContent = getScopedCSS();
  shadow.appendChild(style);

  /* ── Root wrapper ───────────────────────────────────────────── */
  var root = document.createElement("div");
  root.className = "sr-root";
  shadow.appendChild(root);

  /* ── Fetch widget settings ──────────────────────────────────── */
  fetchSettings().then(function () {
    render();
  });

  /* ── Functions ──────────────────────────────────────────────── */

  function fetchSettings() {
    return fetch(SUPABASE_URL + "/functions/v1/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + ANON_KEY,
      },
      body: JSON.stringify({ action: "get_settings", userId: USER_ID }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && !data.error) settings = data;
      })
      .catch(function () {});
  }

  function getColor() {
    return (settings && settings.primary_color) || "#3b82f6";
  }

  function getTitle() {
    return (settings && settings.widget_title) || "Chat with us";
  }

  function getWelcome() {
    return (settings && settings.welcome_message) || "Hi! 👋 I'm Sarah from Support. How can I help you today?";
  }

  function getGreeting() {
    var h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }

  function needsPreChat() {
    if (visitorName || visitorEmail) return false;
    return settings && (settings.collect_name || settings.collect_email);
  }

  function render() {
    if (settings && settings.is_enabled === false) return;

    bodyRef = null;
    streamingBubbleRef = null;
    root.innerHTML = "";

    // FAB
    var fab = el("button", "sr-fab");
    fab.style.background = getColor();
    fab.innerHTML = isOpen ? closeSVG() : chatSVG();
    fab.onclick = function () {
      isOpen = !isOpen;
      render();
    };
    if (settings && settings.position === "bottom-left") {
      fab.classList.add("sr-left");
    }

    if (isOpen) {
      root.appendChild(buildWindow());
    }
    root.appendChild(fab);
  }

  function buildWindow() {
    var win = el("div", "sr-window");
    if (settings && settings.position === "bottom-left") {
      win.classList.add("sr-left");
    }

    win.appendChild(buildHeader());

    var body = el("div", "sr-body");
    bodyRef = body;

    if (needsPreChat()) {
      body.appendChild(buildPreChatForm(body));
      win.appendChild(body);
    } else if (currentView === "home" && messages.length === 0) {
      body.appendChild(buildHomeView());
      win.appendChild(body);
      win.appendChild(buildInputBar(true));
    } else {
      buildChatMessages(body);
      win.appendChild(body);
      if (!handedOff) {
        win.appendChild(buildInputBar(false));
      }
      setTimeout(function () { body.scrollTop = body.scrollHeight; }, 10);
    }

    win.appendChild(buildFooter());
    return win;
  }

  function buildHeader() {
    var header = el("div", "sr-header");

    var left = el("div", "sr-header-left");
    if (currentView === "chat" && messages.length > 0) {
      var back = el("button", "sr-back");
      back.innerHTML = backSVG();
      back.onclick = function () {
        currentView = "home";
        render();
      };
      left.appendChild(back);
    }

    var titleWrap = el("div", "sr-header-titles");
    var title = el("div", "sr-header-title");
    title.textContent = getTitle();
    var sub = el("div", "sr-header-sub");
    sub.innerHTML = '<span class="sr-dot"></span> We typically reply in a few minutes';
    titleWrap.appendChild(title);
    titleWrap.appendChild(sub);
    left.appendChild(titleWrap);

    var close = el("button", "sr-close");
    close.innerHTML = closeSVG();
    close.onclick = function () {
      isOpen = false;
      render();
    };

    header.appendChild(left);
    header.appendChild(close);
    return header;
  }

  function buildHomeView() {
    var wrap = el("div", "sr-home");

    var greet = el("div", "sr-greeting");
    greet.innerHTML = esc(getGreeting()) + ' <span class="sr-wave">👋</span>';
    wrap.appendChild(greet);

    var sub = el("div", "sr-greeting-sub");
    sub.textContent = "Ask us anything, or pick a topic below.";
    wrap.appendChild(sub);

    // Team presence card
    var team = el("div", "sr-card sr-team-card");
    var stack = el("div", "sr-avatar-stack");
    stack.innerHTML =
      '<div class="sr-avatar" style="background:#8b5cf6">S</div>' +
      '<div class="sr-avatar" style="background:#10b981">A</div>' +
      '<div class="sr-avatar" style="background:#f97316">J</div>';
    var teamMeta = el("div", "sr-team-meta");
    teamMeta.innerHTML =
      '<div class="sr-team-title"><span class="sr-dot"></span> Our team is online</div>' +
      '<div class="sr-team-sub">Average reply time: ~2 min</div>';
    team.appendChild(stack);
    team.appendChild(teamMeta);
    wrap.appendChild(team);

    // Sarah welcome card
    var sarah = el("div", "sr-card sr-sarah-card");
    sarah.innerHTML =
      '<div class="sr-avatar sr-avatar-lg" style="background:' + getColor() + '">S</div>' +
      '<div class="sr-sarah-body">' +
        '<div class="sr-sarah-name">Sarah <span class="sr-sarah-role">· Support</span></div>' +
        '<div class="sr-sarah-msg">' + md(getWelcome()) + '</div>' +
      '</div>';
    wrap.appendChild(sarah);

    return wrap;
  }

  function buildChatMessages(body) {
    messages.forEach(function (m, i) {
      var row = el("div", "sr-msg sr-" + m.role);
      var bubble = el("div", "sr-bubble sr-bubble-" + (m.role === "user" ? "u" : "a"));
      if (m.role === "user") {
        bubble.style.background = getColor();
      }
      bubble.innerHTML = m.role === "user" ? esc(m.content) : md(m.content);
      row.appendChild(bubble);
      body.appendChild(row);

      if (isLoading && m.role === "assistant" && i === messages.length - 1) {
        streamingBubbleRef = bubble;
      }
    });

    if (isLoading && !streamingBubbleRef) {
      var dots = el("div", "sr-msg sr-assistant");
      dots.innerHTML = '<div class="sr-bubble sr-bubble-a sr-typing"><span></span><span></span><span></span></div>';
      body.appendChild(dots);
    }
  }

  function buildInputBar(fromHome) {
    var inputBar = el("div", "sr-input-bar");
    var input = document.createElement("input");
    input.className = "sr-input";
    input.placeholder = "Type your message...";
    input.disabled = isLoading;
    var sendBtn = el("button", "sr-send");
    sendBtn.style.color = getColor();
    sendBtn.innerHTML = sendSVG();
    sendBtn.disabled = isLoading;

    function doSend() {
      var val = input.value.trim();
      if (!val || isLoading) return;
      if (currentView === "home") currentView = "chat";
      sendMessage(val);
      input.value = "";
    }
    sendBtn.onclick = doSend;
    input.onkeydown = function (e) {
      if (e.key === "Enter") doSend();
    };
    inputBar.appendChild(input);
    inputBar.appendChild(sendBtn);
    setTimeout(function () { input.focus(); }, 50);
    return inputBar;
  }

  function buildFooter() {
    var f = el("div", "sr-footer");
    f.innerHTML = 'Powered by <strong>SocialRep</strong>';
    return f;
  }

  /** Lightweight update — only touches the streaming bubble's content */
  function updateStreamingBubble(content) {
    pendingStreamContent = content;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      if (streamingBubbleRef && pendingStreamContent !== null) {
        streamingBubbleRef.innerHTML = md(pendingStreamContent);
        if (bodyRef) {
          bodyRef.scrollTop = bodyRef.scrollHeight;
        }
      }
    });
  }

  function buildPreChatForm(body) {
    var form = el("div", "sr-prechat");
    var title = el("div", "sr-prechat-title");
    title.textContent = "Before we start, tell us a bit about yourself:";
    form.appendChild(title);

    if (settings.collect_name) {
      var nameInput = document.createElement("input");
      nameInput.className = "sr-input sr-prechat-input";
      nameInput.placeholder = "Your name";
      nameInput.id = "sr-name";
      form.appendChild(nameInput);
    }
    if (settings.collect_email) {
      var emailInput = document.createElement("input");
      emailInput.className = "sr-input sr-prechat-input";
      emailInput.placeholder = "Your email";
      emailInput.type = "email";
      emailInput.id = "sr-email";
      form.appendChild(emailInput);
    }

    var btn = el("button", "sr-prechat-btn");
    btn.style.background = getColor();
    btn.textContent = "Start Chat";
    btn.onclick = function () {
      var n = form.querySelector("#sr-name");
      var e = form.querySelector("#sr-email");
      visitorName = n ? n.value.trim() : "";
      visitorEmail = e ? e.value.trim() : "";
      render();
    };
    form.appendChild(btn);
    return form;
  }

  function sendMessage(content) {
    messages.push({ role: "user", content: content });
    isLoading = true;
    currentView = "chat";
    render();

    var chatMsgs = messages.map(function (m) {
      return { role: m.role, content: m.content };
    });

    fetch(SUPABASE_URL + "/functions/v1/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + ANON_KEY,
      },
      body: JSON.stringify({
        messages: chatMsgs,
        userId: USER_ID,
        visitorId: VISITOR_ID,
        conversationId: conversationId,
        visitorName: visitorName || undefined,
        visitorEmail: visitorEmail || undefined,
      }),
    })
      .then(function (resp) {
        if (!resp.ok) {
          return resp.json().then(function (e) { throw new Error(e.error || "Error"); });
        }

        var newConvId = resp.headers.get("X-Conversation-Id");
        if (newConvId) conversationId = newConvId;

        if (resp.headers.get("X-Human-Handoff") === "true") {
          handedOff = true;
        }

        return streamResponse(resp);
      })
      .catch(function (err) {
        isLoading = false;
        messages.push({
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        });
        render();
      });
  }

  function streamResponse(resp) {
    var reader = resp.body.getReader();
    var decoder = new TextDecoder();
    var buffer = "";
    var assistantContent = "";

    messages.push({ role: "assistant", content: "" });
    var idx = messages.length - 1;
    render();

    function read() {
      return reader.read().then(function (result) {
        if (result.done) {
          isLoading = false;
          streamingBubbleRef = null;
          render();
          return;
        }

        buffer += decoder.decode(result.value, { stream: true });
        var nlIdx;
        while ((nlIdx = buffer.indexOf("\n")) !== -1) {
          var line = buffer.slice(0, nlIdx).replace(/\r$/, "");
          buffer = buffer.slice(nlIdx + 1);

          if (!line || line.startsWith(":") || !line.startsWith("data: ")) continue;
          var json = line.slice(6).trim();
          if (json === "[DONE]") continue;

          try {
            var parsed = JSON.parse(json);
            var delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content;
            if (delta) {
              assistantContent += delta;
              messages[idx].content = assistantContent;
              updateStreamingBubble(assistantContent);
            }
          } catch (e) {}
        }

        return read();
      });
    }

    return read();
  }

  /* ── Helpers ────────────────────────────────────────────────── */

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function md(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/^[-*]\s+(.+)/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
      .replace(/\n/g, "<br>");
  }

  function chatSVG() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  }

  function closeSVG() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  }

  function backSVG() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
  }

  function sendSVG() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
  }

  /* ── Scoped CSS ─────────────────────────────────────────────── */

  function getScopedCSS() {
    return (
      ".sr-root{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.5;color:#1f2937;}" +
      ".sr-fab{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.25);z-index:99999;transition:transform .2s}" +
      ".sr-fab:hover{transform:scale(1.08)}" +
      ".sr-fab.sr-left{right:auto;left:24px}" +
      ".sr-window{position:fixed;bottom:96px;right:24px;width:380px;max-width:calc(100vw - 32px);height:600px;max-height:calc(100vh - 120px);background:#fff;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,0.16),0 4px 12px rgba(0,0,0,0.06);display:flex;flex-direction:column;overflow:hidden;z-index:99998;animation:sr-slide-up .25s ease-out;border:1px solid rgba(0,0,0,0.04)}" +
      ".sr-window.sr-left{right:auto;left:24px}" +
      "@keyframes sr-slide-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}" +

      /* Header */
      ".sr-header{padding:14px 16px;background:#fff;border-bottom:1px solid #f1f1f3;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:8px}" +
      ".sr-header-left{display:flex;align-items:center;gap:10px;min-width:0;flex:1}" +
      ".sr-header-titles{min-width:0}" +
      ".sr-header-title{font-weight:600;font-size:15px;color:#0f172a;line-height:1.2}" +
      ".sr-header-sub{font-size:12px;color:#64748b;display:flex;align-items:center;gap:6px;margin-top:2px}" +
      ".sr-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 0 0 rgba(16,185,129,0.6);animation:sr-pulse 2s infinite}" +
      "@keyframes sr-pulse{0%{box-shadow:0 0 0 0 rgba(16,185,129,0.5)}70%{box-shadow:0 0 0 6px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}}" +
      ".sr-close,.sr-back{background:none;border:none;color:#64748b;cursor:pointer;padding:6px;display:flex;align-items:center;justify-content:center;border-radius:8px;transition:background .15s}" +
      ".sr-close:hover,.sr-back:hover{background:#f1f5f9;color:#0f172a}" +

      /* Body */
      ".sr-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:#fafafa}" +

      /* Home view */
      ".sr-home{display:flex;flex-direction:column;gap:14px;padding:4px 0}" +
      ".sr-greeting{font-size:24px;font-weight:700;color:#0f172a;letter-spacing:-0.02em}" +
      ".sr-wave{display:inline-block;animation:sr-wave 2s ease-in-out infinite;transform-origin:70% 70%}" +
      "@keyframes sr-wave{0%,60%,100%{transform:rotate(0)}10%,30%{transform:rotate(14deg)}20%{transform:rotate(-8deg)}40%{transform:rotate(-4deg)}50%{transform:rotate(10deg)}}" +
      ".sr-greeting-sub{font-size:13.5px;color:#64748b;margin-top:-6px}" +
      ".sr-card{background:#fff;border:1px solid #eef0f3;border-radius:14px;padding:14px}" +
      ".sr-team-card{display:flex;align-items:center;gap:12px}" +
      ".sr-avatar-stack{display:flex;align-items:center}" +
      ".sr-avatar-stack .sr-avatar{margin-left:-8px;border:2px solid #fff}" +
      ".sr-avatar-stack .sr-avatar:first-child{margin-left:0}" +
      ".sr-avatar{width:34px;height:34px;border-radius:50%;color:#fff;font-weight:600;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}" +
      ".sr-avatar-lg{width:40px;height:40px;font-size:14px}" +
      ".sr-team-meta{min-width:0}" +
      ".sr-team-title{font-size:13.5px;font-weight:600;color:#0f172a;display:flex;align-items:center;gap:6px}" +
      ".sr-team-sub{font-size:12px;color:#64748b;margin-top:2px}" +
      ".sr-sarah-card{display:flex;gap:12px;align-items:flex-start}" +
      ".sr-sarah-body{min-width:0;flex:1}" +
      ".sr-sarah-name{font-size:13.5px;font-weight:600;color:#0f172a}" +
      ".sr-sarah-role{font-weight:400;color:#94a3b8;font-size:12.5px}" +
      ".sr-sarah-msg{font-size:13.5px;color:#334155;line-height:1.55;margin-top:4px}" +

      /* Chat messages */
      ".sr-msg{display:flex}" +
      ".sr-user{justify-content:flex-end}" +
      ".sr-assistant{justify-content:flex-start}" +
      ".sr-bubble{max-width:80%;padding:10px 14px;border-radius:14px;font-size:13.5px;line-height:1.55;word-break:break-word}" +
      ".sr-bubble a{color:inherit;text-decoration:underline}" +
      ".sr-bubble ul{margin:4px 0;padding-left:18px}" +
      ".sr-bubble li{margin:2px 0}" +
      ".sr-bubble code{background:rgba(0,0,0,0.06);padding:1px 4px;border-radius:4px;font-size:12px}" +
      ".sr-bubble-u{color:#fff;border-radius:14px 14px 4px 14px}" +
      ".sr-bubble-a{background:#fff;color:#0f172a;border:1px solid #eef0f3;border-radius:14px 14px 14px 4px}" +
      ".sr-typing{display:flex;gap:4px;padding:12px 16px}" +
      ".sr-typing span{width:6px;height:6px;background:#9ca3af;border-radius:50%;animation:sr-dot 1.2s infinite}" +
      ".sr-typing span:nth-child(2){animation-delay:.2s}" +
      ".sr-typing span:nth-child(3){animation-delay:.4s}" +
      "@keyframes sr-dot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}" +

      /* Input bar */
      ".sr-input-bar{display:flex;gap:6px;align-items:center;padding:10px 12px;border-top:1px solid #f1f1f3;flex-shrink:0;background:#fff}" +
      ".sr-input{flex:1;border:1px solid #e5e7eb;border-radius:999px;padding:10px 16px;font-size:13.5px;outline:none;font-family:inherit;background:#f9fafb;transition:border-color .15s,background .15s}" +
      ".sr-input:focus{border-color:#cbd5e1;background:#fff}" +
      ".sr-send{width:38px;height:38px;border-radius:50%;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s}" +
      ".sr-send:hover:not(:disabled){background:#f1f5f9}" +
      ".sr-send:disabled{opacity:0.4;cursor:default}" +

      /* Footer */
      ".sr-footer{padding:8px;text-align:center;font-size:11px;color:#94a3b8;background:#fff;border-top:1px solid #f5f5f7;flex-shrink:0}" +
      ".sr-footer strong{color:#64748b;font-weight:600}" +

      /* Pre-chat */
      ".sr-prechat{padding:8px 0;display:flex;flex-direction:column;gap:12px}" +
      ".sr-prechat-title{font-size:13.5px;color:#6b7280;text-align:center}" +
      ".sr-prechat-input{width:100%;box-sizing:border-box;border-radius:10px}" +
      ".sr-prechat-btn{width:100%;padding:10px;border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit}"
    );
  }
})();
