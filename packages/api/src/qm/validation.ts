// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  FileValidation,
  FuncValidation,
  NumberValidation,
  StringArrayValidation,
  StringValidation,
  ValidationSchema
} from "./question";
import * as fs from "fs-extra";
import * as jsonschema from "jsonschema"; 
import { Inputs } from "../types";
  
export function getValidationFunction(
  validation: ValidationSchema,
  inputs: Inputs
): (input: string | string[] | number)  => Promise<string | undefined> {
  return async function(input: string | string[] | number): Promise<string | undefined> {
    return await validate(validation, input, inputs);
  };
}

export async function validate(
  validSchema: ValidationSchema,
  value: string | string[] | number,
  inputs?: Inputs
): Promise<string | undefined> {
  {
    //FuncValidation
    const funcValidation: FuncValidation = validSchema as FuncValidation;
    if (funcValidation.validFunc) {
      const res = await funcValidation.validFunc(value, inputs);
      return res as string;
    }
  }

  {
    //FileValidation
    const fileValidation: FileValidation = validSchema as FileValidation;
    if (fileValidation.exists !== undefined) {
      const path = value as string;
      if (!path) {
        return `file path should not be empty!`;
      }
      const exists = await fs.pathExists(path);
      if (fileValidation.exists !== exists) {
        return `'${path}' does not meet condition of existance = ${fileValidation.exists}`;
      }
      return undefined;
    }
  }

  {
    // StringValidation
    const stringValidation: StringValidation = validSchema as StringValidation;
    const strToValidate = value as string;
    if (typeof strToValidate === "string") {
      
      const schema: any = {};
      if (stringValidation.equals && typeof stringValidation.equals === "string")
        schema.const = stringValidation.equals;
      if (
        stringValidation.enum &&
        stringValidation.enum.length > 0 &&
        typeof stringValidation.enum[0] === "string"
      )
        schema.enum = stringValidation.enum;
      if (stringValidation.minLength) schema.minLength = stringValidation.minLength;
      if (stringValidation.maxLength) schema.maxLength = stringValidation.maxLength;
      if (stringValidation.pattern) schema.pattern = stringValidation.pattern;
      if (Object.keys(schema).length > 0) {
        const validateResult = jsonschema.validate(value, schema);
        if (validateResult.errors && validateResult.errors.length > 0) {
          return `'${strToValidate}' ${validateResult.errors[0].message}`;
        }
      }

      if (stringValidation.startsWith) {
        if (!strToValidate.startsWith(stringValidation.startsWith)) {
          return `'${strToValidate}' does not meet startsWith:'${stringValidation.startsWith}'`;
        }
      }
      if (stringValidation.endsWith) {
        if (!strToValidate.endsWith(stringValidation.endsWith)) {
          return `'${strToValidate}' does not meet endsWith:'${stringValidation.endsWith}'`;
        }
      }
      if (stringValidation.includes && typeof strToValidate === "string") {
        if (!strToValidate.includes(stringValidation.includes)) {
          return `'${strToValidate}' does not meet includes:'${stringValidation.includes}'`;
        }
      }
    }
  }

  //NumberValidation
  {
    const numberValidation: NumberValidation = validSchema as NumberValidation;
    const numberToValidate = Number(value);
    const schema: any = {};
    if (numberValidation.equals && typeof numberValidation.equals === "number")
      schema.const = numberValidation.equals;
    if (numberValidation.multipleOf) schema.multipleOf = numberValidation.multipleOf;
    if (numberValidation.maximum) schema.maximum = numberValidation.maximum;
    if (numberValidation.exclusiveMaximum)
      schema.exclusiveMaximum = numberValidation.exclusiveMaximum;
    if (numberValidation.minimum) schema.minimum = numberValidation.minimum;
    if (numberValidation.exclusiveMinimum)
      schema.exclusiveMinimum = numberValidation.exclusiveMinimum;
    if (
      numberValidation.enum &&
      numberValidation.enum.length > 0 &&
      typeof numberValidation.enum[0] === "number"
    )
      schema.enum = numberValidation.enum;
    if (Object.keys(schema).length > 0) {
      const validateResult = jsonschema.validate(numberToValidate, schema);
      if (validateResult.errors && validateResult.errors.length > 0) {
        return `'${numberToValidate}' ${validateResult.errors[0].message}`;
      }
    }
  }

  //StringArrayValidation
  {
    const stringArrayValidation: StringArrayValidation = validSchema as StringArrayValidation;
    const arrayToValidate = value as string[];
    if (arrayToValidate instanceof Array) {
      const schema: any = {};
      if (stringArrayValidation.maxItems) schema.maxItems = stringArrayValidation.maxItems;
      if (stringArrayValidation.minItems) schema.minItems = stringArrayValidation.minItems;
      if (stringArrayValidation.uniqueItems) schema.uniqueItems = stringArrayValidation.uniqueItems;
      if (Object.keys(schema).length > 0) {
        const validateResult = jsonschema.validate(arrayToValidate, schema);
        if (validateResult.errors && validateResult.errors.length > 0) {
          return `'${arrayToValidate}' ${validateResult.errors[0].message}`;
        }
      }
      if (stringArrayValidation.equals && stringArrayValidation.equals instanceof Array) {
        stringArrayValidation.enum = stringArrayValidation.equals;
        stringArrayValidation.containsAll = stringArrayValidation.equals;
      }
      if (stringArrayValidation.enum) {
        for (const item of arrayToValidate) {
          if (!stringArrayValidation.enum.includes(item)) {
            return `'${arrayToValidate}' does not meet enum:'${stringArrayValidation.enum}'`;
          }
        }
      }
      if (stringArrayValidation.contains) {
        if (!arrayToValidate.includes(stringArrayValidation.contains)) {
          return `'${arrayToValidate}' does not meet contains:'${stringArrayValidation.contains}'`;
        }
      }
      if (stringArrayValidation.containsAll) {
        const containsAll: string[] = stringArrayValidation.containsAll;
        if (containsAll.length > 0) {
          for (const i of containsAll) {
            if (!arrayToValidate.includes(i)) {
              return `'${arrayToValidate}' does not meet containsAll:'${containsAll}'`;
            }
          }
        }
      }
      if (stringArrayValidation.containsAny) {
        const containsAny: string[] = stringArrayValidation.containsAny;
        if (containsAny.length > 0) {
          // let array = valueToValidate as string[];
          let found = false;
          for (const i of containsAny) {
            if (arrayToValidate.includes(i)) {
              found = true;
              break;
            }
          }
          if (!found) {
            return `'${arrayToValidate}' does not meet containsAny:'${containsAny}'`;
          }
        }
      }
    }
  }
  return undefined;
}
