# 🎉 BotFramework Web Chat — Achievements

A curated list of major achievements by the Web Chat team. This document celebrates impactful changes, forward-looking designs, and key architectural wins.

<!-- Template for future additions. Add new to the top of a corresponding section.

## 🏆 \[Achievement Title]

**Goal:** Briefly describe the purpose of the change.
**By:** [@username](https://github.com/username) in [PR #XXXX](https://github.com/microsoft/BotFramework-WebChat/pull/XXXX)

* Summary of what was done and why it mattered.

-->

---

## 🧱 Architecture & Core Systems

### 🛠️ Migration to `micromark`

**Goal:** Replace `markdown-it` with a modern and extensible markdown parser.
**By:** [@compulim](https://github.com/compulim) in [PR #5330](https://github.com/microsoft/BotFramework-WebChat/pull/5330)

- Switched to `micromark`, enabling MathML support and consistent parsing.
- Foundation for better Markdown extensibility and performance.

### 🧼 HTML Content Transformer Middleware

**Goal:** Move HTML sanitization into a dedicated middleware layer.
**By:** [@compulim](https://github.com/compulim) in [PR #5338](https://github.com/microsoft/BotFramework-WebChat/pull/5338)

- Clean separation of concerns for Markdown rendering and sanitation.
- Easier customization and more secure rendering.

### 🧩 Migration to npm Workspaces

**Goal:** Modernize monorepo tooling for better dependency and package management.
**By:** [@compulim](https://github.com/compulim) in [PR #5301](https://github.com/microsoft/BotFramework-WebChat/pull/5301)

- Dropped Lerna in favor of native npm workspaces.
- Improves build performance and developer experience.

---

## 🎨 UI & Theming

### ✨ Fluent Theme Overhaul

**Goal:** Expand and refine Fluent UI styling across all components.
**By:** [@OEvgeny](https://github.com/OEvgeny) in [PR #5258](https://github.com/microsoft/BotFramework-WebChat/pull/5258) and others

- Introduced "Copilot" variant and transcript-wide theming.
- Improved accessibility, visual consistency, and component modularity.

### 🧱 Decorator System for Activity Styling

**Goal:** Enable pluggable, dynamic visual enhancements per activity.
**By:** [@OEvgeny](https://github.com/OEvgeny) in [PR #5205](https://github.com/microsoft/BotFramework-WebChat/pull/5205), [#5312](https://github.com/microsoft/BotFramework-WebChat/pull/5312)

- Introduced `WebChatDecorator` and `ActivityDecorator`.
- Supports animated borders and style options with minimal code changes.

---

## 🗣️ Voice & Accessibility

### 🎙️ Speech Recognition Enhancements

**Goal:** Improve real-world usability of voice input.
**By:** [@compulim](https://github.com/compulim), [@RushikeshGavali](https://github.com/RushikeshGavali) in [PR #5400](https://github.com/microsoft/BotFramework-WebChat/pull/5400), [#5426](https://github.com/microsoft/BotFramework-WebChat/pull/5426)

- Support for initial silence timeout and continuous barge-in mode.
- Makes Azure Speech more responsive and accessible.

### 🔊 Centralized Live Region Announcements

**Goal:** Improve screen reader support via centralized ARIA updates.
**By:** [@OEvgeny](https://github.com/OEvgeny) in [PR #5251](https://github.com/microsoft/BotFramework-WebChat/pull/5251)

- Added `usePushToLiveRegion` hook.
- Enables consistent and predictable accessibility behavior.

---

## 🧪 Advanced & Experimental

### 🧩 Shadow DOM Support

**Goal:** Enable safe embedding of Web Chat in custom element trees.
**By:** [@OEvgeny](https://github.com/OEvgeny) in [PR #5196](https://github.com/microsoft/BotFramework-WebChat/pull/5196)

- Added `stylesRoot`, `ThemeProvider.styles`, and nonce support.
- Ensures style encapsulation and isolation in Web Component environments.

### 🧮 TeX/MathML Markdown Support

**Goal:** Support use cases requiring math rendering.
**By:** [@compulim](https://github.com/compulim), [@OEvgeny](https://github.com/OEvgeny) in [PR #5332](https://github.com/microsoft/BotFramework-WebChat/pull/5332), [#5381](https://github.com/microsoft/BotFramework-WebChat/pull/5381)

- Integrated `katex` via `micromark-extension-math`.
- Supports `\[ \]`, `\( \)`, and `$$ $$` syntax.

---

## 🚀 Performance & Developer Experience

### 🧠 Memoization & Hook Optimizations

**Goal:** Reduce rerenders and memory footprint.
**By:** [@OEvgeny](https://github.com/OEvgeny), [@compulim](https://github.com/compulim) across [#5163](https://github.com/microsoft/BotFramework-WebChat/pull/5163), [#5183](https://github.com/microsoft/BotFramework-WebChat/pull/5183), [#5190](https://github.com/microsoft/BotFramework-WebChat/pull/5190)

- Rewrote key hooks (`useActivityWithRenderer`, `useMemoized`) for efficiency.
- Prevents excessive renders in large conversations.

### 🧪 `valibot` Props Validation

**Goal:** Modernize runtime prop validation for performance and clarity.
**By:** [@compulim](https://github.com/compulim) in [PR #5476](https://github.com/microsoft/BotFramework-WebChat/pull/5476)

- Introduced `valibot` to improve schema-based prop safety.
- Reduces runtime errors and simplifies validation logic.

---
