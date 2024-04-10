import { OpenApi } from "../OpenApi";
import { OpenApiV3_1 } from "../OpenApiV3_1";

export namespace OpenApiV3_1Converter {
  export const convert = (input: OpenApiV3_1.IDocument): OpenApi.IDocument => ({
    ...input,
    components: input.components
      ? convertComponents(input.components)
      : undefined,
    paths: input.paths
      ? Object.fromEntries(
          Object.entries(input.paths)
            .filter(([_, v]) => v !== undefined)
            .map(
              ([key, value]) => [key, convertPathItem(input)(value)] as const,
            ),
        )
      : undefined,
    webhooks: input.webhooks
      ? Object.fromEntries(
          Object.entries(input.webhooks)
            .filter(([_, v]) => v !== undefined)
            .map(
              ([key, value]) => [key, convertWebhooks(input)(value)!] as const,
            )
            .filter(([_, value]) => value !== undefined),
        )
      : undefined,
  });

  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  const convertWebhooks =
    (doc: OpenApiV3_1.IDocument) =>
    (
      webhook:
        | OpenApiV3_1.IPathItem
        | OpenApiV3_1.IJsonSchema.IReference<`#/components/pathItems/${string}`>,
    ): OpenApi.IPathItem | undefined => {
      if (!TypeChecker.isReference(webhook))
        return convertPathItem(doc)(webhook);
      const found: OpenApiV3_1.IPathItem | undefined =
        doc.components?.pathItems?.[webhook.$ref.split("/").pop() ?? ""];
      return found ? convertPathItem(doc)(found) : undefined;
    };
  const convertPathItem =
    (doc: OpenApiV3_1.IDocument) =>
    (pathItem: OpenApiV3_1.IPathItem): OpenApi.IPathItem => ({
      ...(pathItem as any),
      ...(pathItem.get
        ? { get: convertOperation(doc)(pathItem)(pathItem.get) }
        : undefined),
      ...(pathItem.put
        ? { put: convertOperation(doc)(pathItem)(pathItem.put) }
        : undefined),
      ...(pathItem.post
        ? { post: convertOperation(doc)(pathItem)(pathItem.post) }
        : undefined),
      ...(pathItem.delete
        ? { delete: convertOperation(doc)(pathItem)(pathItem.delete) }
        : undefined),
      ...(pathItem.options
        ? { options: convertOperation(doc)(pathItem)(pathItem.options) }
        : undefined),
      ...(pathItem.head
        ? { head: convertOperation(doc)(pathItem)(pathItem.head) }
        : undefined),
      ...(pathItem.patch
        ? { patch: convertOperation(doc)(pathItem)(pathItem.patch) }
        : undefined),
      ...(pathItem.trace
        ? { trace: convertOperation(doc)(pathItem)(pathItem.trace) }
        : undefined),
    });
  const convertOperation =
    (doc: OpenApiV3_1.IDocument) =>
    (pathItem: OpenApiV3_1.IPathItem) =>
    (input: OpenApiV3_1.IOperation): OpenApi.IOperation => ({
      ...input,
      parameters: [...(pathItem.parameters ?? []), ...(input.parameters ?? [])]
        .map((p) => {
          if (!TypeChecker.isReference(p)) return convertParameter(p);
          const found: OpenApiV3_1.IOperation.IParameter | undefined =
            p.$ref.startsWith("#/components/headers/")
              ? doc.components?.headers?.[p.$ref.split("/").pop() ?? ""]
              : doc.components?.parameters?.[p.$ref.split("/").pop() ?? ""];
          return found !== undefined ? convertParameter(found) : undefined!;
        })
        .filter((_, v) => v !== undefined),
      requestBody: input.requestBody
        ? convertRequestBody(doc)(input.requestBody)
        : undefined,
      responses: input.responses
        ? Object.fromEntries(
            Object.entries(input.responses)
              .filter(([_, v]) => v !== undefined)
              .map(
                ([key, value]) => [key, convertResponse(doc)(value)!] as const,
              )
              .filter(([_, value]) => value !== undefined),
          )
        : undefined,
    });
  const convertParameter = (
    input: OpenApiV3_1.IOperation.IParameter,
  ): OpenApi.IOperation.IParameter => ({
    ...input,
    schema: convertSchema(input.schema),
  });
  const convertRequestBody =
    (doc: OpenApiV3_1.IDocument) =>
    (
      input:
        | OpenApiV3_1.IOperation.IRequestBody
        | OpenApiV3_1.IJsonSchema.IReference<`#/components/requestBodies/${string}`>,
    ): OpenApi.IOperation.IRequestBody | undefined => {
      if (TypeChecker.isReference(input)) {
        const found: OpenApiV3_1.IOperation.IRequestBody | undefined =
          doc.components?.requestBodies?.[input.$ref.split("/").pop() ?? ""];
        if (found === undefined) return undefined;
        input = found;
      }
      return {
        ...input,
        content: input.content ? convertContent(input.content) : undefined,
      };
    };
  const convertResponse =
    (doc: OpenApiV3_1.IDocument) =>
    (
      input:
        | OpenApiV3_1.IOperation.IResponse
        | OpenApiV3_1.IJsonSchema.IReference<`#/components/responses/${string}`>,
    ): OpenApi.IOperation.IResponse | undefined => {
      if (TypeChecker.isReference(input)) {
        const found: OpenApiV3_1.IOperation.IResponse | undefined =
          doc.components?.responses?.[input.$ref.split("/").pop() ?? ""];
        if (found === undefined) return undefined;
        input = found;
      }
      return {
        ...input,
        content: input.content ? convertContent(input.content) : undefined,
        headers: input.headers
          ? Object.fromEntries(
              Object.entries(input.headers)
                .filter(([_, v]) => v !== undefined)
                .map(
                  ([key, value]) =>
                    [
                      key,
                      (() => {
                        if (TypeChecker.isReference(value) === false)
                          return convertParameter(value);
                        const found:
                          | OpenApiV3_1.IOperation.IParameter
                          | undefined = value.$ref.startsWith(
                          "#/components/headers/",
                        )
                          ? doc.components?.headers?.[
                              value.$ref.split("/").pop() ?? ""
                            ]
                          : undefined;
                        return found !== undefined
                          ? convertParameter(found)
                          : undefined!;
                      })(),
                    ] as const,
                )
                .filter(([_, v]) => v !== undefined),
            )
          : undefined,
      };
    };
  const convertContent = (
    record: Record<string, OpenApiV3_1.IOperation.IMediaType>,
  ): Record<string, OpenApi.IOperation.IMediaType> =>
    Object.fromEntries(
      Object.entries(record)
        .filter(([_, v]) => v !== undefined)
        .map(
          ([key, value]) =>
            [
              key,
              {
                ...value,
                schema: value.schema ? convertSchema(value.schema) : undefined,
              },
            ] as const,
        ),
    );

  /* -----------------------------------------------------------
    DEFINITIONS
  ----------------------------------------------------------- */
  const convertComponents = (
    input: OpenApiV3_1.IComponents,
  ): OpenApi.IComponents => ({
    schemas: input.schemas
      ? Object.fromEntries(
          Object.entries(input.schemas ?? {})
            .filter(([_, v]) => v !== undefined)
            .map(([key, value]) => [key, convertSchema(value)] as const),
        )
      : undefined,
    securitySchemes: input.securitySchemes,
  });
  const convertSchema = (
    input: OpenApiV3_1.IJsonSchema,
  ): OpenApi.IJsonSchema => {
    const union: OpenApi.IJsonSchema[] = [];
    const attribute: OpenApi.IJsonSchema.__IAttribute = {
      title: input.title,
      description: input.description,
      ...Object.fromEntries(
        Object.entries(input).filter(
          ([key, value]) => key.startsWith("x-") && value !== undefined,
        ),
      ),
    };
    const visit = (schema: OpenApiV3_1.IJsonSchema): void => {
      // MIXED TYPE CASE
      if (TypeChecker.isMixed(schema)) {
        if (schema.const !== undefined)
          visit({
            ...schema,
            ...{
              type: undefined,
              oneOf: undefined,
              allOf: undefined,
            },
          });
        if (schema.oneOf !== undefined)
          visit({
            ...schema,
            ...{
              type: undefined,
              const: undefined,
              allOf: undefined,
            },
          });
        if (schema.anyOf !== undefined)
          visit({
            ...schema,
            ...{
              type: undefined,
              const: undefined,
              oneOf: undefined,
            },
          });
        for (const type of schema.type)
          if (type === "boolean" || type === "number" || type === "string")
            visit({
              ...schema,
              ...{
                enum: schema.enum?.length
                  ? schema.enum.filter((x) => typeof x === type)
                  : undefined,
              },
              type: type as any,
            });
          else if (type === "integer")
            visit({
              ...schema,
              ...{
                enum: schema.enum?.length
                  ? schema.enum.filter((x) => Number.isInteger(x))
                  : undefined,
              },
              type: type as any,
            });
          else visit({ ...schema, type: type as any });
      }
      // UNION TYPE CASE
      else if (TypeChecker.isOneOf(schema)) schema.oneOf.forEach(visit);
      else if (TypeChecker.isAnyOf(schema)) schema.anyOf.forEach(visit);
      // ATOMIC TYPE CASE (CONSIDER ENUM VALUES)
      else if (TypeChecker.isBoolean(schema))
        if (schema.enum?.length)
          for (const value of schema.enum)
            union.push({
              const: value,
              ...({
                ...schema,
                type: undefined as any,
                enum: undefined,
                default: undefined,
              } satisfies OpenApiV3_1.IJsonSchema.IBoolean as any),
            } satisfies OpenApi.IJsonSchema.IConstant);
        else
          union.push({
            ...schema,
            ...{
              enum: undefined,
            },
          });
      else if (TypeChecker.isInteger(schema) || TypeChecker.isNumber(schema))
        if (schema.enum?.length)
          for (const value of schema.enum)
            union.push({
              const: value,
              ...({
                ...schema,
                type: undefined as any,
                enum: undefined,
                default: undefined,
                minimum: undefined,
                maximum: undefined,
                exclusiveMinimum: undefined,
                exclusiveMaximum: undefined,
                multipleOf: undefined,
              } satisfies OpenApiV3_1.IJsonSchema.IInteger as any),
            } satisfies OpenApi.IJsonSchema.IConstant);
        else
          union.push({
            ...schema,
            ...{
              enum: undefined,
            },
            ...(typeof schema.exclusiveMinimum === "number"
              ? {
                  minimum: schema.exclusiveMinimum,
                  exclusiveMinimum: true,
                }
              : {
                  exclusiveMinimum: schema.exclusiveMinimum,
                }),
            ...(typeof schema.exclusiveMaximum === "number"
              ? {
                  maximum: schema.exclusiveMaximum,
                  exclusiveMaximum: true,
                }
              : {
                  exclusiveMaximum: schema.exclusiveMaximum,
                }),
          });
      else if (TypeChecker.isString(schema))
        if (schema.enum?.length)
          for (const value of schema.enum)
            union.push({
              const: value,
              ...({
                ...schema,
                type: undefined as any,
                enum: undefined,
                default: undefined,
              } satisfies OpenApiV3_1.IJsonSchema.IString as any),
            } satisfies OpenApi.IJsonSchema.IConstant);
        else
          union.push({
            ...schema,
            ...{
              enum: undefined,
            },
          });
      // ARRAY TYPE CASE (CONSIDER TUPLE)
      else if (TypeChecker.isArray(schema)) {
        if (Array.isArray(schema.items))
          union.push({
            ...schema,
            ...{
              items: undefined,
              prefixItems: schema.items.map(convertSchema),
              additionalItems:
                typeof schema.additionalItems === "object" &&
                schema.additionalItems !== null
                  ? convertSchema(schema.additionalItems)
                  : schema.additionalItems,
            },
          });
        else if (Array.isArray(schema.prefixItems))
          union.push({
            ...schema,
            ...{
              items: undefined,
              prefixItems: schema.prefixItems.map(convertSchema),
              additionalItems:
                typeof schema.additionalItems === "object" &&
                schema.additionalItems !== null
                  ? convertSchema(schema.additionalItems)
                  : schema.additionalItems,
            },
          });
        else
          union.push({
            ...schema,
            ...{
              items: schema.items ? convertSchema(schema.items) : undefined,
              prefixItems: undefined,
              additionalItems: undefined,
            },
          });
      }
      // OBJECT TYPE CASE
      else if (TypeChecker.isObject(schema)) {
        union.push({
          ...schema,
          ...{
            properties: schema.properties
              ? Object.fromEntries(
                  Object.entries(schema.properties)
                    .filter(([_, v]) => v !== undefined)
                    .map(
                      ([key, value]) => [key, convertSchema(value)] as const,
                    ),
                )
              : undefined,
            additionalProperties: schema.additionalProperties
              ? typeof schema.additionalProperties === "object" &&
                schema.additionalProperties !== null
                ? convertSchema(schema.additionalProperties)
                : schema.additionalProperties
              : undefined,
          },
        });
      }
      // THE OTHERS
      else union.push(schema);
    };

    visit(input);
    return {
      ...(union.length === 0
        ? { type: undefined }
        : union.length === 1
          ? { ...union[0] }
          : { oneOf: union }),
      ...attribute,
    };
  };

  namespace TypeChecker {
    export const isConstant = (
      schema: OpenApiV3_1.IJsonSchema,
    ): schema is OpenApiV3_1.IJsonSchema.IConstant =>
      (schema as OpenApiV3_1.IJsonSchema.IConstant).const !== undefined;
    export const isBoolean = (
      schema: OpenApiV3_1.IJsonSchema,
    ): schema is OpenApiV3_1.IJsonSchema.IBoolean =>
      (schema as OpenApiV3_1.IJsonSchema.IBoolean).type === "boolean";
    export const isInteger = (
      schema: OpenApiV3_1.IJsonSchema,
    ): schema is OpenApiV3_1.IJsonSchema.IInteger =>
      (schema as OpenApiV3_1.IJsonSchema.IInteger).type === "integer";
    export const isNumber = (
      schema: OpenApiV3_1.IJsonSchema,
    ): schema is OpenApiV3_1.IJsonSchema.INumber =>
      (schema as OpenApiV3_1.IJsonSchema.INumber).type === "number";
    export const isString = (
      schema: OpenApiV3_1.IJsonSchema,
    ): schema is OpenApiV3_1.IJsonSchema.IString =>
      (schema as OpenApiV3_1.IJsonSchema.IString).type === "string";
    export const isArray = (
      schema: OpenApiV3_1.IJsonSchema,
    ): schema is OpenApiV3_1.IJsonSchema.IArray =>
      (schema as OpenApiV3_1.IJsonSchema.IArray).type === "array";
    export const isObject = (
      schema: OpenApiV3_1.IJsonSchema,
    ): schema is OpenApiV3_1.IJsonSchema.IObject =>
      (schema as OpenApiV3_1.IJsonSchema.IObject).type === "object";
    export const isReference = (
      schema: OpenApiV3_1.IJsonSchema,
    ): schema is OpenApiV3_1.IJsonSchema.IReference =>
      (schema as OpenApiV3_1.IJsonSchema.IReference).$ref !== undefined;
    export const isOneOf = (
      schema: OpenApiV3_1.IJsonSchema,
    ): schema is OpenApiV3_1.IJsonSchema.IOneOf =>
      (schema as OpenApiV3_1.IJsonSchema.IOneOf).oneOf !== undefined;
    export const isAnyOf = (
      schema: OpenApiV3_1.IJsonSchema,
    ): schema is OpenApiV3_1.IJsonSchema.IAnyOf =>
      (schema as OpenApiV3_1.IJsonSchema.IAnyOf).anyOf !== undefined;
    export const isNullOnly = (
      schema: OpenApiV3_1.IJsonSchema,
    ): schema is OpenApiV3_1.IJsonSchema.INullOnly =>
      (schema as OpenApiV3_1.IJsonSchema.INullOnly).type === "null";
    export const isMixed = (
      schema: OpenApiV3_1.IJsonSchema,
    ): schema is OpenApiV3_1.IJsonSchema.IMixed =>
      Array.isArray((schema as OpenApiV3_1.IJsonSchema.IMixed).type);
  }
}