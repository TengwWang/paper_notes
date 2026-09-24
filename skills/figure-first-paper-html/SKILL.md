---
name: figure-first-paper-html
description: Convert a scientific-paper PDF into a Chinese-first HTML explainer that preserves the paper hierarchy, summarizes and fully translates every paragraph, and interleaves actual PDF figure panels at the exact paragraphs that cite them. For ML/foundation-model papers, reconstruct the model in clear data-flow order and backfill the corresponding Methods sections beside the architecture discussion.
---

# Figure-first Paper HTML

## Goal

Create a paper-reading HTML whose primary unit is:

`paragraph summary -> cited figure panel(s) -> full Chinese translation of that paragraph -> next paragraph`

The page must preserve the paper's original section order while making figures, model architecture, equations, and methods easier to understand.

Default explanatory language: **Chinese**. Keep useful English model names, dataset names, metrics, genes, equations, and original section headings.

---

## 1. Source and version rules

1. The supplied PDF is authoritative for section order, paragraph boundaries, figure citations, panel labels, captions, tables, Methods, equations, and Supplementary material.
2. Lock the exact version before processing. Never mix content from another version unless explicitly requested.
3. Render the PDF and visually inspect figure pages. Parsed text is useful for text extraction, but rendered pages are authoritative for figures, equations, and layout.
4. Do not replace inaccessible or difficult figures with third-party screenshots. If a panel cannot be safely extracted, label the missing slot explicitly rather than presenting a redraw as the original.
5. Determine the paper's DOI and/or canonical source URL from the paper itself or a reliable source. **Never guess a DOI.**

---

## 2. Opening section

The HTML begins with:

- title, authors, version/date;
- a clearly visible **original-paper link** placed near the title:
  - prefer the canonical DOI URL, e.g. `https://doi.org/<doi>`;
  - if no DOI is available, use the journal / publisher / bioRxiv / arXiv / official paper URL;
  - if both DOI and a useful preprint/full-text link are available, both may be shown;
  - the link must be directly clickable with a normal `<a href="...">` element and open the original paper;
- **one-sentence whole-paper summary**;
- 4-6 concise key points;
- **Abstract summary**;
- an expandable **complete Chinese translation of the Abstract**.

Do not omit the Abstract or the original-paper link.

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
- figure/table references when useful;
- equations and mathematical symbols.

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

### Panel preview size

**Hard rule: reduce the inline panel height cap to 60% of the previous/current template value.**

- Apply this to both main and supplementary panel previews.
- Preserve aspect ratio with `width: auto` / `height: auto` and `object-fit: contain` as appropriate.
- The smaller inline preview must **not** crop the source panel.
- Click-to-enlarge must still expose the full-resolution panel.
- When modifying an existing template, explicitly multiply its previous panel `max-height` by `0.6`; do not merely reduce width or visually approximate the change.
- Keep very wide plots readable by allowing width to expand within the content column while respecting the reduced height cap.

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

**Every supplementary figure group must be collapsible as a whole. Do not create one disclosure button for every individual panel when panels occur consecutively.**

Grouping rules:

1. If multiple supplementary panels are cited consecutively at the same reading position, place them under **one shared `<details>` toggle**.
2. Consecutive panels from the same supplementary figure (for example Fig. S7A-S7D) should normally form one group.
3. If panels from multiple supplementary figures occur as one uninterrupted supplementary block, they may share one disclosure group when that improves readability; retain each panel's own ID/title inside the group.
4. Start a new supplementary disclosure group when the reading stream is interrupted by a main figure, a substantially different discussion block, or a new non-contiguous supplementary citation context.

Inside an expanded supplementary group, use a **two-column grid** on desktop:

```html
<details class="supp-group">
  <summary>Supplementary figures · Fig. S7A-S7D</summary>
  <div class="supp-grid">
    <figure>...</figure>
    <figure>...</figure>
    <figure>...</figure>
    <figure>...</figure>
  </div>
</details>
```

Recommended behavior:

- desktop/tablet: 2 columns;
- narrow mobile screens: collapse responsively to 1 column;
- preserve source order left-to-right, then top-to-bottom;
- an odd final panel may occupy one grid cell; do not stretch it in a way that distorts the image;
- every panel still carries its own panel ID, short title, image, and concise scientific description.

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
2. a collapsible **complete Chinese translation of the corresponding Methods subsection(s)**;
3. any important equations from those Methods rendered as readable mathematical notation, following Section 7.

Example:

`P04 summary -> Fig.1B -> P04 full translation -> model architecture explainer -> Methods 4.1.1-4.1.3 full translation -> next paragraph`

For post-training:

`P03 summary -> Fig.3A -> P03 full translation -> prompt/query explainer -> Methods 4.2-4.2.5 full translation -> next paragraph`

Do not merely say “see Methods”.

---

## 7. Methods section at the bottom

The bottom Methods section must be a **detailed technical reference**, not a compressed appendix.

Retain the original Methods hierarchy and ordering.

For every Methods subsection include:

1. a visible Chinese summary;
2. a **detailed Chinese explanation** sufficient to understand or reproduce the procedure, when supported by the paper;
3. an expandable **complete Chinese translation of that subsection**;
4. all important equations rendered as readable math rather than raw code.

### Methods detail standard

For computational / ML sections, explicitly capture as applicable:

- inputs and outputs;
- preprocessing and normalization;
- filtering / QC criteria;
- tokenization or feature construction;
- model components and data flow;
- tensor dimensions and axes when stated or inferable with confidence;
- loss terms and their role;
- sampling / masking / corruption process;
- optimization method, learning rate, schedules, batch sizes, epochs/steps;
- regularization;
- initialization;
- training / validation split;
- inference or generation procedure;
- post-training / fine-tuning / alignment stages;
- baselines;
- evaluation metrics;
- statistical tests;
- important hyperparameters and implementation details.

For wet-lab / experimental sections, capture as applicable:

- sample source and cohort definition;
- inclusion/exclusion criteria;
- experimental design;
- perturbation / treatment conditions;
- timing / dose;
- library preparation;
- sequencing / assay platform;
- preprocessing and QC;
- replicate structure;
- statistical analysis.

Do not invent missing details. Clearly indicate when a detail is not specified by the paper.

### Equation rendering — hard requirement

**Equations must never be left as raw Markdown/LaTeX code, escaped text, or code-block syntax in the final reader-facing HTML.**

Use MathJax or KaTeX (or an equivalent reliable math renderer) and convert equations into proper inline/display math.

Acceptable source forms may include:

- `$ ... $`
- `$$ ... $$`
- `\\( ... \\)`
- `\\[ ... \\]`
- raw extracted TeX such as `\\frac{a}{b}`, `\\sum_i`, `\\mathcal{L}`

but the final HTML must display them as typeset mathematics.

Required equation behavior:

1. **Inline equations** remain inline with prose.
2. **Display equations** are centered and visually separated from surrounding text.
3. Preserve original equation numbering when present.
4. Repair extraction artifacts such as broken backslashes, split subscripts/superscripts, malformed braces, Unicode-minus substitutions, and equations accidentally placed inside backticks/code fences.
5. Use proper structures for multi-line equations, e.g. `aligned`, `cases`, matrices, fractions, sums, expectations, norms, and integrals.
6. Immediately after an important equation, explain the symbols/terms in concise Chinese when the paper defines them or when needed for comprehension.
7. For composite objectives, explain what each loss term optimizes and how weighting coefficients enter.
8. Verify every rendered formula against the PDF image; parsed text alone is not sufficient for equations.
9. Never show formulas in a monospace code style merely because the source extraction returned TeX.
10. If a formula cannot be reconstructed confidently, show the rendered PDF crop of that equation and explicitly mark the transcription as uncertain rather than silently guessing.

Recommended MathJax example:

```html
<script>
window.MathJax = {
  tex: {
    inlineMath: [['\\(', '\\)']],
    displayMath: [['\\[', '\\]']]
  }
};
</script>
<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
```

Then write formulas as actual math delimiters, for example:

```html
<div class="equation">
  \\[
  \\mathcal{L}
  = \\mathcal{L}_{\\mathrm{recon}}
  + \\lambda \\mathcal{L}_{\\mathrm{reg}}
  \\]
</div>
```

The user-facing browser must display the equation itself, **not the TeX source characters**.

Tables that are essential to a cited paragraph may also be shown as collapsible blocks at the citing location.

---

## 8. HTML style and interaction

Recommended:

- neutral paper-like theme;
- sticky table of contents on desktop;
- responsive single-column mobile layout;
- native `<details>` for translations and supplementary groups;
- supplementary panel grid: two columns on desktop, one column on narrow mobile;
- reduced inline panel height cap per Section 5;
- MathJax/KaTeX support for readable equations;
- no heavy JavaScript dependency beyond what is needed for lightbox/math rendering;
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

Supplementary groups should be represented explicitly when panels are consecutive:

```json
{
  "type": "supplementary_group",
  "ids": ["FigS7A", "FigS7B", "FigS7C", "FigS7D"],
  "layout": "two-column",
  "collapsible": true
}
```

Generate the HTML deterministically as:

`paragraph summary -> paragraph.after -> paragraph translation -> next paragraph`

or, when an architecture explainer is conceptually clearer:

`paragraph summary -> figure -> paragraph translation -> model explainer -> Methods translation -> next paragraph`.

---

## 10. Quality-control checklist

### Source / opening

- [ ] Exact requested paper version is locked.
- [ ] DOI and/or canonical original-paper URL is verified.
- [ ] A directly clickable original-paper link appears near the title.
- [ ] Abstract has summary + full translation.

### Content

- [ ] Original hierarchy is preserved.
- [ ] Every prose paragraph has a one-sentence summary.
- [ ] Every prose paragraph has a full Chinese translation.
- [ ] Paragraph order is unchanged.
- [ ] Quantitative values match the PDF.

### Figures

- [ ] Every cited main figure is represented.
- [ ] Cited supplementary panels are represented at first citation.
- [ ] Inline panel height cap is exactly 60% of the previous/current template cap.
- [ ] Smaller previews do not crop source content.
- [ ] Consecutive supplementary panels share one disclosure toggle rather than one toggle per panel.
- [ ] Supplementary groups use a two-column desktop grid and responsive one-column mobile layout.
- [ ] Panel labels / axes / legends are not clipped.
- [ ] Shared or overlapping layouts prioritize complete target panels.
- [ ] Every image is click-to-enlarge at full resolution.

### ML / FM papers

- [ ] Architecture is explained in data-flow order.
- [ ] Tensor shapes / attention axes are stated where the paper provides them.
- [ ] The exact location of cross-cell / cross-sample information flow is explicit.
- [ ] Pre-training, post-training, probing, and inference are not conflated.
- [ ] Prompt vs query roles are explicit.
- [ ] Diffusion / flow-matching terminology is interpreted precisely.
- [ ] Relevant Methods sections are fully translated beside the architecture discussion.

### Methods / equations

- [ ] Bottom Methods retains original hierarchy.
- [ ] Every Methods subsection has summary + detailed explanation + full translation.
- [ ] Reproducibility-critical parameters are retained.
- [ ] Important equations are rendered with MathJax/KaTeX or equivalent.
- [ ] No equation remains as raw TeX, backticked code, or monospace code-block text.
- [ ] Equation numbers are preserved when present.
- [ ] Important equation symbols / terms are explained.
- [ ] Every reconstructed equation is visually verified against the PDF.

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
