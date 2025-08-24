Gradient colors used in the project

This document lists the background gradients present in the UI, with their resolved color stops for both light and dark themes. Color variables are defined as HSL in src/app/globals.css and mapped by Tailwind in tailwind.config.ts.

Color variables (light theme)
- --primary: 231 96% 38%
- --secondary: 30 85% 95%
- --accent: 35 90% 60%
- --card: 0 0% 100%
- --background: 0 0% 100%
- --foreground: 0 0% 13%

Color variables (dark theme)
- --primary: 231 96% 38%
- --secondary: 20 15% 15%
- --accent: 25 70% 50%
- --card: 20 20% 10%
- --background: 20 20% 8%
- --foreground: 30 40% 92%

Notation
- Tailwind class from-<color>/<alpha> corresponds to hsla(var(--<color>)) with alpha = <alpha>%.
- bg-gradient-to-br means linear-gradient(to bottom right, ...).
- via- denotes the middle stop; to- denotes the final stop.

Gradients by location

1) App wrapper (Home hero page container)
- File: src/app/page.tsx (line ~211)
- Class: bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/10
- Light theme:
  linear-gradient(to bottom right,
    hsla(231 96% 38% / 0.05),
    hsla(30 85% 95% / 0.10),
    hsla(35 90% 60% / 0.10)
  )
- Dark theme:
  linear-gradient(to bottom right,
    hsla(231 96% 38% / 0.05),
    hsla(20 15% 15% / 0.10),
    hsla(25 70% 50% / 0.10)
  )

2) About section
- File: src/app/page.tsx (lines ~411-421)
- Class: bg-gradient-to-br from-primary/10 via-accent/10 to-card/20
- Light:
  linear-gradient(to bottom right,
    hsla(231 96% 38% / 0.10),
    hsla(35 90% 60% / 0.10),
    hsla(0 0% 100% / 0.20)
  )
- Dark:
  linear-gradient(to bottom right,
    hsla(231 96% 38% / 0.10),
    hsla(25 70% 50% / 0.10),
    hsla(20 20% 10% / 0.20)
  )

3) Courses section
- File: src/app/page.tsx (lines ~486-496)
- Class: bg-gradient-to-br from-secondary/10 via-card/10 to-background/20
- Light:
  linear-gradient(to bottom right,
    hsla(30 85% 95% / 0.10),
    hsla(0 0% 100% / 0.10),
    hsla(0 0% 100% / 0.20)
  )
- Dark:
  linear-gradient(to bottom right,
    hsla(20 15% 15% / 0.10),
    hsla(20 20% 10% / 0.10),
    hsla(20 20% 8% / 0.20)
  )

4) Resources section
- File: src/app/page.tsx (lines ~534-544)
- Class: bg-gradient-to-br from-primary/10 via-accent/10 to-card/20
- Same as About section (see #2).

5) Testimonials section
- File: src/app/page.tsx (lines ~572-580)
- Class: bg-gradient-to-br from-secondary/10 via-card/10 to-background/20
- Same as Courses section (see #3).

6) Contact section
- File: src/app/page.tsx (lines ~609-617)
- Class: bg-gradient-to-br from-primary/10 via-accent/10 to-card/20
- Same as About section (see #2).

7) Hero tag chip gradient
- File: src/app/page.tsx (line ~281)
- Class: bg-gradient-to-r from-primary/10 to-accent/10
- Light:
  linear-gradient(to right,
    hsla(231 96% 38% / 0.10),
    hsla(35 90% 60% / 0.10)
  )
- Dark:
  linear-gradient(to right,
    hsla(231 96% 38% / 0.10),
    hsla(25 70% 50% / 0.10)
  )

8) Course card header background
- File: src/components/cards/course-card.tsx (line ~36)
- Class: bg-gradient-to-br from-primary/10 to-secondary/10
- Light:
  linear-gradient(to bottom right,
    hsla(231 96% 38% / 0.10),
    hsla(30 85% 95% / 0.10)
  )
- Dark:
  linear-gradient(to bottom right,
    hsla(231 96% 38% / 0.10),
    hsla(20 15% 15% / 0.10)
  )

9) Course details modal header
- File: src/components/cards/course-details-modal.tsx (line ~21)
- Class: bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10
- Light:
  linear-gradient(to bottom right,
    hsla(231 96% 38% / 0.10),
    hsla(35 90% 60% / 0.10),
    hsla(30 85% 95% / 0.10)
  )
- Dark:
  linear-gradient(to bottom right,
    hsla(231 96% 38% / 0.10),
    hsla(25 70% 50% / 0.10),
    hsla(20 15% 15% / 0.10)
  )

10) Login page background
- File: src/app/login/page.tsx (lines ~38, 70)
- Class: bg-gradient-to-br from-[#0420bf1A] to-amber-50
- Exact:
  linear-gradient(to bottom right,
    rgba(4, 32, 191, 0.102),
    #fffbeb
  )
  Note: #0420bf1A is a hex with alpha (1A = 26/255 ≈ 0.102). amber-50 is Tailwind’s default #fffbeb.

Inline gradient overlays
- Several sections include an overlay: style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--background))/60 80%)" }} which resolves to light: linear-gradient(to bottom, transparent, hsla(0 0% 100% / 0.60) 80%) and dark: linear-gradient(to bottom, transparent, hsla(20 20% 8% / 0.60) 80%).

Summary
- Primary hue: deep blue (hsl 231 96% 38%).
- Secondary hue: very light warm neutral (light) / deep muted brownish (dark).
- Accent hue: warm orange (light 35 90% 60%, dark 25 70% 50%).
- Many sections blend these with subtle low-opacity stops (5%–20%) over white (light) or dark near-black backgrounds (dark).
