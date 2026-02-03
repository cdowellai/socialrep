// Shared validation utilities for edge functions
// Using manual validation since Deno doesn't have native zod

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Validate string with constraints
export function validateString(
  value: unknown,
  field: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    enum?: string[];
  } = {}
): ValidationError | null {
  const { required = false, minLength, maxLength, pattern, enum: allowedValues } = options;

  if (value === undefined || value === null || value === "") {
    if (required) {
      return { field, message: `${field} is required` };
    }
    return null;
  }

  if (typeof value !== "string") {
    return { field, message: `${field} must be a string` };
  }

  if (minLength !== undefined && value.length < minLength) {
    return { field, message: `${field} must be at least ${minLength} characters` };
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return { field, message: `${field} must be at most ${maxLength} characters` };
  }

  if (pattern && !pattern.test(value)) {
    return { field, message: `${field} has invalid format` };
  }

  if (allowedValues && !allowedValues.includes(value)) {
    return { field, message: `${field} must be one of: ${allowedValues.join(", ")}` };
  }

  return null;
}

// Validate UUID format
export function validateUUID(value: unknown, field: string, required = false): ValidationError | null {
  if (value === undefined || value === null || value === "") {
    if (required) {
      return { field, message: `${field} is required` };
    }
    return null;
  }

  if (typeof value !== "string") {
    return { field, message: `${field} must be a string` };
  }

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(value)) {
    return { field, message: `${field} must be a valid UUID` };
  }

  return null;
}

// Validate array of strings
export function validateStringArray(
  value: unknown,
  field: string,
  options: {
    required?: boolean;
    maxItems?: number;
    maxItemLength?: number;
  } = {}
): ValidationError | null {
  const { required = false, maxItems, maxItemLength } = options;

  if (value === undefined || value === null) {
    if (required) {
      return { field, message: `${field} is required` };
    }
    return null;
  }

  if (!Array.isArray(value)) {
    return { field, message: `${field} must be an array` };
  }

  if (maxItems !== undefined && value.length > maxItems) {
    return { field, message: `${field} must have at most ${maxItems} items` };
  }

  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== "string") {
      return { field, message: `${field}[${i}] must be a string` };
    }
    if (maxItemLength !== undefined && value[i].length > maxItemLength) {
      return { field, message: `${field}[${i}] must be at most ${maxItemLength} characters` };
    }
  }

  return null;
}

// Validate object exists and is an object
export function validateObject(value: unknown, field: string, required = false): ValidationError | null {
  if (value === undefined || value === null) {
    if (required) {
      return { field, message: `${field} is required` };
    }
    return null;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return { field, message: `${field} must be an object` };
  }

  return null;
}

// Sanitize string to prevent injection
export function sanitizeString(value: string): string {
  // Remove null bytes and control characters
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

// Validate request body size (call before parsing JSON)
export async function validateRequestSize(req: Request, maxSizeKB: number = 100): Promise<boolean> {
  const contentLength = req.headers.get("content-length");
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > maxSizeKB * 1024) {
      return false;
    }
  }
  return true;
}

// Parse and validate JSON safely
export async function parseJSON<T>(req: Request): Promise<{ data?: T; error?: string }> {
  try {
    const text = await req.text();
    if (!text || text.trim() === "") {
      return { data: {} as T };
    }
    const data = JSON.parse(text) as T;
    return { data };
  } catch {
    return { error: "Invalid JSON body" };
  }
}

// Collect validation errors
export function collectErrors(errors: (ValidationError | null)[]): ValidationError[] {
  return errors.filter((e): e is ValidationError => e !== null);
}
