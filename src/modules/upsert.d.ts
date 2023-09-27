export type GetReplicatedDatasets = {
  replicatedDatasets: ReplicatedDataset[];
  url: string;
};
export type PostReplicatedDataset = {
  connectorId: string;
  sourceObjectName: string;
};

export type ReplicatedDataset = {
  connectionMode: string;
  connector: DataConnector;
  datasetId: string;
  fieldsUrl: string;
  filterApplied: boolean;
  id: string;
  name: string;
  replicationDataflowId: string;
  sourceObjectName: string;
  status: string;
  supportedConnectionModes: string[];
  type: string;
  uuid: string;
};

export type DataConnector = {
  connectorHandler: string;
  connectorType: string;
  description: string;
  id: string;
  label: string;
  name: string;
  type: string;
  url: string;
};

export type GetReplicatedDatasetFields = {
  fields: ReplicatedDatasetField[];
  url: string;
};

export type ReplicatedDatasetField = {
  fieldType: string;
  label: string;
  multiValue: boolean;
  name: string;
  precision: number;
  skipped: boolean;
};

export type RecipeDefinition = {
  version: string;
  nodes: RecipeDefinitionNodes;
  runMode: string;
};

export type RecipeDefinitionNodes = {
  [key: string]: RecipeDefinitionNode;
};

export type RecipeDefinitionNode = {
  action: string;
  parameters: LoadDefinitionNodeParam | unknown;
  sources: string[];
};

export type LoadDefinitionNodeParam = {
  fields: string[];
  dataset: LoadDefinitionNodeDataset;
};

export type LoadDefinitionNodeDataset = {
  connectionName: string;
  label: string;
  sourceObjectName: string;
  type: string;
};

export type GetDataConnectors = {
  dataConnectors: DataConnector[];
  url: string;
};

export type ChangedAndMissingFields = {
  changedFields: string[];
  missingFields: string[];
}