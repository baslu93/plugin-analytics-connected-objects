import * as fs from 'node:fs';
import { ComponentSetBuilder } from '@salesforce/source-deploy-retrieve';
import { SfProject } from '@salesforce/core';

export class MetadataHelper {
  private apiversion?: string;

  public constructor(apiversion?: string) {
    this.apiversion = apiversion;
  }

  public static readFileUtf8(path: string): string {
    return fs.readFileSync(path, 'utf8');
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
      const recipeString = MetadataHelper.readFileUtf8(sourceComponent?.content as string);
      result.push(JSON.parse(recipeString) as T);
    }
    return result;
  }
}
