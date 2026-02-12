+++
title = "The \"Forgetful\" pattern: A method for Deep Copying with unique instances"
date = 2025-09-08

[taxonomies]
tags = ["Python", "Programming"]
+++

In this article I will showcase you a recent trick I've learned when glancing through boto3 source code. There was a particular class which name was even stranger than its usage: `ForgetfulDict`.
We'll break down its surprisingly simple implementation, understand the specific problem it solves within Python's copy module, and see how this pattern can be useful in other contexts.

**Prerequisites**:
- Basic **Python** understanding

<!-- more -->
--- 

# ForgetfulDict

This is the full implementation of the class. And I mean it when I say it's **full implementation** - there is nothing more.
```python, linenos
 class _ForgetfulDict(dict):
    """A dictionary that discards any items set on it. For use as `memo` in
    `copy.deepcopy()` when every instance of a repeated object in the deepcopied
    data structure should result in a separate copy.
    """
    def __setitem__(self, key, value):
        pass
```

<p align=center><a href="https://github.com/boto/boto3/blob/332640a9a2e01431d2a8e0952d61712f525f4ec6/boto3/dynamodb/transform.py#L25">boto3/dynamodb/transform.py#L25</a>


Slightly below that, you can actually see how they use it:

 ```python, linenos
 def copy_dynamodb_params(params, **kwargs):
    return copy.deepcopy(params, memo=_ForgetfulDict())

 class DynamoDBHighLevelResource:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
       # Apply handler that creates a copy of the user provided dynamodb
       # item such that it can be modified.
       self.meta.client.meta.events.register(
           'provide-client-params.dynamodb',
           copy_dynamodb_params,
           unique_id='dynamodb-create-params-copy',
       )
 ```

# Lib/copy.py

So what actually is a `copy.py` module?
`copy` is a python std library module that contains functions to perform shallow and deep copy operations. Unlike some other languages, in Python, when you do assignment statement (that is x = 1), you don't 
copy objects - you create binding between a target and an object. Sometimes however, this is not what you want (such as collections with mutable items) and you do want to create a copy.
This module provides you with tools necessary to achieve that mainly: `copy(obj)` and `deepcopy(obj[, memo])`.
The difference between the two is one performs _shallow_ copy (that is a copy that is a new compound object with inserted _references_ into it that were found on the original - hence **shallow**) and the other
performs a _deep_ copy (a new compound object with recursively inserted _copies_ of the objects found in the original - hence **deep**).

When you need a completely independent copy of a nested structure, deepcopy is what you should use. It has a built-in mechanism to handle a particular challenge: recursive objects. If an object contains a reference to itself (or there is a cycle), a naive copy implementation would enter an infinite loop, eventually causing a RecursionError.

To prevent this, deepcopy cleverly uses an optional memo dictionary. This dictionary tracks objects that have already been copied during the current pass. When it encounters an object it has seen before, it simply reuses the existing copy from the memo instead of trying to copy it again. This not only solves the recursion problem but also ensures that shared object references within the original structure remain shared in the copied structure.
Now we know what's the purpose of `memo` argument and we got a little bit closer to discovering what's the use of `ForgetfulDict`.

## Usage example

Let's try to use the copy module to do some... well copying.

First, create some dummy class and collection with nested objects.

```python, linenos
class T:
    pass

a = T()
b = T()
original_list = [a, a, b]
```

Now let's check their ids:

```sh
$ python test.py
id(original_list)=128962585137664
id(original_list[0])=128962572331216
id(original_list[1])=128962572331216
id(original_list[2])=128962572908496
```

Clearly you can see that both `a`s are the same object.

Let's create a dummy dictionary memo so we can see what happens when we invoke properly `deepcopy`:

```python, linenos
memo_normal = {}
copied_list_normal = copy.deepcopy(original_list, memo_normal)
```

And now what we've created:
```sh
$ python test.py
id(copied_list_normal)=128962585135936
id(copied_list_normal[0])=128962572909264
id(copied_list_normal[1])=128962572909264
id(copied_list_normal[2])=128962573095360
memo_normal=
{128962572331216: <__main__.T object at 0x754a7058fad0>,
 128962572908496: <__main__.T object at 0x754a705bd1c0>,
 128962572942976: [<__main__.T object at 0x754a705028d0>,
                   <__main__.T object at 0x754a7058f7d0>,
                   [<__main__.T object at 0x754a705028d0>,
                    <__main__.T object at 0x754a705028d0>,
                    <__main__.T object at 0x754a7058f7d0>]],
 128962585137664: [<__main__.T object at 0x754a7058fad0>,
                   <__main__.T object at 0x754a7058fad0>,
                   <__main__.T object at 0x754a705bd1c0>]}
```


As you can see the `memo` dictionary got some keys filled in for us from the `deepcopy` function.
* The very first thing `deepcopy` sees is the `original_list` hence why it creates new empty list 
and stores it `memo[id(original_list)] = copied_list_normal`. 
* Then it sees both `a` and `b`, places them in memo again `memo[id(a)] = copy_a` and `memo[id(b)] = copy_b` and puts them into the `copied_list_normal`.

You might notice other keys in the memo besides our objects (the `128962572942976` key); these are used internally by `deepcopy` to manage the recursion process.
For our purposes, the crucial entries are the ones mapping the original objects (a, b, and the list itself) to their new copies.

As you can see, at minimum, you will always have **keys for every unique object** that `deepcopy` encounters.

Now, the purpose of `ForgetfulDict` becomes clear. By overriding `__setitem__` with a pass statement, it creates a dictionary-like object that accepts set operations but silently discards the items. It's a black hole for data.

When passed to `copy.deepcopy` as the memo, it effectively disables the memoization mechanism. Every time `deepcopy` tries to save a copied object `(memo[id(original_obj)] = new_obj)`, `ForgetfulDict` does nothing. Consequently, `deepcopy` never finds any previously copied objects and is forced to create a fresh copy of every single item it encounters, even if it's a duplicate. Let's see it in action:

```python, linenos
memo_forgetful = _ForgetfulDict()
copied_list_forgetful = copy.deepcopy(original_list, memo_forgetful)
```

And...

```sh
$ python test.py
id(copied_list_forgetful)=128962573070912
id(copied_list_forgetful[0])=128962573100304
id(copied_list_forgetful[1])=128962573100496
id(copied_list_forgetful[2])=128962573100880
memo_forgetful={}
```


Did you spot the difference? ;) 

Not only memo is empty (because we've given it a dictionary that never actually saves keys!) but our copied list, now has **3 references to 3 objects** instead of **3 references to 2 objects**!

To hammer the point even further. Let's compare them and print them out.
```python, linenos

print(f"{copied_list_forgetful[0] is copied_list_forgetful[1]}")
print(f"{copied_list_normal[0] is copied_list_normal[1]}")

...
```

```sh
$ python test.py
False
True
```
Our `deepcopy` operation created a new copy of every item, even separating the duplicates. Neat!

## Warning ⚠️

As mentioned before, `memo` argument is used to prevent `RecursionError`. Using `ForgetfulDict` removes that roadblock, **so any recursive structure you have will cause an error**.

```python, linenos

import sys

sys.setrecursionlimit(100) # Just so you see the error faster.

recursive_list = [1, 2]
recursive_list.append(recursive_list)

copied_list = copy.deepcopy(recursive_list, memo_forgetful)
print("We do not reach that point.")
```

```sh
$ python test.py
  File "/usr/lib/python3.12/copy.py", line 136, in deepcopy
    y = copier(x, memo)
        ^^^^^^^^^^^^^^^
  File "/usr/lib/python3.12/copy.py", line 196, in _deepcopy_list
    append(deepcopy(a, memo))
           ^^^^^^^^^^^^^^^^^
  File "/usr/lib/python3.12/copy.py", line 136, in deepcopy
    y = copier(x, memo)
        ^^^^^^^^^^^^^^^
RecursionError: maximum recursion depth exceeded
```

Whereas normal `deepcopy` deals with it appropriately.

```python, linenos
copied_list = copy.deepcopy(recursive_list)
print(f"{ copied_list =}")
```

```sh
$ python test.py
 copied_list =[1, 2, [...]]
```


# Conclusion 

The `ForgetfulDict` is a brilliant, minimal solution to a very specific problem: how to force `deepcopy` to create a truly distinct copy of every single element in a data structure, breaking any shared references that might exist. It does so at the cost of safety.

While the default behavior of `deepcopy` is usually what you want—preserving the internal structure of your objects—the boto3 authors needed to ensure that user-provided parameters could be modified without any side effects, even if the user passed in a list with duplicate object references.

This elegant pattern teaches us two things:

1. Understand your tools: Knowing about the memo argument in `copy.deepcopy` opens up new possibilities for customizing its behavior.
2. Embrace simple interfaces: By creating a class that adheres to the dictionary interface (`__setitem__`), you can fundamentally change the behavior of a standard library function without rewriting it.

So, the next time you need to ensure every object in a copy is unique, remember the power of being a little forgetful.

You can see entire script on [Github](https://gist.github.com/RevinderDev/86bb05b6ef04e47887de7363faa736d4).
