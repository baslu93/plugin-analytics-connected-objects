import { DataConnectionHelper } from '../../../../../src/dataConnectionHelper';
import { GetDataConnectors, GetReplicatedDatasets, ReplicatedDataset } from '../../../../../src/modules/upsert';
import { GetReplicatedDatasetFields, ReplicatedDatasetField } from '../../../../../src/modules/upsert';

export function getReplicatedDatasets(sourceObjectNames: string[]): GetReplicatedDatasets {
  const replicatedDatasets: ReplicatedDataset[] = new Array<ReplicatedDataset>();
  if (sourceObjectNames.length !== 0) {
    for (const sourceObjectName of sourceObjectNames) {
      replicatedDatasets.push(generateReplicatedDataset(sourceObjectName));
    }
  }
  return { replicatedDatasets, url: '/services/data/v56.0/wave/replicatedDatasets' };
}

export function getEmptyReplicatedDataset() {
  return getReplicatedDatasets([]);
}

export function createReplicatedDateset(connectorId: string, sourceSobjectName: string): ReplicatedDataset {
  return generateReplicatedDataset(sourceSobjectName);
}

export function getReplicatedDatasetFields(fieldIsSkipped: Map<string, boolean>): GetReplicatedDatasetFields {
  const result: ReplicatedDatasetField[] = [];
  for (const fieldName of fieldIsSkipped.keys()) {
    result.push(getReplicatedDatasetField(fieldName, fieldIsSkipped.get(fieldName) as boolean));
  }
  return { fields: result, url: `${DataConnectionHelper.REPLICATED_DATASETS_API}/0Iu7Z00000001waSAA/fields` };
}

export const getDataConnectors: GetDataConnectors = {
  dataConnectors: [
    {
      connectorHandler: 'Legacy',
      connectorType: 'SfdcLocal',
      description: 'SFDC_LOCAL',
      id: '0It7Q00000000RgSAI',
      label: 'SFDC_LOCAL',
      name: 'SFDC_LOCAL',
      type: 'dataconnector',
      url: '/services/data/v56.0/wave/dataConnectors/0It7Q00000000RgSAI',
    },
  ],
  url: '/services/data/v56.0/wave/dataConnectors',
};

function generateReplicatedDataset(sourceSobjectName: string): ReplicatedDataset {
  return {
    connectionMode: 'incremental',
    connector: {
      connectorHandler: 'Legacy',
      connectorType: 'SfdcLocal',
      description: 'SFDC_LOCAL',
      id: '0It7Q00000000RgSAI',
      label: 'SFDC_LOCAL',
      name: 'SFDC_LOCAL',
      type: 'dataconnector',
      url: '/services/data/v56.0/wave/dataConnectors/0It7Q00000000RgSAI',
    },
    datasetId: '0Fb7Z0000005dkRSAQ',
    fieldsUrl: '/services/data/v56.0/wave/replicatedDatasets/0Iu7Z00000001ruSAA/fields',
    filterApplied: false,
    id: '0Iu7Z00000002CESAY',
    name: sourceSobjectName,
    replicationDataflowId: '02K7Z000001ZSGLUA4',
    sourceObjectName: sourceSobjectName,
    status: 'new',
    supportedConnectionModes: ['full', 'incremental', 'periodicFull'],
    type: 'replicateddataset',
    uuid: '0Iu7Z00000002CESAY',
  };
}

function getReplicatedDatasetField(fieldName: string, isSkipped: boolean): ReplicatedDatasetField {
  return {
    fieldType: 'text',
    label: fieldName,
    multiValue: false,
    name: fieldName,
    precision: 255,
    skipped: isSkipped,
  };
}
