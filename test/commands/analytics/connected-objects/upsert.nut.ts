import * as path from 'path';
import { expect } from 'chai';
import { TestSession, execCmd } from '@salesforce/cli-plugins-testkit';
import { Messages } from '@salesforce/core';
import ConnectedObjectUpsertResult from '../../../../src/commands/analytics/connected-objects/upsert';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('plugin-analytics-connected-objects', 'connected-objects.upsert');

describe('analytics connected-objects upsert NUTs', () => {
  let session: TestSession;
  let defaultUsername: string | undefined;

  before(async () => {
    session = await TestSession.create({
      project: {
        sourceDir: path.join('test', 'testProject'),
      },
      devhubAuthStrategy: 'AUTO',
      scratchOrgs: [{ executable: 'sf', config: 'config/project-scratch-def.json', setDefault: true, wait: 10 }],
    });
    defaultUsername = session.orgs.get('default')?.username;
  });

  after(async () => {
    await session?.clean();
  });

  it('should evaluate a single recipe and upsert the respective connected-objects', () => {
    const name = 'Simple_Recipe';
    const command = `analytics connected-objects upsert --recipe-names ${name} -o ${defaultUsername} --json`;
    const result = execCmd<ConnectedObjectUpsertResult[]>(command, { ensureExitCode: 0, cli: 'sf' }).jsonOutput?.result;
    expect(result).to.deep.equal([
      {
        connectorName: 'SFDC_LOCAL',
        objectName: 'User',
        isNew: true,
        fields: ['Id', 'Username'],
        fieldsCount: 2,
      },
    ]);
  });

  it('should evaluate multiple recipes and upsert the respective connected-objects (warn: 1 extra field found)', () => {
    const name = 'Simple_Recipe,Complex_Recipe';
    const command = `analytics connected-objects upsert --recipe-names ${name} -o ${defaultUsername} --json`;
    const output = execCmd<ConnectedObjectUpsertResult[]>(command, { ensureExitCode: 0, cli: 'sf' }).jsonOutput;
    expect(output).to.deep.equal({
      status: 0,
      result: [{
        connectorName: 'SFDC_LOCAL',
        objectName: 'User',
        isNew: false,
        fields: [
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
        ],
        fieldsCount: 12,
      },
      {
        connectorName: 'SFDC_LOCAL',
        objectName: 'Profile',
        isNew: true,
        fields: ['Id', 'Name'],
        fieldsCount: 2,
      }],
      warnings: [
        messages.getMessage('fields.not.found', [ 'User', 'SFDC_LOCAL' , 'Extra__c'])
      ]
    });
  });
});
