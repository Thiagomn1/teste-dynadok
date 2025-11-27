import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../shared/types/errors";
import { Validators } from "../../shared/utils/validators";

export interface ValidationSchema {
  body?: Record<string, ValidationRule>;
  params?: Record<string, ValidationRule>;
  query?: Record<string, ValidationRule>;
}

export interface ValidationRule {
  required?: boolean;
  type?: "string" | "number" | "boolean" | "email" | "phone";
  minLength?: number;
  maxLength?: number;
  custom?: (value: any) => boolean;
  message?: string;
}

export function validateRequest(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    if (schema.body) {
      validateObject(req.body, schema.body, "body", errors);
    }

    if (schema.params) {
      validateObject(req.params, schema.params, "params", errors);
    }

    if (schema.query) {
      validateObject(req.query, schema.query, "query", errors);
    }

    if (errors.length > 0) {
      throw new ValidationError("Erro de validação", errors);
    }

    next();
  };
}

function validateObject(
  obj: any,
  rules: Record<string, ValidationRule>,
  location: string,
  errors: string[]
): void {
  for (const [field, rule] of Object.entries(rules)) {
    const value = obj[field];

    if (rule.required && !Validators.isNotEmpty(value)) {
      errors.push(`${location}.${field}: Campo obrigatório`);
      continue;
    }

    if (!rule.required && !value) {
      continue;
    }

    if (rule.type === "email" && !Validators.isValidEmail(value)) {
      errors.push(
        rule.message || `${location}.${field}: Email inválido`
      );
    }

    if (rule.type === "phone" && !Validators.isValidBrazilianPhone(value)) {
      errors.push(
        rule.message || `${location}.${field}: Telefone inválido`
      );
    }

    if (rule.type === "string" && typeof value !== "string") {
      errors.push(`${location}.${field}: Deve ser uma string`);
    }

    if (rule.minLength && value.length < rule.minLength) {
      errors.push(
        `${location}.${field}: Deve ter no mínimo ${rule.minLength} caracteres`
      );
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(
        `${location}.${field}: Deve ter no máximo ${rule.maxLength} caracteres`
      );
    }

    if (rule.custom && !rule.custom(value)) {
      errors.push(
        rule.message || `${location}.${field}: Validação personalizada falhou`
      );
    }
  }
}
