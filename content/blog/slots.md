+++
title = "Python slots - brief comparison"
date = 2026-05-26
description = "Comparing various methods of adding slots abilities to python objects."

[taxonomies]
tags = ["Python", "Programming"]
+++

Slots is a way in Python to customize attribute access. Some people love them, some people don't. In my work experience - I didn't really see them too often. If a code was critical enough that this kind of memory savings mattered then it was written in something else and then leveraged by Python, be it as an extension or an entirely separate component.

Recently a friend of mine who has never heard of them, after my brief explanation, asked: "Okay, but how much do they actually save?" and... I couldn't really answer. In this article, I will try to do exactly that!

<!-- more -->
--- 

{% alert(type="ai_notice", model="DeepSeek V4 Pro", agent="Opencode v1.2.27") %}
This article was **not** written by AI.

AI was however used to spot typos, check grammar errors and generate some code for graphs (not the data!).
{% end %}

## What slots are?

As mentioned, slots are one of the ways a programmer can customize accessing attributes of a class. In Python, if you *assign* a field to an instance of your class, you do not get an error - it's part of its dynamic nature (and probably a bit uncomfortable coming in from strictly typed languages). The error can happen only if you ask for a field that does not exist.

```python
class M:
     pass

obj = M()
obj.test = 1
print(obj.test)
>>>1
print(obj.doesnt_exist)
Traceback (most recent call last):
  File "<python-input-4>", line 1, in <module>
    print(obj.doesnt_exist)
          ^^^^^^^^^^^^^^^^
AttributeError: 'M' object has no attribute 'doesnt_exist'
```

This works because of how Python stores variables on your object. They live in a dictionary field `__dict__`. That field is populated whenever you assign a field to Python object.

```python
>>> obj.__dict__.keys()
dict_keys(['test'])
>>> obj.__dict__.values()
dict_values([1])
```

This is both extremely powerful and frightening. For example foreign functions can change the state of your object however they like and you probably won't notice, but at the same time, they might care a little less about what kind of an object you are sending as long as they can assign some fields. Flexible!

So how can you define slots and what do they actually do? When Python sees `__slots__` definition a few things happen:
1. Python reserves a space in memory for all attributes defined
2. Python prevents creation of `__dict__` and `__weakref__`

```python
class S:
     __slots__ = ("x", "y")
     def __init__(self):
         self.x = 1
         self.y = 2

s = S()
s.x
>>>1
s.y
>>>2
```

This has two main advantages:
1. It's *memory* efficient - there is no need to store additional dictionary with your class
2. It's faster - direct memory access is faster than dictionary lookups.

But...

```python
>>> s.z = 1
Traceback (most recent call last):
  File "<python-input-12>", line 1, in <module>
    s.z = 1
    ^^^
AttributeError: 'S' object has no attribute 'z' and no __dict__ for setting new attributes
```

{% character(name="Monk", position="right") %}
Hey! That worked before!
{% end %}

That's true! Because we are not allowing `__dict__`, we are unable to have dynamic attributes on our Python objects. It's a curse and a blessing.


{% alert(type="info", title="Note!") %}
It's best you stick with using *immutable* types (such as tuples) for `__slots__` declaration as [noted by the documentation](https://wiki.python.org/moin/UsingSlots).
{% end %}


## Benchmarking

Now that we know what slots are and what do they do, we can ask a followup question that is the root of this article: *How much do they actually save*?

We are using python 3.14 on  Ubuntu 24.04.4 LTS (Noble Numbat) x86_64. I will be creating an object within a loop and comparing the memory differences by using two snapshots from [tracealloc](https://docs.python.org/3/library/tracemalloc.html). It's a fantastic debug tool to trace memory blocks. For our purposes, it's much better than a normal `sys.getsizeof` function.

Essentially, the benchmark will look like this:

```python
def check_memory(hero_class, count):
    tracemalloc.start()
    snapshot1 = tracemalloc.take_snapshot()
    heroes = [hero_class(name="Geralt", level=99, spells=[]) for _ in range(count)]
    snapshot2 = tracemalloc.take_snapshot()
    stats = snapshot2.compare_to(snapshot1, "lineno")
    tracemalloc.stop()
    total_mem = sum(stat.size_diff for stat in stats)
    return total_mem / 1024 / 1024  # bytes -> KiB -> MiB
````

The output will always be in MiB(s). Let's compare firstly 4 different classes:
- A standard plain python class
- Same plain python class, but now with `__slots__` defined
- Python data class of same structure
- Same python class with slots defined `slots=True` (which for data classes is equivalent to defining `__slots__`)


```python
class StandardHero:
    def __init__(self, name, level, abilities):
        self.name = name
        self.level = level
        self.abilities = abilities

class SlottedHero:
    __slots__ = ("name", "level", "abilities")
    def __init__(self, name, level, abilities):
        self.name = name
        self.level = level
        self.abilities = abilities

@dataclass
class DataclassHero:
    name: str
    level: int
    spells: list[int]

@dataclass(slots=True)
class DataclassSlotsHero:
    name: str
    level: int
    spells: list[int]
````

And here are the results:


{{ chart(
    id="mem_plot1", 
    source="/slots/plain_and_dataclass.json", 
    title="plain_and_dataclass.json", 
    withDots=true, 
    x_title="Object Count", 
    y_title="Memory (MiB)",
    y_unit="MiBs"
) }}


{% character(name="Monk", position="right") %}
But `@dataclass` only generates code, it does not modify memory footprint or layout. Why even bother comparing plain python objects to them? They are essentially the same..
{% end %}

Correct! We know that. But it's also nice to run experiment to *confirm* what you already know intuitively. It's a valuable insight - and here, it does show exactly that! The memory efficiency is exactly the same, for both non-slotted, we have a:
1. Same `__dict__` 3 slots in the values array.
2. Fixed size of instance itself in form of `PyObject` header + pointer to `__dict__`

And what have we learned?
- For 10k objects, we are saving 0.40 MiB
- For 100k objects, we are saving 3.82 MiB
- For 1kk objects, we are saving 38.14 MiB

*And I didn't show it on chart, but for 10kk, we would be saving around 380 MiB*. 

**Which means we are saving roughly 40 bytes per instance** and scaling here is "linear".

Now let's go one step further and add a popular libraries to our benchmark: [attrs](https://www.attrs.org/en/stable/) and [pydantic](https://pydantic.dev/docs/validation/latest/get-started/). Since both plain and dataclasses memory footprints are equal, we are going to compare them only to one of them.


We can define `attrs` classes like so:

```python
@define(slots=False)
class AttrsHero:
    name: str
    level: int
    spells: list[int]

@define(slots=True)
class AttrsSlotHero:
    name: str
    level: int
    spells: list[int]
```

And our `pydantic` classes like so:

```python
class PydanticHero(BaseModel):
    name: str
    level: int
    spells: list[int]

@pydantic_dataclasses.dataclass(slots=True)
class PydanticDataclassSlotsHero:
    name: str
    level: int
    spells: list[int]
````


{% character(name="Monk", position="right") %}
Hey! Those are Pydantic dataclasses and not their `BaseModel`!
{% end %}

Yeah, yeah... So unfortunately, Pydantic relies on `__dict__` for storing descriptors for validation. Adding `__slots__` conflicts with that design, therefore they are not supported at all! If you *really* need to use `__slots__` then the convention is to use their dataclasses or forbid extra fields like so:

```python
class PydanticSlotsHero(BaseModel):
    name: str
    level: int
    spells: list[int]
    ConfigDict(extra="forbid", frozen=True)
```

It is by no means equivalent to what `__slots__` do, but for a simple benchmark like this one - it's good enough.
Let's see the results:

{{ chart(
    id="mem_plot2", 
    source="/slots/all_comparison.json", 
    title="all.json", 
    withDots=true, 
    x_title="Object Count", 
    y_title="Memory (MiB)",
    y_unit="MiBs"
) }}

So what did we learn from this graph?
1. Pydantic... is heavy... 😱 400 MiB more on that small of an object comparing to dataclasses or `attrs`..
2. `extra=Forbid, frozen=True` has no effect on size whatsoever. And why would it? It is only about enforcing immutability of an object, and not about having dedicated mechanism like `__slots__`. 
3. Dataclasses and `attrs` are equal in size but only their non slotted versions. For 1kk objects, `attrs` slotted version is 16 MiB larger than a slotted dataclass from std and from Pydantic.
4. Pydantic dataclass is truly equal in size to that of an actual dataclass.
5. Size of Pydantic objects matters even for low count of objects.

## Conclusion

Slots are relatively simple mechanism to both use and understand. The actual benefit is there and it's easily seen (a so called, low hanging fruit) but it's important to understand the caveats that come with it. Are they worth it - probably not. I haven't had an issue with memory, unless there was a memory leak or another bug. In cases that I did have it, I opted for more powerful mechanisms. Extensions, caching, architectural choices. I think if at one point you are dynamically creating a million objects and storing them in memory for a long time, then there is probably something fundamentally wrong with the idea and one should probably just ask himself *"Why?"*.
