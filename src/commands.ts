import { AgentRuntimeStatus, UpdateAgentRuntimeCommand } from '@aws-sdk/client-bedrock-agentcore-control';
import type { actionInputs } from './helpers';

export function buildCommand(input: actionInputs): UpdateAgentRuntimeCommand {
  return new UpdateAgentRuntimeCommand({
    agentRuntimeId: input.runtimeId,
    roleArn: input.roleArn,
    agentRuntimeArtifact: {
      containerConfiguration: {
        containerUri: input.containerUri,
      },
    },
    networkConfiguration: {
      networkMode: 'PUBLIC',
    },
  });
}

//AgentRuntimeStatus can also return undefined
export function isStatusFailed(status: AgentRuntimeStatus | undefined): boolean {
  if (status === undefined) return true;
  return status === AgentRuntimeStatus.UPDATE_FAILED || status === AgentRuntimeStatus.DELETING;
}
