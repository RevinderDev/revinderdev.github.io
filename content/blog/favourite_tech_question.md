+++
title = "My favourite interview question"
date = 2025-02-16
description = "Details of my favourite recruitment questions I give to candidates."

[taxonomies]
tags = ["Interview", "Recruitment", "Programming"]
+++

I've been a technical interviewer where I work for the last year for various positions in various countries, and since then, I've worked out a flow for interviews that I want to conduct. The approach, of course, has to differ depending on the candidate's experience and for what position they are applying. After all, data engineering/machine learning departments have different requirements than backend teams. Nevertheless, the goal is always to get to know the applicant better and understand their thought process, so that I can accurately judge their experience.

<!-- more -->

First, I obviously start with introductions. I will briefly explain who I am, what we will be doing, and what are the next steps after the interview is over. Then I will usually ask the candidate about their work experience – companies they've worked at, projects they've completed. In this section, my goal is to have initial assessments of their abilities as a developer. I want to see what kind of problems they had to deal with and how they came up with solutions. I want to see if they were in the project long enough to understand its architecture. It's common, for example, for people to mention "we've had a microservice architecture," but often, when asked afterwards, "how did these microservices communicate?" I don't get straightforward answers, but guesses/assumptions, which, to me, is not what I want to hear from a senior person. Once I conclude that I've heard enough about their experience, I move onto _the question_, and here it is:

> _Imagine you were selected as a tech lead for a new project in [Web Framework] that will utilize [Database]._
> _Using best practices that are known to you, describe to me how you would set up a perfect CI/CD in a VCS of your choosing (please be git)._
> _In your explanation, be as detailed as possible. You can use any tools that you want. No money or time constraints on the project._

I absolutely love that.

At this point, some of the candidates will jump straight into an answer (usually a bad sign) or will ask for a few minutes to think this through, perhaps write or draw a few things on a piece of paper or on a computer before jumping to an answer.

# Why it's so good

**1. It's open**

There are as many answers to that question as there are developers working on these. And that is the point. They choose what is important to them. They choose the setup. Will they choose a hot new technology or stick to plain old, boring one? Will they choose to run integration tests or only unit tests? Lots of choices they have to make and each of them is telling you yet another thing about them.

**2. It's easy to follow it up**

Suppose they mention testing. Great! Testing is important. How will you run tests? Will you include integration tests? If integration tests require a database, then how will you set it up? Your test cases are running slowly, what can we do to improve that? When will the tests run?

As you can see, you can go on and on and on. And it is not limited by tests only; there are plenty of steps that one can include in their pipeline – linting, formatting, deploying the application, building containers. Each of these can be followed up with tons of questions like above, and it can go on as long as you need.

**3. It touches up pretty much everything**

Docker, git, testing, databases, the Python ecosystem of packages, DevOps, good practices, cloud, deployments. This question really can be pointed towards any topic, all of which can be delved deeper.

**4. It's easy to make it harder**

You can make this question harder by introducing more constraints. Come up with additional services that are required for deployment, additional caching tools, or specific cloud providers and their best CI/CD tools. Introduce time constraints, ephemeral environments, fail-safe redundancy, data migrations – you name it! Sky is the limit. Anything that lets you gauge a candidate's limit is important, as it is the most defining factor of their actual seniority, rather than years of experience.

**5. It's easy to answer _something_**

Some people are more difficult than others in terms of how much they talk. That doesn't necessarily mean anything about their experience (yet), just that they don't use too many buzzwords or are stressed – which, obviously, is understandable. Since this question is easy to start with, **every** candidate I've ever asked this was able to say _something_. Some answers were not so great, but that's when we follow it up, and sometimes, the follow-ups were fantastic, even though the initial answer was not so great.

# Why it is not so good

I have to admit. This question is not perfect. It is a good thing to talk about, but it tells you nothing about the practical skills of a candidate. You won't be able to tell if someone knows Python well. For that, you need a practical question. Perhaps it's a take-home task or live coding session. But here again, there are as many strategies to that as there are developers conducting these interviews and this is yet another one:)

> _Trzech polaków, cztery zdania_ - J. K.
