## AWS Bedrock AgentCore "Deploy" Action for GitHub Actions

Deploys an AI agent to AWS Bedrock AgentCore Runtime by updating an existing runtime with a new container image.

**Table of Contents**

- [Usage](#usage)
  * [Building and pushing the container image](#building-and-pushing-the-container-image)
  * [Deploying an existing image](#deploying-an-existing-image)
  * [VPC network mode](#vpc-network-mode)
- [Inputs](#inputs)
- [Outputs](#outputs)
- [Credentials and Region](#credentials-and-region)
- [Permissions](#permissions)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contributing](#contributing)

## Usage

```yaml
- name: Deploy to AgentCore
  uses: cokerrd/agentcore-deploy@v1
  with:
    runtime-id: my_agent_runtime-AbCdEfGhIj
    role-arn: arn:aws:iam::<aws_account_id>:role/<agentcore_runtime_role_name>
    container-uri: <aws_account_id>.dkr.ecr.<region>.amazonaws.com/my-agent:v1.2.0
```

See [action.yml](action.yml) for the full documentation for this action's inputs and outputs.

### Building and pushing the container image

It is highly recommended that each time your workflow builds a new container image, a new image tag is generated. For example, use the commit SHA as the tag instead of overwriting `latest`. A unique tag for each deployment allows you to roll back to a previous image.

AgentCore Runtime expects `linux/arm64` container images, so the following example runs on an ARM runner (`ubuntu-24.04-arm`). A plain `docker build` on that runner produces an ARM64 image.

```yaml
name: Deploy Agent

on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: my-agent

jobs:
  deploy:
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v6

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: arn:aws:iam::<aws_account_id>:role/<github_actions_role_name>
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image to Amazon ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Deploy to AgentCore
        id: deploy
        uses: your-org/agentcore-deploy@v1
        with:
          runtime-id: my_agent_runtime-AbCdEfGhIj
          role-arn: arn:aws:iam::<aws_account_id>:role/<agentcore_runtime_role_name>
          container-uri: ${{ steps.build-image.outputs.image }}

      - name: Show result
        run: |
          echo "Version: ${{ steps.deploy.outputs.runtime-version }}"
          echo "Status:  ${{ steps.deploy.outputs.status }}"
```

### Deploying an existing image

If your image is already in ECR (for example, pushed by a separate pipeline), skip the build steps and pass the image URI directly:

```yaml
- name: Deploy to AgentCore
  uses: your-org/agentcore-deploy@v1
  with:
    runtime-id: my_agent_runtime-AbCdEfGhIj
    role-arn: arn:aws:iam::<aws_account_id>:role/<agentcore_runtime_role_name>
    container-uri: <aws_account_id>.dkr.ecr.<region>.amazonaws.com/my-agent:v1.2.0
```

### VPC network mode

By default the runtime uses `PUBLIC` network mode. To run the runtime inside your VPC, set `network-mode` to `VPC` and provide the security groups and subnets:

```yaml
- name: Deploy to AgentCore (VPC)
  uses: your-org/agentcore-deploy@v1
  with:
    runtime-id: my_agent_runtime-AbCdEfGhIj
    role-arn: arn:aws:iam::<aws_account_id>:role/<agentcore_runtime_role_name>
    container-uri: ${{ steps.build-image.outputs.image }}
    network-mode: VPC
    security-groups: sg-0123456789abcdef0,sg-0fedcba9876543210
    subnets: subnet-0123456789abcdef0,subnet-0fedcba9876543210
```

## Inputs

| Name | Description | Required | Default |
| --- | --- | --- | --- |
| `runtime-id` | The unique identifier of the AgentCore Runtime to update. | Yes | |
| `role-arn` | The IAM role ARN that provides permissions for the AgentCore Runtime. | Yes | |
| `container-uri` | Container URI for the AgentCore Runtime (ECR image URI). | Yes | |
| `network-mode` | Network mode for the AgentCore Runtime. Either `PUBLIC` or `VPC`. | No | `PUBLIC` |
| `security-groups` | Comma-separated list of security group IDs for `VPC` network mode. | No | |
| `subnets` | Comma-separated list of subnet IDs for `VPC` network mode. | No | |

When `network-mode` is `VPC`, provide both `security-groups` and `subnets`.

## Outputs

| Name | Description |
| --- | --- |
| `runtime-version` | Updated version of the deployed AgentCore runtime. |
| `status` | Status of the AgentCore runtime. |

## Credentials and Region

This action expects AWS credentials and a region to be available in the GitHub Actions environment. Use [the `aws-actions/configure-aws-credentials` action](https://github.com/aws-actions/configure-aws-credentials) to configure the environment with your credentials and desired region.

We recommend following [Amazon IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) for the AWS credentials used in GitHub Actions workflows, including:

- Prefer [OpenID Connect (OIDC)](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) with a short-lived IAM role over long-lived access keys.
- Do not store credentials in your repository's code. If you must use access keys, store them in [GitHub Actions secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions).
- [Grant least privilege](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#grant-least-privilege) to the credentials used in your workflows. See the [Permissions](#permissions) section below for what this action needs.
- [Monitor the activity](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#keep-a-log) of the credentials used in your workflows.

## Permissions

Deploying a runtime requires the following minimum set of permissions. Adjust the resources to match your account, region, runtime, and repository.

```json
{
   "Version": "2012-10-17",
   "Statement": [
      {
         "Sid": "UpdateRuntime",
         "Effect": "Allow",
         "Action": [
            "bedrock-agentcore:UpdateAgentRuntime",
            "bedrock-agentcore:GetAgentRuntime"
         ],
         "Resource": [
            "arn:aws:bedrock-agentcore:<region>:<aws_account_id>:runtime/<runtime_id>"
         ]
      },
      {
         "Sid": "PassRuntimeRole",
         "Effect": "Allow",
         "Action": [
            "iam:PassRole"
         ],
         "Resource": [
            "arn:aws:iam::<aws_account_id>:role/<agentcore_runtime_role_name>"
         ]
      }
   ]
}
```

If your workflow also builds and pushes the image to Amazon ECR (as in the [example above](#building-and-pushing-the-container-image)), add the following:

```json
{
   "Version": "2012-10-17",
   "Statement": [
      {
         "Sid": "EcrLogin",
         "Effect": "Allow",
         "Action": [
            "ecr:GetAuthorizationToken"
         ],
         "Resource": "*"
      },
      {
         "Sid": "EcrPush",
         "Effect": "Allow",
         "Action": [
            "ecr:BatchCheckLayerAvailability",
            "ecr:InitiateLayerUpload",
            "ecr:UploadLayerPart",
            "ecr:CompleteLayerUpload",
            "ecr:PutImage"
         ],
         "Resource": [
            "arn:aws:ecr:<region>:<aws_account_id>:repository/<ecr_repository_name>"
         ]
      }
   ]
}
```

The role referenced by `role-arn` is assumed by AgentCore Runtime itself. It must trust the AgentCore service and grant whatever the agent needs at runtime, such as pulling the image from ECR and invoking Bedrock models.

## Troubleshooting

Common issues:

- **The runtime fails to start after deployment.** Check that the image was built for `linux/arm64`. Building on an x86 runner without cross-compilation produces an incompatible image.
- **`AccessDeniedException` on `iam:PassRole`.** The credentials used by the workflow must be allowed to pass the role given in `role-arn`.
- **VPC deployment errors.** Make sure both `security-groups` and `subnets` are provided when `network-mode` is `VPC`.


### License

This project is licensed under the [MIT license](LICENSE).

### Contributing

All contributions are encouraged! Check out the [contributor's guide](.github/contributing.md) to learn more.