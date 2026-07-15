// Giallo (Zola 0.22+) emits data-lang on <code>, not <pre> (getzola/zola#3091).
// Mirror the data-* attributes onto <pre> so the CSS attr() selectors + copy
// button logic keep working, then wire up the copy button.
const codeBlocks = document.querySelectorAll("pre.giallo");

for (const pre of codeBlocks) {
    const codeBlock = pre.querySelector("code");
    if (!codeBlock) continue;

    // Mirror data-lang (and data-name if present) from <code> onto <pre>
    for (const attr of ["data-lang", "data-name"]) {
        const value = codeBlock.getAttribute(attr);
        if (value) {
            pre.setAttribute(attr, value);
        }
    }

    // Giallo renders each line as <span class="giallo-l"> and, when line numbers
    // are on, prefixes it with <span class="giallo-ln" aria-hidden="true">N</span>.
    // Build the copyable text from the line spans, stripping the number spans so
    // the copied code doesn't include the line digits.
    let content;
    const lines = pre.querySelectorAll(".giallo-l");
    if (lines.length > 0) {
        content = Array.from(lines)
            .map((line) => {
                const clone = line.cloneNode(true);
                clone.querySelectorAll(".giallo-ln").forEach((n) => n.remove());
                return clone.textContent;
            })
            .join("\n");
    } else {
        content = codeBlock.innerText;
    }

    if (navigator.clipboard !== undefined) {
        const copyButton = document.createElement("button");
        copyButton.classList.add("copy-button");
        copyButton.innerText = "Copy";

        copyButton.addEventListener("click", () => {
            copyButton.innerText = "Copied!";
            navigator.clipboard.writeText(content);
            setTimeout(() => copyButton.innerText = "Copy", 1000);
        });

        // Terminus appends it to pre and uses absolute positioning
        pre.appendChild(copyButton);
    }
}
