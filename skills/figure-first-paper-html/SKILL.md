---
name: figure-first-paper-html
description: Convert a scientific-paper PDF into a Chinese-first HTML explainer that preserves the paper hierarchy, summarizes and fully translates every paragraph, and interleaves actual PDF figure panels at the exact paragraphs that cite them. For ML/foundation-model papers, reconstruct the model in clear data-flow order and backfill the corresponding Methods sections beside the architecture discussion.
---

# Figure-first Paper HTML

## Goal

Create a paper-reading HTML whose primary unit is:

`paragraph summary -> cited figure panel(s) -> full Chinese translation of that paragraph -> next paragraph`

The page must preserve the paper's original section order while making figures, model architecture, and methods easier to understand.

Default explanatory language: **Chinese**. Keep useful English model names, dataset names, metrics, genes, equations, and original section headings.

---

## 1. Source and version rules

1. The supplied PDF is authoritative for section order, paragraph boundaries, figure citations, panel labels, captions, tables, Methods, and Supplementary material.
2. Lock the exact version before processing. Never mix content from another version unless explicitly requested.
3. Render the PDF and visually inspect figure pages. Parsed text is useful for text extraction, but rendered pages are authoritative for figures and layout.
4. Do not replace inaccessible or difficult figures with third-party screenshots. If a panel cannot be safely extracted, label the missing slot explicitly rather than presenting a redraw as the original.

---

## 2. Opening section

The HTML begins with:

- title, authors, version/date;
- **one-sentence whole-paper summary**;
- 4-6 concise key points;
- **Abstract summary**;
- an expandable **complete Chinese translation of the Abstract**.

Do not omit the Abstract.

---

## 3. Paragraph-level reading stream

Preserve the paper's original hierarchy:

- Abstract
- Introduction
- Results and original subsections
- Discussion
- Methods and original subsections

For every prose paragraph:

1. assign a local paragraph ID such as `2.1·P04`;
2. provide one concise Chinese summary sentence;
3. inspect all figure/table citations in the paragraph;
4. if the paragraph cites figures, insert those panels immediately after the summary;
5. after the cited figure group, add `<details>` containing the **complete Chinese translation of the citing paragraph**;
6. if the paragraph cites no figure, place the expandable complete translation directly under the paragraph summary;
7. only then continue to the next paragraph.

Never use this structure:

`all paragraph summaries in a section -> all figures at the end`.

Use:

`P01 -> figures cited by P01 -> translation of P01 -> P02 -> ...`.

### Multiple citations in one paragraph

Preserve the source citation order. Example:

`Fig. S1A -> Fig. S1B -> Fig. S1C -> Fig. S1D -> Fig. 1D`

should remain in that order when rendered.

A panel is normally displayed at its **first meaningful citation**. Later citations should not duplicate it unless repetition is necessary for comprehension.

---

## 4. Translation behavior

### Full paragraph translation

The expandable text is a faithful, complete Chinese translation of the corresponding source paragraph, not an interpretation template.

Do **not** add labels such as:

- “对应原文”
- “图意”
- “阅读方式”
- “为什么这张图放在这里”

The `<details>` title can simply be:

`展开完整翻译`

Preserve:

- quantitative values;
- datasets;
- comparison groups;
- uncertainty/caveats;
- author framing;
- figure/table references when useful.

Do not silently add conclusions that are absent from the PDF.

---

## 5. Figure extraction and display

### Panel extraction

Split main and supplementary figures into individual A/B/C/... panels whenever feasible.

Crop rules:

1. keep the entire target panel, including its panel label, axes, tick labels, legends, titles, annotations, and error bars;
2. if a shared legend is required to interpret the target panel, include it;
3. if panel boundaries overlap, **prefer a complete target panel even if a small amount of a neighboring panel remains**;
4. never clip scientifically meaningful labels merely to produce a cleaner rectangular crop;
5. visually verify crops against the rendered PDF.

### Main figures

Main-figure panels are visible by default.

Each panel contains only:

- figure/panel ID;
- short scientific title;
- actual PDF crop;
- a direct scientific description of what the panel shows.

Avoid UI/layout narration such as:

- “读图一句话”
- “P04 后 / P05 前”
- “Figure insert”
- “本版新增规则”

### Supplementary figures

**Every supplementary figure/panel must be collapsible as a whole.**

Recommended:

```html
<details class="supp-panel">
  <summary>Fig. S7A · ...</summary>
  <img ...>
  <p>...</p>
</details>
```

### Click-to-enlarge

Every main and supplementary image must support click-to-enlarge in a lightbox or equivalent full-screen viewer.

Requirements:

- click image -> enlarge;
- click background / close button / Esc -> close;
- preserve full resolution;
- cursor indicates zoomability.

---

## 6. Special handling for deep-learning / foundation-model papers

A generic paragraph summary is not sufficient. If the paper contains a learned model, reconstruct the model in **data-flow order**.

### Required model explanation

Explain:

`raw input -> preprocessing/masking -> tokenization -> backbone -> cross-unit information flow -> embedding/latent -> decoder/head -> losses -> post-training/alignment -> inference/generation`

For every major tensor/representation, state when supported by the paper:

- tensor shape;
- sequence axis;
- feature axis;
- which attention operates on which axis;
- where information first crosses cells/samples/modalities;
- what is preserved per cell versus pooled;
- what decoder/output distribution means;
- how training differs from inference.

### Required conceptual clarifications

Explicitly resolve likely confusions, for example:

- Is a “gene-module token” a predefined pathway or a learned projection?
- Is the model pooling cells into one sample vector, or retaining per-cell states?
- Exactly where does cellular context enter?
- What does prompt supply versus query supply?
- Is query expression blank/masked or still used as cell-identity input?
- Is “diffusion” literal Gaussian diffusion, masked diffusion, flow matching, or only an analogy?
- What is the unit being iteratively generated: genes, cells, or samples?

### Architecture Methods backfill

When a Results paragraph introduces architecture/training/post-training, immediately after the corresponding architecture figure insert:

1. a clear model explainer;
2. a collapsible **complete Chinese translation of the corresponding Methods subsection(s)**.

Example:

`P04 summary -> Fig.1B -> P04 full translation -> model architecture explainer -> Methods 4.1.1-4.1.3 full translation -> next paragraph`

For post-training:

`P03 summary -> Fig.3A -> P03 full translation -> prompt/query explainer -> Methods 4.2-4.2.5 full translation -> next paragraph`

Do not merely say “see Methods”.

---

## 7. Methods section at the bottom

Retain the original Methods hierarchy.

For every Methods subsection:

- visible concise Chinese summary;
- expandable **complete Chinese translation of that subsection**.

Do this even if the same section was backfilled earlier beside a model figure. The bottom Methods section acts as a complete hierarchical reference.

Tables that are essential to a cited paragraph may also be shown as collapsible blocks at the citing location.

---

## 8. HTML style and interaction

Recommended:

- neutral paper-like theme;
- sticky table of contents on desktop;
- responsive single-column mobile layout;
- native `<details>` for translations and supplements;
- no heavy JavaScript dependency;
- self-contained HTML when practical;
- actual panel assets also retained separately in the delivery package.

Do not put internal workflow/design commentary into the reader-facing page.

---

## 9. Intermediate representation

Build an IR where each paragraph owns its downstream content:

```json
{
  "section": "2.1",
  "paragraphs": [
    {
      "id": "P04",
      "summary_zh": "...",
      "translation_zh": "...",
      "citations_in_order": ["Fig1B"],
      "after": [
        {"type":"figure","id":"Fig1B"},
        {"type":"model_explainer","id":"pretrain_backbone"},
        {"type":"methods_translation","refs":["4.1.1","4.1.2","4.1.3"]}
      ]
    }
  ]
}
```

Generate the HTML deterministically as:

`paragraph summary -> paragraph.after -> paragraph translation -> next paragraph`

or, when an architecture explainer is conceptually clearer:

`paragraph summary -> figure -> paragraph translation -> model explainer -> Methods translation -> next paragraph`.

---

## 10. Quality-control checklist

### Content

- [ ] Exact requested paper version is locked.
- [ ] Abstract has summary + full translation.
- [ ] Original hierarchy is preserved.
- [ ] Every prose paragraph has a one-sentence summary.
- [ ] Every prose paragraph has a full Chinese translation.
- [ ] Paragraph order is unchanged.
- [ ] Quantitative values match the PDF.

### Figures

- [ ] Every cited main figure is represented.
- [ ] Cited supplementary panels are represented at first citation.
- [ ] Supplementary panels are fully collapsible.
- [ ] Panel labels / axes / legends are not clipped.
- [ ] Shared or overlapping layouts prioritize complete target panels.
- [ ] Every image is click-to-enlarge.

### ML / FM papers

- [ ] Architecture is explained in data-flow order.
- [ ] Tensor shapes / attention axes are stated where the paper provides them.
- [ ] The exact location of cross-cell / cross-sample information flow is explicit.
- [ ] Pre-training, post-training, probing, and inference are not conflated.
- [ ] Prompt vs query roles are explicit.
- [ ] Diffusion / flow-matching terminology is interpreted precisely.
- [ ] Relevant Methods sections are fully translated beside the architecture discussion.

### Methods

- [ ] Bottom Methods retains original hierarchy.
- [ ] Every Methods subsection has summary + full translation.

### Reader-facing cleanup

- [ ] No “对应原文 / 图意 / 阅读方式 / Figure insert” boilerplate.
- [ ] No statements about where a figure was inserted for layout reasons.
- [ ] No workflow notes such as “new hard rule” in the paper page.
- [ ] No semantic redraw is presented as an original PDF figure.

---

## Deliverables

Minimum:

1. `<paper>_figure_first.html`
2. `assets/` containing extracted figure panels
3. `SKILL.md`
4. optionally `paper_ir.json`

Package them together for reproducibility.