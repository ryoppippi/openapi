import { IChatGptSchema } from "./IChatGptSchema";
import { IClaudeSchema } from "./IClaudeSchema";
import { IDeepSeekSchema } from "./IDeepSeekSchema";
import { IGeminiSchema } from "./IGeminiSchema";
import { ILlamaSchema } from "./ILlamaSchema";
import { ILlmSchemaV3 } from "./ILlmSchemaV3";
import { ILlmSchemaV3_1 } from "./ILlmSchemaV3_1";

/**
 * The schemas for the LLM function calling.
 *
 * `ILlmSchema` is an union type collecting every the schemas for the LLM
 * function calling.
 *
 * Select a proper schema type according to the LLM provider you're using.
 *
 * @author Jeongho Nam - https://github.com/samchon
 * @template Model Type of the LLM model
 * @reference https://platform.openai.com/docs/guides/function-calling
 * @reference https://platform.openai.com/docs/guides/structured-outputs
 */
export type ILlmSchema<Model extends ILlmSchema.Model = ILlmSchema.Model> =
  ILlmSchema.ModelSchema[Model];

export namespace ILlmSchema {
  export type Model =
    | "chatgpt"
    | "claude"
    | "deepseek"
    | "gemini"
    | "llama"
    | "3.0"
    | "3.1";
  export interface ModelConfig {
    chatgpt: IChatGptSchema.IConfig;
    claude: IClaudeSchema.IConfig;
    deepseek: IDeepSeekSchema.IConfig;
    gemini: IGeminiSchema.IConfig;
    llama: ILlamaSchema.IConfig;
    "3.0": ILlmSchemaV3.IConfig;
    "3.1": ILlmSchemaV3_1.IConfig;
  }
  export interface ModelParameters {
    chatgpt: IChatGptSchema.IParameters;
    claude: IClaudeSchema.IParameters;
    deepseek: IDeepSeekSchema.IParameters;
    gemini: IGeminiSchema.IParameters;
    llama: ILlamaSchema.IParameters;
    "3.0": ILlmSchemaV3.IParameters;
    "3.1": ILlmSchemaV3_1.IParameters;
  }
  export interface ModelSchema {
    chatgpt: IChatGptSchema;
    claude: IClaudeSchema;
    deepseek: IDeepSeekSchema;
    gemini: IGeminiSchema;
    llama: ILlamaSchema;
    "3.0": ILlmSchemaV3;
    "3.1": ILlmSchemaV3_1;
  }

  /**
   * Type of function parameters.
   *
   * `ILlmSchema.IParameters` is a type defining a function's pamameters as a
   * keyworded object type.
   *
   * It also can be utilized for the structured output metadata.
   *
   * @reference https://platform.openai.com/docs/guides/structured-outputs
   */
  export type IParameters<Model extends ILlmSchema.Model = ILlmSchema.Model> =
    ILlmSchema.ModelParameters[Model];

  /** Configuration for the LLM schema composition. */
  export type IConfig<Model extends ILlmSchema.Model = ILlmSchema.Model> =
    ILlmSchema.ModelConfig[Model];
}
