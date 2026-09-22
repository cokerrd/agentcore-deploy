import * as core from '@actions/core';
import { BedrockAgentCoreControlClient } from '@aws-sdk/client-bedrock-agentcore-control';
import { buildCommand, isStatusFailed } from './commands';
import { type actionInputs, errorMessage, validateInput } from './helpers';

export async function run(): Promise<void> {
  try {
    const input: actionInputs = {
      runtimeId: core.getInput('runtime-id', { required: true }),
      roleArn: core.getInput('role-arn', { required: true }),
      containerUri: core.getInput('container-uri', { required: true }),
    };

    validateInput(input);

    core.setSecret(input.roleArn);
    core.setSecret(input.containerUri);

    const client = new BedrockAgentCoreControlClient();

    core.info(`Updating AgentCore Runtime: ${input.runtimeId}`);
    const response = await client.send(buildCommand(input));

    core.setOutput('runtime-version', response.agentRuntimeVersion);
    core.setOutput('status', response.status);

    if (isStatusFailed(response.status)) {
      core.setFailed(`AgentCore Runtime ${input.runtimeId} is in a failed state: ${response.status}`);
      return;
    }
    core.info('Agent successfully deployed');
  } catch (error) {
    core.setFailed(errorMessage(error));
  }
}

if (require.main === module) {
  run();
}
