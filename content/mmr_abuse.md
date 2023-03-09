+++
title = "MMR Abuse in World of Warcraft Arena"
date = 2021-06-25

[taxonomies]
tags = ["World of Warcraft", "Exploit"]
+++

## Introduction

Arenas are one of the two rated PvP game modes in World of Warcraft. In this article I will present how players abuse MMR system that was designed to match players based on skill to gain rewards that they shouldn't have gained in the first place. I will also propose solutions which can be implemented to more or less address the presented issues. I am not advocating MMR abuses nor will I name anyone personally. This article is meant to be strictly informative and it's only purpose is to highlight already glaring issues. 

<!-- more -->

### Matchmaking
There are two numbers that are associated with each player that plays arenas:
* Their **current rating** known as CR. This number is sort of irrelevant for matchmaking alone, however it is used to determine rewards given to a player (titles, items or whatever).
*  Their **matchmaking rating** known as MMR. This determines who are you facing. Everyone starts with base non negative MMR number, usually 1500. This number also remains hidden from the player and is only shown after the game.

You can only queue arenas as 2 or as 3, meaning that your team MMR is going to be average MMR of your team. Can't exactly say it's average but that is usually the case with similar matching systems. The numbers I'm gonna mention are speculation, though again, this is how systems like that usually work. 

#### Matching example
Imagine your team enters Arena queue with 3000 team MMR. Initially queueing system is going to look for teams that are within 25 MMR points of your point - 2975 and 3025 respectively. If no teams within those MMR ranges are also in queue, then the range will expand after some time, maybe to 50 so now we are searching for 2950 and 3050. Looping search and range expansion like that will continue indefinitely until team ranges collide and we've got our match. Very simple.

There is some protection involved about matching the same team twice in a row, though that is thrown out of the window upon certain unknown criteria's are met - usually when there is lack of active teams in queue on a given range, so on the "top" of the MMR ladder.

#### MMR / CR gains
To gain MMR and CR you need to win game, to lose them you need to lose the game. However, there are differences on how much each of them changes. MMR is more prone to bigger swings, while CR always tries to match the MMR. What that means is that if you have a very low CR but a very high MMR, you are more than likely to lose very little or no CR on loses, and at the same time gain more CR for wins than if they were nearby. This is a double edge sword because lower MMR than your CR means you are losing more CR for your loses than you gain for your wins. 

Essentially, if you have higher MMR than your CR  you are going to climb the ladder, and vice versa. There is an exception to this in form of placement games, which have much higher MMR swings than usual and only last for first 10 games, or a few games if you play with someone who already has been placed, they do however start with relatively low point of maybe ~1500.

### Rewards
To understand why people abuse, you need to know how rewards are given to players. Everything has to do with their CR number. There are three types of rewards that are awarded upon:
* reaching a certain CR threshold: 1400, 1600, 1800, 2100 and 2400.
* winning 50 games above 2400 CR. This rewards `Gladiator` title.
* ending the season in the top 0.1% of the 3v3 arena ladder (and your faction, also requires 150 games won on your current faction!). This rewards `{Season} Gladiator` title and is also the most prestigious reward one can gain in Arena. 


## MMR Abuse methods

There are several ways MMR system can be abused to "cheat it" and gain reward. Some of them I would call exploits, because that is not what the intended reward was supposed to represent, while some others are clever though unfortunate consequences of lack of any constraints as to choice of teammates. The problem is that every single one of the methods presented can be sold as a service by players who can get to the top of the ladder within their own ability, thus creating even greater incentive to cheat the system.

### "Coaching" and Gladiator boosts
Coaching in WoW is when you (as an awesome player that you are) and your buddy take someone who is way under experienced comparing to you and whom you help gain more CR. Coached person usually has way lower MMR than yours, but as two players with much greater MMR you are able to raise calculated average team MMR way beyond thus making sure that the coachee gains CR (given some wins obviously). Since your MMR is going to be way lower than what you are used to play on as well, you should *in theory* have no problem defeating the opponents, even with handicap in form of a coachee.

To earn Gladiator one must win 50 games while being above 2400 CR - but **not** MMR. Suppose you and your buddy managed to help your coachee gain 2400 CR (the MMR at this point is irrelevant). What you can do at this spot to make it easier for your coachee to play, is to change him for some other 3rd person and then keep on losing the games on purpose. The reason you do that is to lower your MMR way below 2400. Once its low enough you can go back to your coachee and queue up together again - *voilà* you are now gaining wins for your coachee `Gladiator` title while facing opponents way way outside what anyone with 2400 CR would have ever faced, even 1600 or 1700.

### Farming 150 wins
Suppose the PvP season is drawing its conclusion and you have made it to top 0.1% of the player base but you have not yet met requirement of 150 wins. You can obviously try and play fairly with your teammates but you are risking losing and dropping your CR - maybe even lower than top 0.1% threshold making you miss out on the reward. Instead of that, you can ask your friends to drop the MMR very low, so much so that every game is going to be a piece of cake, or better yet - ask a friend who has a character that has not played any arenas yet to play placement games with. Obviously because of previously mentioned MMR gains this would mean that your MMR is going to be way lower than your CR thus every lose is going to hit hard and every win is going to give you nothing - but that does not matter, as long as you will not lose a game (and you are not going to because you face under geared players that are at the bottom of the ladder, while you are fighting for an actual top of it). 

### Win trading
Win trading is essentially match fixing to gain CR or MMR depending on what are you trying to achieve. This method is constraint by the fact that both teams that intend to fix the match need to have somewhat the same MMR ranges. Luckily, because of the very nature of ladder itself, the higher MMR you have, the easier it is to win trade with it as there are fewer and fewer teams within that same range. Add on top of that avoiding queueing hours (for Europe higher queues start on the evening, maybe 19 and last till 2 or 3 am) and you've got yourself guarantee of meeting team you wanted. Now what? There are at least 3 ways you can abuse it.

#### Giving away your MMR 
Suppose that you are very talented player and you can achieve pretty much the very top of the ladder given competent team mates whenever you want. Suppose there is another team (lets call them team #2) that is not so talented and they are leaning on the edge of `{Season} Gladiator` cutoff title. You yourself are way way above it, so much so that there aren't even enough teams to knock you out of it even if you decided not to play at all. Team #2 very convincingly asks you to help them out and thus the scheming begins. You queue into each other, with the intention that you are going to lose it on purpose. You will lose part of your CR and your MMR this way but it does not matter, you are still too high for cutoff to ever reach you. Team #2 on the other hand managed to squeeze in just above the cutoff giving them much needed breathing room.

#### MMR funnel
Suppose instead of entire team like in method 1, you have 1 very talented and up and coming PvP player - lets call him player #1. Through the miracle of social engineering he manages to convince you and 5 of your equally skilled players to help him out with a slight push. You all team up, you put your player #1 in whatever team you want. You lose a couple of games for him on purpose and he gains CR and MMR. It is very similar to method 1, however there is a very significant speed up that you can now do. Shuffle teams, players that kept on losing now go into the player #1 team and players that kept on winning now go to the team that is supposed to lose. You queue again and again you let the player #1 win. This makes it insanely efficient to push player #1 even by 100s points daily. Though in the end all the players except player #1 will be down on MMR and CR, but as talented as they are, it is not exactly their concern.

#### Mutual win trading
So far I've presented ways of where there is clear beneficiary and clear loser of the situation, in terms of MMR and CR only. However there is a 3rd, less obvious, way to abuse MMR to your advantage while win trading that benefits both parties, though it does require certain criteria's to be met. This one is used primarily by actual teams that are slightly above `{Seasonal} Gladiator` cutoff range. For this method to work both teams have to have somewhat higher MMR than their CR and they need to be roughly equal, otherwise while still beneficial, it might be very inefficient method. 

For cutoff range every point matters, meaning that even if you are exactly on the cutoff, you will still make it - every CR point matters, and **not** MMR point. If teams with higher MMR than CR queue into each other and make sure to keep on trading wins, meaning that both teams win and lose equal amounts of games then their MMR and CR numbers will try to even out, so in the end they will **both** raise their CR while sacrificing their MMR. It is a direct consequence of design choice on how MMR affects CR gains. Depending on how much higher their MMR is than their CR, they might get a lot of points this way, but usually it was leveraged to push those additional 20 or 30 points needed to be safe.


## Hiding MMR abuse
There are several websites that track ladder activity in both Europe and America, including official World of Warcraft armory website. There are two that I will highlight today: 
* [Xunamate](https://xunamate.com/#/activity/3v3) which tracks games played within last time frame (usually last 3-4 hours). Works wonderfully as it allows you to determine (based on score) who is playing with who and what CR change they have during that timeframe period. List of games refreshes every time that time frame changes and there is no access to history, meaning you can only see it daily though I am sure creator of the website could have stored all that information if they really wanted to. If you want to see the MMR abuse methods in action yourself, just take a look on xunamate outside the regular queueing hours towards the end of season. Guarantee you will be able to spot them yourself as most people don't even bother hiding it.
* [Check-PvP](https://check-pvp.fr/) allows you to search characters and see other characters associated with the same battle net account. Even if someone is using their alt to MMR abuse, you can use check-pvp to determine who their real identity is.

Unfortunately there are several steps one can take in order to hide, fully or partially, their activity on the ladder.
1. The day you win traded, and your games will be visible for everyone to see on xunamate, you can just delete your character thus avoiding anyone seeing it because it is not being returned from blizzards API. Just wait couple of days, write a ticket to restore it and everything is the way it was before deletion - CR/MMR included.
2. You can also disable one of the Privacy settings in your battle net account settings called "Share my game data with community developers". This will prevent sites like check-pvp from ever showing your characters.
3. Change your character name or change it to a different account. Initially it is going to be obvious as to what character you renamed to, but doing it at the right moment and combining that with previously mentioned step, will probably make it a lot murkier to determine who was who.
4. Xunamate does not register characters that have CR below 2.4. Meaning if they have high MMR (but low CR) you can still use them to abuse the system the same way while also hiding yourself from xunamate ladder activity.

As mentioned, these methods are not completely fool proof but if you combine them and use them at the right moment, they sure make it a lot harder to untangle who exactly did what.

## Solutions
Unfortunately I couldn't come up with a solution to everything. Some of the mechanisms that are used to win trade are core part of the gameplay (such as ability to play with whoever you want to) and taking them away would take toll on already suffering player base. However there are things that could have happened that would somewhat diminish availability of abuses.

1. Getting rid of MMR and basing match making entirely on CR would prevent mutual win trading from ever being a possibility as that would cause either teams to lose more CR than they gained from back to back win trades. 
2. Either reverting `Gladiator` change to how it was before where you needed to be in top 0.5 % of the ladder at the end of season in other to receive it or..
3. ... forcing `Gladiator` requirement to be tied to MMR, thus you need to win 50 games above 2.4 MMR rather than CR. This would prevent `Gladiator` boosting's - or well at least make them much harder and sort of more reasonable.
4. Create separate league for highest players of the ladder that can be played only during fixed hours. Suppose you take everyone who achieved certain CR threshold to another different queueing league which is the only place you can gain `{Seasonal} Gladiator` title (and some other rewards). However, you can only enter the queue on a fixed hours that are always known in advance (maybe 18 - 24, different times for weekends would be needed though). In order to progress in that league, everyone would have to queue during those hours. This would not only create more dynamic ladder experience where there are loads of teams queueing, but would also make it more prestigious. Added benefit is that it would make win trading by sniping in all form much much harder and ultimately not worth as the risk of running into actual enemy team would be much higher. Technically with high enough population and correct MMR distribution among teams, there should be no moment where you would be able to directly fix who you face, at least not more than once. 
5. Implement live, Blizzard supported tracking of every game played on the ladder for every day that has no xunamate constraints such as changed names, 2.4 CR requirement, deleted characters or lack of historic data. Make it so it includes only previous days, so as to not use that tool for sniping. You can then use that tool to allow players to report suspicious activity and manually review case by case. Unfortunately Blizzard has to care enough about the issue to dedicate man power to it, as I can't see simple way of automating detection process.


## Conclusion
In this article I present several methods to game arena MMR system to your advantage. I also presented several small fixes that should make these methods much harder to abuse or much easier to counteract/detect. Ultimately it is always up to Blizzard to take action, and without them not much can be achieved. This article is not meant to call out any particular player, nor glorify use of such methods. The purpose of it is to spark a discussion that hopefully leads to some changes. You can argue that it is irresponsible for me to disclose exact nature of each abuse, however everyone who can abuse these methods pretty much already does. Even if more people started to abuse it, then Blizzard themselves would have even greater incentive to step down and take action against it.