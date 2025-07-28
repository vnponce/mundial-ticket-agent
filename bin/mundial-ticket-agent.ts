#!/usr/bin/env node
import 'source-map-support/register';
import * as dotenv from 'dotenv';
import * as cdk from 'aws-cdk-lib';
import { MundialTicketAgentStack } from '../lib/mundial-ticket-agent-stack';

// Cargar variables de entorno
dotenv.config();

const app = new cdk.App({
  context: {
    '@aws-cdk/core:newStyleStackSynthesis': true,
  }
});

new MundialTicketAgentStack(app, 'MundialTicketAgentStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION
  }
});