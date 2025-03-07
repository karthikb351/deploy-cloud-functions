/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as core from '@actions/core';
import { CloudFunctionClient } from './cloudFunctionClient';
import { CloudFunction } from './cloudFunction';

async function run(): Promise<void> {
  try {
    // Get inputs
    const name = core.getInput('name', { required: true });
    const runtime = core.getInput('runtime', { required: true });
    const credentials = core.getInput('credentials');
    const projectId = core.getInput('project_id');
    const availableMemoryMb = core.getInput('memory_mb');
    const region = core.getInput('region') || 'us-central1';
    const envVars = core.getInput('env_vars');
    const envVarsFile = core.getInput('env_vars_file');
    const entryPoint = core.getInput('entry_point');
    const sourceDir = core.getInput('source_dir');
    const vpcConnector = core.getInput('vpc_connector');
    const vpcConnectorEgressSettings = core.getInput(
      'vpc_connector_egress_settings',
    );
    const ingressSettings = core.getInput('ingress_settings');
    const serviceAccountEmail = core.getInput('service_account_email');
    const timeout = core.getInput('timeout');
    const maxInstances = core.getInput('max_instances');
    const eventTriggerType = core.getInput('event_trigger_type');
    const eventTriggerResource = core.getInput('event_trigger_resource');
    const eventTriggerService = core.getInput('event_trigger_service');
    const deployTimeout = core.getInput('deploy_timeout');
    const labels = core.getInput('labels');

    // Create Cloud Functions client
    const client = new CloudFunctionClient(region, { projectId, credentials });

    // Create Function definition
    const newFunc = new CloudFunction({
      name: name,
      parent: client.parent,
      sourceDir,
      runtime,
      availableMemoryMb: +availableMemoryMb,
      entryPoint,
      envVars,
      envVarsFile,
      timeout,
      maxInstances: +maxInstances,
      eventTriggerType,
      eventTriggerResource,
      eventTriggerService,
      deployTimeout,
      vpcConnector,
      vpcConnectorEgressSettings,
      ingressSettings,
      serviceAccountEmail,
      labels,
    });

    // Deploy function
    const deployFunctionResponse = await client.deploy(newFunc);

    if (deployFunctionResponse.response?.httpsTrigger?.url) {
      // Set Cloud Function URL as output
      core.setOutput('url', deployFunctionResponse.response.httpsTrigger.url);
    } else {
      core.info('No URL set. Only HttpsTrigger Cloud Functions have URL.');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
