(function () {
  const DEMOS = [
    { id: "home", href: "/", label: "Acasă" },
    { id: "hiro", href: "/demos/hiro/", label: "Hiro" },
    { id: "image", href: "/demos/image/", label: "AR.js" },
    { id: "mind", href: "/demos/mind/", label: "MindAR" },
    { id: "location", href: "/demos/location/", label: "Locație" },
  ];

  function currentDemoId() {
    const path = window.location.pathname;
    if (path.includes("/demos/hiro")) return "hiro";
    if (path.includes("/demos/image")) return "image";
    if (path.includes("/demos/mind")) return "mind";
    if (path.includes("/demos/location")) return "location";
    return "home";
  }

  const activeId = currentDemoId();
  const nav = document.createElement("nav");
  nav.id = "site-nav";
  nav.className = "site-nav";
  nav.setAttribute("aria-label", "Demo-uri WebAR");

  DEMOS.forEach((demo) => {
    const a = document.createElement("a");
    a.href = demo.href;
    a.textContent = demo.label;
    if (demo.id === activeId) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
    nav.appendChild(a);
  });

  document.body.insertBefore(nav, document.body.firstChild);
  document.body.classList.add("has-site-nav");
})();
