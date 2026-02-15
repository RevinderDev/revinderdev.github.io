+++
title = "Theme Features Showcase"
date = 2020-01-01
+++

This page demonstrates the new theme features implemented all styled with a consistent `gruvbox` dark palette.

<!-- more -->

# H1

## H2

### H3

#### H4

##### H5

* Item list
* Item List
    * Nested

-> <-
- [ ] Check box
- [x] Check box

## 1. Code Blocks
These blocks support language headers, line numbers, and highlighted lines with syntax highlighting.

### Basic Code Block with Line Numbers
```python,linenos
def greet(name):
    # Regular code block
    print(f"Hello, {name}!")

if __name__ == "__main__":
    greet("Terminus")
```

### Code Block with Highlighted Lines
To highlight specific lines, use the `hl_lines` parameter with space-separated line numbers:

```python,linenos,hl_lines=2 3
def greet(name):
    # These lines are highlighted!
    print(f"Hello, {name}!")

if __name__ == "__main__":
    greet("Terminus")
```



## 2. Alerts (Shortcode)

{% alert(type="note") %}
This is an **Note** alert. It supports **Markdown** syntax like `code` and [links](https://google.com).
{% end %}

{% alert(type="info") %}
This is an **Information** alert. It supports **Markdown** syntax like `code` and [links](https://google.com).
{% end %}

{% alert(type="warning", title="Check this out!") %}
Fully framed alert box.
{% end %}

{% alert(type="danger") %}
**Danger!** Something went wrong here.
{% end %}

## 3. Character Shortcodes

{% character(name="CoolPizza", position="left") %}
"Welcome to the blog! The character image is now correctly linked and displayed."
{% end %}

{% character(name="Monk", position="right") %}
"And I can appear on the right side too, with a mirrored avatar!"
{% end %}

## Quotes or Poems

{% quote() %}
Something something
Bigger quote
Multi line
Lorem ipsum!
{% end %}
