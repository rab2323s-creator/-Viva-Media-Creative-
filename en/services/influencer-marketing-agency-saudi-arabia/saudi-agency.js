(() => {
  "use strict";
  const form = document.getElementById("saudi-lead-form");
  const status = document.getElementById("sa-status");
  const submit = document.getElementById("sa-submit");
  const menuButton = document.querySelector(".sa-menu-toggle");
  const nav = document.getElementById("main-navigation");
  const dropdownToggles = document.querySelectorAll(".sa-subnav-toggle");
  const whatsapp = document.getElementById("sa-whatsapp");
  const MOBILE_NAV_BREAKPOINT = 1020;
  const WHATSAPP_PHONE = "4915565678291";
  const EMAILJS_KEY = "SzBBlvEjgwysF8vHJ";
  const SERVICE_ID = "service_6w76hdv";
  const TEMPLATE_ID = "template_11cfrv4";
  const COOLDOWN_MS = 25000;

  const year = document.getElementById("sa-year");
  if (year) year.textContent = String(new Date().getFullYear());

  function setMenu(isOpen) {
    if (!menuButton || !nav) return;
    nav.classList.toggle("is-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    if (!isOpen) {
      dropdownToggles.forEach(button => {
        button.setAttribute("aria-expanded", "false");
        button.closest(".home-nav-item")?.classList.remove("is-open");
      });
    }
  }
  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  dropdownToggles.forEach(button => {
    button.addEventListener("click", () => {
      const item = button.closest(".home-nav-item");
      const shouldOpen = button.getAttribute("aria-expanded") !== "true";
      dropdownToggles.forEach(other => {
        other.setAttribute("aria-expanded", "false");
        other.closest(".home-nav-item")?.classList.remove("is-open");
      });
      if (item && shouldOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > MOBILE_NAV_BREAKPOINT) setMenu(false);
  }, {passive: true});

  function track(name, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, Object.assign({
        page_market: "Saudi Arabia",
        page_language: "en",
        lead_source_page: "influencer-marketing-agency-saudi-arabia"
      }, params || {}));
    }
  }

  document.querySelectorAll('a[href="#proposal"]').forEach(anchor => {
    anchor.addEventListener("click", () => track("lead_cta_click", {
      cta_text: (anchor.textContent || "").trim().slice(0, 70)
    }));
  });

  let started = false;
  form?.addEventListener("focusin", () => {
    if (!started) {
      started = true;
      track("lead_form_start");
    }
  });

  function readField(name) {
    const field = form?.elements.namedItem(name);
    return field && "value" in field ? String(field.value).trim() : "";
  }

  function buildBrief() {
    return [
      "Hello Viva Media Creative, I would like to request Saudi influencers for a brand campaign.",
      "",
      "Company: " + readField("company"),
      "Contact person: " + readField("contact_person"),
      "Email: " + readField("email"),
      "Phone: " + readField("whatsapp"),
      "Market: Saudi Arabia / " + readField("target_city"),
      "Industry: " + readField("niche"),
      "Campaign objective: " + readField("goal"),
      "Preferred platform: " + readField("platform"),
      "Creator category: " + readField("creator_type"),
      "Budget: " + readField("budget"),
      readField("notes") ? "Notes: " + readField("notes") : ""
    ].filter(Boolean).join("\n");
  }

  function setStatus(type, message) {
    if (!status) return;
    status.hidden = false;
    status.dataset.type = type;
    status.textContent = message;
    status.focus({preventScroll: true});
  }

  function updateWhatsApp(brief) {
    if (!whatsapp) return;
    whatsapp.href = "https://wa.me/" + WHATSAPP_PHONE + "?text=" + encodeURIComponent(brief);
  }
  whatsapp?.addEventListener("click", () => track("whatsapp_click", {cta_location:"lead_sidebar"}));

  function storageGet(key) {
    try { return Number(window.sessionStorage.getItem(key) || 0); }
    catch (_) { return 0; }
  }
  function storageSet(key, value) {
    try { window.sessionStorage.setItem(key, String(value)); }
    catch (_) { /* storage not available */ }
  }

  const defaultText = submit?.textContent || "Send campaign brief";

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (readField("website")) {
      setStatus("error", "We could not process this request. Please contact our team directly.");
      return;
    }
    if (!document.getElementById("sa-consent")?.checked) {
      setStatus("error", "Please agree to the Privacy Policy before submitting.");
      return;
    }

    const now = Date.now();
    const lastSuccess = storageGet("saudiLeadLastSuccessfulSend");
    if (lastSuccess && now - lastSuccess < COOLDOWN_MS) {
      setStatus("error", "Your recent request was received. Please wait before submitting another.");
      return;
    }

    const brief = buildBrief();
    form.elements.namedItem("wa_message").value = brief;
    // Existing email template receives all expected legacy fields. Local segmentation also arrives in the message.
    form.elements.namedItem("target_country").value = "Saudi Arabia — " + readField("target_city");
    updateWhatsApp(brief);

    if (!window.emailjs || typeof window.emailjs.sendForm !== "function") {
      setStatus("error", "The form service is unavailable. Please send your brief through WhatsApp or email below.");
      track("lead_form_error", {error_type:"email_service_unavailable"});
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending your brief…";
    setStatus("pending", "Securely sending your campaign brief…");

    try {
      window.emailjs.init({publicKey: EMAILJS_KEY});
      await window.emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form);
      storageSet("saudiLeadLastSuccessfulSend", Date.now());
      track("lead_form_submit", {market:"Saudi Arabia", lead_type:"brand_campaign"});
      form.reset();
      form.elements.namedItem("target_country").value = "Saudi Arabia";
      setStatus("success", "Thank you. Your campaign brief has been submitted. Our team will review your requirements and contact you about the next steps. You can also follow up using the WhatsApp link.");
    } catch (error) {
      console.error("VMC Saudi lead submission failed", error);
      track("lead_form_error", {error_type:"email_delivery"});
      setStatus("error", "Your form could not be sent. Nothing has been confirmed. Please try again or continue with WhatsApp using the brief we prepared.");
    } finally {
      submit.disabled = false;
      submit.textContent = defaultText;
    }
  });
})();
