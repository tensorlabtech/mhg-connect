(function () {
    "use strict";

    var knowledge = window.MHGLearningContent;
    if (!knowledge) return;

    function fileNameFor(frame) {
        var raw = frame.dataset.baseSrc || frame.getAttribute("src") || "";
        return raw.split("?")[0].split("#")[0].split("/").pop();
    }

    function createSection(doc, label, value) {
        var section = doc.createElement("section");
        var heading = doc.createElement("h4");
        var paragraph = doc.createElement("p");
        heading.textContent = label;
        paragraph.textContent = value;
        section.appendChild(heading);
        section.appendChild(paragraph);
        return section;
    }

    function installInDocument(doc, mapping) {
        if (!doc || !doc.body || !mapping) return;
        if (doc.documentElement.dataset.mhgLearningReady === "true") return;
        doc.documentElement.dataset.mhgLearningReady = "true";

        var style = doc.createElement("style");
        style.id = "mhg-learning-popover-style";
        style.textContent = [
            ".mhg-learning-popover{position:fixed;z-index:2147483647;width:min(390px,calc(100vw - 24px));max-height:min(560px,calc(100vh - 24px));overflow:auto;padding:18px;border:1px solid rgba(214,174,75,.62);border-radius:14px;background:rgba(15,16,22,.98);box-shadow:0 20px 60px rgba(0,0,0,.52),0 0 0 1px rgba(255,255,255,.04) inset;color:#f5f0e6;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;letter-spacing:0;opacity:0;visibility:hidden;transform:translateY(6px) scale(.985);transform-origin:top left;transition:opacity .14s ease,transform .14s ease,visibility .14s;pointer-events:none}",
            ".mhg-learning-popover[data-open=true]{opacity:1;visibility:visible;transform:none;pointer-events:auto}",
            ".mhg-learning-popover__head{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start;padding-bottom:13px;border-bottom:1px solid rgba(214,174,75,.22)}",
            ".mhg-learning-popover__eyebrow{margin:0 0 6px;color:#e0b842;font:700 10px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;text-transform:uppercase}",
            ".mhg-learning-popover h3{margin:0;color:#fffaf0;font:700 20px/1.25 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}",
            ".mhg-learning-popover__close{display:grid;place-items:center;width:32px;height:32px;padding:0;border:1px solid rgba(255,255,255,.16);border-radius:8px;background:rgba(255,255,255,.04);color:#d9d2c4;font:20px/1 sans-serif;cursor:pointer}",
            ".mhg-learning-popover__body{display:grid;gap:13px;padding-top:14px}",
            ".mhg-learning-popover section{margin:0;padding:0}",
            ".mhg-learning-popover h4{margin:0 0 4px;color:#9aa8bd;font:700 10px/1.25 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;text-transform:uppercase}",
            ".mhg-learning-popover p{margin:0;color:#e9e3d7;font:500 13px/1.55 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}",
            ".mhg-learning-popover section:nth-child(3) p{padding:9px 10px;border-left:2px solid #49d5a7;border-radius:0 7px 7px 0;background:rgba(73,213,167,.07);color:#dff8ef}",
            ".mhg-learning-popover__actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:15px;padding-top:13px;border-top:1px solid rgba(255,255,255,.1)}",
            ".mhg-learning-popover__hint{color:#8f99aa;font:500 10px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace}",
            ".mhg-learning-popover__passport{padding:8px 10px;border:1px solid rgba(214,174,75,.4);border-radius:8px;background:rgba(214,174,75,.1);color:#f1cf70;font:700 11px/1.2 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;cursor:pointer}",
            "[data-mhg-learning]{cursor:help}",
            "[data-mhg-learning]:focus-visible{filter:drop-shadow(0 0 8px rgba(224,184,66,.8))}",
            "@media(max-width:640px){.mhg-learning-popover{max-height:calc(100vh - 16px);padding:15px}.mhg-learning-popover__actions{align-items:flex-start;flex-direction:column}.mhg-learning-popover__passport{width:100%}}",
            "@media(prefers-reduced-motion:reduce){.mhg-learning-popover{transition:none}}"
        ].join("");
        doc.head.appendChild(style);

        var popover = doc.createElement("aside");
        popover.className = "mhg-learning-popover";
        popover.setAttribute("role", "dialog");
        popover.setAttribute("aria-modal", "false");
        popover.setAttribute("aria-label", "Giải thích khối kỹ thuật");
        popover.innerHTML = '<div class="mhg-learning-popover__head"><div><p class="mhg-learning-popover__eyebrow"></p><h3></h3></div><button class="mhg-learning-popover__close" type="button" aria-label="Đóng">×</button></div><div class="mhg-learning-popover__body"></div><div class="mhg-learning-popover__actions"><span class="mhg-learning-popover__hint">Hover để xem · click để ghim</span><button class="mhg-learning-popover__passport" type="button">Xem quan hệ trong sơ đồ</button></div>';
        doc.body.appendChild(popover);

        var eyebrow = popover.querySelector(".mhg-learning-popover__eyebrow");
        var title = popover.querySelector("h3");
        var body = popover.querySelector(".mhg-learning-popover__body");
        var closeButton = popover.querySelector(".mhg-learning-popover__close");
        var passportButton = popover.querySelector(".mhg-learning-popover__passport");
        var activeNode = null;
        var pinned = false;
        var allowPassport = false;
        var hideTimer = 0;

        function clearHideTimer() {
            if (hideTimer) window.clearTimeout(hideTimer);
            hideTimer = 0;
        }

        function place(x, y) {
            var margin = 12;
            var gap = 16;
            var width = popover.offsetWidth;
            var height = popover.offsetHeight;
            var left = x + gap;
            var top = y + gap;
            if (left + width + margin > doc.documentElement.clientWidth) left = x - width - gap;
            if (top + height + margin > doc.documentElement.clientHeight) top = doc.documentElement.clientHeight - height - margin;
            popover.style.left = Math.max(margin, left) + "px";
            popover.style.top = Math.max(margin, top) + "px";
        }

        function render(node, concept, x, y) {
            clearHideTimer();
            activeNode = node;
            eyebrow.textContent = concept.kind;
            title.textContent = node.dataset.nodeLabel || "Khối kỹ thuật";
            body.replaceChildren(
                createSection(doc, "Là gì?", concept.definition),
                createSection(doc, "Vai trò trong hệ thống", concept.role),
                createSection(doc, "Luồng đi qua", concept.flow),
                createSection(doc, "Khi trình bày", concept.talk)
            );
            popover.dataset.open = "true";
            place(x, y);
        }

        function hide(force) {
            if (pinned && !force) return;
            clearHideTimer();
            popover.dataset.open = "false";
            pinned = false;
            activeNode = null;
        }

        function scheduleHide() {
            clearHideTimer();
            hideTimer = window.setTimeout(function () { hide(false); }, 180);
        }

        Object.keys(mapping).forEach(function (id) {
            var node = doc.querySelector('[data-node-id="' + id + '"]');
            var concept = knowledge.concepts[mapping[id]];
            if (!node || !concept) return;
            node.dataset.mhgLearning = mapping[id];
            node.setAttribute("aria-description", concept.definition + " " + concept.role);
            Array.prototype.forEach.call(node.children, function (child) {
                if (child.tagName && child.tagName.toLowerCase() === "title") child.textContent = "";
            });
            node.addEventListener("pointerenter", function (event) {
                if (!pinned) render(node, concept, event.clientX, event.clientY);
            });
            node.addEventListener("pointermove", function (event) {
                if (!pinned && popover.dataset.open === "true") place(event.clientX, event.clientY);
            });
            node.addEventListener("pointerleave", scheduleHide);
            node.addEventListener("focus", function () {
                if (pinned) return;
                var box = node.getBoundingClientRect();
                render(node, concept, box.right, box.top);
            });
            node.addEventListener("blur", scheduleHide);
            node.addEventListener("pointerdown", function (event) {
                if (allowPassport) return;
                event.preventDefault();
                event.stopImmediatePropagation();
            }, true);
            node.addEventListener("click", function (event) {
                if (allowPassport) return;
                event.preventDefault();
                event.stopImmediatePropagation();
                pinned = true;
                render(node, concept, event.clientX || node.getBoundingClientRect().right, event.clientY || node.getBoundingClientRect().top);
            }, true);
        });

        popover.addEventListener("pointerenter", clearHideTimer);
        popover.addEventListener("pointerleave", scheduleHide);
        closeButton.addEventListener("click", function () { hide(true); });
        passportButton.addEventListener("click", function () {
            var node = activeNode;
            hide(true);
            if (!node) return;
            allowPassport = true;
            node.dispatchEvent(new doc.defaultView.MouseEvent("click", { bubbles: true, cancelable: true, view: doc.defaultView }));
            allowPassport = false;
        });
        doc.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && popover.dataset.open === "true") hide(true);
        });
        doc.addEventListener("pointerdown", function (event) {
            if (!pinned || popover.contains(event.target) || (activeNode && activeNode.contains(event.target))) return;
            hide(true);
        });
    }

    function installInFrame(frame) {
        var mapping = knowledge.byFile[fileNameFor(frame)];
        if (!mapping) return;
        try {
            installInDocument(frame.contentDocument, mapping);
        } catch (_) {
            return;
        }
    }

    function watch(frame) {
        if (!frame || frame.dataset.mhgLearningFrame === "true") return;
        frame.dataset.mhgLearningFrame = "true";
        frame.addEventListener("load", function () { installInFrame(frame); });
        installInFrame(frame);
    }

    function initialize() {
        var currentFile = window.location.pathname.split("/").pop();
        installInDocument(document, knowledge.byFile[currentFile]);
        document.querySelectorAll("iframe").forEach(watch);
        new MutationObserver(function () {
            document.querySelectorAll("iframe").forEach(watch);
        }).observe(document.documentElement, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }
})();
