import { RecipeDefinition } from '../../../../../src/modules/upsert';

export const recipeFields: string[] = [
  'Id',
  'Username',
  'LastName',
  'FirstName',
  'CompanyName',
  'Email',
  'Phone',
  'MobilePhone',
  'UserRoleId',
  'ProfileId',
  'LanguageLocaleKey',
  'LastLoginDate',
  'CreatedDate',
  'LastModifiedDate',
];

export const simpleRecipe: RecipeDefinition = {
  version: '58.0',
  nodes: {
    LOAD_DATASET0: {
      action: 'load',
      sources: [],
      parameters: {
        fields: recipeFields,
        dataset: {
          type: 'connectedDataset',
          label: 'User',
          connectionName: 'SFDC_LOCAL',
          sourceObjectName: 'User',
        },
        sampleDetails: {
          type: 'TopN',
          sortBy: [],
        },
      },
    },
    OUTPUT0: {
      action: 'save',
      sources: ['LOAD_DATASET0'],
      parameters: {
        fields: [],
        dataset: {
          type: 'analyticsDataset',
          label: 'Simple Dataset',
          name: 'Simple_Dataset',
          rowLevelSecurityFilter: ' ',
          folderName: 'SharedApp',
        },
        measuresToCurrencies: [],
      },
    },
  },
  runMode: 'full',
};
