const targetDate = new Date("2026-06-06T00:00:00").getTime();

/* Countdown */
function updateCountdown() {
  const now = Date.now();
  const distance = Math.max(targetDate - now, 0);

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
  if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
  if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
  if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* Reveal Animation */
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("show");
    }),
  { threshold: 0.15 },
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

/* RSVP Form */
const form = document.getElementById("rsvpForm");
const message = document.getElementById("formMessage");

if (form && message) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Validate willAttend is not empty
    const willAttendSelect = form.querySelector("select[name='willAttend']");
    if (!willAttendSelect.value) {
      message.textContent = "Please select whether you will attend.";
      message.style.color = "#e45757";
      return;
    }

    message.textContent = "Submitting your RSVP...";
    message.style.color = "#2f6f9f";

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit RSVP.");
      }

      message.textContent = data.message;
      message.style.color = "#2f7d4f";
      form.reset();
    } catch (error) {
      message.textContent = error.message;
      message.style.color = "#e45757";
    }
  });
}

/* Hero Slideshow */
const slides = document.querySelectorAll(".hero-slide");
let currentSlide = 0;

if (slides.length > 0) {
  setInterval(() => {
    slides[currentSlide].classList.remove("active");

    currentSlide = (currentSlide + 1) % slides.length;

    slides[currentSlide].classList.add("active");
  }, 5000);
}

/* ==========================
   GALLERY CAROUSEL
========================== */

const galleryTrack = document.querySelector(".gallery-track");
const galleryPrev = document.querySelector(".gallery-btn.prev");
const galleryNext = document.querySelector(".gallery-btn.next");

if (galleryTrack && galleryPrev && galleryNext) {
  const slideAmount = () => galleryTrack.clientWidth * 0.85;

  /* Manual next */
  galleryNext.addEventListener("click", () => {
    galleryTrack.scrollBy({
      left: slideAmount(),
      behavior: "smooth",
    });
  });

  /* Manual previous */
  galleryPrev.addEventListener("click", () => {
    galleryTrack.scrollBy({
      left: -slideAmount(),
      behavior: "smooth",
    });
  });

  /* AUTO SLIDE EVERY 3 SECONDS */
  let autoSlide = setInterval(() => {
    const maxScrollLeft = galleryTrack.scrollWidth - galleryTrack.clientWidth;

    /* If reached end, go back to start */
    if (galleryTrack.scrollLeft >= maxScrollLeft - 10) {
      galleryTrack.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    } else {
      galleryTrack.scrollBy({
        left: slideAmount(),
        behavior: "smooth",
      });
    }
  }, 3000);

  /* Pause autoplay when hovering */
  galleryTrack.addEventListener("mouseenter", () => {
    clearInterval(autoSlide);
  });

  /* Resume autoplay when mouse leaves */
  galleryTrack.addEventListener("mouseleave", () => {
    autoSlide = setInterval(() => {
      const maxScrollLeft = galleryTrack.scrollWidth - galleryTrack.clientWidth;

      if (galleryTrack.scrollLeft >= maxScrollLeft - 10) {
        galleryTrack.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        galleryTrack.scrollBy({
          left: slideAmount(),
          behavior: "smooth",
        });
      }
    }, 3000);
  });
}

/* Gallery Click Preview Modal */
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");
const closeModal = document.querySelector(".close-modal");
const galleryImages = document.querySelectorAll(".gallery-track img");

function closeImageModal() {
  if (!modal || !modalImg) return;

  modal.classList.remove("show");
  modalImg.src = "";
  document.body.style.overflow = "";
}

if (modal && modalImg && closeModal && galleryImages.length > 0) {
  galleryImages.forEach((img) => {
    img.addEventListener("click", () => {
      modal.classList.add("show");
      modalImg.src = img.src;
      document.body.style.overflow = "hidden";
    });
  });

  closeModal.addEventListener("click", closeImageModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeImageModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeImageModal();
    }
  });
}
