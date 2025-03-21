+++
title = "Tech interview process improvements"
date = 2025-03-20

[taxonomies]
tags = ["Interview", "Recruitment"]
+++

I've been a technical interviewer where I work for the last year for various positions in various countries. 
I've come to realise that our interview process is flawed and so in this article I will try to justify my position on it as well as propose improvements.
Before you read further, if there is one thing that you should get out of this article, it's this: __Candidate is be entitled to receive proper feedback from the interview__. You probably received one of those before (I did too): "we've found someone else", "we are looking for someone more qualified" or simply ghosting you AFTER you've done take-home task, on-site interview and 2 HR calls. Laughably pathetic and speaks volumes on the place you were trying to get into. Either way, moving on..

<!-- more -->

--- 
# Why our process sucks

Currently our process looks like this:

![Current Process](/tech_interview/bad_process.png)

--- 
## 1. HR interview

*Disclaimer: I was never present in one of those interviews, though I did hear about how they went and do actively read feedback from those, as it helps me understand the candidate before he even shows up for technical interview.*

From what I've been told, several obviously unwanted cases are thrown out during this step.
This includes but is not limited to:
- Lying on CV and not being able to at least back it up a little bit.
- Someone else showing up for interview (Asian claiming to be Mexican but being unable to speak Spanish or English - yes that happened.)
- People you wouldn't want to work with purely on personal basis due to behavioural issues.


This is actually the one thing that I do like about our process. I feel like it does solid job for what it is supposed to do - help technical interviewers not be overwhelmed by abundance of candidates by filtering out the most obvious ones.

--- 
## 2. Technical interview

Here is where it gets much worse unfortunately. Currently our main interviews consist of pure Frontend developers, pure Backend developers, Data Engineering/Machine learning and Fullstack developers.
For each of those you get a maximum of 2 hours to conduct the full technical interview. This is usually enough to sort out *really* bad candidates, but it is
certainly **not enough time to check if someone is truly an expert**.
I guess that would depend on your definition of an expert, but to me that person **must be versatile**. That means he has to know about topics like: databases, cloud environments, containers, CI/CD, architectural designs, python quirks, **hands on coding abilities**, web development, networking, concurrency, asynchronous programming, leadership and communication.
You have to check all of that in those 2 hours - don't forget to fit in 1hr for technical task of some sort, during which you want your candidate to focus, thus not disturb him by talking too much. 
I've had plenty of candidates who were fantastic when talking about their experience, knowledge and understanding, only to get to practical part and ask me "How do I make hashmap in python? Sorry I forgot".

--- 
### **But it gets much worse.**

Suppose someone is applying for a Fullstack position. Time for the interview remains constant, which means that you now have even more topics to cover during two hours (and preferably two tasks since you need to check both JS and BE language of choice).
Same thing is applied for DE/ML interview, though there are a few topics to drop of or change - system design is still very much a thing but you no longer care about web development for example. Still, the time remains the same - 2 hours.

There is also a single point of [technical] failure. The technical part is preferably conducted by one person only. Sometimes its not possible since
not everyone knows enough to be able to interview for Fullstack role (especially with variety of JS frameworks). That is an issue because: 
- Interviewer could have a bias.
- Interviewer could have misjudged the candidate.
- Candidate could have had one of 'those' days. He was great during HR part, but failed miserably in technical interview. *Note: Should this kind of candidate be rejected immediately? I am not sure personally*.
- Candidate could have been eaten by a stress - e.g. he failed JS part, but would have been exceptionally good at Python part but due to stress, he is unable to perform right afterwards.
- Different interviewers focus on different things (and excel at different things), thus are able to delve further only into what they know.


There is simply no system design part of the process - we are completely leaving it out of the picture. We do no checking if you can actually design a system, 
or think about its implementation before you start coding it away. I don't think I need to go into details on why that is a horrible idea.

And last but not least - time (again). All interview time is conducted as strictly overtime. That includes but is not limited to: organizational meetings, 
interview task creation/maintenance, actual interview, note writing and more. We are mandated not to ever take the time of the client time to conduct interviews. That does make sense, but that also means that there are no technical interviewers who conduct interviews as part of their schedule, but rather they are chosen one 'whenever they can fit overtime'. 
On top of that, there is a constant pressure to do everything ASAP - e.g. feedback writing (both for candidate and TL) takes time, we usually tell candidates
that we are gonna do it up to a week, but... everytime there is a candidate, there is a request to write this note faster if its possible.
I get where it comes from - it is an urgency to fill client needs and lack of manpower to do so, but you can't have it both ways, where you kneecap the process
but still expect unicorn candidates to come out of it in timely fashion. Some part of it is bound to suffer because of those choices.

--- 
### Tasks for candidate

As mentioned, up until a certain point, we've really had no time dedicated to fixing our tasks.

> ***Horror story:** We really had only one exercise to show all candidates for a long time.*
> *We were meant not to allocate more time to address it as the process was somewhat functional.*
> *It changed only when that exercise inevitably leaked and candidates started showing up*
> *knowing what to do exactly upfront (or sometimes not understanding their own solution even..).*

That did change and thankfully our team now allocates a portion of time on a monthly basis to address it. However the tasks are either too easy
or checking the wrong thing. For example, there is a task (requested by ML team) that requires a candidate to solve something related to [binary trees](https://en.wikipedia.org/wiki/Binary_tree) and all the candidate has to do is *barely* modify [DFS](https://en.wikipedia.org/wiki/Depth-first_search#:~:text=Depth%2Dfirst%20search%20(DFS),along%20each%20branch%20before%20backtracking.) algorithm and that's all. 
I am a bit biased against those kind of tests, because in the end - what is actually being checked here? The implementation is a detail, so that does not check
language skills. I can see the argument of it checking problem solving skills, but all that actually is, is first he has to realise that the problem is indeed
a DFS problem. If he does not, then his problem skills are not gonna help him much. He is gonna keep digging a deeper hole for himself throughout the process.
In my opinion this specific task is a horrible way to validate pretty much anything of value from a candidate. There are much better problem solving challenges
that are worth giving a candidate, but somehow, we landed on that one.

As you can see, this part of the interview has several failing points that ultimately doom the whole process.

The other tasks on the other hand, are too easy (and yet majority of candidates fail to finish them in time..). The previously mentioned most used task
is essentially just: grouping data from dictionary and slightly parsing it, sending the get request, adding typing and some more small parsing. That is it.
Sure, there are some nooks and crannies to get out of the task itself - which is why it was being used for a long long time, but the difficulty in general
is laughably small. It is certainly not something that I would give to a person coming up with years of experience and [applying for a Tech Lead position](https://www.youtube.com/watch?v=eSqexFg74F8).

I have since added a few more challenging tasks, but my team has pushed back on those saying that nobody wants to choose them for a candidate as they are deemed to difficult. 
Worth noting is that I have personally chosen them several times and _all_ feedback I've got from candidates was positive _(I know, the dynamic of the situation probably does not warrant them saying the exercise blows and that the whole idea is dumb, but it really felt genuine okay, leave me alone!)._


--- 
## 3. Manager/TL feedback review

This is the part where managers read the feedback provided by technical interview and HR interview. They also take into the account financial expectations 
on the candidate and decide whether or not to give them an offer. 


I am okay with that part as well, though I would rather see them conduct quick call with the candidate, something like 15 minutes just to see if they like the candidate on a personal level. 
This call should be done by a manager who would end up being the manager of a candidate (should he accept given offer).

--- 
# What can we do about it

Most importantly dedicate more time for the process. Leave personal bias out of the equation. Add more scope to the interviews that vary depending on the 
skill of candidate and position he is applying for.

Looking at a big picture, it can look like this:

![New Process](/tech_interview/new_process.png)

The main idea here revolves around adding _modules_. That is, interviews that focus on one thing and mostly on one thing. A given choice of modules scheduled
for a candidate is dynamic - it changes depending on the need of candidate. 


--- 
## Modules

These modules don't need to be overly strict in what they check - for example, given Junior Backend Position, it's reasonable to conduct combination of Database module and System design module together (totalling shorter time), as simply the expectation is much lower from them. 
Questions should be considerably easier to go through, thus not requiring that much time to do so. 
The key part here is that _different modules within one process should be conducted by different interviewers_, thus removing their bias and having more thorough opinion formulated towards the end.
In either case let's go through what each module could be before moving onto concrete examples of combinations.

1. **Frontend and Backend modules** - They will be similar enough that I am going to group them here. We start off by chatting through candidates experience in the given language ecosystem and then move onto practical part that should last at minimum 1hr.
2. **System design module** - This is something that is not present in the process so this entire component is something new. Ideally part of this module should be focused on practical part, with little chatting to back it up. Depending on the position the candidate is choosing this could be focused more on a DevOps side (different cloud services, how they interact with each other and how they scale) or on a backend side (how would different APIs talk to each other, what would be responses be, communication between microservices, architectural patterns and so on). In both cases CI/CD, containers, orchestration, local environments is something that too can be covered here.
3. **Database module** - Again, something new. Everything related to database regardless of database of choice. You would usually choose the one that the candidate claims to be proficient in as a task and then validate if that is actually the case. Split with chatting on different RDBMS, tradeoffs but also include practical part. Writing some kind of query to active database instance. Start small (simple select), progress through (joins), to window functions, views, query optimisation and so on.
4. **DE/ML module** - this is something that was already part of the process, so this part would remain the same as it was proven succesful already. The only difference is that for a DE position, you wouldn't just need to pass DE module - more on that later.
5. **DevOps module** - this overlaps heavily with system design and it is on purpose. For a Tech Lead position, this would be mostly chat about different cloud vendors. Solutions to common problems of theirs, available services and tools, what to use when. Perhaps someone has a certificate from one of the popular choices, so this module would be the place to validate that, but crucially, as opposed to system design - this would not have practical part. 

Semantics, flow of the interview, questions to ask, expected answers for a given candidate level and tasks to give would be a seperate thing for each module and each team/member of said module would be responsible for implementing those. It goes without saying that to be a member of said module, you should have been able
to ace that module flawlessly.


--- 

### Example

Let's look at concrete example of what modules would be required for Senior Backend Developer position:

![Backend process](/tech_interview/backend_process.png)

At minimum senior developer should be able to come up with a system design, operate database and implement features on a backend (in a language of his choice).
Thus all 3 modules are present. It is entirely possible that candidate could be less experienced (or no experience) with a database, but perform absolutely 
flawelessly in system design. That is great. We all excel and different things and thats the root of the idea. To find out what the candidate excels at.

Ordering matters - obviously. Since it is a senior **backend** position, we start of with backend and only move to consecutive modules IF the candidate 
successfully passed "the core" of his process. Vast majority of the candidates flop interviews and so, most would fail here.
Given that this module is shorter than its original version (1hr30 instead of 2hrs), this makes it _cheaper_ and _safer_, to reject and pass candidates here.
There is also added benefit of removing personal bias as different people would be responsible of conducting different modules and if someone was called rude by
3 different people, they are probably just actually rude. 🤷 

--- 
## Take home task

Good in practice and generally I've been a fan of those, but the issue is that apparently most of the candidates don't like to do them and skip the entire application whenever they hear about it during introductory call. 
I like them, especially when candidate does not have a git account with up to date projects, so to me, that is a shame, but perhaps there is a place for them in this design. 
Maybe it is something that the candidate could bring to system design module and we can spend entire time chatting about his solution? 
I don't know yet. All I know is that I wouldn't say no to try and fit them somewhere, but it does not hurt that much not having them here.

--- 
## Other Issues

Unfortunately this solution also has a few issues, I would argue that they are to be expected and should be embraced rather than fight upon.

The main one - cost. Properly doing that raises the cost of recruitment process significantly, however, the alternative - that is having a bad process and recruiting bad people (or skipping good ones) - also has a cost. A hidden cost, one that is not calculable, but one that is bound to be paid at one point or another.
Be it by unhappy client having a 'senior' developer come in and not actually being senior, project that blew up because of incapable people being in charge, not cultivating knowledge properly within a company and countless other issues that would come out with incompetent people being involved.

The other issues such as process being longer and more involved are valid. However, if candidate isn't willing to be properly checked, then he probably
does not want to join the position all that much in the first place. Moreover, if I was the candidate and the recruitment process to a company 
was suspciously too easy or incomplete, that would make me think that other developers in the company went through the same process and thus
**might not actually be senior themselves**. I wouldn't want to work at that company either.

--- 
# Conclusion

Hopefully this will be enough of arguments against the existing system to warrant a change. I would be surprised if the idea I came up with 
ended up being the one to be implemented fully, but my hope is for that plan to be at least partially carried out.

> _"The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt._
