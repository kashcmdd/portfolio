# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: developers and peers.** They arrive from GitHub, Discord, a shared
link or search — usually on desktop, often with the site open beside an editor
or a chat window. They are judging two things at once: the finished surface and
the engineering behind it (motion, performance, code, whether the work is real).

Recruiters and clients also visit, but they are secondary and do not drive
decisions.

## Product Purpose

A personal portfolio for KashhCMD presenting Discord-bot and web work with
uncommon craft. Success is a peer remembering the build and then making
contact: the site is evidence, not a brochure.

## Positioning

The portfolio is itself the proof. It is a hand-built, statically generated
React site with real engineering behind the surface — HLS video backdrops,
generated journal pages, RSS, OG art, Playwright and axe checks — rather than a
themed template with a project list.

## Operating Context

Read on desktop and mobile on a dark screen, often at night, expected to be
fast, keyboard-navigable and readable. Content areas: hero, selected works,
skills, experience, journal (technical writing), testimonials, contact.
Published to GitHub Pages at `https://kashcmdd.github.io/portfolio/`.

## Capabilities and Constraints

- React 19, TypeScript (strict), Vite 6, Tailwind CSS v4, GSAP, Motion, HLS.js,
  Lucide, Prism (lazy).
- The build generates journal pages, RSS, the resume PDF and OG cards, then
  asserts the static output.
- Playwright + axe are part of the quality bar; reduced-motion preferences are
  respected by the motion and video layers.
- Static hosting on GitHub Pages: no server runtime, no private APIs.
- **Project metrics are real figures and must be preserved verbatim.**

## Brand Commitments

The name **KashhCMD**; the existing dark, cinematic identity (liquid glass,
video backdrops, restrained type); the established voice in existing copy.
These are binding until the user asks for a redesign.

## Evidence on Hand

- Real project metrics for the selected works — preserve them.
- Testimonials, the resume PDF and journal entries exist on disk but were **not
  confirmed as current or real** during init. Do not invent quotes, figures,
  roles, dates or client names; do not delete existing copy without asking.
- No confirmed press, awards or client logos.

## Product Principles

1. **Craft first.** The build is the argument; polish before persuasion.
2. **Then contact.** Every surface keeps an obvious, low-friction way to reach
   out.
3. **Peers are the judge.** Optimize for technical credibility, not a recruiter
   checklist.
4. **Truth over filler.** Never invent evidence to fill a section.
5. **Preserve the incumbent identity.** Change it only when a redesign is asked
   for.

## Accessibility & Inclusion

The existing axe/Playwright checks are the floor and must keep passing. Motion
respects `prefers-reduced-motion`. Navigation, modals and the shortcuts overlay
are expected to be fully keyboard-accessible.
