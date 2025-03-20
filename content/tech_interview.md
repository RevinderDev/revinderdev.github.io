+++
title = "Tech interview process improvements"
date = 2025-03-20

[taxonomies]
tags = ["Interview", "Recruitment"]
+++

I've been a technical interviewer where I work for the last year for various positions in various countries. 
I've come to realise that our interview process is flawed and so in this article I will try to justify my position on it as well as propose improvements.
<!-- more -->


# Why our process sucks

Currently our process looks like this:

![Current Process](/tech_interview/bad_process.png)

## 1. HR interview

*Disclaimer: I was never present in one of those interviews, though I did hear about how they went and do actively read feedback from those, as it helps me understand the candidate before he even shows up for technical interview.*

From what I've been told, several obviously unwanted cases are thrown out during this step.
This includes but is not limited to:
- Lying on CV and not being able to at least back it up a little bit.
- Someone else showing up for interview (Asian claiming to be Mexican but being unable to speak Spanish or English - yes that happened.)
- People you wouldn't want to work with purely on personal basis due to behavioral issues.


This is actually the one thing that I do like about our process. I feel like it does solid job for what it is supposed to do - help technical interviewers not be overwhelmed by abundance of candidates by filtering out the most obvious ones.

## 2. Technical interview

Here is where it gets much worse unfortunately. Currently our main interviews consist of pure Frontend developers, pure Backend developers, Data Engineering/Machine learning and Fullstack developers.
For each of those you get a maximum of 2 hours to conduct the full technical interview. This is usually enough to sort out *really* bad candidates, but it is
certainly **not enough time to check if someone is truly an expert**.
I guess that would depend of your definition of an expert, but to me that person **must be versatile**. That means he has to know about topics like: databases, cloud environments, containers, CI/CD, architectural designs, python quirks, **hands on coding abilities**, web development, networking, concurrency, asynchronous programming, leadership and communication.
You have to check all of that in those 2 hours - don't forget to fit in 1hr for technical task of some sort. I've had plenty of candidates who were fantastic 
when talking about their experience, knowledge and understanding, only to get to practical part and ask me "How do I make hashmap in python? Sorry I forgot".

**But it gets much worse.**

Suppose someone is applying for a Fullstack position. Time for the interview remains constant, which means that you now have even more topics to cover during two hours (and preferably two tasks since you need to check both JS and BE language of choice).
Same thing is applied for DE/ML interview, though there few topics drop of / change - as system design is still very much a thing but you no longer care about web development for example. Still, the time remains the same - 2hrs.

There is also a single point of [technical] failure. The technical part is preferably conducted by one person only. Sometimes its not possible since
not everyone knows enough to be able to interview for Fullstack role (especially with variety of JS frameworks). That is an issue because: 
- Interviewer could have a bias.
- Interviewer could have misjudged the candidate.
- Candidate could have had one of 'those' days. He was great during HR part, but failed miserably in technical interview. *Note: Should this kind of candidate be rejected immedietaly? I am not sure personally*.
- Candidate could have been eaten by a stress - e.g. he failed JS part, but would have been exceptionally good at Python part but due to nerves, he is unable to perform right afterwards.
- Different interviewers focus on different things (and excel at different things), thus are able to delve further only into what they know.


There is simply no system design - we are completely leaving that part out of the picture. We do no checking if you can actually design a system, 
or think about it's implementation before you start coding it away. I don't think I need to go into details why that is a horrible idea.

As you can see, this part of the interview has several failing points that ultimately doom the whole process.

## 3. Manager/TL feedback review

This is the part where managers read the feedback provided by technical interview and HR interview. They also take into the account financial expectations 
on the candidate and decide whether or not to give them an offer. 


I am okay with that part as well, though I would rather see them conduct quick call with the candidate, something like 15 minutes just to see if they like the candidate on a personal level. 
This call should be done by a manager who would end up being the manager of a candidate (should he accepted given offer).



TODO: Propose new way now. Introduce modules per
