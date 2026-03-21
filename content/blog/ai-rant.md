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

Why most of AIs propose obviously deprecated way of type hinting my code? To showcase this, take a look at this (very sensible) production code and let's ask various models how they would type hint it.

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

For some reasons, as of march 2026, most of the models still suggest point 4. which is obviously deprecated. Worse than that, they offer it *regardless* of what version of python you are running or without asking you to clarify it. As a case study, I asked several different models, with a prompt "Can you type hint this function?" and here are summaries of their proposed solutions:
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


Okay I think I've proved my point. So why does it happen? It could be that my prompt is not that good, after all, I could have specified not to use `typing` module. It could be that the AI wants the code that will run on *most* available python versions, and most of the python code is probably written in python (<=3.9). It could be that the most available training data is the one that uses `typing` module, therefore AI is biased to using it.

---

This got me thinking.


{% quote() %}
If more and more code is AI generated, and AI generates mostly what it has seen in a training data, so the more volume of something there is the more likely it is to propagate it as an answer. Wouldn't that mean it will become harder and harder to introduce syntax/semantic changes to your tools? How will people in the future know, there is a newer and better way of writing something, if the AI gives them only what it has seen in the past?
{% end %}

It turns out this problem is pretty common in industry and is often referred to as [*Model Collapse*](https://www.nature.com/articles/s41586-024-07566-y). Not only that, but models have a tendency to exert [The Consensus Bias](https://en.wikipedia.org/wiki/False_consensus_effect).



