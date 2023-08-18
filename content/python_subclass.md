+++
title = "Python `__init_subclass_` demystified"
date = 2023-03-11

[taxonomies]
tags = ["Python", "Programming"]
+++

## Introduction

In this article I will try to demystify less commonly known function `__init_subclass__` introduced in [PEP 487](https://peps.python.org/pep-0487/), explain how it works and show you real life example of how you can leverage it in Python 3.11 for your own benefit.

<!-- more -->

## Inner workings

`__init_subclass__` is whats known as a [hook method](https://www.oreilly.com/library/view/learning-python-design/9781785888038/ch08s03.html#:~:text=A%20hook%20is%20a%20method,it%20can%20easily%20ignore%20this.) [1]. It was introduced as an easier alternative to using metaclasses should you want to customize how your classes are defined using [meta programming](https://en.wikipedia.org/wiki/Metaprogramming#:~:text=Metaprogramming%20is%20a%20programming%20technique,even%20modify%20itself%20while%20running.). That is - ability to manipulate code by itself. In python, one of the ways you can achieve such behaviour is by using [Metaclasses](https://docs.python.org/3/reference/datamodel.html#metaclasses). This can allow us to customize class creation process, however we need to: introduce new base meta class (that inherits from `type`), the class needs to implement either `__new__` or `__init__` depending on how we want it to behave, inherited classes need to explicitly set it as a metaclass and so on. That is a lot of boilerplate! This is where `__init_subclass__` comes to the rescue and simplifies it all for us.

As mentioned in the documentation [2], `__init_subclass__` is called, whenever a containing class is subclassed by class (it will get more clear with an example I promise). So to phrase it differently - whenever you define new *type* or *subclass* of a class that had this method defined. By defining that method, we can add behaviour that will be added to each new subclass in our project.


> To go slightly too much in depth, in CPython the method is called whenever new a *type* is defined with `type_new(...)` function. `type_new(...)` then calls `type_new_impl(...)`. That function creates new `PyObject` (more specifically `PyTypeObject` which is CPython equivalent of Python [`type`](https://docs.python.org/3/library/functions.html#type) object), that will be a new *type*, based on given `PyTypeObject` metatype structure. Gets confusing I know. It will also do all the heavy lifting of defining a new type such as calling `set_attrs`, putting slots, calling `set_names` and.. you guessed it - `init_subclass` too! How cool open source is?
> ```C
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
>    PyTypeObject *type = type_new_init(ctx);
>    if (type_new_set_names(type) < 0) {
>        goto error;
>    }
>    if (type_new_init_subclass(type, ctx->kwds) < 0) {
>       goto error; // https://xkcd.com/292
>    }
>    return (PyObject *)type;
> }
> ```
><p align=center><a href="https://github.com/python/cpython/blob/main/Objects/typeobject.c#L3334">Objects/typeobject.c</a>

## Usage

What can you use it for? Anything! Maybe additional logging, automatic property creation or resource locking/synchronization. The possibilites are endless, but in this article I will show you an example a friend of mine showed me that involves [registry pattern](https://charlesreid1.github.io/python-patterns-the-registry.html). Suppose that you want to build a base `FileHandler` class. By using registry pattern and `__init_subclass__`, we can make it into a manager class, that will know which method of which subclass to call or which subclass to create based on an input (sort of like a factory pattern). 


Let's define `enum` that lists our choices:
```python
# my_module/enums.py
from enum import StrEnum

class FileType(StrEnum):
    CSV = "csv"
    JSON = "json"
```

And the base file class:
```python
# my_module/files.py
import abc
from typing import Type

from .enums import FileType

class FileHandler(abc.ABC):
    # 👇 Our registry from `registry_pattern` will be a dictionary
    _registry: dict[FileType, Type["FileHandler"]] = {}

    def __init_subclass__(
        cls: Type["FileHandler"], *, file_type: FileType
    ) -> None:
        cls._registry[file_type] = cls

    @classmethod
    def get_by_file_type(cls, file_type: FileType) -> Type["FileHandler"]:
        try:
            return cls._registry[file_type]
        except KeyError as exc:
            raise ValueError("Invalid file type provided.") from exc
    
    @abc.abstractmethod
    def generate_file(self) -> None:
        raise NotImplementedError
```

Breaking it down:
* `FileHandler` is our [Abstract Base Class](https://docs.python.org/3/library/abc.html).
* `_registry` is it's class field that is going to be of a type `dict` with key of type `FileType` and value as `FileHandler` class - **type, not object**. This will be part of our `registry-pattern`. 
* `get_by_file_type` is *public* class method that will allow us to fetch `FileHandler` type, based on given a `FileType` enum choice, from the registry - this will be entry point of a client and this is rest of our registry implementation. We use input as a key in the dictionary and if it is not there - we raise a `ValueError`. You could return `None` if the key is incorrect, but it is better to be [explicit rather than implicit](https://peps.python.org/pep-0020/).
* `generate_file` is only for the sake of example. Abstract function which will generate our file™ - patent pending. Concrete implementation will be inside subclasses.

Now we can implement our `__init_subclass__` method, which will only put our class type inside our registry. Notice how we didn't call `super().__init_subclass__()`. That's because base implementation does nothing, other than raising an error should it be called with any arguments, as stated in the documentation [2]. We already took care of that by doing:
```python
                                             👇👇
 def __init_subclass__(cls: Type[FileHandler], *, file_type: FileType):
    ...
```
that `*` asterisk symbol means that any following function arguments need to be passed as **keyword arguments** only. Which means we will never have any unwanted arguments pass in here anyway. Neat!

Now, onto concrete classes!

```python
# my_module/specialized.py
from .enums import FileType
from .base import FileHandler

class CSVFileHandler(FileHandler, file_type=FileType.CSV):
    def generate_file(self) -> None:
        # Brilliant example I know ;)
        print("Generating CSV") 

class JSONFileHandler(FileHandler, file_type=FileType.JSON):
    def generate_file(self) -> None:
        print("Generating JSON")
```

A careful reader will ask himself a question now, what will happen if you omit `file_type` in definition?

```python
class CSVFileHandler(FileHandler):
    ...
```
And run it..
```bash
$ python file.py

Traceback (most recent call last):
  File "D:\examples\file.py", line 38, in <module>
    class CSVFileHandler(FileHandler):
  File "<frozen abc>", line 106, in __new__
TypeError: FileHandler.__init_subclass__() missing 1 required keyword-only argument: 'file_type'
```

Nice! It threw an error during importing module, not when trying to instantiate the class! 

Anyways, back to the example. Remember that we defined everything inside a python module and we now want our client to use our file to well.. file! Let's expose that for him.

```python
# my_module/__init__.py
from .enums import FileType
from .base import FileHandler

__all__ = ["FileHandler", "FileType"]
```

But how can a client create concrete instances of a class if he cannot access them from a module? That's what the helper method and registry are for! This is how he would be able to call them:

```python
from your_module import FileType, FileHandler

def process() -> None:
    file_type: FileType = determine_file_from_very_hard_client_logic() 
    # You've received a type, not an instance!
    file_class = FileHandler.get_by_file_type(file_type)
    # Notice! 👇
    file_class().generate_file()
```

Notice also how easily extensible that approach is. If there will be new choice added in `FileType` enum, then the client does even not need to modify his own code to support other `file_type`s (other than updating our glorious module of course!).

Alternatively, we could already return instance of a class from `get_by_file_type` rather than returning its type - this would be a proper factory then. 

Another example would be to use `registry` of [Singletons](https://en.wikipedia.org/wiki/Singleton_pattern#:~:text=In%20software%20engineering%2C%20the%20singleton,class%20to%20a%20singular%20instance.). Now we could define a proxy method, that would take `FileType` choice input and that would underneath invoke, correct corresponding method from singletons from the registry. Indeed lots of possibilities.

## Conclusion

In this post, I showed you how you can leverage `__init_subclass__` mechanism to modify how your classes are defined. Hopefully I managed to show you something cool that you haven't seen before and you will be able to now succesfully use it for your own benefit. As a side note, it is worth mentioning that PEP-487 introduced yet another method called `__set_name__` which is *yet another* hook method that you can use, though for the purpose of the article, it was not necessary.

## References

[1] [PEP-487](https://peps.python.org/pep-0487/)

[2] [Python documentation](https://docs.python.org/3/reference/datamodel.html#object.__init_subclass__)

[3] [Registry Pattern explained](https://charlesreid1.github.io/python-patterns-the-registry.html) 