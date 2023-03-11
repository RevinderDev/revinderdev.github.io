+++
title = "Pyton's `__init_subclass_` demystified"
date = 2023-03-11

[taxonomies]
tags = ["Python", "Programming"]
+++

## Introduction

In this article I will try to demystify less commonly known function `__init_subclass__` introduced in [PEP 487](https://peps.python.org/pep-0487/), explain how it works and show you real life example of how you can leverage it in Python 3.11 for your own benefit.

<!-- more -->

## Inner workings

`__init_subclass__` is whats known as a [hook method](https://www.oreilly.com/library/view/learning-python-design/9781785888038/ch08s03.html#:~:text=A%20hook%20is%20a%20method,it%20can%20easily%20ignore%20this.) [1]. It was introduced as an easier alternative to using metaclasses should you want to customize how your classes are defined using [meta programming](https://en.wikipedia.org/wiki/Metaprogramming#:~:text=Metaprogramming%20is%20a%20programming%20technique,even%20modify%20itself%20while%20running.). 

As mentioned in the documentation [2], it is called on the parent class, whenever a class inherits from another class (it will get more clear with an example I promise). What it means, is that its called **whenever the containing class is subclassed**.
> To go slightly too much in depth, let's take a look at CPython inner workings to see when it *actually* is being called. The method is called whenever new type is defined with `type_new(...)` function. `type_new(...)` then calls `type_new_impl(...)`, which does all the heavy lifting of defining a new type such as calling `set_attrs`, puts slots, calling `set_names` and.. you guessed it - `init_subclass` too! How cool open source is?
> ```C
> // Objects/typeobject.c
> ...
> /* line 3438 */
>static PyObject *
> type_new(PyTypeObject *metatype, PyObject > *args, PyObject *kwds)
> {
>    /* Partially ommited */
>    type = type_new_impl(&ctx);     
> }
> 
> /* line 3334 */
> static PyObject*
> type_new_impl(type_new_ctx *ctx)
> {
>    /* Partially ommitted */
>    if (type_new_init_subclass(type, ctx->kwds) < 0) {
>       goto error; // https://xkcd.com/292
>    }
> }
> ```
><p align=center><a href="https://github.com/python/cpython/blob/main/Objects/typeobject.c#L3334">Source</a>

## Usage

What can you use it for? Plenty! For example a cool [registry pattern](https://charlesreid1.github.io/python-patterns-the-registry.html). Suppose that you want to build a base `Report` class that you want to expose from a module but you don't want to expose your concrete implementations and you also want this to be easily extensible.

Let's define `enum` that lists our choices:
```python
# my_module/enums.py
from enum import StrEnum

class ReportType(StrEnum):
    CSV = "csv"
    JSON = "json"
```

And the base report class:
```python
# my_module/reports.py
import abc
from typing import Type

from .enums import Report Type

class ReportHandler(abc.ABC):
    # This one can show as Undefined by Pylance 👇
    _registry: dict[ReportType, Type[ReportHandler]] = {}

    def __init_subclass__(
        cls: Type[ReportHandler], *, report_type: ReportType
    ) -> None:
        cls._registry[report_type] = cls

    @classmethod
    def get_by_report_type(cls, report_type: ReportType) -> ReportHandler:
        try:
            return cls._registry[report_type]
        except KeyError as exc:
            raise ValueError("Invalid report type provided.") from exc
    
    @abc.abstractmethod
    def generate_report(self) -> None:
        raise NotImplementedError
```

Breaking it down:
* we create [Abstract Base Class](https://docs.python.org/3/library/abc.html) called `ReportHandler`.
* we defined class field called `_registry` that is going to be of a type `dict` with key of type `ReportType` and value as `ReportHandler` class **type, not object**. 
* we added helper *public* class method that will allow us to fetch `ReportHandler` type based on given `ReportType` from the registry - this will be entry point of a client.
* and for the sake of example, some abstract function `generate_report` which will generate our report™.

Now we can implement our `__init_subclass__` method, which will only put our class type inside our registry. Notice how we didn't call `super().__init_subclass__()`. That's because base implementation does nothing, other than raising an error should it be called with any arguments, as stated in the documentation [2]. We already took care of that by doing:
```python
                                               👇👇
 def __init_subclass__(cls: Type[ReportHandler], *, report_type: ReportType):
    ...
```
that `*` asterisk symbol means that any following function arguments need to be passed as **keyword arguments** only. Which means we will never have any unwanted arguments pass in here anyway. Neat!

Now, onto concrete classes!

```python
# my_module/specialized.py
from .enums import ReportType
from .base import ReportHandler

class CSVReportHandler(ReportHandler, report_type=ReportType.CSV):
    def generate_report(self) -> None:
        # Brilliant example I know ;)
        print("Generating CSV") 

class JSONReportHandler(ReportHandler, report_type=ReportType.JSON):
    def generate_report(self) -> None:
        print("Generating JSON")
```

A careful reader will ask himself a question now, what will happen if you omit `report_type` in definition?

```python
class CSVReportHandler(ReportHandler):
    ...
```
And run it..
```bash
$ python report.py

Traceback (most recent call last):
  File "D:\examples\report.py", line 38, in <module>
    class CSVReportHandler(ReportHandler):
  File "<frozen abc>", line 106, in __new__
TypeError: ReportHandler.__init_subclass__() missing 1 required keyword-only argument: 'report_type'
```

Nice! It reported an error during importing module, not when trying to instantiate the class! 

Anyways, back to the example. Remember that we defined everything inside a python module and we now want our client to use our report to well.. report! Let's expose that for him.

```python
# my_module/__init__.py
from .enums import ReportType
from .base import ReportHandler

__all__ = ["ReportHandler", "ReportType"]
```

But how can a client create concrete instances of a class if he cannot access them from a module? That's what the helper method and registry are for! This is how he would be able to call them:

```python
from your_module import ReportType, ReportHandler

def process() -> None:
    report_type: ReportType = determine_report_from_very_hard_client_logic() 
    # You've received a type, not an instance!
    report_klass = ReportHandler.get_by_report_type(report_type)
    # so notice 👇 that we need to instantiate it
    report_klass().generate_report()
```

Notice also how easily extensible that approach is. If input is given by some [event](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-concepts.html#gettingstarted-concepts-event) then the client does even not need to modify his own code to support other `report_type`s (other than updating our glorious module of course when new one shows up).

## Conclusion

Hopefully I managed to show you something cool that you haven't seen yet before and you will be able to now succesfully leverage it wherever it makes sense. As a side note, it is worth mentioning that PEP-487 introduced also another method called `__set_name__` but that's beyond the scope of this article.

## References

[1] [PEP-487](https://peps.python.org/pep-0487/)

[2] [Python documentation](https://docs.python.org/3/reference/datamodel.html#object.__init_subclass__)

[3] [Registry Pattern explained](https://charlesreid1.github.io/python-patterns-the-registry.html) 