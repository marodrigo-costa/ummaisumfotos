# Stitch Integration Bridge

This document serves as a reference for the collaboration between the AI and the user when using Stitch as a starting point.

## Context
The user uses Stitch to generate initial "sketches" or wireframes of UI ideas.
The final implementation is done locally, with deep modifications to the visual design, animations, and business logic.

## Design Philosophy
- **Stitch = Skeleton**: Use Stitch to get the initial list of screens, IDs, and basic structure.
- **Local = Soul**: Apply high-end aesthetics, custom animations, and advanced architecture locally.
- **Topological Betrayal**: Always look for ways to improve upon the Stitch layout, avoiding standard clichés.

## Technical Mapping
- **Project ID**: 14131695857470186523 (Portal Um Mais Um Fotos)
- **Base Screen**: a73fc0a898914f1cac60ed5efa20d811 (ummaisum Studio Home)

## Workflow
1. Read the screen data from Stitch using `get_screen`.
2. Translate the structural intent into local React/Next.js components.
3. Replace generic styles with custom tokens (Noto Serif, Manrope, Earthy Tones).
4. Implement the Admin/Client logic that Stitch doesn't handle.
