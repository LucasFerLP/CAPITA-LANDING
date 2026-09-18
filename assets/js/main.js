(function () {
  "use strict";

  var header = document.getElementById("header");
  var navToggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  // Header shadow/border on scroll
  function onScroll() {
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav toggle
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
      mobileNav.hidden = isOpen;
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Abrir menú");
        mobileNav.hidden = true;
      });
    });
  }

  // Scroll reveal
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  // Waitlist form (client-side only demo — no backend wired yet)
  var form = document.getElementById("beta-form");
  var emailInput = document.getElementById("beta-email");
  var errorMsg = document.getElementById("beta-error");
  var successMsg = document.getElementById("beta-success");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var isValid = emailInput.checkValidity();

      if (!isValid) {
        emailInput.setAttribute("aria-invalid", "true");
        errorMsg.hidden = false;
        emailInput.focus();
        return;
      }

      emailInput.removeAttribute("aria-invalid");
      errorMsg.hidden = true;
      successMsg.hidden = false;
      form.reset();
    });

    emailInput.addEventListener("input", function () {
      if (emailInput.getAttribute("aria-invalid") === "true" && emailInput.checkValidity()) {
        emailInput.removeAttribute("aria-invalid");
        errorMsg.hidden = true;
      }
    });
  }
})();
