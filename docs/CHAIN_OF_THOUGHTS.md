# Chain-of-Thoughts

Web Chat supports Chain-of-Thoughts (CoT) UI for reasoning.

Chain-of-Thought reasoning enables users to follow the logical progression of ideas or decisions. By presenting reasoning as a sequence of steps, it becomes easier to debug, refine, and explain the thought process behind a decision or solution. This is particularly useful in scenarios involving complex problem-solving, collaborative discussions, or educational purposes, where transparency and clarity are essential.

## Terminology

| Term  | Description                            |
| ----- | -------------------------------------- |
| Chain | The complete Chain-of-Thought sequence |
| Step  | A reasoning step in the chain.         |

## Must-knows

- A chain must have one or more steps
- Each step is implemented as a message activity (either complete or [livestreaming](./LIVESTREAMING.md) message)
- Chains are identified by an ID rather than being materialized objects
- Chain ID is treated as an opaque string and local to the conversation
- Steps are linked to chains through the chain ID

## Design decisions

### Why use Schema.org `HowTo` and `HowToStep`?

We are leveraging [`HowTo`](https://schema.org/HowTo) and [`HowToStep`](https://schema.org/HowToStep) type to represent the chain and the step respectively.

Their definitions:

- [`HowTo`](https://schema.org/HowTo): "Instructions that explain how to achieve a result by performing a sequence of steps."
- [`HowToStep`](https://schema.org/HowToStep): "A step in the instructions for how to achieve a result."

The definitions of `HowTo` and `HowToStep` capture the metaphor of Chain-of-Thought precisely. Thus, the payload is based on them.

## Sample payload

> Copied from [../__tests__/html2/part-grouping/index.html](this test case).

```json
{
  "entities": [
    {
      "@context": "https://schema.org",
      "@id": "",
      "@type": "Message",
      "type": "https://schema.org/Message",

      "abstract": "Considering equation solutions",
      "isPartOf": {
        "@id": "h-00001",
        "@type": "HowTo"
      },
      "keywords": ["AIGeneratedContent", "AnalysisMessage"],
      "position": 1
    }
  ],
  "id": "a-00001",
  "text": "The equation \\(x^2 + y^2 = 0\\) has only one solution: \\((0, 0)\\). This means the graph would only plot a single point at the origin.",
  "type": "message"
}
```

The table below explains each individual property in the sample payload.

| Type      | Property   | Required | Description                                                                                                                                           |
| --------- | ---------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Message` |            |          | This root entity represents the message itself. In the sample, it is `entities[@id=""]`.                                                              |
|           | `@context` | Yes      | Must be `"https://schema.org"`.                                                                                                                       |
|           | `@id`      | Yes      | Must be empty string `""`, it represents the message itself.                                                                                          |
|           | `@type`    | Yes      | Must be `"Message"`.                                                                                                                                  |
|           | `abstract` | No       | Short description of the message. For CoT, this is the title of the step.                                                                             |
|           | `isPartOf` | Yes      | Indicates this message is part of a group. For CoT, `isPartOf.@type` must be `"HowTo"` to indicate "this message is a step of the chain."             |
|           | `keywords` | No       | Attributes of the message. For CoT, if it contains `"Collapsible"`, the step will be shown as collapsed by-default.                                   |
|           | `position` | No       | A non-negative integer representing the position of the step in the chain. Steps are sorted in ascending order.                                       |
|           | `type`     | Yes      | Must be `"https://schema.org/Message"`, required by Bot Framework spec.                                                                               |
| `HowTo`   |            |          | This entity represent the chain. In the sample, it is `entities[@id=""].isPartOf[@type="HowTo"]`.                                                     |
|           | `@id`      | Yes      | ID of the chain. For all messages that participate in the same chain, they share the same ID. Treated as opaque string and local to the conversation. |
|           | `@type`    | Yes      | Must be `"HowTo"` to represent the chain.                                                                                                             |

## Readings

- Related pull requests
  - [Initial commit](https://github.com/microsoft/BotFramework-WebChat/pull/5553)
- [Test cases](/__tests__/html2/part-grouping)
