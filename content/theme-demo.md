+++
title = "Theme Features Showcase"
date = 2020-01-01
+++

This page demonstrates the new theme features implemented from `terminus` and `apollo`, all styled with a consistent `gruvbox` dark palette.

<!-- more -->

## 1. Terminus-style Code Blocks
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
Implemented from `terminus`, styled for `gruvbox` with full borders and markdown support.

{% alert(type="info") %}
This is an **Information** alert. It supports **Markdown** syntax like `code` and [links](https://google.com).
{% end %}

{% alert(type="warning", title="Check this out!") %}
Fully framed alert box.
{% end %}

{% alert(type="danger") %}
**Danger!** Something went wrong here.
{% end %}

## 3. Apollo Character Shortcodes
Imported from the `apollo` theme with working assets.

{% character(name="CoolPizza", position="left") %}
"Welcome to the blog! The character image is now correctly linked and displayed."
{% end %}

{% character(name="CoolPizza", position="right") %}
"And I can appear on the right side too, with a mirrored avatar!"
{% end %}
