import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';


export class MundialTicketAgentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table for ticket interests
    const ticketInterestsTable = new dynamodb.Table(this, 'TicketInterests', {
      partitionKey: { 
        name: 'id', 
        type: dynamodb.AttributeType.STRING 
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING
      },
      tableName: 'mundial-ticket-interests',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use carefully in production
      
      // Configure additional table properties
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true
    });

    // Create Lambda function for handling ticket interests
    const ticketInterestLambda = new lambda.Function(this, 'TicketInterestHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/index.handler',
      code: lambda.Code.fromAsset('lambda/dist'),
      environment: {
        DYNAMODB_TABLE: ticketInterestsTable.tableName
      },
      
      // Configure Lambda function properties
      memorySize: 128,
      timeout: cdk.Duration.seconds(10)
    });

    // Grant Lambda permissions to write to DynamoDB
    ticketInterestsTable.grantWriteData(ticketInterestLambda);

    // ADD THIS: Grant Amazon Bedrock permission to invoke the Lambda function
    ticketInterestLambda.addPermission('BedrockInvokePermission', {
      principal: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      // Opcional: puedes restringir el acceso a acciones específicas de Bedrock
      // sourceArn: `arn:aws:bedrock:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:agent-alias/*`
    });
  }
}

// Optional: Export the stack for use in bin file
export default MundialTicketAgentStack;