/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolve } from 'node:path';
import { expect } from 'chai';
import { TestContext, MockTestOrgData } from '@salesforce/core/lib/testSetup';
import { ensureJsonMap, AnyJson } from '@salesforce/ts-types';
import { Config } from '@oclif/core';
import { ComponentSet, ComponentSetBuilder, LazyCollection, SourceComponent } from '@salesforce/source-deploy-retrieve';
import { ApiHelper } from '../../../../src/apiHelper';
import { PostReplicatedDataset } from '../../../../src/modules/upsert';
import { MetadataHelper } from '../../../../src/metadataHelper';
import ConnectedObjectsUpsert from '../../../../src/commands/analytics/connected-objects/upsert';
import {
  createReplicatedDateset,
  getDataConnectors,
  getEmptyReplicatedDataset,
  getReplicatedDatasetFields,
  getReplicatedDatasets,
} from './mocks/apis';
import { recipeFields, simpleRecipe } from './mocks/recipes';

describe('analytics recipe run', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: resolve(__dirname, '../../../package.json') });
  const commandParams = ['--target-org', 'test@org.com', '--recipe-names', 'Simple_Recipe'];

  beforeEach('prepare session', async () => {
    await $$.stubAuths(testOrg);
    await config.load();
    $$.fakeConnectionRequest = (request: AnyJson): Promise<AnyJson> => {
      let result = {};
      const requestMap = ensureJsonMap(request);
      const url = requestMap.url as string;
      if (requestMap.method === 'GET' && url === ApiHelper.REPLICATED_DATASETS_API) {
        result = getEmptyReplicatedDataset();
      } else if (requestMap.method === 'GET' && url === ApiHelper.DATA_CONNECTORS_API) {
        result = getDataConnectors;
      } else if (requestMap.method === 'POST' && url === ApiHelper.REPLICATED_DATASETS_API) {
        const body = JSON.parse(requestMap?.body as string) as PostReplicatedDataset;
        result = createReplicatedDateset(body.connectorId, body.sourceObjectName);
      } else {
        // Replicated Data Fields API
        const fieldIsSkipped = new Map(recipeFields.map((field) => [field, true]));
        result = getReplicatedDatasetFields(fieldIsSkipped);
      }
      return Promise.resolve(result);
    };
  });

  after(async () => {
    $$.restore();
  });

  it('should mark multiple fields and return a json', async () => {
    stubMethodsInMetadataHelper($$, simpleRecipe);
    const cmd = new ConnectedObjectsUpsert([...commandParams, '--json'], config);
    const result = await cmd.run();
    expect(result).to.deep.equal([
      {
        objectName: 'User',
        isNew: true,
        fields: recipeFields,
        fieldsCount: recipeFields.length,
        connectorName: 'SFDC_LOCAL',
      },
    ]);
  });

  it('should mark a single field and return a json', async () => {
    $$.SANDBOX.stub(MetadataHelper.prototype, 'getElements').resolves([simpleRecipe]);
    $$.SANDBOX.stub(ApiHelper.prototype, 'getReplicatedDatasets').resolves(
      getReplicatedDatasets(['User']).replicatedDatasets
    );
    const fieldIsSkipped = new Map(recipeFields.map((field) => [field, false]));
    const USERNAME = 'Username';
    fieldIsSkipped.set(USERNAME, true);
    $$.SANDBOX.stub(ApiHelper.prototype, 'getReplicatedDatasetFields' as any).resolves(
      getReplicatedDatasetFields(fieldIsSkipped)
    );
    const cmd = new ConnectedObjectsUpsert([...commandParams, '--json'], config);
    const result = await cmd.run();
    expect(result).to.deep.equal([
      {
        objectName: 'User',
        isNew: false,
        fields: [USERNAME],
        fieldsCount: 1,
        connectorName: 'SFDC_LOCAL',
      },
    ]);
  });

  it('should mark multiple fields and print result (warn: 1 extra field found)', async () => {
    $$.SANDBOX.stub(MetadataHelper.prototype, 'getElements').resolves([simpleRecipe]);
    $$.SANDBOX.stub(ApiHelper.prototype, 'getReplicatedDatasets').resolves(
      getReplicatedDatasets(['User']).replicatedDatasets
    );
    const fieldIsSkipped = new Map(recipeFields.map((field) => [field, true]));
    recipeFields.push('Extra__c');
    $$.SANDBOX.stub(ApiHelper.prototype, 'getReplicatedDatasetFields' as any).resolves(
      getReplicatedDatasetFields(fieldIsSkipped)
    );
    const cmd = new ConnectedObjectsUpsert([...commandParams, '--verbose'], config);
    await cmd.run();
  });

  it('should make no changes and return a json', async () => {
    $$.SANDBOX.stub(MetadataHelper.prototype, 'getElements').resolves([simpleRecipe]);
    $$.SANDBOX.stub(ApiHelper.prototype, 'getReplicatedDatasets').resolves(
      getReplicatedDatasets(['User']).replicatedDatasets
    );
    const fieldIsSkipped = new Map(recipeFields.map((field) => [field, false]));
    recipeFields.push('Extra__c');
    $$.SANDBOX.stub(ApiHelper.prototype, 'getReplicatedDatasetFields' as any).resolves(
      getReplicatedDatasetFields(fieldIsSkipped)
    );
    const cmd = new ConnectedObjectsUpsert([...commandParams, '--json', '--verbose'], config);
    const result = await cmd.run();
    expect(result).to.lengthOf(0);
  });
});

function stubMethodsInMetadataHelper(testContext: TestContext, result: unknown): void {
  testContext.setConfigStubContents('SfProjectJson', {
    contents: { packageDirectories: [{ path: 'force-app', default: true }], pushPackageDirectoriesSequentially: true },
  });
  testContext.SANDBOX.stub(ComponentSetBuilder, 'build').resolves(new ComponentSet());
  testContext.SANDBOX.stub(ComponentSet.prototype, 'getSourceComponents').returns(
    new LazyCollection([{ content: 'my/path' } as SourceComponent])
  );
  testContext.SANDBOX.stub(MetadataHelper, 'readFileUtf8').returns(JSON.stringify(result));
}
