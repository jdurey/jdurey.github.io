# Design

## Style Prompt

A static portfolio that reads like a premium diagnostic lab surface: deep tinted canvas, precise typography, small signal colors, visible measurement structure, and restrained motion. It should feel tech-forward and fascinating without looking like a generic AI landing page.

## Colors

- Background: deep green-blue black using OKLCH-tinted neutrals, never pure black.
- Surface: slightly lifted diagnostic panels with hairline borders.
- Primary accent: electric cyan for proof, links, and primary actions.
- Secondary accent: green for systems and successful signal.
- Risk accent: red for red-team and failure modes.
- Light mode: cool off-white background with the same semantic accent roles.

## Typography

Use the native system sans stack for speed and credibility. Use strong heading contrast, heavier weights, balanced heading wraps, tabular numerals for dates and metrics, and compact mono only for labels, code, chips, and dates.

## Layout

The home page uses a statement hero with a live diagnostic instrument beside it on wide screens and stacked beneath it on small screens. Selected work is a comparison grid, while the changelog stays tighter and more operational. Case studies keep a narrow readable measure with stronger metadata and code/table treatment.

## Components

- Sticky translucent nav with strong active and focus states.
- Pill CTAs with clear primary/secondary hierarchy.
- Work cards with hairline signal highlights, stable radii, and subtle hover/reveal states.
- Segmented filters on the work index when JavaScript is available.
- Diagnostic hero panel with animated scan/trace details that are decorative and hidden from assistive tech.

## Motion

Use a local enhancement script for progressive reveals, work filtering, scroll progress, and pointer-reactive hero detail. Motion should be 300-800ms, use expo/quart easing, animate transform and opacity, and shut down under `prefers-reduced-motion: reduce`.

## What Not To Do

No typewriter hero, no gradient text, no decorative glassmorphism, no large rounded card grids, no generic AI gradient blobs, no hidden content that requires JavaScript, and no external runtime dependency for core reading or navigation.
