# Mundial Ticket Agent

A serverless virtual assistant that registers users interested in World Cup tickets, built with AWS Bedrock and Lambda.

## Project Overview

This project demonstrates the integration between AWS Bedrock's conversational AI capabilities and AWS Lambda serverless functions. The assistant collects customer information (name and email) and stores it in DynamoDB for future ticket availability notifications.

## Architecture

The system integrates three main AWS services:
- **Amazon Bedrock**: Handles conversations with users through generative AI
- **AWS Lambda**: Processes information received from the Bedrock agent
- **DynamoDB**: Stores data from interested individuals

## Key Components

### AWS CDK Infrastructure

The infrastructure is defined as code using AWS CDK with TypeScript:

```typescript
// Creating the DynamoDB table
const ticketInterestsTable = new dynamodb.Table(this, 'TicketInterests', {
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
  tableName: 'mundial-ticket-interests'
});

// The Lambda function
const ticketInterestLambda = new lambda.Function(this, 'TicketInterestHandler', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'dist/index.handler',
  code: lambda.Code.fromAsset('lambda/dist')
});
```
## Bedrock Agent Configuration

A Bedrock agent is configured with an Action Group that points to the Lambda function, enabling natural language processing and extraction of customer information.

## Lambda Permission

The critical integration point is the permission that allows Bedrock to invoke the Lambda function:

```typescript
// This is what makes Bedrock call Lambda to save data
ticketInterestLambda.addPermission('BedrockInvokePermission', {
  principal: new iam.ServicePrincipal('bedrock.amazonaws.com'),
  action: 'lambda:InvokeFunction'
});
```

## Prerequisites

- AWS Account with appropriate permissions
- Node.js (v14 or later)
- AWS CDK installed globally (`npm install -g aws-cdk`)
- Access to AWS Bedrock (requires approval from AWS)

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/mundial-ticket-agent.git
cd mundial-ticket-agent
```
2. Install dependencies:
```
npm install
```

3. Build the Lambda function:
```
cd lambda
npm install
npm run build
cd ..
```

4. Deploy the CDK stack:
```
cdk deploy
```

5. Configure the Bedrock agent:
```
- Create a new agent in the Bedrock console
- Set up an Action Group pointing to the deployed Lambda function
- Configure the agent to extract customer name and email
```

## Usage

Once deployed, users can interact with the agent through the Bedrock console or by integrating it with other channels (web, mobile, etc.).

Example conversation:
```
User: I'm interested in World Cup tickets
Agent: Great! I can help you register your interest. Could you please provide your name?
User: John Doe
Agent: Thanks, John. What's your email address where we can contact you about ticket availability?
User: john.doe@example.com
Agent: Thank you, John. I've saved your contact information. We'll email you when World Cup tickets become available.
```

## Lessons Learned

This project demonstrates the importance of understanding AWS service permissions. The key learning was implementing the correct permissions between Bedrock and Lambda - even when all other configurations are correct, without proper permissions, the integration fails with an "Access Denied" error.

## Future Enhancements

- Real-time data integration with ticket availability APIs
- Authentication system for returning users
- Enhanced conversation capabilities
- Response caching for optimization

## License

MIT