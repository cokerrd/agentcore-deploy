import { describe, expect, test } from 'vitest';
import { type actionInputs, validateInput } from '../src/helpers';

const validInput: actionInputs = {
  runtimeId: 'runtime123467789',
  roleArn: 'arn:aws:iam::12345678910:role/agent-role',
  containerUri: '123456789100.dkr.ecr.us-west-2.amazonaws.com/agentcore-deploy:v1.0.0',
};

const makeInput = (overrides: Partial<actionInputs> = {}): actionInputs => ({
  ...validInput,
  ...overrides,
});

describe('validateInput', () => {
  test('accepts valid input', () => {
    expect(() => validateInput(validInput)).not.toThrow();
  });

  test('rejects invalid role ARN', () => {
    const input = makeInput({ roleArn: 'role/agent-role' });
    expect(() => validateInput(input)).toThrow(/Invalid "role-arn":/);
  });

  test('rejects invalid container URI', () => {
    const input = makeInput({ containerUri: '123456789.dkr.ecr.us-west-2.amazonaws.com' });
    expect(() => validateInput(input)).toThrow(/Invalid "container-uri":/);
  });

  test('reports all validation errors together', () => {
    const input = makeInput({
      roleArn: 'role/agent-role',
      containerUri: 'agentcore-deploy:v1.0.0',
    });
    expect(() => validateInput(input)).toThrow(/Invalid Input\(s\):[\s\S]*role-arn[\s\S]*container-uri/);
  });
});
