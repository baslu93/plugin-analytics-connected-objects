import { Connection } from '@salesforce/core';
import { ChangedAndMissingFields, GetDataConnectors, GetReplicatedDatasets, PostReplicatedDataset, ReplicatedDataset } from './modules/upsert';
import { GetReplicatedDatasetFields } from './modules/upsert';

export class DataConnectionHelper {
  public static readonly REPLICATED_DATASETS_API = '/wave/replicatedDatasets';
  public static readonly DATA_CONNECTORS_API = '/wave/dataConnectors';
  private conn: Connection;

  public constructor(conn: Connection) {
    this.conn = conn;
  }

  public async getConnectors(): Promise<Map<string, string>> {
    const response = new Map<string, string>();
    const getDataConnectorsResponse = await this.conn.requestGet<GetDataConnectors>(
      DataConnectionHelper.DATA_CONNECTORS_API
    );
    for (const connector of getDataConnectorsResponse.dataConnectors) {
      response.set(connector.name, connector.id);
    }
    return response;
  }

  public async getReplicatedDatasets(): Promise<ReplicatedDataset[]> {
    const replicatedDatasets = await this.conn.requestGet<GetReplicatedDatasets>(
      DataConnectionHelper.REPLICATED_DATASETS_API
    );
    return replicatedDatasets.replicatedDatasets;
  }

  public async createReplicatedDateset(connectorId: string, sourceObjectName: string): Promise<ReplicatedDataset> {
    const body: PostReplicatedDataset = { connectorId, sourceObjectName };
    const result = await this.conn.requestPost<ReplicatedDataset>(DataConnectionHelper.REPLICATED_DATASETS_API, body);
    return result;
  }

  public async updateReplicatedDatasetFields(datasetId: string, repositoryFieldSet: Set<string>): Promise<ChangedAndMissingFields> {
    const replicatedDatasetFieldsObject = await this.getReplicatedDatasetFields(datasetId);
    const changedFields = new Array<string>();
    const orgFieldSet = new Set<string>();
    for (const field of replicatedDatasetFieldsObject.fields) {
      orgFieldSet.add(field.name);
      if (repositoryFieldSet?.has(field.name) && field.skipped) {
        field.skipped = false;
        changedFields.push(field.name);
      }
    }
    if (changedFields.length > 0) {
      await this.patchReplicatedDatasetFields(datasetId, replicatedDatasetFieldsObject);
    }
    const missingFields = new Array<string>();
    for (const field of Array.from(repositoryFieldSet)){
      if(!orgFieldSet.has(field)){
        missingFields.push(field);
      }
    }
    return {changedFields, missingFields};
  }

  private async getReplicatedDatasetFields(datasetId: string): Promise<GetReplicatedDatasetFields> {
    const result = await this.conn.requestGet<GetReplicatedDatasetFields>(
      `${DataConnectionHelper.REPLICATED_DATASETS_API}/${datasetId}/fields`
    );
    return result;
  }

  private async patchReplicatedDatasetFields(
    datasetId: string,
    replicatedDatasetFieldsObject: GetReplicatedDatasetFields
  ): Promise<void> {
    await this.conn.requestPatch<object>(`${DataConnectionHelper.REPLICATED_DATASETS_API}/${datasetId}/fields`, {
      fields: replicatedDatasetFieldsObject.fields,
    });
  }
}
