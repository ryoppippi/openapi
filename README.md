# `@samchon/openapi`
![Nestia Editor](https://github.com/samchon/openapi/assets/13158709/350128f7-c159-4ba4-8f8c-743908ada8eb)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/openapi/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@samchon/openapi.svg)](https://www.npmjs.com/package/@samchon/openapi)
[![Downloads](https://img.shields.io/npm/dm/@samchon/openapi.svg)](https://www.npmjs.com/package/@samchon/openapi)
[![Build Status](https://github.com/samchon/openapi/workflows/build/badge.svg)](https://github.com/samchon/openapi/actions?query=workflow%3Abuild)

OpenAPI definitions and converters.

`@samchon/openapi` is a collection of OpenAPI definitions of below versions. Those type definitions do not contain every properties of OpenAPI specification, but just have only significant features essentially required for `typia`, `nestia` (especially for [`@nestia/editor`](https://nestia.io/docs/editor/)).

  1. [Swagger v2.0](https://github.com/samchon/openapi/blob/master/src/SwaggerV2.ts)
  2. [OpenAPI v3.0](https://github.com/samchon/openapi/blob/master/src/OpenApiV3.ts)
  3. [OpenAPI v3.1](https://github.com/samchon/openapi/blob/master/src/OpenApiV3_1.ts)

Also, `@samchon/openapi` provides emended OpenAPI v3.1 definition and its converter/inverter from above versions for convenient development. The keyword "emended" means that [`OpenApi`](https://github.com/samchon/openapi/blob/master/src/OpenApi.ts) is not a direct OpenAPI v3.1 specification ([`OpenApiV3_1`](https://github.com/samchon/openapi/blob/master/src/OpenApiV3_1.ts)), but a little bit shrinked to remove ambiguous and duplicated expressions of OpenAPI v3.1 for the convenience of `typia` and `nestia`.

For example, when representing nullable type, OpenAPI v3.1 supports three ways. In that case, OpenApi remains only the third way, so that makes `typia` and `nestia` (especially for [`@nestia/editor`](https://nestia.io/docs/editor/)) to be simple and easy to implement.

- `{ type: ["string", "null"] }`
- `{ type: "string", nullable: true }`
- `{ oneOf: [{ type: "string" }, { type: "null" }] }`

```mermaid
flowchart
  v20(Swagger v2.0) --upgrades--> emended[["<b><u>OpenAPI v3.1 (emended)</u></b>"]]
  v30(OpenAPI v3.0) --upgrades--> emended
  v31(OpenAPI v3.1) --emends--> emended
  emended --downgrades--> v20d(Swagger v2.0)
  emended --downgrades--> v30d(Swagger v3.0)
```

Here is the entire list of differences between OpenAPI v3.1 and emended OpenApi.

- Operation
  - Merge `OpenApiV3_1.IPathItem.parameters` to `OpenApi.IOperation.parameters`
  - Resolve references of `OpenApiV3_1.IOperation` members
  - Escape references of `OpenApiV3_1.IComponents.examples`
- JSON Schema
  - Decompose mixed type: `OpenApiV3_1.IJsonSchema.IMixed`
  - Resolve nullable property: `OpenApiV3_1.IJsonSchema.__ISignificant.nullable`
  - Array type utilizes only single `OpenAPI.IJsonSchema.IArray.items`
  - Tuple type utilizes only `OpenApi.IJsonSchema.ITuple.prefixItems`
  - Merge `OpenApiV3_1.IJsonSchema.IAnyOf` to `OpenApi.IJsonSchema.IOneOf`
  - Merge `OpenApiV3_1.IJsonSchema.IRecursiveReference` to `OpenApi.IJsonSchema.IReference`
  - Merge `OpenApiV3_1.IJsonSchema.IAllOf` to `OpenApi.IJsonSchema.IObject`

Additionally, `@samchon/openapi` provides [`IMigrateDocument`](https://github.com/samchon/openapi/blob/master/src/IMigrateDocument.ts) for OpenAPI generators. 

If you're developing TypeScript, [`@nestia/editor`](https://nestia.io/docs/editor) would be the best project utilizing the [`IMigrateDocument`](https://github.com/samchon/openapi/blob/master/src/IMigrateDocument.ts) for the OpenAPI SDK generation. Otherwise, you wanna utilize OpenAPI document for OpenAI function calling, [`@wrtnio/openai-function-schema`](https://github.com/wrtnio/openai-function-schema/) has been prepared for you.

```mermaid
flowchart
  subgraph "OpenAPI Specification"
    v20(Swagger v2.0) --upgrades--> emended[["OpenAPI v3.1 (emended)"]]
    v30(OpenAPI v3.0) --upgrades--> emended
    v31(OpenAPI v3.1) --emends--> emended
  end
  subgraph "OpenAPI Generators"
    emended --normalizes--> migration[["<b><u>Migration Schema</u></b>"]]
    migration --A.I.--> lfc{{"LLM Function Call"}}
    migration --Uiltiy--> editor{{"@nestia/editor"}}
  end
```




## How to use
```bash
npm install @samchon/openapi
```

```typescript
import {
  OpenApi,
  SwaggerV2,
  OpenApiV3,
  OpenApiV3_1,
  IMigrateDocument,
} from "@samchon/openapi";

// original Swagger/OpenAPI document
const input: 
  | SwaggerV2.IDocument
  | OpenApiV3.IDocument
  | OpenApiV3_1.IDocument
  | OpenApi.IDocument = { ... };

// you can convert it to emended OpenAPI v3.1
const output: OpenApi.IDocument = OpenApi.convert(input);

// it is possible to downgrade to Swagger v2 or OpenAPI v3
const v2: SwaggerV2 = OpenApi.downgrade(output, "2.0");
const v3: OpenApiV3 = OpenApi.downgrade(output, "3.0");

// you can utilize it like below
OpenApi.downgrade(OpenApi.convert(v2), "3.0");
OpenApi.downgrade(OpenApi.convert(v3), "2.0");

// also helps openapi generator libraries
const migrate: IMigrateDocument = OpenApi.migrate(output);
```

Just install `@samchon/openapi` library and import `OpenApi` module from there.

Every features you need from `@samchon/openapi` are in the `OpenApi` module. If you want to connvert emended OpenAPI v3.1 type, just call `OpenApi.convert()` function with your document. Otherwise you want to downgrade from the OpenAPI v3.1 emended specification, call `OpenApi.migrate()` instead. Of course, if you combine both `OpenApi.convert()` and `OpenApi.migrate()` functions, you can transform every OpenAPI versions.

By the way, if you want to validate whether your OpenAPI document is following the standard specification or not, you can do it on the playground website. Click one of below links, and paste your OpenAPI URL address. Of course, if you wanna validate in your local machine, just install [`typia`](https://github.com/samchon/typia) and write same code of playground.

  - [💻 Type assertion](https://typia.io/playground/?script=JYWwDg9gTgLgBAbzgeTAUwHYEEzADQrra4BqAzAapjsOQPoCMBAygO4CGA5p2lCQExwAvnABmUCCDgAiAAIBndiADGACwgYA9BCLtc0gNwAoUJFhwYAT1zsxEqdKs3DRo8o3z4IdsAxwAvHDs8pYYynAAFACUAFxwAAr2wPJoADwAbhDAACYAfAH5CEZwcJqacADiAKIAKnAAmsgAqgBKKPFVAHJY8QCScAAiyADCTQCyXTXFcO4YnnBQaPKQc2hxLUsrKQFBHMDwomgwahHTJdKqMDBg8jFlUOysAHSc+6oArgBG7ylQszCYGBPdwgTSKFTqLQ6TB6YCabyeXiaNAADyUYAANktNOkyE8AAzaXTAJ4AK3kGmk0yixhKs3m2QgyneIEBcXYGEsO0ePngi2WHjQZIpGGixmmZTgNXqHTgWGYzCqLRqvWQnWmTmA7CewV+MAq73YUGyqTOcAAPoRqKQyIwnr0BkyWYCzZaqMRaHiHU7WRgYK64GwuDw+Px7Y7mb7-SVchFGZHATTXCVJcM1SQlXUasg4FUJp0BlUBtN6fA0L7smhsnF3TRwz7ATta7hgRp0rwYHGG36k3SPBAsU9fKIIBFy5hK9kk0JjN5fNFgexjqoIvSB0LeBIoDSgA)
  - [💻 Detailed validation](https://typia.io/playground/?script=JYWwDg9gTgLgBAbzgeTAUwHYEEzADQrra4BqAzAapjsOQPoCMBAygO4CGA5p2lCQExwAvnABmUCCDgAiAAIBndiADGACwgYA9BCLtc0gNwAoUJFhwYAT1zsxEqdKs3DRo8o3z4IdsAxwAvHDs8pYYynAAFACUAFxwAAr2wPJoADwAbhDAACYAfAH5CEZwcJqacADiAKIAKnAAmsgAqgBKKPFVAHJY8QCScAAiyADCTQCyXTXFcO4YnnBQaPKQc2hxLUsrKQFBHMDwomgwahHTJdKqMDBg8jFlUOysAHSc+6oArgBG7ylQszCYGBPdwgTSKFTqLQ6TB6YCabyeXiaNAADyUYAANktNOkyE8AAzaXTAJ4AK3kGmk0yixhKs3m2QgyneIEBcXYGEsO0ePngi2WHjQZIpGGixmmZTgNXqHTgJCwABlegMsDVeshOtN6Xylu8MfBAk5gOwnul2BicuwAakznAAD6EaikMiMJ7KpkswG2h1UYi0PHu5msjAwb1wNhcHh8fhugYe4Ohkq5CKMoOAmnTYCiSL8vVA+TvZTKJbyAL+QKic0pKKIW30iBYp6+UQQCK5-VPXgSKDyDMlEqLGDvKAYWnCVwlSXDDUkKotOo1ZBwKoTToDKoDLUeeBoYPZNDZOK+mix+OAnbH3DAjTpXgwFNnkN9mYeBtC5ut3eYffZDNCYzeL40TAlaJz1o2XbQDSQA)

```typescript
import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "@samchon/openapi";
import typia from "typia";
 
const main = async (): Promise<void> => {
  // GET YOUR OPENAPI DOCUMENT
  const response: Response = await fetch(
    "https://raw.githubusercontent.com/samchon/openapi/master/examples/v3.0/openai.json"
  );
  const document: any = await response.json();
 
  // TYPE VALIDATION
  const result = typia.validate<
    | OpenApiV3_1.IDocument
    | OpenApiV3.IDocument
    | SwaggerV2.IDocument
  >(document);
  if (result.success === false) {
    console.error(result.errors);
    return;
  }
 
  // CONVERT TO EMENDED
  const emended: OpenApi.IDocument = OpenApi.convert(document);
  console.info(emended);
};
main().catch(console.error);
```




## Related Projects
- `typia`: https://github.com/samchon/typia
- `nestia`: https://github.com/samchon/nestia
- `@wrtnio/openai-function-schema`: https://github.com/wrtnio/openai-function-schema