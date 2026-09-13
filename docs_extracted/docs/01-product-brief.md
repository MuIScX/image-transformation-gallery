# 01 — Product Brief

## What this is

An explanatory web app for a linear-algebra mini-project: *"Image Transformation Gallery — apply
2×2 matrices (scaling, rotation, shearing, reflection) to digital images, explain determinant &
eigenvalues."* The app's job is to teach the topic well enough that the person building it can
present it live and answer questions on the spot, and to double as the "set of original &
transformed images with analysis" the assignment asks for.

## Audience

Beginner-friendly, but not childish. Assume the reader knows what a matrix looks like and can do
basic algebra, but has never connected matrices to geometry or images before. Avoid forced
enthusiasm ("let's start our matrix adventure!") — write like a clear, patient explanation, not a
kids' show.

## Teaching philosophy

**Every concept gets two paired explanations, always visible together:**

| Plain-language | Math |
|---|---|
| "This matrix stretches everything sideways, like pulling taffy." | `x' = 2x, y' = y` |
| "The green arrow is a special direction — it only gets longer, it never turns." | `Av = λv`, λ = 2 |
| "Spinning the picture — everything turns, nothing points the way it used to." | eigenvalues = ±i (complex → no real eigenvector) |

This is **not** a "simple mode vs. advanced mode" toggle. Both appear together, always. The one
exception is *derivations* (e.g. expanding `det(A − λI) = 0`) — those go behind a `<ShowMath>`
collapsible reveal, because they're proof, not fact, and a first-time reader doesn't need to sit
through algebra to trust the result.

## Structure of the experience

A guided, ordered walkthrough (see `02-information-architecture.md`) that builds concepts in
dependency order — point → transforms → determinant → eigenvalues → summary — followed by a
free-form playground for exploration, and a gallery for reference/export.

## Success criteria

- A person with no prior exposure to this project can go through `/point` → `/summary` and come
  out able to explain, in their own words, what a matrix does to an image, what the determinant
  tells you, and what an eigenvalue is.
- Every formula shown anywhere in the app is also demonstrated with a live, worked numeric example
  — never presented as an abstract symbol with no number attached.
- The presenter (project owner) can use this app directly as their presentation, section by
  section, without needing separate slides.
