+++
title = "Markdown & Theme Showcase"
date = 2020-01-01
description = "A single page exercising every Markdown feature and shortcode this theme supports — headers, tables, code blocks, alerts, characters, charts, images and more."

[taxonomies]
tags = ["Meta", "Theme"]
+++

This page is a living reference for everything the `revinder-blog` theme can render. Copy any block here as a starting point for a new post. It is deliberately back-dated so it sinks to the bottom of the blog index.

<!-- more -->

# H1 — The Main Heading
## H2 — Section Heading
### H3 — Subsection
#### H4 — Deeper
##### H5 — Deeper Still
###### H6 — The Bottom

---

## Footnotes

Zola supports standard Markdown footnotes[^1] and inline footnotes are not supported. [^2]

[^1]: This is the first footnote, rendered at the bottom of the page.
[^2]: Inline footnote should have been defined up top.

## Text Formatting

**Bold**, *italic*, ***bold italic***, ~~strikethrough~~, `inline code`, and a [hyperlink](https://www.getzola.org). You can also use autolinks: <https://example.com> or `https://example.com`.

> This is a standard Markdown blockquote.
> It can span multiple lines and even contain `inline code`.

## Lists

### Unordered
- First item
- Second item
    - Nested item
    - Another nested item
        - Deeper still
- Third item

### Ordered
1. Step one
2. Step two
    1. Sub-step
    2. Another sub-step
3. Step three

### Task Lists
- [ ] Todo item
- [x] Done item
- [ ] Another todo

## Horizontal Rule

Text above.

---

Text below.

## Tables

| Feature          | Supported | Notes                          |
|------------------|:---------:|--------------------------------|
| Headers          | ✓         | All six levels                 |
| Tables           | ✓         | GFM pipe syntax                |
| Code highlighting| ✓         | Giallo (VSCode grammars)       |
| Alerts           | ✓         | 7 types + AI notice            |
| Charts           | ✓         | ApexCharts via JSON            |

Aligned columns: `:---`, `:---:`, `---:` give left / center / right.

| Left   | Center | Right |
|:-------|:------:|------:|
| a      | b      | c     |
| long   | med    | x     |

## Code Blocks

### Plain (no language)

```
No language hint — rendered as plain text.
Arbitrary monospace content here.
```

### Single language

```python
def greet(name: str) -> None:
    print(f"Hello, {name}!")

greet("Revinder")
```

### With the `copy=true` marker (Zola 0.21+)

Adding `copy=true` to the fence emits a `data-copy="true"` attribute on the `<code>` element. By itself this is just a marker — Zola does **not** render a button or wire up clipboard. It is a hook for your JS (or a theme) to opt a block into showing a Copy button. This block uses it:

```python,copy=true
def greet(name: str) -> None:
    # copy=true adds data-copy="true" to the <code> tag
    print(f"Hello, {name}!")

greet("Revinder")
```

### With line numbers

```python,linenos
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

for i in range(10):
    print(fib(i))
```

### Line numbers + highlighted lines

```python,linenos,hl_lines=3-4
def fib(n: int) -> int:
    if n < 2:
        return n          # highlighted
    return fib(n - 1) + fib(n - 2)  # highlighted
```

### Line numbers starting at 20 + hidden lines

`hide_lines` uses **1-indexed source line numbers** (not the displayed `linenostart` value). Below, `hide_lines=1-2` removes the first two source lines — the comments — so only the function body shows, with numbering continuing from the `linenostart=20` base.

```python,linenos,linenostart=20,hide_lines=1-2
# this source line 1 is hidden from output
# this source line 2 is also hidden
def visible():
    return "shown"
```

### Named block (renders a `data-name` label)

```rust,name=src/main.rs
fn main() {
    let xs: Vec<i32> = (1..=5).collect();
    println!("{:?}", xs);
}
```

### A few more languages

```sql
SELECT username, tier
FROM users
WHERE created_at > now() - interval '30 days'
ORDER BY created_at DESC;
```

```sh
#!/usr/bin/env sh
set -euo pipefail
echo "deploying $1"
rsync -avz public/ user@host:/srv/blog/
```

```yaml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
```

## Images

### Markdown image syntax

![Bad process diagram](/tech_interview/bad_process.png)

### `image` shortcode (with caption + position)

The `image` shortcode wraps a single `<img>` with optional caption and CSS class (position).

{{ image(src="/images/DigitalMinimalism.png", alt="Digital Minimalism book cover", position="center", caption="Caption rendered by the <code>image</code> shortcode.") }}

## Shortcodes

### `alert` — all 7 types

Alerts are framed callout boxes. Each type picks its border/background colour and icon automatically. The `title` is optional (defaults to the uppercased type).

{% alert(type="note") %}
A **note** alert. Supports *Markdown*, `code`, and [links](https://example.com).
{% end %}

{% alert(type="tip", title="Pro tip") %}
A **tip** alert with a custom title.
{% end %}

{% alert(type="info") %}
An **info** alert.
{% end %}

{% alert(type="important") %}
An **important** alert.
{% end %}

{% alert(type="warning", title="Check this out!") %}
A **warning** alert with a custom title.
{% end %}

{% alert(type="danger", title="Careful!") %}
A **danger** alert — use sparingly.
{% end %}

### `alert` — AI notice

A special `ai_notice` type renders a robot icon and structured model/agent metadata. Used at the top of AI-assisted posts to disclose usage.

{% alert(type="ai_notice", model="DeepSeek V4 Flash", agent="Opencode v1.2.27") %}
This article was **not** written by AI. AI was used for typo-spotting and to draft auxiliary functions. All scripts were read, understood, and run by a human.
{% end %}

### `character` — speech bubbles

Two characters ship with the theme: `CoolPizza` and `Monk`. They can appear on either side.

{% character(name="CoolPizza", position="left") %}
Welcome to the blog! The avatar sits on the **left** and the bubble points rightward.
{% end %}

{% character(name="Monk", position="right") %}
And I appear on the **right**, with a mirrored avatar.
{% end %}

### `quote` — framed quote / poem

A dashed-border block for short quotes or multi-line verse. Whitespace is preserved (`white-space: pre-wrap`).

{% quote() %}
Two roads diverged in a wood, and I—
I took the one less traveled by,
And that has made all the difference.
{% end %}

### `chart` — ApexCharts via JSON

The `chart` shortcode fetches a JSON file from `static/` at render time and draws an ApexCharts line chart. The JSON must have `labels` (array) and `series` (array of `{name, data}`). Optional terminal-style window with dots via `withDots=true`, plus `title`, `x_title`, `y_title`.

{{ chart(
    id="mem_showcase",
    source="/slots/plain_and_dataclass.json",
    title="plain_and_dataclass.json",
    withDots=true,
    x_title="Object Count",
    y_title="Memory (MiB)"
) }}


## Escaping & Edge Cases

Literal asterisks: `\*not italic\*`, literal backticks: `` `not code` `` (wrapped in double backticks with spaces).

A line that ends with two spaces  
forces a hard line break (the line above has trailing spaces).

A very long word or URL like `https://github.com/getzola/zola/blob/master/CHANGELOG.md` should wrap rather than overflow the container.

---

That's everything. If a feature you need isn't shown here, it probably isn't wired up yet — check `templates/shortcodes/` and `sass/shortcodes.scss`.
