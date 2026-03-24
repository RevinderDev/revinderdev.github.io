+++
title = "Some observations on AI"
date = 2026-03-20
description = "My personal thoughts and some anecdotes that make me question if AI is the miracle tool that all tech bros shill for."

[taxonomies]
tags = ["AI", "Python"]
+++

Because I'm relatively young and love learning, I try to live on the cutting edge of technology. I don't *try* every tool there is, but I read about all of them. With some I experiment. I know roughly what's available and how it functions. In this article I will share some of my thoughts, use cases and observations that surprised me, though my general feeling has been rather negative.
<!-- more -->
--- 

{% alert(type="note", icon="robot", title="AI Notice") %}
This article was **not** written by AI.

AI was however for spotting typos. 

AI was also used as a case study in python code example, though it's clearly indicated there which one did what.

---
**Models**: MiniMax M2.5

**Tool**: Opencode v1.2.27
{% end %}

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

For some reason, as of March 2026, most of the models still suggest point 4. which is obviously inferior way of doing it. Advised against by Python developers, but not yet deprecated.
Worse than that, they offer it *regardless* of which version of python you are running or without asking you to clarify it. 
As a case study, I asked several different models, with a prompt "Can you type hint this function?" and here are summaries of their proposed solutions:

|Model            |Primary Types Suggested    |Return Type / Extras                              |
|-----------------|---------------------------|------------------------------------------------- |
|MiniMax M2.5     |`Dict`, `List`, `Optional`, `Union`|TypedDict (return only), bugged field duplication. Pretty bad.|
|Chat GPT-5.4     |`dict`, `list`, &#124;              |Extracted types to variables with clear names. Actually pretty good usage.|
|Gemini 3 Flash   |`Dict`, `List`, `Optional`, `Any`  |`Dict[str, Any]`. Awful.                                   |
|Gemini 3.1 Pro   |`dict`, `list`, `Any`            |`dict[str, Any]`. Still awful.                                   |
|Claude Haiku 4.5 |`Dict`, `List`, `Optional`       |Avoided using `Any`, but still awful.                               |
|Claude Sonnet 4.6|`dict`, `list`                 |Suggested TypedDict (return only, not input). Not bad, but not great. 3.6                 |

{% character(name="Monk", position="right") %}
You should have used the [insert your favourite AI]! It's better for coding! And wait out till [next generation] comes in and it will be fixed then!
{% end %}

Ehh.. yeah yeah.. alongside the price going up substantially. 

Okay I think I've proved my point. So why does it happen? 
It could be that my prompt is not that good, after all, I could have specified not to use `typing` module. 
It could be that the AI wants the code that will run on *most* available python versions, and most of the python code is probably written in python (<=3.9). 
It could be that the most available training data is the one that uses `typing` module, therefore AI is biased to using it.

---

This got me **thinking**.


{% quote() %}
If more and more code is AI generated, and AI generates mostly what it has seen in a training data, so the more volume of something there is the more likely it is to propagate it as an answer. Wouldn't that mean it will become harder and harder to introduce syntax/semantic changes to your tools? How will people in the future know, there is a newer and better way of writing something, if the AI gives them only what it has seen in the past and the only way they write code is through AI?
{% end %}

It turns out this problem is pretty common in industry and is often referred to as [*Model Collapse*](https://www.nature.com/articles/s41586-024-07566-y). Not only that, but models have a tendency to exert [The Consensus Bias](https://en.wikipedia.org/wiki/False_consensus_effect). Ouch, no bueno.

## Illusion of competence

You might feel like my `dict` example is cherry picked, perhaps by language of my choice or the nature of the error itself. I can assure you - **it's not**.
That issue is actually magnified by different version of languages, different libraries and different environments.
I've had similar issues with Pydantic migrating from v1 to v2. Functions deprecated and AI continuously suggesting them.

Can it be fixed by RAG or by giving the model access to the internet? To some degree yes, but there is a catch - it's the illusion of competence.
AI is always sure of its answer. It never hesitates. It's a job of a human now to question it, but for some reason, most people don't.
To manager, generating 500 lines of code in 10 seconds looks like a miracle. To senior developer same code might be a ticking time bomb of technical debt, just waiting for the perfect moment.
Sure, it might work most of the time and be kinda slow and be kinda okay, but if mediocrity is all you are after, then go ahead and vibe all you want. That's just not for me. I want my code to be artisan.

The keyword however in this is **senior**. Unfortunately I've noticed the disturbing trend of more junior colleagues of mine to be over reliant on AI to a point where
they are *very* confident in delivering far more than they can. And again, another keyword: **delivering** NOT **maintaining**.
Maintenance is never considered. I've seen personally a situation where a junior backend developer suggested to a manager that he can make entire email form done link to custom made frontend 
which will collect the answer to the backend over the next 2-3 days. I tried talking him out of it, to let FE team handle it, but try and convince a manager who heard from one very 
respectable junior that "yes it's possible" that your view is correct one.
All I could do is watch this train wreck of a situation, which predictably crashed on: deployment, authentication and authorization to backend, security issues with emails, company branding being incorrectly made, and more.
AI never told him about these problems initially - it was only as he worked through it he saw the issues piling up. He had no experience prior to that, so he couldn't have known about it.
And because it wasn't specified by him, the AI didn't know either. That *illusion* was enough to convince manager to green light it and the train went off.

In this case the mistake wasn't costly. Few days of developers time most. Maybe some architectural pivot required. But it could have been a lot worse, had the functionality been critical *and* successfully deployed to the public.
In a scenario like this - how a junior who accepts LLM frequently without asking questions is meant to succeed? And how can he keep asking questions to LLM when the managers are over his head for more efficiency,
more code committed and more PRs done? How is he meant to grow as an engineer?

It feels like the endgame to this situation is a market of very small amount of bad juniors.


## Breaking point

If by any chance you browse LinkedIn / Twitter / YouTube nowadays and are a developer you might be feeling less secure about your job. 
You see all these posts about Claude or Gemini one shotting several tasks, clearing entire backlogs, success stories of delivering something over the course of a few days.
Every one of these posts is repeating roughly same mantra - coding is no more. Entire departments laid off because of it. Nobody needs programmers anymore.
Maybe you've actually been laid off because of the AI hype? If that happened, I am sorry to hear that.
Maybe like me you are hoping for the AI bubble to finally burst?
Will it happen this year? Will it happen next year? Or maybe we will finally achieve true AGI?
Nobody knows. Nobody *can* know. And that makes all of us uneasy. 


Going one step further, maybe like me, you've invested time in trying various models. Maybe you tried opencode, claude code or codex and run up an agent to do your work, and... you are disappointed.

Sure the code somewhat works, but the edge cases are there, it's overly verbose, over engineered, there is A LOT of it, and you don't even understand it fully. Most importantly: *you haven't learned anything while writing it*.
Doesn't that make you feel anxious? I know it does me. I don't want to push generated code and be responsible for it. At least not when I don't understand it fully.


I don't know what future holds, I can however, show you what's happening now:
1. [It turns out that they've done a study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/#methodology) on impact of AI on 16 *very* experienced developers from open source communities. They were sometimes allowed, sometimes not allowed, to use AI on opened issue. Shockingly to LinkedIn managers, they took on average, **19% longer to complete issues**. The fun bit is all of them *thought* that AI was increasing their speed by around 24%. 
2. AI hasn't contributed to substantial growth in apps according to: ["Where's the shovelware?"](https://mikelovesrobots.substack.com/p/wheres-the-shovelware-why-ai-coding) Author asked a good question - if developers are so much more productive with AI, why there isn't more shovelware? To back it up, he brought up amount of domains registered each year, new Github repositories, new steam games, new android apps and new iPhone apps. The trend is the same. Not much really has changed. 
3. Adoption of AI is accelerating, but general confidence of public in AI dropped by 19%, [as reported by Forbes](https://fortune.com/2026/01/21/ai-workers-toxic-relationship-trust-confidence-collapses-training-manpower-group/).
4. Less than 1/3rd of AI assisted research [is reproducible](https://aimultiple.com/reproducible-ai). Corporate labs are much more luxurious places to be at for scientists and they are not for knowledge. They are for profit. By definition then, they will not want to share full result of their works. That in itself is not a bad thing, after all research can be driven by idea of immense profit, but when vast majority of work is done this way, it does feel like we as a society will have a net negative from it, not net positive.
5. Open source projects are rebelling about blind AI usage with most opting for clear AI usage disclosure. That includes:
   * Popular terminal Ghostty, as denoted [by its AI Policy](https://github.com/ghostty-org/ghostty/blob/main/AI_POLICY.md).
   * Debian - which flat out [bans AI-generated contributions](https://lwn.net/Articles/1061544/)
   * Hackernews also bans [AI generated comments](https://news.ycombinator.com/newsguidelines.html#generated).
   * Pydantic AI (oh the irony..) who are in trouble for having too much AI slop and are now resorting to harsher [contribution rules](https://old.reddit.com/r/Python/comments/1ry99ce/open_source_contributions_to_pydantic_ai/?share_id=KtxYHyj9-WnNQO25zDNB-) to keep up.
   * .. and many more ..
6. The internet is accelerating toward *the dead internet theory*, with bots being rampant - one of them tried to [blackmail one of the open source developers after it's PR was rejected](https://www.fastcompany.com/91492228/matplotlib-scott-shambaugh-opencla-ai-agent). Another one [applied to a job](https://www.adriankrebs.ch/blog/dead-internet/) without its owner's approval.
7. [In a simulated stress test environment](https://www.anthropic.com/research/agentic-misalignment), researchers found AI (at least in some of the cases) to behave in malicious way towards humans. 
8. Microsoft is simultaneously boasting about [how 30% of it's code is AI-written](https://timesofindia.indiatimes.com/technology/tech-news/less-than-a-year-after-ceo-satya-nadella-said-30-of-microsofts-code-is-ai-written-company-appoints-an-engineering-quality-head/articleshow/128116076.cms) and how [all major Windows 11 core features are broken](https://www.neowin.net/news/microsoft-finally-admits-almost-all-major-windows-11-core-features-are-broken/). Do we not see a connection yet?

Then we get to **really** depressive stuff:

9. There is [Malus](https://malus.sh/) project which "liberates from open source license obligations" by... recreating any open source project from scratch using AI agents, essentially bypassing any licensing issues. Or does it? What if AST representation remains the same, but the implementation differs? I have no idea, I am not a lawyer.

{% character(name="CoolPizza", position="left") %}
Going after people who made a choice of sharing their work for free for you to use, just based on a promise of yours to be fair according to their wishes? **Real cool bro**.
{% end %}

10. [A new websited popped up](https://rentahuman.ai/) for AI agents to rent... a human. Because even AI agent sometimes needs a human to do real life work. Black mirror stuff..
11. [AI is already used in war.](https://thebulletin.org/2026/03/unready-for-war-ai-may-already-be-causing-deadly-mistakes/) There are links of AI to recent attack on school of children in Iran by US, but so far nothing has been confirmed yet, so I will refrain from wearing tinfoil hat this time, but boy is it horrifying.


If all of that makes you feel uneasy, you are not alone. That unfortunately however, is what makes a lot of difference.
The breaking point of AI, so called "Technological Singularity", does not need to occur at its full potential, for it to have a huge impact on society. 
As stated by [Cam Pedersen in his "Singularity" piece](https://campedersen.com/singularity):
> *The curve [of AI Potential] does not need to reach the pole, it just needs to look like it will. (...) And the uncomfortable answer is: <b>it's already happening</b>*.

## Final Thoughts

So where does this leave us at? I am not happy. When it comes down to IT sector, the thing that always
ground my gears was corporate stuff. Boring meetings, people with no expertise telling me what is worth doing
and what is not (why is it always tests and refactors..) or incoherent vision for a project. It feels to me, that
the current AI landscape magnifies these issues to absolute extremes. It feels like my projects are:
- Sloppier with no real understanding in choice of tooling.
- Over promised by managers with a hook of AI solving every single of our problems.
- Same managers are also cutting on every expense possible. Somehow I am meant to pay for all these tokens myself for work, but if I don't use AI, I am also told I am not working the best way I can. Another markdown file will fix it for sure.
- Somehow not deterministic because in the contract it was stated that the AI agent must be involved, so we had to include it somewhere.
- Insecure, riddled with holes.

This is not why I've fallen in love with this field. 

I went in because I liked computers. 
I like code. I liked engineering parts of the problems and I liked when solutions worked.
I liked caring about developer ergonomic. I liked when being thorough paid off with stability. 
But it seems with AI it matters less and less.
When asked if one should go into IT, I used to say 'absolutely yes if you are feeling it'.
No longer can I say that with clear conscience, because I don't know if I will be able to even work 
in the field myself in a few years and that makes me sad..
