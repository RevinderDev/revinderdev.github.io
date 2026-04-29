+++
title = "Useful stuff for your terminal"
date = 2026-04-28
description = "Small set of functions that I found particularly useful in my local development environment."

[taxonomies]
tags = ["Programming", "Shell"]
+++

In this article I will show you a small set of cool tools that I've gathered that enchance my developer experience on Linux.
My hope for this is that you walk away from this article with something meaningful and useful for your daily workflow. If you would rather just look at the source code, you can find it on [Github](https://github.com/RevinderDev/.dotfiles/blob/master/.zshrc).
<!-- more -->
--- 

{% alert(type="note", icon="robot", title="AI Notice") %}
This article was **not** written by AI.

AI was, however, used for spotting typos and to generate `helprev`, `secrets_edit` and `secrets_encrypt` functions.
All scripts however were read, understood, checked and ran by human.


---
**Models**: DeepSeek V4 Flash

**Tool**: Opencode v1.2.27
{% end %}

## Hurl

I work primarly in web development, that usually means creating some kind of Backend Service. I always disliked having to use GUI apps such as
Postman or Insomnia, but at the same time, writing curls wasn't exactly pleasant experience with BIG json inputs. Lucikly, French company Orange released open source tool called [Hurl](https://github.com/Orange-OpenSource/hurl). It's a CLI tool that executes HTTP requests defined in plain text format and it's surprisingly powerful. Less portable than curl, but slightly nicer syntax. For example:

```hurl
# Simple get
GET https://meowfacts.herokuapp.com/?count=3


# With body
POST https://example.org/api/tests
{
    "id": "4568",
    "evaluate": true
}
```

And that's all it takes!

Invoking it we get:

```sh
$ hurl cat.hurl
{"data":["In 1987 cats overtook dogs as the number one pet in America.","Some common houseplants poisonous to cats include: English Ivy, iris, mistletoe, philodendron, and yew.","Today there are about 100 distinct breeds of the domestic cat."]}%
```


{% character(name="Monk", position="right") %}
That's not really readable JSON..
{% end %}


Correct! Let's write a small shortcut function using another, fantastic tool: [jq](https://jqlang.org/). Throw in [csvlook](https://csvkit.readthedocs.io/en/latest/scripts/csvlook.html) for when we work with CSV output.

```zsh
hurljq() { command hurl "$@" | jq }
hurlcsv() { command hurl "$@" | csvlook }
```

And now:

```sh
$ hurljq cat.hurl
{
  "data": [
    "Some common houseplants poisonous to cats include: English Ivy, iris, mistletoe, philodendron, and yew.",
    "Cats must have fat in their diet because they cannot produce it on their own.",
    "Today there are about 100 distinct breeds of the domestic cat."
  ]
}
```

It supports colors too if your terminal does as well!


Gets even better - Hurl itself is incredibly powerful which helps you with: [Testing responses](https://github.com/Orange-OpenSource/hurl#testing-response),  [Most data structures](https://github.com/Orange-OpenSource/hurl#posting-a-json-body) and so much more!

## Colored echo

Quick one, but I like colored output in my terminal. Makes it easier to visually parse. Couple of helpers for later commands:

```zsh
echo_red()    { echo -e "\033[31m$*\033[0m"; }
echo_green()  { echo -e "\033[32m$*\033[0m"; }
echo_yellow() { echo -e "\033[33m$*\033[0m"; }
echo_blue()   { echo -e "\033[34m$*\033[0m"; } 
echo_cyan()   { echo -e "\033[36m$*\033[0m"; }
```

## Secrets

A lot of the times, the tools that I use on my machine require some kind of 3rd party API key. In AI age, it's especcially prevelent as
all agents require at least one key to be given. It doesn't really sit well with me having them just laying around in some unencrypted file so I've figured I will do something about it. Sure you could use a secret vault, but I didn't really want to roll out one. I wanted something that is somewhat secure while at the same time has an ease of use and is entirely local. GPG to the rescue! First I defined function to create secret file:

```zsh
typeset -g default_secret_file="$HOME/secrets.sh"
typeset -g gpg_id="michal0kasprzyk@gmail.com"

secrets_encrypt() {
    local target_file="${1:-$default_secret_file}"
    if [[ -z "$target_file" || ! -f "$target_file" ]]; then
        echo_red "Error: File '$target_file' not found."
        return 1
    fi
    local target_asc="${target_file}.asc"

    # -e (encrypt), -a (ascii armor), -r (recipient), --yes (overwrite existing)
    if gpg -ea -r "$gpg_id" --yes --output "$target_asc" "$target_file"; then 
        shred -u "$target_file" 2>/dev/null
        chmod 600 "$target_asc"
        echo_green "Locked: '$target_file' encrypted to '$target_asc' and safely removed."
    else
        echo_red "Error: Encryption failed! Plaintext file was NOT removed."
        return 1
    fi
}
```

Now create the `secrets.sh` file itself. It's a script that we control and which we will later eval. Since we changed RW permissions to include our user only, we can be relatively safe that this is indeed the case. If someone has root on our machine, we are doomed anyway 🤷‍♂️.

```sh
export MY_SECRET_KEY="MySecretValue"
```


{% alert(type="warning", title="Careful!") %}
This function will [*shred*](https://linux.die.net/man/1/shred) the **original** file after encrypting it! Otherwise what would be the point of encrypting it if we leave unencrypted file next to it..
{% end %}

```sh
$ secrets_encrypt test.sh
Locked: 'my_secret.sh' encrypted to 'my_secret.sh.asc' and safely removed.
$ ls -al 
...
.rw-------   350 michał 1 second      my_secret.sh.asc
```

Great! Now when someone will peek into what's `my_secret.sh.asc` they wont see plain text of your secrets anymore, just PGP Message.
How to work with the file now? Well, for that, there are 2 things we can do.

### Loading secrets

For my own purposes, I only use default secret file, stored at:

```sh
typeset -g secret_asc="$HOME/secrets.sh.asc"
```

Which is why my loading secrets is not taking any file as an argument, but that shouldn't be an issue for you to tweak it. Let it be an exercises for a reader! Moving on...

```sh
load_secrets() {
    if [[ ! -f "$secret_asc" ]]; then
        echo_red "Error: Encrypted file not found at $secret_asc"
        return 1
    fi

    local decrypted
    if ! decrypted=$(gpg --quiet --decrypt "$secret_asc" 2>/dev/null); then
        echo_red "Error: Decryption failed (check your GPG agent/passphrase)."
        return 1
    fi

    # Parse for display
    local -a loaded_keys
    for line in ${(f)decrypted}; do
        [[ $line == export\ * ]] && loaded_keys+=(${${line#export }%%=*})
    done

    eval "$decrypted"
    unset decrypted  # get it off from memory.

    echo_green "✅ Secrets loaded into environment:"
    for key in $loaded_keys; do
        echo_blue "- $key"
    done
}
```

Stripping away printing output and error checking, the crucial line is `gpg --quiet --decrypt`. That's it! We `eval` what was given in the script
For another measure, we unset the contents from memory just in case, though the variables will be visible in shell session and it's probably better to do it *per command* but it's still miles ahead of plain text, so for now - it's good enough for me. Now let's test it:

```sh
$ load_secrets
✅ Secrets loaded into environment:
- MY_SECRET_KEY
$ echo $MY_SECRET_KEY
MySecretValue
````

Voila!

### Editing secrets

What if we wanna edit it? For that, we have another function:

```zsh
secrets_edit() {
    if [[ ! -f "$secret_asc" ]]; then
        echo_red "Error: $secret_asc not found."
        return 1
    fi
    local editor="${EDITOR:-vi}"
    local ram_file="/dev/shm/secrets_edit_${UID}.sh"

    # Decrypt straight into RAM
    if ! gpg --quiet --decrypt --output "$ram_file" "$secret_asc"; then
        echo_red "Error: Decryption failed."
        return 1
    fi
    chmod 600 "$ram_file"

    local before
    before=$(sha256sum "$ram_file" | awk '{print $1}')

    $editor "$ram_file"

    # Skip re-encryption if nothing changed
    local after
    after=$(sha256sum "$ram_file" | awk '{print $1}')
    if [[ "$before" == "$after" ]]; then
        echo_cyan "No changes — removing temporary file."
        rm -f "$ram_file"
        return 0
    fi

    if gpg -ea -r "$gpg_id" --yes --output "$secret_asc" "$ram_file"; then
        rm -f "$ram_file"
        echo_green "🔐 Secrets encrypted to $secret_asc"
    else
        echo_red "Error: Encryption failed — plaintext left at $ram_file"
        return 1
    fi
}
```

This one is a little bit more involved so I will break it down step by step:
1. We define a path where we will store unencrypted file at `/dev/shm/{file}` which is a special place that behaves like a file system, that is stored within RAM. Essentially this means that the file is never stored on disc!
2. Decrypt into it.
3. Change RW permissions to include only our user. 

{% alert(type="note", title="Note") %}
Technically between these two steps (2 and 3) the attacker could swap out the file for something else but... we are editing the file right away, so we would see different code before encrypting it again. And we are not using `eval` in this function either, so we are safe **if you catch that something is off by looking at the file before `load_secrets`**.
{% end %}

4. Calculate `sha256` for both old and new files to compare if the contents changed.
5. Encrypt only if it did in fact change.
6. Delete temporary file from RAM.

And that's it! Our file was edited, was never present unencrypted on disc, and is back to be encrypted. Pretty nifty! 

## Git 

Andrej Karpathy had a fun idea of using [llm](https://llm.datasette.io/en/stable/) to create small script that produces commit message for given changes. Since this idea is entirely copied from him, I wont provide full implementation here, but rather send you to his [Github Gists page](https://gist.github.com/karpathy/1dd0294ef9567971c1e4348a90d69285). My extension of it however tweaked the prompts to generate semantic commits and allowed editing commit message - in case the generated one is off only by few words or just one. Saves a little bit of tokens. I'm cheap yall sorry! Here is how it looks:

```sh
typeset -g llm_model="openrouter/deepseek/deepseek-v4-flash"

gitcs() {
    local prompt='
    Below is a diff of all staged changes, coming from the command:
    \`\`\`
    git diff --cached
    \`\`\`
    Please generate a concise, one-line commit message for these changes.'
    _git_commit_with_prompt "$prompt"
}

gitcl() {
    local prompt='
    You are an automated, non-interactive Git commit message generation machine. You are part of a shell pipeline. Your ONLY purpose is to read a git diff and output raw text. 

    UNDER NO CIRCUMSTANCES should you ask questions, make suggestions, or converse. If you see garbage, debugging code, or errors in the diff, ignore them and simply document what was added or removed.

    Analyze the diff and generate a commit message following the Conventional Commits specification.

    STRICT RULES:
    1. Identify the PRIMARY change to determine the commit type (feat, fix, docs, style, refactor, perf, test, chore).
    2. Write a subject line (max 50 chars): <type>(<optional scope>): <short description>.
    3. Leave exactly one blank line after the subject.
    4. Write a detailed body explaining the motivation for the main change and listing secondary changes.
    5. NO MARKDOWN. Do not use backticks (```).
    6. NO CONVERSATION. Do not output anything like "Here is the commit" or "Would you like to change this?".

    OUTPUT TEMPLATE:
    <type>(<scope>): <subject>

    <body>

    DIFF TO ANALYZE:'
    _git_commit_with_prompt "$prompt"
}
```

Those are both for when I am working locally and want to commit locally, which will later be pushed. However, a lot of the times I find myself having PR open with bunch of commits and that PR requires proper description as well as proper commit message for when all the commits get squashed when merging. For that, I opted for much less saner approach, but one that still works, of using [opencode](https://opencode.ai/) agent to do the work for me:

```zsh
gitprdesc() {
    local prompt='
    You are an automated Pull Request description generator. 
    Your ONLY purpose is to read a git diff of a feature branch and output a PR description in Markdown.

    STRICT RULES:
    1. Provide a high-level summary of the overall goal or feature added.
    2. Provide a bulleted list of the specific changes made. Group them logically if there are many.
    3. Keep it professional, concise, and structured.
    4. If there are commit messages that are good enough, you can keep them in the list, but skip any useless messages such as "test" or "bump".
    5. NO CONVERSATION. Do not output anything like "Here is your description". Just output the raw Markdown.
    '
    opencode run --model "$llm_model" $prompt
}

gitprc() {
    local prompt='
    You are an expert Software Engineer specializing in Git archaeology and the Conventional Commits standard. Your goal is to analyze a branch history and generate a single, perfectly formatted semantic commit message for a squash-and-merge.

    1. Analyze the current branch and compare it against the base branch (e.g., `main` or `master`).
    2. Summarize all atomic changes into one cohesive, strictly formatted semantic commit message.

    - **Structure:** <type>[optional scope]: <description>
    - **Subject Line:** - Use imperative, present tense ("add", not "added" or "adds").
        - No period at the end.
        - Maximum 50 characters.
    - **Body:** - Use a bulleted list for the specific changes.
        - Explain the "what" and "why," not just the "how."
        - Wrap lines at 72 characters.
    - **Types:** You must use exactly one of these:
        - `feat`: A new feature.
        - `fix`: A bug fix.
        - `docs`: Documentation only.
        - `style`: Formatting, missing semi-colons, etc. (no logic change).
        - `refactor`: Code change that neither fixes a bug nor adds a feature.
        - `perf`: Code change that improves performance.
        - `test`: Adding or correcting tests.
        - `chore`: Build process, dependencies, or auxiliary tools.

    If the changes contain breaking API or logic, append a `!` after the type/scope and include a `BREAKING CHANGE:` footer detailing the migration/impact.

    Gather the diff and commit history for the current branch now. Generate the final squash commit message based on your findings.
    '
    opencode run --model "$llm_model" $prompt
}
```

{% character(name="CoolPizza", position="left") %}
One should really question PR description shortcut. On one hand it speeds up writing it quite a bit, but on the other writing it slowly by hand
makes you think about your changes much more and makes intent of the them more deliberate. There is a good argument to be made to write these by hand still.
{% end %}

Let's test it out by running against this, at that moment unfinished, article:

```sh
$ load_secrets # Duh..
...
$ gitcs
🤖 Generating AI-powered commit message...

Proposed commit message:

Add 'Useful stuff for your terminal' blog post

Do you want to (a)ccept, (e)dit, (r)egenerate, or (c)ancel? c
Commit cancelled.

$ gitcl
🤖 Generating AI-powered commit message...

Proposed commit message:

feat(blog): add blog post about useful terminal helpers and functions

This new blog post documents a set of shell functions and tools that enhance the developer terminal experience. The article covers:
- Using Hurl with jq and csvlook for prettified HTTP request outputs
- Colored echo functions for improved terminal readability
- A GPG-based secret management system: encrypt, load, and edit secrets without leaving plaintext on disk
- Git helper functions that leverage LLMs for generating conventional commit messages and pull request descriptions

Do you want to (a)ccept, (e)dit, (r)egenerate, or (c)ancel? c
```

Lovely!

## Pomodoro

Last one is just a fun little productivity tool. I use [Pomodoro Technique](https://en.wikipedia.org/wiki/Pomodoro_Technique) to stay focused. I wrote myself some small helpers for the timer using [timer-cli](https://crates.io/crates/timer-cli):

```sh
typeset -A pomo_options
pomo_options[work]="25"
pomo_options[break]="5"

pomodoro() {
  local session_type="$1"
  
  if [[ -n "$session_type" && -n "${pomo_options[$session_type]}" ]]; then
    timer "${pomo_options[$session_type]}m"
  else
    echo_red "Invalid pomodoro session type. Use 'work' or 'break'."
  fi
}

alias workdo='pomodoro work'
alias workbreak='pomodoro break'
```

Which gives this lovely ASCII art clock that counts down to 0: 

```sh

 ad888888b,          ,d8                                    ,d8     ad88888ba
d8"     "88        ,d888                                  ,d888    d8"     "88
        a8P      ,d8" 88                                ,d8" 88    8P       88
     ,d8P"     ,d8"   88    88,dPYba,,adPYba,         ,d8"   88    Y8,    ,d88  ,adPPYba,
   a8P"      ,d8"     88    88P'   "88"    "8a      ,d8"     88     "PPPPPP"88  I8[    ""
 a8P'        8888888888888  88      88      88      8888888888888           8P   `"Y8ba,
d8"                   88    88      88      88               88    8b,    a8P   aa    ]8I
88888888888           88    88      88      88               88    `"Y8888P'    `"YbbdP"'
```

When it finishes, it plays a terminal bell sound but you could easily silent it and just have `notify-send` be used instead for small popup.

## Last words

I admit, these are not perfect solutiosn to those problems, but that misses the point. The point is that these are *my* solutions, to *my* specific problems and so far, they have been working nicely. The reason for this entire article was that perhaps, you might find them useful. Or even better, perhaps you will find inspiriation to write your own custom tools and share them with me. Either way it's a win.

Lastly, you can see how it might be easy to get lost at the sea of not-exactly-best names of these functions. So for that, with the help of AI, I wrote custom parser of `.zshrc` to allow documenting it and printing out nicely formatted help. 

```zsh
helprev() {
    print -P "\n%F{green}Helper functions: %f"
    awk '/^# @desc / { 
        desc = substr($0, 9); 
        getline; 
        gsub(/[(){]/, "", $1); 
        name = ($1 == "function") ? $2 : $1; 
        printf "  \033[36m%-20s\033[0m %s\n", name, desc 
    }' ~/.zshrc
    echo "" 
}
# @desc Hurl with pipe to jq
hurljq() { command hurl "$@" | jq }
```

You can see already usage of it - just define `# @desc My description` comment above the function you wish to document. If you ever forget one and it's syntax, just run the `helprev`:

```sh
$ helprev

Helper functions:
  helprev              Displays this list of custom registered functions
  hurljq               Hurl with pipe to jq
  hurlcsv              Hurl with pipe to csvlook
  gitprdesc            Generate pull request *description* using opencode agent.
  gitprc               Generate pull request *commit* using opencode agent.
  gitcs                Generate short concise, one-line commit message using llm.
  gitcl                Generate longer semantic commit message using llm.
  pomodoro             Start pomodoro timer. Support [pomodoro work] | [pomodoro break]
  secrets_edit         Allows to edit secrets.sh.asc file in RAM.
  secrets_encrypt      Allows to encrypt given file. Original file is removed.
  load_secrets         Loads the secrets to given shell session.

```

Just one thing to remember - `helprev`.

