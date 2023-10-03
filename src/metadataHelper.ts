import * as fs from 'fs';
import { ComponentSetBuilder } from '@salesforce/source-deploy-retrieve';
import { SfProject } from '@salesforce/core';

export class MetadataHelper {
  private apiversion?: string;

  public constructor(apiversion?: string) {
    this.apiversion = apiversion;
  }

  public async getElements<T>(entries: string[]): Promise<T[]> {
    const project = await SfProject.resolve();
    const paths = project.getUniquePackageDirectories().map((pDir) => pDir.fullPath);

    const componentSet = await ComponentSetBuilder.build({
      apiversion: this.apiversion,
      metadata: {
        metadataEntries: entries,
        directoryPaths: paths,
      },
    });
    const result = new Array<T>();
    const sourceComponents = componentSet.getSourceComponents().toArray();
    for (const sourceComponent of sourceComponents) {
      const recipeString = fs.readFileSync(sourceComponent?.content as string, 'utf-8');
      result.push(JSON.parse(recipeString) as T);
    }
    return result;
  }
}
