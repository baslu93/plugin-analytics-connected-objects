/* eslint-disable no-await-in-loop */
import { SfCommand, Flags, Progress } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import { MetadataHelper } from '../../../metadataHelper';
import { ApiHelper } from '../../../apiHelper';
import { RecipeDefinition, LoadDefinitionNodeParam, ReplicatedDataset } from '../../../modules/upsert';
import { PrinterHelper } from '../../../printerHelper';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('plugin-analytics-connected-objects', 'connected-objects.upsert');
const common = Messages.loadMessages('plugin-analytics-connected-objects', 'common');

export interface ConnectedObjectUpsertResult {
  [key: string]: string | boolean | string[] | number | undefined;
  objectName: string;
  connectorName: string;
  isNew: boolean;
  fields?: string[];
  fieldsCount?: number;
}

export default class ConnectedObjectsUpsert extends SfCommand<ConnectedObjectUpsertResult[]> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'api-version': Flags.orgApiVersion({
      char: 'a',
      summary: common.getMessage('flags.api-version.summary'),
      description: common.getMessage('flags.api-version.description'),
    }),
    'target-org': Flags.requiredOrg({
      char: 'o',
      summary: common.getMessage('flags.target-org.summary'),
      description: common.getMessage('flags.target-org.description'),
      required: true,
    }),
    'recipe-names': Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.recipe-names.summary'),
      description: messages.getMessage('flags.recipe-names.description'),
      multiple: true,
      delimiter: ',',
      exclusive: ['all'],
    }),
    all: Flags.boolean({
      summary: messages.getMessage('flags.all.summary'),
      exclusive: ['recipe-names'],
    }),
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  public async run(): Promise<ConnectedObjectUpsertResult[]> {
    const { flags } = await this.parse(ConnectedObjectsUpsert);
    const conn = flags['target-org'].getConnection(flags['api-version']);
    const service = new ApiHelper(conn);

    // get object and fields from recipes
    const entries = flags.all ? ['WaveRecipe'] : flags['recipe-names']?.map((name) => `WaveRecipe:${name}`);
    const metadataResolver = new MetadataHelper(flags['api-version']);

    const recipeDefinitions = await metadataResolver.getElements<RecipeDefinition>(entries ? entries : []);
    if (recipeDefinitions.length === 0) {
      throw new SfError(messages.getMessage('recipes.not.found'), 'RecipesNotFound');
    }
    const connectorObjectFields = this.getInputConnectorObjectFields(recipeDefinitions);

    // check all connectors exist
    const connectorIdByName = await service.getConnectors();
    for (const connectorName of connectorObjectFields.keys()) {
      if (!connectorIdByName.has(connectorName)) {
        throw new SfError(messages.getMessage('connector.not.found', [connectorName]), 'ConnectorNotFound');
      }
    }

    // get available datasets
    const replicatedDatasets = await service.getReplicatedDatasets();
    const connectorAvailableDatasets = new Map<string, Map<string, ReplicatedDataset>>();
    for (const dataset of replicatedDatasets) {
      if (!connectorAvailableDatasets.has(dataset.connector.name)) {
        connectorAvailableDatasets.set(dataset.connector.name, new Map<string, ReplicatedDataset>());
      }
      connectorAvailableDatasets.get(dataset.connector.name)?.set(dataset.sourceObjectName, dataset);
    }

    this.log('*** Upserting connected-objects ***');
    let current = 0;
    let total = 0;
    for (const connectorName of connectorObjectFields.keys()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      total += Array.from(connectorObjectFields.get(connectorName)!.keys()).length;
    }

    const progressBar = new Progress(!this.jsonEnabled());
    progressBar.start(total, {}, { format: '%s | {bar} | {value}/{total} Objects' });

    const warnMessages = new Array<string>();

    // Create / Update connected-objects
    const resultMap = new Map<string, ConnectedObjectUpsertResult>();
    for (const connectorName of connectorObjectFields.keys()) {
      const objectFields = connectorObjectFields.get(connectorName) as Map<string, Set<string>>;
      for (const objectName of objectFields.keys()) {
        let dataset: ReplicatedDataset;
        if (!connectorAvailableDatasets.get(connectorName)?.has(objectName)) {
          dataset = await service.createReplicatedDateset(connectorIdByName.get(connectorName) as string, objectName);
          resultMap.set(objectName, { objectName, isNew: true, connectorName });
        } else {
          dataset = connectorAvailableDatasets.get(connectorName)?.get(objectName) as ReplicatedDataset;
          resultMap.set(objectName, { objectName, isNew: false, connectorName });
        }
        const fieldSet = objectFields.get(dataset.sourceObjectName) as Set<string>;
        const {changedFields, missingFields} = await service.updateReplicatedDatasetFields(dataset.id, fieldSet);

        if(missingFields.length > 0){
          const message = messages.getMessage('fields.not.found', [objectName, connectorName, missingFields.join(', ')]); 
          warnMessages.push(message);
        }
        if (changedFields.length > 0) {
          const item = resultMap.get(dataset.sourceObjectName) as ConnectedObjectUpsertResult;
          item.fields = changedFields;
          item.fieldsCount = changedFields.length;
        }
        current++;
        progressBar.update(current);
      }
    }
    progressBar.stop();

    if(warnMessages.length > 0){
      if(!flags.json){
        warnMessages[warnMessages.length -1] += '\n'; // Last warning line break 
      }
      for(const warnMessage of warnMessages){
        this.warn(warnMessage);
      }
    }

    const result: ConnectedObjectUpsertResult[] = Array.from(resultMap.values()).filter(
      (x) => x.fields && x.fields.length > 0
    );
    if (result.length > 0) {
      this.printConnectionUpgradeResult(result, flags.verbose);
    } else {
      this.log(messages.getMessage('nothing.changed'));
    }
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  private getInputConnectorObjectFields(recipeDefinitions: RecipeDefinition[]): Map<string, Map<string, Set<string>>> {
    const response = new Map<string, Map<string, Set<string>>>();
    for (const recipeDefinition of recipeDefinitions) {
      const keys: string[] = Object.keys(recipeDefinition.nodes);
      for (const key of keys) {
        const node = recipeDefinition.nodes[key];
        if (node?.action === 'load') {
          const params = node?.parameters as LoadDefinitionNodeParam;
          const objectName = params.dataset.sourceObjectName;
          const connectionName = params.dataset.connectionName;
          if (connectionName !== undefined) {
            // load from other dataset
            if (!response.has(connectionName)) {
              response.set(connectionName, new Map<string, Set<string>>());
            }
            const objectFields = response.get(connectionName);
            if (!objectFields?.has(objectName)) {
              objectFields?.set(objectName, new Set<string>());
            }
            for (const field of params.fields) {
              objectFields?.get(objectName)?.add(field);
            }
          }
        }
      }
    }
    return response;
  }

  private printConnectionUpgradeResult(records: ConnectedObjectUpsertResult[], verbose: boolean): void {
    this.table(
      records,
      {
        objectName: { header: 'OBJECT' },
        connectorName: { header: 'CONNECTOR' },
        isNEW: {
          header: 'OPERATION',
          get: (data): string => (data.isNew ? 'Create' : 'Update'),
        },
        fieldsCount: { header: 'FIELDSCOUNT' },
        fields: {
          header: 'FIELDS',
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          get: (data): string => PrinterHelper.printFieldsMultiline(data.fields!, 60),
          extended: !verbose,
        },
      },
      { title: 'Changed connected-objects' }
    );
  }
}
