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

### 🌐 ES Modules Browser Build

**Goal:** Ship first-class `<script type="module">` bundles for modern browsers.  
**By:** [@compulim](https://github.com/compulim) in [PR #5592](https://github.com/microsoft/BotFramework-WebChat/pull/5592), [#5593](https://github.com/microsoft/BotFramework-WebChat/pull/5593), [#5595](https://github.com/microsoft/BotFramework-WebChat/pull/5595), [#5600](https://github.com/microsoft/BotFramework-WebChat/pull/5600), [#5602](https://github.com/microsoft/BotFramework-WebChat/pull/5602)

- Delivered browser-ready ES module builds with vendor chunking for optimal caching.
- Introduced new export entries and reworked external API.
- Added documentation for all available Web Chat inclusion options.

### 🧠 Part Grouping for Chain-of-Thought

**Goal:** Organize multi-part reasoning flows into collapsible groups within the transcript.  
**By:** [@OEvgeny](https://github.com/OEvgeny) in [PR #5553](https://github.com/microsoft/BotFramework-WebChat/pull/5553), [#5585](https://github.com/microsoft/BotFramework-WebChat/pull/5585), [#5590](https://github.com/microsoft/BotFramework-WebChat/pull/5590), [#5608](https://github.com/microsoft/BotFramework-WebChat/pull/5608)

- Added logical grouping and context so activities can self-organize via `Message` entity metadata.
- Introduced a way to render grouped activities and group-aware focus management to keep grouped conversations accessible.
- Reworked fluent-theme approach to decorating activities.
- Extended activity ordering to honor entity `position` fields when rendering grouped messages.

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

### 🎨 Icon Customization via CSS Variables

**Goal:** Enable developers to customize Web Chat and Fluent theme icons without JavaScript overrides.  
**By:** [@OEvgeny](https://github.com/OEvgeny) in [PR #5413](https://github.com/microsoft/BotFramework-WebChat/pull/5413), [#5502](https://github.com/microsoft/BotFramework-WebChat/pull/5502)

- Introduced CSS variable-based icon customization system for Web Chat and Fluent theme.
- Reworked existing icons and fully enabled across Web Chat components.

### 📎 Attachment Preview for `sendAttachmentOn: "send"`

**Goal:** Improve multi-file upload UX by introducing persistent attachment previews.  
**By:** [@compulim](https://github.com/compulim), [@OEvgeny](https://github.com/OEvgeny) in [PR #5464](https://github.com/microsoft/BotFramework-WebChat/pull/5464), [#5491](https://github.com/microsoft/BotFramework-WebChat/pull/5491), [#5492](https://github.com/microsoft/BotFramework-WebChat/pull/5492)

- Added `SendBoxAttachmentBar` to allow users to preview and remove attachments before sending.
- Previews switch between thumbnails and list mode based on count and accessibility settings.
- Enhances multi-folder upload workflows and aligns with modern messaging UX.

### 🧾 Code Block Rendering & Highlighting System

**Goal:** Unify and polish code block rendering across Markdown and UI components.  
**By:** [@OEvgeny](https://github.com/OEvgeny), [@compulim](https://github.com/compulim) in [PR #5334](https://github.com/microsoft/BotFramework-WebChat/pull/5334), [#5335](https://github.com/microsoft/BotFramework-WebChat/pull/5335), [#5336](https://github.com/microsoft/BotFramework-WebChat/pull/5336), [#5389](https://github.com/microsoft/BotFramework-WebChat/pull/5389)

- Introduced syntax highlighting for markdown blocks using Shiki.
- Added copy buttons to all rendered code blocks and dialogs.
- Unified presentation of fenced blocks with accessibility and clipboard improvements.

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

### 🗂️ Starter Prompts

**Goal:** Enhance onboarding by offering users suggested starter prompts before interaction.  
**By:** [@compulim](https://github.com/compulim), [@OEvgeny](https://github.com/OEvgeny)

- Experimental pre-chat messages added in [PR #5255](https://github.com/microsoft/BotFramework-WebChat/pull/5255) and [#5263](https://github.com/microsoft/BotFramework-WebChat/pull/5263)
- Fluent blueprint implementation in [#5270](https://github.com/microsoft/BotFramework-WebChat/pull/5270), [#5276](https://github.com/microsoft/BotFramework-WebChat/pull/5276), [#5279](https://github.com/microsoft/BotFramework-WebChat/pull/5279), [#5284](https://github.com/microsoft/BotFramework-WebChat/pull/5284)

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
- Supports `\\[ \\]`, `\\( \\)`, and `$$ $$` syntax.

---

## 🚀 Performance & Developer Experience

### 🧩 Introduction of PolyMiddleware

**Goal:** Enable composable, reusable, and unified way for managing middleware.  
**By:** [@compulim](https://github.com/compulim) in [PR #5515](https://github.com/microsoft/BotFramework-WebChat/pull/5515), [#5566](https://github.com/microsoft/BotFramework-WebChat/pull/5566)

- Allows multiple middleware to be composed and applied from a single place.
- Simplifies extension, testing, and maintenance of middleware logic.
- Lays groundwork for Web Chat becoming a UI orchestration layer.

### 🧠 Memoization & Hook Optimizations

**Goal:** Reduce rerenders and memory footprint.  
**By:** [@OEvgeny](https://github.com/OEvgeny), [@compulim](https://github.com/compulim) across [#5163](https://github.com/microsoft/BotFramework-WebChat/pull/5163), [#5183](https://github.com/microsoft/BotFramework-WebChat/pull/5183), [#5190](https://github.com/microsoft/BotFramework-WebChat/pull/5190)

- Rewrote key hooks (`useActivityWithRenderer`, `useMemoized`) for efficiency.
- Prevents excessive renders in large conversations.

### 🧮 Multi-Dimensional Grouping Support

**Goal:** Improve activity grouping logic and performance.  
**By:** [@compulim](https://github.com/compulim) in [PR #5471](https://github.com/microsoft/BotFramework-WebChat/pull/5471)

- Added `styleOptions.groupActivitiesBy` and `useGroupActivitiesByName` hook.
- Keeps existing `sender` + `status` behavior as default.
- New hook preferred for performance.
- Middleware can optionally compute groupings by name.

### 🧪 `valibot` Props Validation

**Goal:** Modernize runtime prop validation for performance and clarity.  
**By:** [@compulim](https://github.com/compulim) in [PR #5476](https://github.com/microsoft/BotFramework-WebChat/pull/5476)

- Introduced `valibot` to improve schema-based prop safety.
- Reduces runtime errors and simplifies validation logic.

---
