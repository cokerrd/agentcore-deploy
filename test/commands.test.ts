import { AgentRuntimeStatus, NetworkMode } from '@aws-sdk/client-bedrock-agentcore-control';
import { describe, expect, test } from 'vitest';
import { buildCommand, isStatusFailed, toNetworkMode } from '../src/commands';

describe('buildCommand', () => {
  test('maps input fields to the command', () => {
    const command = buildCommand({
      runtimeId: 'runtime123467789',
      roleArn: 'arn:aws:iam::12345678910:role/agent-role',
      containerUri: '123456789100.dkr.ecr.us-west-2.amazonaws.com/agentcore-deploy:v1.0.0',
      networkMode: 'PUBLIC',
      securityGroups: [],
      subnets: [],
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
  test('maps VPC network input fields to the command', () => {
    const command = buildCommand({
      runtimeId: 'runtime123467789',
      roleArn: 'arn:aws:iam::12345678910:role/agent-role',
      containerUri: '123456789100.dkr.ecr.us-west-2.amazonaws.com/agentcore-deploy:v1.0.0',
      networkMode: 'VPC',
      securityGroups: ['sg-123'],
      subnets: ['subnet-a'],
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
        networkMode: 'VPC',
        networkModeConfig: {
          subnets: ['subnet-a'],
          securityGroups: ['sg-123'],
        },
      },
    });
  });
});

describe('toNetworkMode', () => {
  test('check invalid networkMode', () => {
    expect(() => toNetworkMode('INVALID_NETWORK')).toThrow(/Invalid networkMode/);
  });
  test('check VPC networkMode', () => {
    expect(toNetworkMode('VPC')).toBe(NetworkMode.VPC);
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
