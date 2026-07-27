+++
title = "Crates.io error handling in Rust"
date = 2300-01-01
description = "How does rust-lang/crates.io project do error handling?"

[taxonomies]
tags = ["Rust", "Programming", "Web"]
+++

Recently I wanted to write some more Rust and I was looking for an excuse to do so. 
It came with an idea of expanding this very blog with an ability to add comment from registered user. 
I am not really sure yet if that project will be published, but trying to figure out how to write it properly, has lead me down some interesting rabbit holes. 
For example - how do you do a proper error handling in a Rust web service? 
I had no idea.
Back in 2023 I read [zero2prod](https://www.zero2prod.com/index.html?country=Poland&discount_code=EEU60&country_code=PL) by Luca Palmieri (fantastic book btw) but it's been a while since I done any Rust backend and maybe standards have changed by now. 
I searched for some established projects that use Axum (framework of my choice) and I landed on exploring internals of [rust-lang/crates-io](https://github.com/rust-lang/crates.io) repository. In this article, I will try to better understand what actually are they doing.
<!-- more -->
--- 

{% alert(type="ai_notice", model="MiniMax M2.5, Gemini 3.1 Pro", agent="Opencode v1.2.27") %}
This article was **not** written by AI.

AI was, however, used for spotting typos and to generate markdown table (not its content!).
{% end %}

It's worth mentioning at the start - I am no Rust expert! 
I do this because I want to learn!

With that out of the way, let's get down to..

## Main Error Trait

Crates define their main error like so:

```rust
pub type BoxedAppError = Box<dyn AppError>;
pub type AppResult<T> = Result<T, BoxedAppError>;
pub trait AppError: Send + fmt::Display + fmt::Debug + 'static {
    fn response(&self) -> axum::response::Response;

    fn get_type_id(&self) -> TypeId {
        TypeId::of::<Self>()
    }
}
```

