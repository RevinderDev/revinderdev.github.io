const codeBlocks = document.querySelectorAll("pre[data-lang]");

for (const pre of codeBlocks) {
    const codeBlock = pre.querySelector("code");
    if (!codeBlock) continue;

    let content;
    // Check if it's a table (line numbers)
    const rows = pre.querySelectorAll("tr");
    if (rows.length > 0) {
        content = [...rows]
            .map((row) => {
                const lastTd = row.querySelector("td:last-child");
                return lastTd ? lastTd.innerText : "";
            })
            .join("");
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
