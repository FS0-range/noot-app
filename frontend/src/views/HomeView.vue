<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Staggered entrance animation state
const visible = ref(false)
onMounted(() => {
  // Small tick so CSS transitions fire after mount
  requestAnimationFrame(() => { visible.value = true })
})
</script>

<template>
  <div class="homepage">

    <!-- ─── HERO ─────────────────────────────────────────────── -->
    <section class="hero">
      <!-- Background image + gradient overlay -->
      <div class="hero-bg">
        <img src="@/assets/hero-car.jpg" alt="Luxury car" class="hero-img" />
        <div class="hero-overlay" />
      </div>

      <!-- Content — staggered fade-in -->
      <div class="hero-content" :class="{ 'is-visible': visible }">
        <p class="hero-eyebrow">Elevate Your Drive</p>

        <h1 class="hero-title">
          Expert Automotive<br>
          <span class="hero-accent">Mastery</span>
        </h1>

        <p class="hero-subtitle">
          20+ years serving Singapore. Precision repairs, tailored upgrades,
          and unmatched craftsmanship for your luxury vehicle.
        </p>

        <div class="hero-buttons">
          <a href="#services" class="btn btn-primary">Explore Services</a>
          <a href="#contact"  class="btn btn-primary">Contact Us</a>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="scroll-indicator" :class="{ 'is-visible': visible }">
        <div class="scroll-line" />
      </div>
    </section>

    <!-- ─── SERVICES ──────────────────────────────────────────── -->
    <section id="services" class="services-preview">
      <div class="container">
        <h2 class="section-title">Our Services</h2>
        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">🔧</div>
            <h3>Engine Repair</h3>
            <p>Full diagnostics &amp; rebuilds</p>
          </div>
          <div class="service-card">
            <div class="service-icon">🛞</div>
            <h3>Tyre &amp; Brake</h3>
            <p>Safety certified service</p>
          </div>
          <div class="service-card">
            <div class="service-icon">⚙️</div>
            <h3>Full Servicing</h3>
            <p>Oil, AC, maintenance</p>
          </div>
          <div class="service-card">
            <div class="service-icon">🚗</div>
            <h3>Body Work</h3>
            <p>Dents &amp; painting</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── STATS ─────────────────────────────────────────────── -->
    <section class="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-number">5000+</div>
            <p>Vehicles Fixed</p>
          </div>
          <div class="stat">
            <div class="stat-number">20+</div>
            <p>Years Exp.</p>
          </div>
          <div class="stat">
            <div class="stat-number">98%</div>
            <p>Satisfaction</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── CTA ───────────────────────────────────────────────── -->
    <section class="cta-banner">
      <div class="container">
        <h2>Ready for Service?</h2>
        <p>20% off first visit • Free check</p>
        <a href="#contact" class="btn btn-primary btn-large">Get Quote</a>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ─── TOKENS ──────────────────────────────────────────────── */
:root {
  --gold:        #fdc601;
  --gold-glow:   rgba(253, 198, 1, 0.55);
  --fg:          #ffffff;
  --fg-muted:    rgba(255,255,255,0.65);
  --bg-dark:     #0a0a0a;
  --shadow-sm:   0 5px 20px rgba(0,0,0,0.18);
  --shadow-lg:   0 15px 50px rgba(0,0,0,0.35);
}

/* ─── BASE ────────────────────────────────────────────────── */
.homepage {
  font-family: 'Barlow', system-ui, sans-serif;
  color: var(--fg);
  overflow-x: hidden;
  background: var(--bg-dark);
  /* No padding here — hero must bleed to full viewport width */
  padding: 0;
  margin: 0;
  width: 100%;
}

.container {
  
  margin: 0 auto;
  padding: 0 clamp(1rem, 3vw, 2rem);
  width: 100%;
  box-sizing: border-box;
}

/* ─── HERO ────────────────────────────────────────────────── */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Background image — must fill hero edge-to-edge */
.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.hero-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

/* Gradient overlay — matches React's from-background/60 via .../40 to-background */
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(10, 10, 10, 0.55) 0%,
    rgba(10, 10, 10, 0.35) 45%,
    rgba(10, 10, 10, 1.00) 100%
  );
}

/* Content block */
.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 0 clamp(1.5rem, 5vw, 3rem);
  max-width: 900px;
  margin: 0 auto;

  .&> * {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }

  &.is-visible > *:nth-child(1) { opacity: 1; transform: none; transition-delay: 0.3s; }
  &.is-visible > *:nth-child(2) { opacity: 1; transform: none; transition-delay: 0.5s; }
  &.is-visible > *:nth-child(3) { opacity: 1; transform: none; transition-delay: 0.7s; }
  &.is-visible > *:nth-child(4) { opacity: 1; transform: none; transition-delay: 0.9s; }
}

/* Eyebrow — matches React's tracking-[0.4em] text-primary uppercase */
.hero-eyebrow {
  font-size: clamp(0.7rem, 1.5vw, 0.875rem);
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color:#fdc601;
  font-weight: 500;
  margin: 0 0 1.5rem;
}

/* Title — matches React's text-5xl/7xl/8xl leading-[0.95] */
.hero-title {
  font-size: clamp(2.8rem, 9vw, 6.5rem);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.02em;
  margin: 0 0 2rem;
  font-family:Georgia, 'Times New Roman', Times, serif;
  color:#ffffff;
}

/* Gold accent word with glow — matches React's text-gold-glow */
.hero-accent {
  color:#fdc601;
  text-shadow:
    0 0 40px var(--gold-glow),
    0 0 80px rgba(253, 198, 1, 0.25);
  font-weight:700;
}

/* Subtitle — matches React's text-muted-foreground font-light */
.hero-subtitle {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  color:#ffffff;
  font-weight: 300;
  line-height: 1.75;
  max-width: 600px;
  margin: 0 auto 3rem;
}

/* Buttons row */
.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  color:#fdc601;
 
}

@media (min-width: 640px) {
  .hero-buttons { flex-direction: row; }
}

/* ─── BUTTONS ─────────────────────────────────────────────── */
/* Sharp square corners matching React's rounded-none aesthetic */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 0;              /* sharp — no pill */
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-sizing: border-box;
}

/* Filled — matches React's bg-primary text-primary-foreground */
.btn-primary {
  background:transparent;
  color:#ffffff;
  border: 0.5px solid #ffffff;
}
.btn-primary:hover {
  background:#fdc601;
  transform: translateY(-2px);
  color:#000;
  box-shadow: 0 8px 25px rgba(253, 198, 1, 0.35);
}

/* Outline — matches React's border border-foreground/30 */
.btn-outline {
  background: transparent;
  color: var(--fg);
  border: 1px solid rgba(255,255,255,0.3);
}
.btn-outline:hover {
  border-color: var(--gold);
  color: var(--gold);
}

.btn-large { min-width: 200px; }

/* ─── SCROLL INDICATOR ────────────────────────────────────── */
/* Matches React's w-px h-16 gradient line + animate-pulse */
.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.8s ease 1.5s;
}

.scroll-indicator.is-visible { opacity: 1; }

.scroll-line {
  width: 1px;
  height: 4rem;
  background: linear-gradient(to bottom, transparent, rgba(253,198,1,0.5), var(--gold));
  animation: scroll-pulse 1.8s ease-in-out infinite;
}

@keyframes scroll-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

/* ─── SERVICES ────────────────────────────────────────────── */
.services-preview {
  padding: clamp(4rem, 10vw, 8rem) 0;
  background: #111;
}

.section-title {
  text-align: center;
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: clamp(2.5rem, 6vw, 4rem);
  color: var(--fg);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(220px, 22vw, 300px), 1fr));
  gap: clamp(1.5rem, 3vw, 2rem);
}

.service-card {
  background: #1a1a1a;
  border: 1px solid rgba(255,255,255,0.07);
  padding: clamp(2rem, 5vw, 3rem);
  text-align: center;
  transition: all 0.35s ease;
}

.service-card:hover {
  border-color: rgba(253, 198, 1, 0.4);
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  background: #1e1e1e;
}

.service-icon {
  font-size: clamp(2.5rem, 7vw, 3.5rem);
  margin-bottom: 1.25rem;
}

.service-card h3 {
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  font-weight: 700;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem;
  color: var(--fg);
}

.service-card p {
  color: var(--fg-muted);
  font-size: 0.9rem;
  margin: 0;
}

/* ─── STATS ───────────────────────────────────────────────── */
.stats {
  padding: clamp(3rem, 8vw, 6rem) 0;
  background: var(--gold);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: clamp(1.5rem, 4vw, 2.5rem);
  text-align: center;
}

.stat-number {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 800;
  color: #000;
  line-height: 1;
  margin-bottom: 0.5rem;
  letter-spacing: -0.03em;
}

.stat p {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(0,0,0,0.65);
  margin: 0;
}

/* ─── CTA ─────────────────────────────────────────────────── */
.cta-banner {
  padding: clamp(4rem, 10vw, 8rem) 0;
  background: #0a0a0a;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.cta-banner h2 {
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
  color: var(--fg);
}

.cta-banner p {
  color: var(--fg-muted);
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 2.5rem;
}

/* ─── MOBILE ──────────────────────────────────────────────── */
@media (max-width: 480px) {
  .container { padding: 0 1rem; }
  .hero-buttons .btn { width: 100%; max-width: 300px; }
}

@media (max-height: 500px) and (orientation: landscape) {
  .hero { min-height: 100vh; padding: 2rem 1rem; }
}
</style>