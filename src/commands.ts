import { AgentRuntimeStatus, NetworkMode, UpdateAgentRuntimeCommand } from '@aws-sdk/client-bedrock-agentcore-control';
import type { actionInputs } from './helpers';

/**
 * Converts a raw string input into a validated NetworkMode enum.
 * Throws a descriptive error if the value is missing or invalid.
 */
export function toNetworkMode(value: string): NetworkMode {
  const normalized = value.trim().toUpperCase();

  switch (normalized) {
    case 'PUBLIC':
      return NetworkMode.PUBLIC;
    case 'VPC':
      return NetworkMode.VPC;
    default:
      throw new Error(`Invalid networkMode "${value}". ` + `Expected one of: ${Object.values(NetworkMode).join(', ')}`);
  }
}

export function buildCommand(input: actionInputs): UpdateAgentRuntimeCommand {
  const networkMode = toNetworkMode(input.networkMode);

  const networkConfiguration =
    networkMode === NetworkMode.VPC
      ? {
          networkMode: networkMode,
          networkModeConfig: {
            securityGroups: input.securityGroups,
            subnets: input.subnets,
          },
        }
      : {
          networkMode: networkMode,
        };

  return new UpdateAgentRuntimeCommand({
    agentRuntimeId: input.runtimeId,
    roleArn: input.roleArn,
    agentRuntimeArtifact: {
      containerConfiguration: {
        containerUri: input.containerUri,
      },
    },
    networkConfiguration: networkConfiguration,
  });
}

//AgentRuntimeStatus can also return undefined
export function isStatusFailed(status: AgentRuntimeStatus | undefined): boolean {
  if (status === undefined) return true;
  return status === AgentRuntimeStatus.UPDATE_FAILED || status === AgentRuntimeStatus.DELETING;
}
