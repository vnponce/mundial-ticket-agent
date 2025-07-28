import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from 'crypto';

// Initialize DynamoDB client
const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

// Interface for ticket interest
interface TicketInterest {
  id: string;
  customerName: string;
  customerEmail: string;
  interestedMatch: string;
  createdAt: string;
}

export const handler = async (event: any) => {
  // Log entire event for debugging
  console.log('Full event received:', JSON.stringify(event, null, 2));

  try {
    // Log specific event properties
    console.log('ActionGroup:', event.actionGroup);
    console.log('Function:', event.function);
    console.log('Parameters:', event.parameters);

    // Modify parameter extraction
    const parameters = Array.isArray(event.parameters) ? event.parameters : [];

    // Initialize customer details
    let customerName = '';
    let customerEmail = '';

    // Extract customer name and email from parameters
    parameters.forEach((param: any) => {
      console.log('Processing param:', JSON.stringify(param));
      if (param.name === 'customerName') {
        customerName = param.value;
      }
      if (param.name === 'customerEmail') {
        customerEmail = param.value;
      }
    });

    // Log extracted details
    console.log('Extracted Name:', customerName);
    console.log('Extracted Email:', customerEmail);

    // Validate input
    if (!customerName || !customerEmail) {
      console.error('Validation failed: Missing name or email');
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Customer name and email are required'
        })
      };
    }

    // Prepare item for DynamoDB
    const item: TicketInterest = {
      id: randomUUID(),
      customerName,
      customerEmail,
      interestedMatch: 'Inaugural Match',
      createdAt: new Date().toISOString()
    };

    // Save to DynamoDB
    await docClient.send(new PutCommand({
      TableName: process.env.DYNAMODB_TABLE || 'mundial_ticket_interests',
      Item: item
    }));

    // Prepare response
    const responseBody = {
      TEXT: {
        body: `We have saved your contact information. We will email you when Inaugural Match tickets become available.`
      }
    };

    const actionResponse = {
      actionGroup: event.actionGroup,
      function: event.function,
      functionResponse: {
        responseBody
      }
    };

    return {
      response: actionResponse,
      messageVersion: event.messageVersion || 1
    };

  } catch (error) {
    console.error('Unexpected error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};