+++
title = "Book summary and review #0: Mara Bos - Rust Atomics and Locks"
date = 2025-06-20

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

Since I am not a book reviewer, I don't exactly know how to conduct one, so I am going to approach it how I see it make most sense - going chapter by chapter.
This article is for those who are not yet sure if this book is worth a read (spoiler - it is) and is mainly targeted for someone interested in a little bit lower level of concurrency, with a sprinkle of Rust, than what's usually used. We rarely, if ever, write these structures ourselves.

<!-- more -->
--- 
## Chapter 1 - Basics of Rust Concurrency

This chapter introduces us to the concepts of concurrency, what it actually is in theory and how it looks like in practise - that is - how it looks like in Rusts code.
The core that you get to know are: Threads and their scopes, data ownerships between them and reference counting, data races, interior mutability, `Send` and `Sync` traits that allow for sharing data between the Threads safely, Locks and finally Thread parking and Condition Variables.

**Thread** are a unit of execution within your process. In user space, threads only exist within process, they cannot exist on their own. Kernel has it's own privileges and has some running threads but that's beyond the scope for now so we will skip that idea. Multiple threads can be run within your process concurrently and they can execute sequence of instructions. They can share some resources with the process, such as memory, though they can have their own local memory too. Apart from multiprocessing, they are the key to unlocking full concurrent power of your processor, but they need to be synchronized. Otherwise you can have lots of troubles.
These book will show you ways you can achieve this synchronization, such as **Locks**, which are a way to prevent something to be modified or read by multiple threads at once.

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
Two important sources of these reordering that we care about are: processors and compilers. A processor might determine that two consecutive instructions in your program will not affect each other, therefore it is allowed to execute them out of order. Similarly, a compiler will do the same when it has a reason to believe it might execute faster. The idea is that neither of the two things will change the behaviour of your program - else you there is a bug and it's a very deep one.

Again, with a Rust spin, we learn that there are these memory orderings available to use:
- `Relaxed` - relaxed ordering.
- `Release`, `Acquire` and `AcqRel` - release and acquire (duh!)
- `SeqCast` - sequentially consistent.

In order to fully grasp them however, we are presented with a concept known as `happens-before` relationship. It describes how something is guaranteed to have happened before another thing, and order of everything else is undefined. For example, everything within the same thread happens in order; that is, if thread is executing `f()` then `g()`, then `f()` `happens-before` `g()`. It sounds obvious but it needs to be said, because that concept does not exist in between threads. The only way it can is through synchronization mechanisms or when spawning other threads.

Each ordering then can be understood in terms of that `happens-before` relationship.
`Relaxed` is therefore an order that does not provide any `happens-before`, they do guarantee a _total modification order_ of each individual atomic variable. That is, **all modifications of the same atomic variable happen in an order that is the same from the perspective of every single thread.**
`Release` and `Acquire` are used in pair to form a `happens-before` relationship between threads. `Release` applies to store operations, while `Acquire` applies to load operations. Compound operation such as `fetch-and-modify` will then therefore have `Release` be applied only to it's modify part and then `Acquire` for it's load part.

> A happens-before relationship is formed when an acquire-load operation observes the result of a release-store operation.

`SeqCast` is the strongest memory ordering. It includes all guarantees of acquire ordering (for loads) and release ordering (for stores), and also guarantees a globally consistent order of operations. That is, every single operation with `SeqCst` ordering within a program is part of a single total order all threads green on. An acquire-load can not only form a happens-before relationship with a release-store, but also with a sequentially consistent store, and similarly the other way around.

Last thing mentioned in this chapter is something called `Fences`. Fence can have its own ordering applies, but in essence it allows you to separate the memory ordering from the atomic operation. It prevents the CPU and compiler from reordering certain memory operations across the fence boundary.

I initially thought I could reason about this chapter rather nicely, until author gathered common myths, that while super interesting, did put a dent in my understanding as I directly came up with one of the myths. I will leave explanations why they are myths to the author:)

> - Myth I: I need strong memory ordering to make sure changes are "immediately" visible.
> - Myth II: Sequentially consistent memory ordering is a great default and is always correct.
> - Myth III: Disabling optimization means I don’t need to care about memory ordering.

---
## Chapter 4, 5 and 6 -  Building our own X

In these chapters, author gives us a chance to do something practical, which will hopefully deepen our understanding of previously mentioned concepts. We build our base using chapter 1, 2 and 3, to now use actually leverage it and code up something useful. It's a nice mix of practicality and theory, though I was mostly interested in concepts that go beyond Rust and these chapters felt Rust heavy.

We build our own:
- `SpinLock` - is a lock that is designed such that a thread waiting for it to be unlocked, is repeatedly trying to unlock it, instead of going to sleep, as is in the case of regular Mutex. This can make sense in a scenario where a lock is only held for a brief moment, thus waking a thread and putting it to sleep would waste more resources than 'busy' waiting like so.
- `Channels` - are used to send data between threads and they can come in many variants. One sender/one receiver or many receivers/one sender and so on. Some are blocking, some are optimised for throughput and so on. The important bit is towards the end, that is - **Every design and implementation decision involves a trade-off and can best be made with a specific use case in mind.** 
- `Arc` - is an Atomic Reference Counting that allows us in Rust to have shared ownership through reference counting. Cloning Arc will share the original allocation, without creating new one. It's only when all references are dropped, when the actual allocation will be dropped as well. 

All in all in each of the implementations, we are always given reasons as to why we do a certain thing and what's the outcome of it. More over, the author points out all the subtle mistakes that the implementation has and ways it can be improved. Each chapter starts of with simple naive implementation, and throughout it we are constantly improving it bit by bit. 
Particularly, like a true rustacean that we are, we are trying to create a safe interface such that the user _cannot_ possibly use in a wrong way. Achieving that can be tricky, as under the hood, we have to deal with unsafe code.
All the examples and short codes are distributed by the author on her own github page [3].

[3] https://github.com/m-ou-se/rust-atomics-and-locks?tab=readme-ov-file 

---
## Chapter 7 - Understanding the processor

Chapter 7 is the chapter that I was looking forward the most. In fact, this is the reason why I've picked this book up in the first place. At my university we did in fact have classes that dealt with assembler itself, but we never really dived deep into it. I was hoping to fill in the gaps that were created, by me 
rushing through topics to hopefully make everything on time.

It starts off with explaining in a very high level approach two main different processor architectures: x86-64 and ARM64. From this books perspective, the most important difference is that they handle atomics differently. We then have some brief assembler lessons and the way to see generated assembly from rust compiler.
So far so good. The entire chapter compares compile codes for x86-64 and ARM64 from the same code. Let's take a look at first and already surprising bit:


<table>
  <tr>
    <th>Rust source</th>
    <th>Compiled x86-64</th>
    <th>Compiled ARM64</th>
  </tr>
  <tr>
    <td>
<pre><code class="language-rust" style='font-size: 10px'>pub fn a(x: &mut i32) {
    *x = 0;
}
</code></pre>
    </td>
    <td>
<pre><code class="language-x86asm" style='font-size: 10px'>a:
    mov dword ptr [rdi], 0
    ret
</code></pre>
    </td>
    <td>
<pre><code class="language-armasm" style='font-size: 10px'>a:
    str wzr, [x0]
    ret
</code></pre>
    </td>
  </tr>
  <tr>
    <td>
<pre><code class="language-rust" style='font-size: 10px'>pub fn a(x: &AtomicI32) {
    x.store(0, Relaxed);
}
</code></pre>
    </td>
    <td>
<pre><code class="language-x86asm" style='font-size: 10px'>a:
    mov dword ptr [rdi], 0
    ret
</code></pre>
    </td>
    <td>
<pre><code class="language-armasm" style='font-size: 10px'>a:
    str wzr, [x0]
    ret
</code></pre>
    </td>
  </tr>
</table>

As you can see, if using atomic or not is irrelevant in this function - it compiles to the same thing! That is because both `mov` and `str` are already atomic!

Mild interest levels, I know, but let's go one step further into `read-and-modify` types of function:

<table>
  <tr>
    <th>Rust source</th>
    <th>Compiled x86-64</th>
    <th>Compiled ARM64</th>
  </tr>
  <tr>
    <td>
<pre><code class="language-rust" style='font-size: 10px'>pub fn a(x: &mut i32) {
    *x += 10;
}</code></pre>
    </td>
    <td>
<pre><code class="language-x86asm" style='font-size: 10px'>a:
    add dword ptr [rdi], 10
    ret
</code></pre>
    </td>
    <td>
<pre><code class="language-armasm" style='font-size: 10px'>a:
    ldr w8, [x0]
    add w8, w8, #10
    str w8, [x0]
    ret
</code></pre>
    </td>
  </tr>
  <tr>
    <td>
<pre><code class="language-rust" style='font-size: 10px'>pub fn a(x: &AtomicI32) {
    x.fetch_add(10, Relaxed);
}</code></pre>
    </td>
    <td>
<pre><code class="language-x86asm" style='font-size: 10px'>a:
    lock add dword ptr [rdi], 10
    ret
</code></pre>
    </td>
    <td>
<pre><code class="language-armasm" style='font-size: 10px'>a:
.L1:
    ldxr w8, [x0]    
    add w9, w8, #10  
    stxr w10, w9, [x0] 
    cbnz w10, .L1    
    ret
</code></pre>
    </td>
  </tr>
</table>

Finally! We see some difference. For x86-64 it's the `lock` prefix that was introduced by Intel to support multi core systems. It causes processors LOCK# signal to be asserted during execution of the accompanying instruction (which turns the instruction into atomic instruction). It ensures that processor has exclusive use of any shared memory while that signal is asserted. [4]

But what's going on with ARM64? Our previous 3 instructions changed into 4 and there is additional label added somehow. What for? Let's go over each step.

```asm, linenos
a:
.L1:
    ldxr w8, [x0]      ; Load the value at address x0 into w8 (LL).
    add w9, w8, #10    ; Add 10 to w8 and store the result in w9.
    stxr w10, w9, [x0] ; Attempt to store w9 back to x0 (SC). Result in w10. 0 = success, 1 = fail.
    cbnz w10, .L1      ; If w10 != 0, retry.
    ret
```

Keen reader will observe that we've swapped `ldr` (load register) and `str` (store register) for `ldrx` and `strx`. What's the difference? Those are atomic versions of the same functions. `ldrx` is load exclusive register while `strx` is store exclusive register. Both instructions guarantee that memory access is atomic. [5] [6]
`strx` can fail, and if that happens, we need to retry. Interestingly though, `ldrx` doesn't seem to be possible to fail.


[4] [Lock prefix](https://www.felixcloutier.com/x86/lock)

[5] [LDXR documentation]( https://developer.arm.com/documentation/100069/0606/Data-Transfer-Instructions/LDXR )

[6] [STXR Documentation]( https://developer.arm.com/documentation/100069/0606/Data-Transfer-Instructions/STXR )

---

Book goes on into the topic of different instructions (such as those that do not have equivalent instructions to compile down to), cache and cache lines, memory reordering done by the processors and cost of certain atomic operations on each architecture. All of these are extremely detailed and I want to encourage you that if you do not wish to read this entire book, this chapter and chapter 1 were fantastic and are worth your time regardless if you program in Rust or not.
I do not envy people that have to debug multithreaded issues that come from memory ordering bugs on different architectures!

---
## Chapter 8 - Operating System Primitives

We've been talking instructions on a CPU level. We've been talking instructions in your code. Now it's time to talk about what we haven't yet - stuff your operating system does to them! More specifically, how scheduler of a kernel, _schedules_ your instructions to run on given processor core.
Your entire communication with system kernel is through _syscall_. Depending on your system, you can/should them in a different way. On Linux, you use `libc` as it provides you with standard interface for it. MacOS also has it's own `libc` implementation, however, as opposed to Linux, it's syscalls are not stable and thus you should not be using them as they are likely to be broken.

Apart from `libc`, unix systems have another thing in common - POSIX standard. It is a set on functions that you should implement in order to be POSIX compliant
and thus having libraries that leverage POSIX work from the get go. Windows does not follow POSIX (nor libc for that matter) and instead gives us its own `kernel32.dll` that we are supposed to use instead. Again, no syscalls should be made here.

**PThreads** are extensions to POSIX standard that give us access to common data types and functions for concurrency. Stuff like mutexes, locks, threads, condition variables are all possible to use from pthreads. Lot's of examples given by author of functions and how they can be leveraged.

> There is a problem though. PThreads were designed for C, not Rust, thus, they are not exactly compatible with Rust memory model. Threads from PThreads are not moveable which in Rust is problematic. 

There was another cool thing mentioned by the author, which I had never heard of before - `futex`! [7]
On Linux all synchronization primitives are implemented using the `futex` system call. It is what's called "fast user-space mutex". Here is it's `libc` signature:

```c, linenos
long syscall(
        SYS_futex, 
        uint32_t *uaddr, 
        int futex_op, 
        uint32_t val,
        const struct timespec *timeout,   /* or: uint32_t val2 */
        uint32_t *uaddr2, 
        uint32_t val3
);
```

It provides a method to wait until certain condition is true. Kernel will put a thread specified by us to sleep, and then another thread can wake that other thread up by using the same atomic variable to notify it.

There are operating system primitives explained from Windows and MacOS too, but... [Linux FTW](https://xkcd.com/272/)!

[7] [Futex manpage](https://man7.org/linux/man-pages/man2/futex.2.html)

---
## My own ZigLock

There are still 2 more chapters - building our own lock and ideas and inspiration. I thought it would be fun instead of summarising these, is to use `zig` to recreate one of the easiest lock implementations from chapter 9. I don't know anything about `zig`. I don't know much about concurrency. I am not as qualified as the author is. It is gonna be the easiest thing to do and it's gonna be awful. You've been warned! Let's go then!

Firstly, let's create a simple race condition.

```zig, linenos
const std = @import("std");

var global_counter: i32 = 0;

fn incrementer() !void {
    var i: usize = 0;
    while (i < 100_000) : (i += 1) {
        global_counter += 1;
    }
}

pub fn main() !void {
    const thread1 = try std.Thread.spawn(.{}, incrementer, .{});
    const thread2 = try std.Thread.spawn(.{}, incrementer, .{});
    thread1.join();
    thread2.join();
    std.debug.print("\tFinal counter value: {d}\n", .{global_counter});
}
````

Running this a couple of times we can see that, we did in fact succeeded in creating a bad code.

```sh, linenos
$ zig build run
    Final counter value: 150368
$ zig build run
    Final counter value: 133840
$ zig build run
    Final counter value: 157181
```

We can obviously fix our function by using atomic like so:

```zig, linenos
fn incrementer() !void {
    var i: usize = 0;
    while (i < 100_000) : (i += 1) {
        _ = @atomicRmw(i32, &global_counter, .Add, 1, .release);
    }
}
```

But where is the fun in that! We wanted our own lock to be used for it! I am gonna go for SpinLock. Which is a lock that continuously 'spins' trying to unlock to get in. Sort of a busy waiting. Let's define `lock` and `unlock` methods on our struct:

```zig, linenos
const std = @import("std");

const SpinLock = struct {
    flag: std.atomic.Value(bool) = std.atomic.Value(bool).init(false),

    pub fn lock(self: *SpinLock) !void {
        while (self.flag.swap(true, .acquire)) {
            try std.Thread.yield(); // Give up CPU if lock busy
        }
    }

    pub fn unlock(self: *SpinLock) void {
        self.flag.store(false, .release);
    }
};
```

And that's it! We can now use it to lock around our variable and have no race conditions.

```zig, linenos
var my_lock = SpinLock{};

var shared_counter: i32 = 0;

fn thread_fn() !void {
    var i: usize = 0;
    while (i < 100_000) : (i += 1) {
        try my_lock.lock(); // What a great variable name.
        shared_counter += 1;
        my_lock.unlock();
    }
}

pub fn main() !void {
    const t1 = try std.Thread.spawn(.{}, thread_fn, .{});
    const t2 = try std.Thread.spawn(.{}, thread_fn, .{});
    t1.join();
    t2.join();
    std.debug.print("Counter: {}\n", .{shared_counter});
}
```

Results:

```sh, linenos
$ zig build run
Counter: 200000
$ zig build run
Counter: 200000
$ zig build run
Counter: 200000
```

Ahh! Lovely! There are probably issues with that - it is a naive implementation by someone who doesn't even program in `zig` at all. I will once again refer you to a book for deeper explanations as to what could go wrong with it. You can also see how close the implementation is to that of a Rust.
I didn't really have to wrestle to get it working. That's because all these primitives, memory orderings and functions are mostly present in all systems languages.

## Summary

Overall, this book has been a joy to read. It's packed with knowledge that I've never heard of. It's dense. It has practical examples. It has theory. It explains concepts that are not language specific. It's _almost_ what I hoped would be in it. 
The only mild thing that I would prefer to be less of is.. Rust itself. I know, this sounds silly being shocked of abundance of Rust in a book titled `Rust - Atomics and Locks` but both chapter 1 and chapter 8 are precisely my favourites because they go beyond just Rust. Even though the concepts were language agnostic,
it felt to me like a lot of hoops you had to jump through, were there so that you can make safe code in Rust. Translating these concepts to `zig` took me 10 minutes and I didn't have to deal with complexity, something which Rust with it's `UnsafeCell` and interfaces clearly has more of than `zig`. Is the Rust code safer then? Probably. Is it harder to follow and more verbose than `zig` in this case? Yes. Ultimately this is a price you have to pay for being sure your code is indeed secure with Rust. If it compiles, I am safe... (right?). 


> If you hadn't added any `unsafe` blocks, then you are safe from data races and segfaults, but you are still vulnerable to panics.
