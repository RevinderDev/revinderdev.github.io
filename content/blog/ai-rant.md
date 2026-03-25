+++
title = "Dicts, Slop and the Dead Internet"
date = 2026-03-24
description = "My personal thoughts and some anecdotes that make me question if AI is the miracle tool that all tech bros shill for and why I believe that AI isn't the miracle tool management was promised to be."

[taxonomies]
tags = ["AI", "Python"]
+++

Because I'm relatively young and love learning, I try to live on the cutting edge of technology. I don't *try* every tool there is, but I read about all of them. With some I experiment. I know roughly what's available and how it functions. In this article I will share some of my thoughts, use cases and observations that surprised me, though my general feeling has been rather negative.
<!-- more -->
--- 

{% alert(type="note", icon="robot", title="AI Notice") %}
This article was **not** written by AI.

AI was, however, used for spotting typos and to generate markdown table (not its content!).

AI was also used as a case study in a Python code example, though it's clearly indicated there which one did what.

---
**Models**: MiniMax M2.5, Gemini 3.1 Pro

**Tool**: Opencode v1.2.27
{% end %}

## To Dict or not to dict

For a while whenever I did any Python work, I kept wondering: 

> *Why do most LLMs propose an obviously deprecated way of type hinting my code?*

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
Chillax. In this case, it really does not matter; the point was to have some kind of nested dictionary with an optional field. 
{% end %}

So how would you type hint that to make it cleaner?
1. You could have added regular `dict`, `list` and `|` (union) types.
2. You could have added a custom `TypedDict` instance.
3. You could have altered the return type of a function to instead use DTOs in the form of `dataclasses` or `pydantic models`. In general this is my preferred method as I find passing around dictionary objects to be a code smell. It does, however, come with the cost of increased maintenance as you need to define a type, preferably make it reusable and all that jazz.
4. And now the crucial bit.. IF you are running Python (<3.9) then you could have suggested using `Dict`, `Optional`, and `List` from the `typing` module.

For some reason, as of March 2026, most of the models still suggest point 4, which is an obviously inferior way of doing it. It is advised against by Python developers, but not yet deprecated.
Worse than that, they offer it *regardless* of which version of Python you are running or without asking you to clarify it. 
As a case study, I asked several different models with a prompt "Can you type hint this function?" and here are summaries of their proposed solutions:

|Model            |Primary Types Suggested    |Return Type / Extras                              |
|-----------------|---------------------------|------------------------------------------------- |
|MiniMax M2.5     |`Dict`, `List`, `Optional`, `Union`|TypedDict (return only), bugged field duplication. Pretty bad.|
|Chat GPT-5.4     |`dict`, `list`, &#124;              |Extracted types to variables with clear names. Actually pretty good usage.|
|Gemini 3 Flash   |`Dict`, `List`, `Optional`, `Any`  |`Dict[str, Any]`. Awful.                                   |
|Gemini 3.1 Pro   |`dict`, `list`, `Any`            |`dict[str, Any]`. Still awful.                                   |
|Claude Haiku 4.5 |`Dict`, `List`, `Optional`       |Avoided using `Any`, but still awful.                               |
|Claude Sonnet 4.6|`dict`, `list`                 |Suggested TypedDict (return only, not input). Not bad, but not great. 3.6                 |

{% character(name="Monk", position="right") %}
You should have used the [insert your favourite AI]! It's better for coding! And wait until [next generation] comes in and it will be fixed then!
{% end %}

Ehh.. yeah yeah.. alongside the price going up substantially. 

Okay, I think I've proven my point. So why does it happen? 
It could be that my prompt is not that good; after all, I could have specified not to use the `typing` module. 
It could be that the AI wants the code that will run on *most* available Python versions, and most Python code is probably written in Python (<=3.9). 
It could be that the most available training data is what uses the `typing` module; therefore, the AI is biased toward using it.


## Illusion of competence

You might feel like my `dict` example is cherry-picked, perhaps by the language of my choice or the nature of the error itself. I can assure you - **it's not**.
That issue is actually magnified by different versions of languages, different libraries, and different environments.
I've had similar issues with Pydantic migrating from v1 to v2. Functions are deprecated, and AI is continuously suggesting them.

Can it be fixed by RAG or by giving the model access to the internet? To some degree yes, but there is a catch - it's the illusion of competence.
AI is always sure of its answer. It never hesitates. It's the job of a human now to question it, but for some reason, most people don't.
To a manager, generating 500 lines of code in 10 seconds looks like a miracle. To a senior developer, the same code might be a ticking time bomb of technical debt, just waiting for the perfect moment.
Sure, it might work most of the time and be kinda slow and be kinda okay, but if mediocrity is all you are after, then go ahead and vibe all you want. That's just not for me. I want my code to be artisan.

The keyword, however, in this is **senior**. Unfortunately, I've noticed the disturbing trend of more junior colleagues of mine being over-reliant on AI to a point where
they are *very* confident in delivering far more than they can. And again, another keyword: **delivering** NOT **maintaining**.
Maintenance is never considered. I've seen personally a situation where a junior backend developer suggested to a manager that he could make an entire email form link to a custom-made frontend 
which would collect the answers for the backend over the next 2-3 days. I tried talking him out of it, to let the FE team handle it, but try and convince a manager, who heard from one very 
respectable junior that "yes it's possible", that your view is the correct one.
All I could do is watch this train wreck of a situation, which predictably crashed on: deployment, authentication, and authorization to the backend, security issues with emails, company branding being incorrectly made, and more.
AI never told him about these problems initially - it was only as he worked through it he saw the issues piling up. He had no prior experience, so he couldn't have known about it.
And because it wasn't specified by him, the AI didn't know either. That *illusion* was enough to convince the manager to green-light it and the train went off.

In this case, the mistake wasn't costly. A few days of developer time at most. Maybe some architectural pivot required. But it could have been a lot worse, had the functionality been critical *and* successfully deployed to the public.
In a scenario like this - how is a junior who accepts LLM output frequently without asking questions meant to succeed? And how can he keep asking questions of an LLM when the managers are over his shoulder for more efficiency,
more code committed and more PRs done? How is he meant to grow as an engineer?

It feels like the endgame to this situation is a market of a very small number of bad juniors.

## Systemic loop

This got me **thinking**.

{% quote() %}
If more and more code is AI-generated, and AI generates mostly what it has seen in training data, so the more volume of something there is the more likely it is to propagate it as the answer. Wouldn't that mean it will become harder and harder to introduce syntax/semantic changes to your tools? How will people in the future know there is a newer and better way of writing something, if the AI gives them only what it has seen in the past and the only way they write code is through AI?
{% end %}

It turns out this problem is pretty common in the industry and is often referred to as [*Model Collapse*](https://www.nature.com/articles/s41586-024-07566-y). As models train on data that was generated by other models, the quality and diversity of their outputs degrade. It is a known fact and there are no good answers to it yet. They are trying. Billions of dollars are on it after all.

Combine that with [The Consensus Bias](https://en.wikipedia.org/wiki/False_consensus_effect) - where models favor the most statistically frequent answer rather than the correct one (how would they know which one is correct though!) and suddenly, the Python typing issue makes sense. The models aren't malicious; *they are just aggressively mediocre by design. They enforce stagnation*.


And all of this is possible because a lot of the tireless and thankless work by open source developers was stolen to be included as datasets for AI companies to profit off of.


## Breaking point

If by any chance you browse LinkedIn / Twitter / YouTube nowadays and are a developer, you might be feeling less secure about your job. 
You see all these posts about Claude or Gemini one-shotting several tasks, clearing entire backlogs, success stories of delivering something over the course of a few days.
Every one of these posts is repeating roughly the same mantra - coding is no more. Entire departments laid off because of it. Nobody needs programmers anymore.
Maybe you've actually been laid off because of the AI hype? If that happened, I am sorry to hear that.
Maybe like me, you are hoping for the AI bubble to finally burst?
Will it happen this year? Will it happen next year? Or maybe we will finally achieve true AGI?
Nobody knows. Nobody *can* know. And that makes all of us uneasy. 


Going one step further, maybe like me, you've invested time in trying various models. Maybe you tried OpenCode, Claude Code or Codex and ran an agent to do your work, and... you are disappointed.

Sure, the code somewhat works, but the edge cases are there, it's overly verbose, over-engineered, there is A LOT of it, and you don't even understand it fully. Most importantly: *you haven't learned anything while writing it*.
Doesn't that make you feel anxious? I know it does me. I don't want to push generated code and be responsible for it. At least not when I don't understand it fully.

I don't know what the future holds, I can, however, show you what's happening now:


1. Productivity boost is a lie
* [It turns out that they've done a study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/#methodology) on the impact of AI on 16 *very* experienced developers. Shockingly, they took, on average, **19% longer to complete issues**. The fun bit is all of them *thought* they were 24% faster.
* AI hasn't contributed to substantial growth in apps. Michael Hart asked a good question in ["Where's the shovelware?"](https://mikelovesrobots.substack.com/p/wheres-the-shovelware-why-ai-coding): if developers are so much more productive, why isn't there a spike in new GitHub repos, Steam games, or mobile apps? The trend is the same. Nothing has changed.
* Microsoft is simultaneously boasting about [how 30% of its code is AI-written](https://timesofindia.indiatimes.com/technology/tech-news/less-than-a-year-after-ceo-satya-nadella-said-30-of-microsofts-code-is-ai-written-company-appoints-an-engineering-quality-head/articleshow/128116076.cms) while dealing with reports that [almost all major Windows 11 core features are broken](https://www.neowin.net/news/microsoft-finally-admits-almost-all-major-windows-11-core-features-are-broken/). Do we not see a connection yet?

2. Open source is under attack
* Projects are rebelling against blind AI usage. That includes:
   * Popular terminal Ghostty, as denoted [by its AI Policy](https://github.com/ghostty-org/ghostty/blob/main/AI_POLICY.md).
   * Debian - which flat out [bans AI-generated contributions](https://lwn.net/Articles/1061544/)
   * Hacker News bans [AI-generated comments](https://news.ycombinator.com/newsguidelines.html#generated).
   * Pydantic AI (oh the irony..) who are in trouble for having too much AI slop and is now resorting to harsher [contribution rules](https://old.reddit.com/r/Python/comments/1ry99ce/open_source_contributions_to_pydantic_ai/?share_id=KtxYHyj9-WnNQO25zDNB-) to keep up.
* Conversely, there is the [Malus](https://malus.sh/) project, which attempts to "liberate" from open-source license obligations by using AI agents to recreate projects from scratch, essentially laundering AST representations to bypass licensing. 

{% character(name="CoolPizza", position="left") %}
Going after people who made the choice to share their work for free for you to use, just based on a promise of yours to be fair according to their wishes? **Real cool bro**.
{% end %}

3. Scientific collaboration collapse
* Despite accelerating adoption, public confidence in AI has dropped by 19%, [as reported by Forbes](https://fortune.com/2026/01/21/ai-workers-toxic-relationship-trust-confidence-collapses-training-manpower-group/).
* Less than 1/3rd of AI-assisted research [is reproducible](https://aimultiple.com/reproducible-ai). Corporate labs prioritize profit over shared knowledge, creating a net negative for society's actual technological progression.

4. The dead internet theory isn't a theory anymore
* We have bots [blackmailing open source developers](https://www.fastcompany.com/91492228/matplotlib-scott-shambaugh-opencla-ai-agent), bots [applying for jobs](https://www.adriankrebs.ch/blog/dead-internet/) autonomously, and [simulated stress tests](https://www.anthropic.com/research/agentic-misalignment) showing AI behaving maliciously toward humans.
* And for the truly depressive stuff: a [new website popped up](https://rentahuman.ai/) for AI agents to *rent a human*. Because even an AI agent sometimes needs a human to do real life work. Black Mirror season 6.

And the coup de grace we all saw coming.. [AI may already be used in a war.](https://thebulletin.org/2026/03/unready-for-war-ai-may-already-be-causing-deadly-mistakes/)

If all of that makes you feel uneasy, you are not alone. That, unfortunately, is what makes a lot of difference.
The breaking point of AI, the so-called "Technological Singularity", does not need to occur at its full potential, for it to have a huge impact on society. 
As stated by [Cam Pedersen in his "Singularity" piece](https://campedersen.com/singularity):
> *The curve [of AI Potential] does not need to reach the pole, it just needs to look like it will. (...) And the uncomfortable answer is: <b>it's already happening</b>*.

## Final Thoughts

So where does this leave us? I am not happy. When it comes down to the IT sector, the thing that always
ground my gears was corporate stuff. Boring meetings, people with no expertise telling me what is worth doing
and what is not (why is it always tests and refactors..) or an incoherent vision for a project. It feels to me that
the current AI landscape magnifies these issues to absolute extremes. It feels like my projects are:
- Sloppier with no real understanding in the choice of tooling.
- Over-promised by managers with a hook of AI solving every single one of our problems.
- Same managers are also cutting on every expense possible. Somehow I am meant to pay for all these tokens myself for work, but if I don't use AI, I am also told I am not working the best way I can. Another markdown file will fix it for sure.
- Somehow not deterministic because in the contract it was stated that the AI agent must be involved, so we had to include it somewhere.
- Insecure, riddled with holes.

This is not why I've fallen in love with this field. 

I went in because I liked computers. 
I like code. I liked engineering parts of the problems and I liked when solutions worked.
I liked caring about developer ergonomics. I liked when being thorough paid off with stability. 
But it seems with AI it matters less and less.
When asked if one should go into IT, I used to say 'absolutely yes if you are feeling it'.
No longer can I say that with a clear conscience, because I don't know if I will be able to even work 
in the field myself in a few years and that makes me sad..
