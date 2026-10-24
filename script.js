"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector("#menu-toggle");
  const navLinks = document.querySelector("#nav-links");

  const contactForm = document.querySelector("#contact-form");
  const serviceSelect = document.querySelector("#service");
  const messageField = document.querySelector("#message");
  const submitButton = contactForm?.querySelector(
    'button[type="submit"]'
  );
  const formStatus = document.querySelector("#form-status");
  const yearElement = document.querySelector("#year");

  const recipient = "appzenstudioo@gmail.com";
  const formEndpoint = `https://formsubmit.co/ajax/${recipient}`;

  // Automatically update the footer year.
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }

  // Mobile navigation.
  if (menuToggle && navLinks) {
    function closeMenu() {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    }

    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 640) {
        closeMenu();
      }
    });
  }

  // Prefill the service when visitors click a demo or service button.
  document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      const service = link.dataset.service;

      if (!serviceSelect || !service) {
        return;
      }

      const optionExists = Array.from(serviceSelect.options).some(
        (option) => option.value === service
      );

      if (optionExists) {
        serviceSelect.value = service;
      }

      const starterMessages = {
        "ZenValuers demo request":
          "Hello App Zen Studio, I would like to request a ZenValuers demo. Please share the project's current status and preview availability.",

        "Restaurant website demo request":
          "Hello App Zen Studio, I would like to request a restaurant website demo. Please share the project's current status and preview availability.",

        "One-page business website":
          "Hello App Zen Studio, I am interested in a one-page website for my business.",

        "Landing page":
          "Hello App Zen Studio, I am interested in a custom landing page.",

        "Website improvement":
          "Hello App Zen Studio, I would like to discuss improvements to my existing website.",

        "Similar web tool":
          "Hello App Zen Studio, I would like to discuss building a web tool."
      };

      // Keep any message the visitor has already typed.
      if (
        messageField &&
        !messageField.value.trim() &&
        starterMessages[service]
      ) {
        messageField.value = starterMessages[service];
      }
    });
  });

  // Contact form submission.
  if (
    contactForm &&
    serviceSelect &&
    messageField &&
    submitButton &&
    formStatus
  ) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      formStatus.textContent = "";
      formStatus.className = "form-status";

      if (!contactForm.reportValidity()) {
        return;
      }

      if (submitButton.disabled) {
        return;
      }

      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());

      // Keep the recipient fixed; never accept it from visitor input.
      payload._subject = `New App Zen Studio enquiry: ${payload.service}`;
      payload._template = "table";
      payload._replyto = String(payload.email || "").trim();

      const originalButtonContent = submitButton.innerHTML;

      submitButton.disabled = true;
      submitButton.innerHTML =
        '<span class="spinner" aria-hidden="true"></span> Sending...';

      formStatus.textContent = "Submitting your enquiry...";

      try {
        const response = await fetch(formEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => null);

        const accepted =
          response.ok &&
          result &&
          (
            result.success === true ||
            result.success === "true"
          );

        if (!accepted) {
          const detail = result?.message
            ? ` ${result.message}`
            : "";

          throw new Error(
            `The form provider did not confirm submission.${detail}`
          );
        }

        contactForm.reset();

        formStatus.className = "form-status is-success";
        formStatus.textContent =
          "Thank you! Your enquiry was submitted successfully. We'll get back to you as soon as possible.";

        formStatus.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });

      } catch (error) {
        console.error("Contact form submission failed:", error);

        formStatus.className = "form-status is-error";
        formStatus.textContent =
          "We couldn't confirm your enquiry. Please check your connection and try again. If this is your first test, confirm the activation email from FormSubmit first.";

      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonContent;
      }
    });
  }
});