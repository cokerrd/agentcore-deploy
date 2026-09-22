import { AgentRuntimeStatus } from '@aws-sdk/client-bedrock-agentcore-control';
import { describe, expect, test } from 'vitest';
import { buildCommand, isStatusFailed } from '../src/commands';

describe('buildCommand', () => {
  test('maps input fields to the command', () => {
    const command = buildCommand({
      runtimeId: 'runtime123467789',
      roleArn: 'arn:aws:iam::12345678910:role/agent-role',
      containerUri: '123456789100.dkr.ecr.us-west-2.amazonaws.com/agentcore-deploy:v1.0.0',
    });

    expect(command.input).toEqual({
      agentRuntimeId: 'runtime123467789',
      roleArn: 'arn:aws:iam::12345678910:role/agent-role',
      agentRuntimeArtifact: {
        containerConfiguration: {
          containerUri: '123456789100.dkr.ecr.us-west-2.amazonaws.com/agentcore-deploy:v1.0.0',
        },
      },
      networkConfiguration: {
        networkMode: 'PUBLIC',
      },
    });
  });
});

describe('isStatusFailed', () => {
  test.each([
    [AgentRuntimeStatus.UPDATING, false],
    [AgentRuntimeStatus.UPDATE_FAILED, true],
    [AgentRuntimeStatus.DELETING, true],
    [undefined, true],
  ])('check agentcore runtime status(%s) === (s%)', (status, expected) => {
    expect(isStatusFailed(status as AgentRuntimeStatus)).toBe(expected);
  });
});
