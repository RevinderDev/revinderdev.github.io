+++
title = "Book Review #0: Mara Bos - Rust Atomics and Locks"
date = 2025-03-20

[taxonomies]
tags = ["Rust", "Book", "Programming"]
+++

My TL over at [STX](https://www.stxnext.com/) has given me a good self-improvement idea - for every book I've read, I should write something about it.
It can be some kind of side project that uses the ideas from the book or a blog post summarising it. In this series, I am going to do a little bit of both.
Going over the most interesting points to me that I've got to known thanks to said book, as well as try (more or less) use it practically.

The book we put on the spot as a first one is (one that I've read most recently since hearing mentioned advice) - **Rust Atomics and Locks** by Mara Bos.
Mara is an excellent engineer, current Rust library team dev and a fantastic writer. You can get to know her more on one of following websites:

- [Blog](https://blog.m-ou.se/) - can not recommend that one enough!
- [Bluesky](https://bsky.app/profile/mara.bsky.social)
- [Twitter](https://x.com/m_ou_se)
- [Link to a book](https://marabos.nl/atomics/)

<!-- more -->

Since I am not a book reviewer, I don't exactly know how to conduct one, so I am going to approach it how I see it make most sense - going chapter by chapter.

--- 
## Chapter 1 - Basics of Rust Concurrency

This chapter introduces us to the concepts of concurrency, what it actually is in theory and how it looks like in practise - that is - how it looks like in Rusts code.
The core that you get to know are: Threads and their scopes, data ownerships between them and reference counting, data races, interior mutability, `Send` and `Sync` traits that allow for sharing data between the Threads safely, Locks and finally Thread parking and Condition Variables.

**Leaking** is particularly interesting construct to me, as I've always associated it with a bad code, however, author suggests that you can leverage that 
to _share_ data between the threads. In other words, you deliberately leak the memory thread owns, promising it will never be cleaned up (in Rust they say "dropped") and thus make it live forever and allowing it to be borrowed by any thread as long as the program runs. You do that by using `Box::leak`
In other words, you say, **this is gonna live in the memory forever, so it's safe to read from it**. Fantastic! There is a clear downside to it, as you increase the memory of said program. You can leverage this in other programming languages to your advantage.

**Lock poisoning** this one is something that has been drilled into me by my professor (jokingly referred to as King of Concurrency by it's students), but its significance and obviousness is worth repeating as it goes beyond Rust. 

> If a thread holding a lock (or mutex) is terminated abruptly, so never actually unlocking said lock, you have a problem. 

Different languages handle it differently, for example if that happens to you in [1] C++ while using `std::mutex` you are now in **Undefined Behaviour** land and all bets are off. Not good. In Rust, thanks to its guarantees, it's better - Mutex is marked as _poisoned_ and thus will never be lockable again. Subsequent attempts of doing so will return you an `Err` from `lock` method, which gives you an opportunity to handle the situation. Much better!

**Thread parking** is a way to put a thread into a sleep, such that it waits for another thread to give it notification. This makes it so it doesn't consume CPU cycles while employing busy waiting, but it does require another thread to _unpark_ it.


Overall, this is fantastic introduction to the topics of concurrency as it covers whole ground from the get-go.

[1] https://en.cppreference.com/w/cpp/thread/mutex.html

---

## Chapter 2 -  Atomics

Chapter 2 is where the pacing of the book goes up as this were the first paragraphs that I had to read more than once to fully grasp what they actually meant (and frankly speaking, I am unsure if I do get them yet..). This chapter contains a deep dive into the atomics, where they come from, what's their purpose and what are their guarantees.

The book couldn't be more clear as to what makes an atomic. To quote: 

> Atomic comes from Greek and it means _indivisible_. Atomics and atomic operations in Computer Science are indivisible; they have either fully completed, or they haven't happened yet.

As we've learned in Chapter 1, multiple threads accessing same variables concurrently reading and writing would cause a data race which would result in undefined behaviour land. We do not want undefined behaviour land. Atomics are a way of tackling this issue as one of the synchronization mechanisms. 
The bit that I've got surprised by is that **not all platforms support all atomics**! Almost all however, provide at least all atomic types up to the size of a pointer.

Another cool bit is that we go over some of the more popular atomic operations such as `fetch_add/sub/or/and/nand` in Rust, however, they are not *limited* to Rust. Zig and C++ also have them and more or less, they work the same here. Even though this chapter is heavy on Rust code, it again, goes beyond it which is a big plus in my opinion.

Then there is stuff that I didn't know exist - `compare_exchange` (and `_weak`). This checks if atomic value is equal to the given value and then only if it is equal, it _exchanges_ it for new (completely different!) value. So we have 3 possible values and 2 memory orders! Using that and load operations, author is showcasing a known problem called ABA [2] which occurs when a location is read twice, has same value for both reads, and then that value is understood as 'nothing has changed' but in reality, in between those checks, some other thread could have changed the value once, then changed it back, reverting to original 'state', thus the 'monitoring' thread would never be able to tell that.


[2] https://en.wikipedia.org/wiki/ABA_problem

---

## Chapter 3 - Memory Ordering

In my mind, this chapter is the core of the entire book. If you don't understand this chapter, you will struggle to find deeper understanding in all subsequent chapters because they are all built upon ideas from this one.
This isn't precisely about _memory_ itself but about instructions that are stored within that memory. These instructions can be executed out of order for variety of optimisation reasons.
Two important sources of these reorderings that we care about are: processors and compilers. A processor might determine that two consecutive instructions in your program will not affect each other, therefore it is allowed to execute them out of order. Similarly, a compiler will do the same when it has a reason to believe it might execute faster. The idea is that neither of the two things will change the behaviour of your program - else you there is a bug and it's a very deep one.

Again, with a Rust spin, we learn that there are these memory orderings available to use:
- `Relaxed` - relaxed ordering.
- `Release`, `Acquire` and `AcqRel` - release and acquirue (duh!)
- `SeqCast` - sequentially consistent.

In order to fully grasp them however, we are presented with a concept known as `happens-before` relationship. It describes how something is guaranteed to have happened before another thing, and order of everything else is undefined. For example, everything within the same thread happens in order; that is, if thread is executing `f()` then `g()`, then `f()` `happens-before` `g()`. It sounds obvious but it needs to be said, because that concept does not exist in between threads. The only way it can is through synchronization mechanisms or when spawning other threads.

Each ordering then can be understood in terms of that `happens-before` relationship.
`Relaxed` is therefore an order that does not provide any `happens-before`, they do guarantee a _total modification order_ of each individual atomic variable. That is, **all modifications of the same atomic variable happen in an order that is the same from the perspective of every single thread.**
`Release` and `Acquire` are used in pair to form a `happens-before` relationship between threads. `Release` applies to store operations, while `Acquire` applies to load operations. Compound operation such as `fetch-and-modify` will then therefore have `Release` be applied only to it's modify part and then `Acquire` for it's load part.

> A happens-before relationship is formed when an acquire-load operation observes the result of a release-store operation.

`SeqCast` is the strongest memory ordering. It includes all guarentees of acquire ordering (for loads) and release ordering (for stores), and also guarentees a globally consistent order of operations. That is, every single operation with `SeqCst` ordering within a program is part of a single total order all threads agreen on. An aquire-load can not only form a happens-before relationship with a release-store, but alos with a sequentially consistent store, and similarly the other way around.

Last thing mentioned in this chapter is something called `Fences`. Fence can have its own ordering applies, but in essence it allows you to seperate the memory ordering from the atomic operation. It prevents the CPU and compiler from reordering certain memory operations across the fence boudry.

I initially thought I could reason about this chapter rather nicely, until author gathered common myths, that while super interesting, did put a dent in my understanding as I directly came up with one of the myths. I will leave explanations why they are myths to the author:)

> Myth I: I need strong memory ordering to make sure changes are "immediately" visible.
> Myth II: Sequentially consistent memory ordering is a great default and is always correct.
> Myth III: Disabling optimization means I don’t need to care about memory ordering.


