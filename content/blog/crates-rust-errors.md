+++
title = "Crates.io error handling in Rust"
date = 2026-07-29
description = "How does rust-lang/crates.io project do error handling?"

[taxonomies]
tags = ["Rust", "Programming"]
+++

Recently I wanted to write some more Rust and I was looking for an excuse to do so. 
It came with an idea of expanding this very blog with the ability to add comments from registered users. 
I am not really sure yet if that project will be published, but trying to figure out how to write it properly has led me down some interesting rabbit holes. 
For example - how do you do proper error handling in a Rust web service? 
I had no idea.
Back in 2023 I read [zero2prod](https://www.zero2prod.com/index.html?country=Poland&discount_code=EEU60&country_code=PL) by Luca Palmieri (fantastic book btw) but it's been a while since I've done any Rust backend and maybe standards have changed by now. 
I searched for some established projects that use Axum (framework of my choice) and I landed on exploring the internals of the [rust-lang/crates.io](https://github.com/rust-lang/crates.io) repository. In this article, I will try to better understand what they are actually doing.
<!-- more -->
--- 

{% alert(type="ai_notice", model="Claude Opus 5", agent="pi v0.82.1") %}
This article was **not** written by AI.

AI was, however, used for spotting typos and to help answer some of my
questions about Rust itself.
{% end %}

It's worth mentioning at the start - I am no Rust expert! 
I do this because I want to learn!

With that out of the way, let's get down to..

## Main Error Trait

Crates[^1] define their main error trait and corresponding type aliases like so:

[^1]: [src/util/errors.rs]( https://github.com/rust-lang/crates.io/blob/96652a2cf8dfebd129c83820094eb1af365750a4/src/util/errors.rs#L90 )

```rust
pub trait AppError: Send + fmt::Display + fmt::Debug + 'static {
    fn response(&self) -> axum::response::Response;

    fn get_type_id(&self) -> TypeId {
        TypeId::of::<Self>()
    }
}

pub type BoxedAppError = Box<dyn AppError>;
pub type AppResult<T> = Result<T, BoxedAppError>;
```

This trait acts as a contract between internal backend errors and HTTP responses. 
Any struct (or enum) that wants to implement this trait needs to be:
- `Send` - which means it has to be safely transferable between threads. Important for async code, which Axum/Tokio code is. There is no `Sync` though, which means `BoxedAppError` cannot be shared behind `&` across threads.
- `fmt::Display` and `fmt::Debug` - has to be able to be formatted into `{}` - `{:?}`, this is for logging.
- `'static` - no short-lived references. All data must be owned or `'static`. 
- <b>Must implement</b> `fn response(&self) -> Response` function. By defining this trait, Axum's middleware can take any `BoxedAppError` and turn it into HTTP Response by calling `.response()`.

{% character(name="Monk", position="right") %}
`get_type_id` looks weird.. what is it?
{% end %}

`get_type_id` is implemented and it's a virtual dispatch that allows exposing the actual concrete type of a class, because the type is stripped away and hidden in a `Box<dyn AppError>` trait object at runtime. 
This allows us to get that information back. 
`dyn AppError` isn't `dyn Any`. 
They couldn't upcast without an `as_any` method, so they replicate the minimum `Any` surface directly on the trait. 
The default body is correct per `impl` because `Self` monomorphizes to the concrete type - but any impl that overrides `get_type_id` gets to decide its own identity, which is why `BoxedAppError` forwarding `impl` matters. 
`impl AppError for BoxedAppError` is therefore exactly what keeps `err.is::<T>()` honest through a `Box`.


{% character(name="Monk", position="right") %}
Okay.. sure. I get that. Then what's a `Box<dyn Trait>` construct?
{% end %}

Glad you keep asking questions! As you've noticed, `AppError` is a trait, not an object. 
Multiple types can implement `AppError`!
`dyn AppError` tells the compiler "I don't care what it is, as long as it implements `AppError`".
In Rust, this is called **type erasure**. 
Because the type is not known at compile time, its size is *dynamic* and also not known at compile time!
This means that you cannot simply store it on a stack or return it by value, it needs to be allocated on the heap via `Box<dyn Trait>`, which is a **fat pointer** because it has a data pointer and a vtable pointer.  
Thanks to it, we also get a *dynamic dispatch* at runtime that resolves the correct method to call via a vtable.


{% character(name="Monk", position="right") %}
So I am guessing `AppResult<T>` is for convenience too?
{% end %}

Indeed! It's being used as the main return type in router functions that are mapped to endpoints:

```rust
/// Handles the `GET /api/private/admin_list/{username}` endpoint.
pub async fn list(
    state: AppState,
    Path(username): Path<String>,
    req: Parts,
) -> AppResult<(TypedHeader<CacheControl>, Json<AdminListResponse>)> 
```

## Some Rust magic

Next, we get a couple of interesting implementations, so let's go over them one by one:

```rust
impl dyn AppError {
    pub fn is<T: Any>(&self) -> bool {
        self.get_type_id() == TypeId::of::<T>()
    }
}
```

This allows a neat trick for easier *runtime type checking* for trait objects.
Specifically, this allows us to check if this erased `AppError` is `T` underneath or not, without needing to
downcast or consume the error.
We can therefore write:

```rust
if err.is::<DatabaseError>() {...}
```

Again - convenience.


Another one we have is:

```rust
impl AppError for BoxedAppError {
    fn response(&self) -> axum::response::Response {
        (**self).response()
    }

    fn get_type_id(&self) -> TypeId {
        (**self).get_type_id()
    }
}
```

And that's a forwarding of implementation - implementing `AppError` for the container type itself (which is `BoxedAppError`). This allows `Box<dyn AppError>` to be treated as if it were an `AppError`.

{% character(name="Monk", position="right") %}
Oh no... raw pointers again, just like in C++...
{% end %}

{% character(name="CoolPizza", position="left") %}
Relax, it's just dereferencing. It's not the same. Let me explain..
{% end %}

When I saw the `(**self)`, I was thinking to myself *What even is that?*. 
But don't worry, I promise it does make sense. Let's build it from the ground up:
1. What is `self`? In this case it's `&BoxedAppError`, which we know expands to `&Box<dyn AppError>`.
2. What is `*self`? It's a first *dereference* which is... `Box<dyn AppError>`. Outer shared reference is stripped.
3. What is `**self`? It's a *dereference* of `Box<dyn AppError>` which is... `dyn AppError`. 

And now, when we do have `dyn AppError` we are free to call `.response()`!
It is worth noting that at this point nothing is *moved*, because `dyn AppError` is unsized - the method call auto-refs back to `&dyn AppError`!
Sure, there is a concept of *auto-dereferencing* but because we implement `AppError` for `BoxedAppError`, we would cause the method to call itself recursively - that's not what we wanted!
We are forcing Rust to skip the `BoxedAppError` implementation and go directly to the inner `dyn AppError`!

{% character(name="Monk", position="right") %}
Why even bother implementing a trait for its own box?
Let me guess... **convenience** again?
{% end %}


{% character(name="CoolPizza", position="left") %}
Yep! Nice interoperability with generics and axum itself!
You are getting the hang of it!
{% end %}

And last but not least we get:

```rust
impl IntoResponse for BoxedAppError {
    fn into_response(self) -> axum::response::Response {
        self.response()
    }
}
```

It's a final adapter that links Axum and internal backend code. 
In Axum, every route must return a type that `impl`s `IntoResponse`, which is a Rust way of saying,
"hey, this needs to be translatable into a `Response`".
This makes it so that we can leverage our error in routing methods (as specified earlier).

{% character(name="Monk", position="right") %}
Aren't we lacking something? How do we create our errors even? 
{% end %}

Ah, excellent question! There are two more main components that are missing..

## Error implementations

We need a way to tell Rust how our `BoxedAppError` can be created from arbitrary errors, but how do we do that
without sacrificing developer ergonomics by forcing too much boilerplate on them in every endpoint?

First, we are defining a few helpers:

```rust
fn json_error(detail: &str, status: StatusCode) -> Response {
    let json = json!({ "errors": [{ "detail": detail }] });
    (status, json).into_response()
}

```

To allow us to create a quick `json`-like `Response` object.

Then we define our `CustomApiError` structure, which will hold all the data for error response:

```rust
#[derive(Debug, Clone)]
pub struct CustomApiError {
    status: StatusCode,
    detail: Cow<'static, str>,
}

impl AppError for CustomApiError {
    fn response(&self) -> Response {
        json_error(&self.detail, self.status)
    }
}
```

And implement the previously mentioned `AppError` trait with the helper `json_error` function.

And another helper..

```rust
pub fn custom(status: StatusCode, detail: impl Into<Cow<'static, str>>) -> BoxedAppError {
    Box::new(CustomApiError {
        status,
        detail: detail.into(),
    })
}
```

That allows us to create a quick `BoxedAppError` and now we can...

{% character(name="Monk", position="right") %}
Hey, hey!! What is that `Into`? And why do we have some animal `Cow` in there?
{% end %}


{% character(name="CoolPizza", position="left") %}
Not an animal but a `Clone-on-Write` smart pointer...
{% end %}

This pointer declaration means that the `string` is either **Borrowed** (`&'static str`) or **Owned** (`String`).
`Into` is related to type conversion from/to another type. Essentially, what this all boils down to is, again, *convenience*, which in practice allows us to write without much worry:

```rust
custom(StatusCode::UNAUTHORIZED, "You must be logged in");
custom(StatusCode::NOT_FOUND, format!("Crate {} not found", crate_name));
custom(StatusCode::BAD_REQUEST, existing_cow);
```

And with that, we can define some more helpers like:

```rust
pub fn forbidden(detail: impl Into<Cow<'static, str>>) -> BoxedAppError {
    custom(StatusCode::FORBIDDEN, detail)
}

pub fn not_found() -> BoxedAppError {
    custom(StatusCode::NOT_FOUND, "Not Found")
}
```

To be used within endpoints or custom errors.

Two more things - we provide a default fallback implementation for all errors that implement `std::error::Error`:

```rust
impl<E: std::error::Error + Send + 'static> AppError for E {
    fn response(&self) -> axum::response::Response {
        tracing::error!(error = %self, "Internal Server Error");
        sentry::capture_error(self);

        server_error_response(self.to_string())
    }
}
```

Any `std::error::Error` becomes `AppError` automatically, thanks to `E` generic. 
Its message is logged and sent to `sentry`, while the user gets a blanket `Internal Server Error` message.
No leakage of stack trace of any kind.

{% character(name="Monk", position="right") %}
But what if we wanna handle specific errors, not global ones?
After all, I wanna do something different when I get a `RowNotFound` error or something.
{% end %}

Spot on! 
With the previous definition, every error will be mapped to a 500 error right away,
but sometimes - **that's not what you might want**.
Because of the blanket implementation over `std::error::Error`, you *literally* cannot write `impl AppError for GitHubError`.
It will be rejected as a conflicting implementation!
Doing `From<Error>` is therefore the only way to handle specific errors in a way specific to them:

```rust
impl From<GitHubError> for BoxedAppError {
    fn from(error: GitHubError) -> Self {
        match error {
            GitHubError::Forbidden(_) => custom(
                StatusCode::FORBIDDEN,
                "custom message that was too long for a blog."
            ),
            GitHubError::NotFound(_) => not_found(),
            _ => internal(format!("didn't get a 200 result from github: {error}")),
        }
    }
}
```

We are implementing `From<GitHubError>`, which is a domain-specific error, for our `BoxedAppError`. Essentially this is "how to convert `GitHubError` to our `BoxedAppError`". 
And look at that! We can directly call our helper methods here: `custom`, `not_found` and `internal`.


## Example

So how is all this code actually used?
Well - in two ways. First, remember that we did a global conversion of errors to HTTP responses and we wrapped our error into `AppResult` type.
Which means that we can now define our endpoints with it as a return type and use `?`, which is the Try propagation expression, or just the `?` operator. 
It can be applied to a few expressions such as `Result<T, E>` or `Option<T>`.
In our case, if a line can blow up with an error that we already implemented `From` for or we don't care that it blows up at all and we can map it to error 500 then it's okay to use `?`.
Rust type system will still complain though! You still need an explicit `from<E> for BoxedAppError` or `?` will not work!
The second way is to directly map an error into our helper functions or call it directly for explicit control flow.
`rust-lang/crates.io`[^2] does exactly that, here is an example of an endpoint that does that:

[^2]: [src/controllers/user/email_verification.rs]( https://github.com/rust-lang/crates.io/blob/96652a2cf8dfebd129c83820094eb1af365750a4/src/controllers/user/email_verification.rs#L59 )

```rust
pub async fn resend_email_verification(
    state: AppState,
    Path(param_user_id): Path<i32>,
    req: Parts,
     👇👇
) -> AppResult<OkResponse> {
    let auth = AuthCheck::default().check(&req, &mut conn).await?;
                                                                👆
    if auth.user_id() != param_user_id {
        return Err(bad_request("current user does not match requested user"));
                   👆👆 
    }

    // ...
    let email: Email = diesel::update(Email::belonging_to(auth.user()))
            .set(emails::token.eq(sql("DEFAULT")))
            .returning(Email::as_returning())
            .get_result(conn)
            .await
            .optional()? 👈
            .ok_or_else(|| bad_request("Email could not be found"))?;
                           👆👆
    // ...
} 
```

As you can see, this one endpoint leverages all error handling methods we've discussed.
Pretty neat!

## Summary

So what have we learned in this article?
We've explored `rust-lang/crates.io` codebase.
We've seen how they define the main trait, its type aliases and their implementations.
Then we wrapped it all up with how it is actually being used throughout the codebase.
There is a trade-off to this pattern however, and it's that boxed trait objects allocate per error, which is a performance hit.
Not only that, but we cannot have an exhaustive match on error kinds at the call site.
We also get our status-code mapping scattered throughout the `From` implementations.
However, as a benefit, you get a pretty readable, but also not too verbose error handling that happens to make it hard to accidentally leak internals through.
Is this worth it? Perhaps. `rust-lang/crates.io` certainly thinks it is.
The goal of this article wasn't just to show how `rust-lang/crates.io` handles the errors. 
The goal was to show just how powerful the Rust type system can be and how competent programmers can leverage it.

