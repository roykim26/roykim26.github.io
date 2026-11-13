---
title: "TypeScript Narrowing, Without the Guesswork"
description: "TypeScript narrowing is not magic. It follows a small set of rules, and most confusion comes from the places it gives up."
pubDate: 2026-08-04
tags: ["engineering"]
featured: false
draft: false
---

Most TypeScript frustration I hear is not about types being wrong. It is about types being right in a way the developer did not expect. Someone checks a value, calls a function, and gets "possibly undefined" anyway. That is not a bug in the compiler. It is narrowing working exactly as designed, in a place where the design stops.

## What narrowing actually is

Narrowing is control-flow analysis over a single reference. At every point in a scope, TypeScript computes the set of types a variable could have, given the checks and assignments that came before. `typeof x === 'string'` removes every non-string member from that set for the rest of the block.

Two consequences matter. First, narrowing is lexical and local. It applies to a specific reference in a specific scope, not to the value everywhere it travels. Second, narrowings are erased at runtime. They are guesses the compiler can prove from syntax, not validations you performed.

Once you internalize that, most surprises stop being surprising.

## The reliable tools

The everyday checks are reliable within their limits:

- `typeof` covers primitives, and it is the only way to separate `string` from `number`. Remember that `typeof null === 'object'`.
- `instanceof` works for class instances. It fails for values from another realm and for plain objects that merely resemble a class.
- The `in` operator narrows a union by property presence. It tells you the key exists, not that its value has the type you hope.
- Equality against a literal narrows unions, which is the foundation of the pattern in the next section.
- Truthiness narrows out `null`, `undefined`, `0`, `''`, and `false` together. If zero is a valid value, a truthiness check is a bug with good syntax.

| Construct | Narrows when | Stops working when |
| --- | --- | --- |
| `typeof x === 'string'` | x is a primitive union | x is `null` or a boxed `String` |
| `x instanceof Foo` | x is a class instance | The value crossed a realm or came from JSON |
| `'key' in x` | The union differs by keys | Key exists with the wrong value type |
| `x.kind === 'circle'` | The union has a literal discriminant | A variant is missing the discriminant |
| `if (x)` | x may be null or undefined | `0`, `''`, or `false` are valid values |
| `isFoo(x)` | You wrote a compiler-verified guard | The guard body lies |

The discipline is the same one that works for performance: eliminate possibilities with evidence instead of asserting the answer, which is how I approach latency in [A Field Guide to Slow APIs](/blog/slow-apis). The compiler is doing the eliminating for you; your job is to give it facts it can read.

## Discriminated unions are the workhorse

If you standardize one pattern, make it this. Give every variant of a union a literal field, then switch on it. The compiler narrows each branch precisely, and the `never` check makes future changes loud.

```ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'rectangle'; width: number; height: number };

function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    default:
      return assertNever(shape);
  }
}
```

Add a `triangle` variant and `assertNever` fails to compile, because `shape` is no longer `never` in the default branch. That is the entire benefit: the compiler enumerates the places that need updating. Exhaustiveness is not a style preference; it is a maintenance tool.

The same pattern works for API responses, reducer actions, and form states. A `status: 'idle' | 'loading' | 'success' | 'error'` field with payloads attached to the relevant variants removes an entire category of impossible states.

## Type guards and their honesty problem

A user-defined guard looks like this:

```ts
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value;
}
```

The compiler trusts the return type. It does not verify that `id` is a string, that the other required fields exist, or that the object is not an array. The body can be wrong, and every call site inherits the lie. Guards are promises, and TypeScript has no way to audit them.

This is why I keep guards small and close to the boundary where data enters the system. A guard that checks three fields is reviewable. A guard that attempts to validate a nested payload by hand is a schema validator with worse error messages. If the data is external, parse it once with a real validator and hand typed values inward.

Assertion functions (`asserts value is User`) have the same honesty problem plus a syntax constraint: the function must have an explicit type annotation, and arrow functions assigned to variables cannot be assertion functions in the way you might expect. They are useful for invariants inside a module. They are a poor substitute for validation.

> A type guard is a promise the compiler cannot verify. Write small promises.

## Where narrowing gives up

Narrowing is lost in a few predictable places. Knowing them saves hours.

**Aliases.** Narrowing applies to the reference you checked. Check `obj.value`, then call a function that might mutate `obj`, and the compiler resets what it knows about `obj.value` afterward. Copy the value into a `const` first when the narrow needs to survive a function call.

**Closures and callbacks.** A check outside a callback does not narrow the value inside it, because the callback may run later, after the variable changed. This is the classic:

```ts
let current: string | null = getValue();

if (current !== null) {
  items.forEach(() => {
    console.log(current.toUpperCase()); // current may be null again
  });
}
```

Copy the narrowed value into a `const` before the callback, or narrow inside it.

**Indexed access.** `obj[key]` where `key` is a union of strings produces a union of all possible value types, and a check on one branch does not narrow the others. Destructure first or use a mapped lookup.

**Non-null assertions and `as`.** These do not narrow. `value!` silences the error and leaves the runtime unchanged. `as User` tells the compiler to stop asking questions. Both are sometimes necessary at a boundary; neither is a substitute for a check.

## A checklist before you reach for `as`

I use this list whenever a cast feels tempting.

- [ ] Is there a discriminant field I could add to the union instead?
- [ ] Does the guard body actually validate every field it claims?
- [ ] Can this value be `const` so the narrowing survives?
- [ ] Is the check at the boundary, or ten frames deep in business logic?
- [ ] Did I handle the `never` case, or did I write a default that returns `undefined`?
- [ ] Would parsing the value once with a schema validator be more honest?
- [ ] If I remove the assertion, what does the compiler actually know?

Narrowing is one of the few parts of TypeScript that rewards reading the error instead of fighting it. The error usually names the exact reference and the exact line where the compiler lost confidence. Treat it as a question about scope, not an insult about your code.

And write the types as if the next person will read them without you, because they will; that is the same argument I make in [Designing for the Second Reader](/blog/the-second-reader). A discriminated union with a clear discriminant is documentation that the compiler checks. An `as` is a comment that the compiler cannot.

## Further reading

- [TypeScript Handbook — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [MDN — typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
