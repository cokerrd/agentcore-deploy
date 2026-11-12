export interface actionInputs {
  runtimeId: string;
  roleArn: string;
  containerUri: string;
  networkMode: string;
  securityGroups: string[];
  subnets: string[];
}

export function validateInput(inputs: actionInputs) {
  const errors: string[] = [];

  //validate agent role arn input
  if (!inputs.roleArn.startsWith('arn:aws')) {
    errors.push(`Invalid "role-arn": "${inputs.roleArn}". Expected an ARN starting with "arn:aws".`);
  }

  //validate ecr uri input
  const ecrRegex = /^\d{12}\.dkr\.ecr\.[a-z0-9-]+\.amazonaws\.com\/.+:.+$/;
  if (!ecrRegex.test(inputs.containerUri)) {
    errors.push(
      `Invalid "container-uri": "${inputs.containerUri}". Expected an ECR URI like 123456789012.dkr.ecr.us-west-2.amazonaws.com/repo:tag.`,
    );
  }

  //validate PUBLIC network configuration
  if (
    inputs.networkMode.trim().toUpperCase() === 'PUBLIC' &&
    (inputs.securityGroups.length > 0 || inputs.subnets.length > 0)
  ) {
    errors.push(
      `Invalid "network-mode": "${inputs.networkMode}". "security-groups" and "subnets" must not be set for ${inputs.networkMode} network-mode`,
    );
  }

  //validate VPC network configuration
  if (
    inputs.networkMode.trim().toUpperCase() === 'VPC' &&
    (inputs.securityGroups.length === 0 || inputs.subnets.length === 0)
  ) {
    errors.push(
      `Invalid "network-mode": "${inputs.networkMode}". ${inputs.networkMode} network-mode requires "security-groups" and "subnets" to be set`,
    );
  }

  if (errors.length > 0) {
    throw new Error(`Invalid Input(s):\n- ${errors.join('\n- ')}`);
  }
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
