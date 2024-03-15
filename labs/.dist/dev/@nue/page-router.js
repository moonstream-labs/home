// browser/page-router.js
async function loadPage(path) {
  dispatchEvent(new Event("before:route"));
  const dom = mkdom(await getHTML(path));
  document.title = $("title", dom)?.textContent;
  const new_styles = swapStyles($$("style"), $$("style", dom));
  new_styles.forEach((style) => $("head").appendChild(style));
  $("body").classList = $("body2", dom).classList;
  const paths = swapStyles($$("link"), $$("link", dom));
  loadCSS(paths, () => {
    updateHTML(dom);
    setActive(path);
    scrollTo(0, 0);
    dispatchEvent(new Event("route"));
  });
}
var updateHTML = function(dom) {
  for (const query of ["header", "main", "footer"]) {
    const a = $("body >" + query);
    const b = $("body2 >" + query, dom);
    if (a && b) {
      if (a.outerHTML != b.outerHTML)
        a.replaceWith(b);
    } else if (a) {
      a.remove();
    } else if (b) {
      const fn = query == "footer" ? "append" : "prepend";
      document.body[fn](b);
    }
  }
};
function onclick(root, fn) {
  root.addEventListener("click", (e) => {
    const el = e.target.closest("[href]");
    const path = el?.getAttribute("href");
    const target = el?.getAttribute("target");
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !path || path[0] == "#" || path.includes("//") || path.startsWith("mailto:") || target == "_blank")
      return;
    if (path != location.pathname)
      fn(path);
    e.preventDefault();
  });
}
function setActive(path, attrname = "active") {
  $$(`[${attrname}]`).forEach((el) => el.removeAttribute(attrname));
  $$(`[href="${path}"]`).forEach((el) => el.toggleAttribute(attrname, true));
}
var $ = function(query, root = document) {
  return root.querySelector(query);
};
var $$ = function(query, root = document) {
  return [...root.querySelectorAll(query)];
};
var hasStyle = function(sheet, sheets) {
  return sheets.find((el) => el.getAttribute("href") == sheet.getAttribute("href"));
};
var swapStyles = function(orig, styles) {
  orig.forEach((el, i) => el.disabled = !hasStyle(el, styles));
  return styles.filter((el) => !hasStyle(el, orig));
};
async function getHTML(path) {
  if (!cache[path]) {
    const resp = await fetch(path);
    cache[path] = await resp.text();
  }
  return cache[path];
}
var mkdom = function(html) {
  html = html.replace(/<(\/?)body/g, "<$1body2");
  const tmpl = document.createElement("template");
  tmpl.innerHTML = html.trim();
  return tmpl.content;
};
var loadCSS = function(paths, fn) {
  let loaded = 0;
  !paths[0] ? fn() : paths.forEach((el, i) => {
    loadSheet(el.href, () => {
      if (++loaded == paths.length)
        fn();
    });
  });
};
var loadSheet = function(path, fn) {
  const el = document.createElement("link");
  el.rel = "stylesheet";
  el.href = path;
  $("head").appendChild(el);
  el.onload = fn;
};
var is_browser = typeof window == "object";
if (is_browser) {
  if (!document.startViewTransition) {
    document.startViewTransition = (fn) => fn();
  }
  history.pushState({ path: location.pathname }, 0);
  onclick(document, async (path) => {
    document.startViewTransition(async function() {
      await loadPage(path);
      history.pushState({ path }, 0, path);
    });
  });
  setActive(location.pathname);
  addEventListener("popstate", (e) => {
    const { path } = e.state || {};
    if (path)
      loadPage(path);
  });
}
var cache = {};
export {
  setActive,
  onclick,
  loadPage
};
