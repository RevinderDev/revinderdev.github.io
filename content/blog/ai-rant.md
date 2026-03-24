+++
title = "Some observations on AI"
date = 2026-03-20
description = "My personal thoughts and some anecdotes that make me question if AI is the miracle tool that all tech bros shill for."

[taxonomies]
tags = ["AI", "Python"]
+++

Given that I am still relatively young and I do like to learn new things, I do try to live on the cutting edge of technologies. I don't *try* every tool there is, but I read about all of them. With some I experiment. I know roughly what's available and how it functions. In this article I will share some of my thoughts, use cases and observations that surprised me, though my general feeling has been rather negative.
<!-- more -->
--- 

## To Dict or not to dict

For a while whenever I did any python work, I kept wondering: 

> *Why most of LLMs propose obviously deprecated way of type hinting my code?*

To showcase this, take a look at this (very sensible) production code and let's ask various models how they would type hint it.

```python
def f(my_name, my_age, my_favourite_numbers = None):
       my_age +=10
       if not my_favourite_numbers:
            my_favourite_numbers = {"odd": [1,3], "even": [2,4]} 

    return {
       "name": my_name,
       "my_age": my_age,
       "numbers": my_favourite_numbers,
    }
```

{% character(name="Monk", position="right") %}
Nobody writes code like that, this example doesn't make sense!
{% end %}

{% character(name="CoolPizza", position="left") %}
Chillax. In this case it really does not matter, the point was to have some kind of nested dictionary with optional field. 
{% end %}

So how would you type hint that to make it cleaner?
1. You could have added regular `dict`, `list` and `|` (union) types.
2. You could have added custom `TypedDict` instance.
3. You could have altered the return type of a function, to instead use DTOs in form of `dataclasses` or `pydantic` models. In general this is my preferred method as I find passing around dictionary objects to be code smell. It does however come with a cost of more maintenance as you need to define a type, preferably make it reusable and all that jazz.
4. And now the crucial bit.. IF you are running python (<3.9) then you could have suggested using `Dict`, `Optional` and `List` from `typing` module.

For some reasons, as of march 2026, most of the models still suggest point 4. which is obviously inferior way of doing it. Advised by python developers against, but not yet deprecated.
Worse than that, they offer it *regardless* of which version of python you are running or without asking you to clarify it. 
As a case study, I asked several different models, with a prompt "Can you type hint this function?" and here are summaries of their proposed solutions:
1. MiniMax M2.5 suggested using `Optional`, `Dict`, `List` and `Union`. As an alternative, he suggested using a `TypedDict` but he did it only for the return type, not the input. The input still uses old types. Not only that, but the suggested `TypedDict` uses `Dict` for `numbers` field, duplicated twice unfortunately.
2. Chat GPT-5.4 suggested only one solution with using `dict`, `list` and `|`. He did mention as a bonus to extract these types to a variable with clearly defined names. Not bad!
3. Gemini 3 Flash only gave one choice, with `Dict`, `List`, `Optional` and... `Any`. Somehow it figured the best type hint to return is to give `Dict[str, Any]`. Very bad... 


{% character(name="Monk", position="right") %}
You should have used the Pro version! It's better!
{% end %}

Ehh.. ye ye.. on my way to spend more $.

4. Gemini 3.1 Pro - This surprised me, as I had better hopes for it. It gave only one proposed solution using `dict`, `list` but... it used `Any` and as a return type, it specified `dict[str, Any]`. Unfortunately to the bad bucket you go!
5. Claude Haiku 4.5. Used `Optional`, `Dict` and `List`. No other solutions. At least there is no `Any`...
6. Claude Sonnet 4.6 - used `dict` and `list`. It did mention alternative solution of using `TypedDict`, but only for return type, not for an input.

{% character(name="Monk", position="right") %}
Next model generation will fix that and it will almost be true AGI!
{% end %}

Okay I think I've proved my point. 
So why does it happen? 
It could be that my prompt is not that good, after all, I could have specified not to use `typing` module. 
It could be that the AI wants the code that will run on *most* available python versions, and most of the python code is probably written in python (<=3.9). 
It could be that the most available training data is the one that uses `typing` module, therefore AI is biased to using it.

---

This got me **thinking**.


{% quote() %}
If more and more code is AI generated, and AI generates mostly what it has seen in a training data, so the more volume of something there is the more likely it is to propagate it as an answer. Wouldn't that mean it will become harder and harder to introduce syntax/semantic changes to your tools? How will people in the future know, there is a newer and better way of writing something, if the AI gives them only what it has seen in the past and the only way they write code is through AI?
{% end %}

It turns out this problem is pretty common in industry and is often referred to as [*Model Collapse*](https://www.nature.com/articles/s41586-024-07566-y). Not only that, but models have a tendency to exert [The Consensus Bias](https://en.wikipedia.org/wiki/False_consensus_effect). Ouch, no bueno.


## Breaking point

If by any chance you browse Linkedin / Twitter / Youtube nowadays and are a developer you might be feeling less secure about your job. 
You see all these posts about claude or gemini one shotting several tasks, clearing entire backlogs, succcess stories of delivering something over the course of a few days.
Every one of these posts are repeating roughly same mantra - coding is no more. Entire departments laid off because of it. Nobody needs programmers anymore.
Maybe you've actually been laid off because of the AI hype? If that happened, I am sorry to hear that.
Maybe like me you are hoping for AI bubble to finally burst?
Will it happen this year? Will it happen next year? Or maybe we will finally achieve true AGI?
Nobody knows. Nobody *can* know. And that makes all of us uneasy. 

---

Going one step further, maybe like me, you've invested time to try various models. Maybe you tried opencode, claude code or codex and run up an agent to do your work, and... you are disappointed.

Sure the code somewhat works, but the edge cases are there, it's overly verbose, over engineered, there is A LOT of it and you don't even understand it fully. Most importantly: *you haven't learned anything while writing it*.
Doesn't that make you feel anxious? I know it does for me. I don't want to push that code and be responsible for it. At least not when I don't understand it fully.


I don't know what future holds, I can however, show you that it's not as bad for programmers as other show it to be:
1. [It turns out that they've done a study ](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/#methodology) on impact of AI on 16 *very* experienced developers from open source communities. They were sometimes allowed, sometimes not allowed, to use AI on opened issue. Shockingly to LinkedIn managers, they took on average, **19% longer to complete issues**. The fun bit is all of them *thought* that AI was increasing their speed by around 24%. 
2. There is a great article by Mike Judge - ["Where's the shovelware?"](https://mikelovesrobots.substack.com/p/wheres-the-shovelware-why-ai-coding) He asked the question - if developers are so much more productive with AI, why there isn't more shovelware? To back it up, he brought up amount of domains registered each year, new Github repositories, new steam games, new android apps and new iPhone apps. The trend is the same. Not much really has changed.
3. Adoption of AI is accelerating, but general confidence of public in AI dropped by 19%, [as reported by Forbes](https://fortune.com/2026/01/21/ai-workers-toxic-relationship-trust-confidence-collapses-training-manpower-group/).
4. Less than 1/3rd of AI assisted research [is reproducible](https://aimultiple.com/reproducible-ai).
5. Open source projects are rebelling about blind AI usage with most opting for clear AI usage disclosure.
   * That includes popular terminal Ghostty, as denoted [by it's AI Policy](https://github.com/ghostty-org/ghostty/blob/main/AI_POLICY.md).
   * Debian flat out [bans AI-generated contributions](https://lwn.net/Articles/1061544/)
   * Hackernews bans [AI generated comments](https://news.ycombinator.com/newsguidelines.html#generated).
   * Pydantic AI (oh the irony..)  are in trouble for having too much AI slop and are now resorting to harsher [contribution rules](https://old.reddit.com/r/Python/comments/1ry99ce/open_source_contributions_to_pydantic_ai/?share_id=KtxYHyj9-WnNQO25zDNB-) to keep up.
6. Internet is more and more going towards *the dead internet theory*, with bots being rampart - one of them tried to [blackmail one of the open source developers after it's PR was rejected](https://www.fastcompany.com/91492228/matplotlib-scott-shambaugh-opencla-ai-agent). Another one [applied to a job](https://www.adriankrebs.ch/blog/dead-internet/) without it's owners approval.
7. [In a simulated stress test environment](https://www.anthropic.com/research/agentic-misalignment), researchers found AI (at least in some of the cases) to behave in malicious way towards humans. 


Then we get to **really** depressive stuff:

8. There is [Malus](https://malus.sh/) project which "liberates from open source license obligations" by... recreating any open source project from scratch. How is that even a thing?

{% character(name="CoolPizza", position="left") %}
Going after people who made choice of sharing their work for free for you to use, just based on a promise of yours to be fair according to said license? **Real cool bro**.
{% end %}

9. There [is a website](https://rentahuman.ai/) for AI agents to rent... a human. Because even AI agent sometimes needs a human to do real life work.
10. AI is possibly to be at fault for hitting the school of children in Iran. We can't know for sure, it's too early to say, but so far it's been thrown around as combination of data error and human error.
