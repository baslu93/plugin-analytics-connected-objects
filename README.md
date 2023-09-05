# Analytics Connected-Objects Plugin

[![npm](https://badgen.net/npm/v/plugin-analytics-connected-objects)](https://badgen.net/npm/v/plugin-analytics-connected-objects)
[![downloads](https://badgen.net/npm/dw/plugin-analytics-connected-objects)](https://badgen.net/npm/dw/plugin-analytics-connected-objects)

The plugin enhances the productivity of CRMA developers and release managers by automating manual procedural tasks related to connected objects. Nowadays, each time a new field is used in recipes, the user tracks the field in notes. Later, when there's a need to migrate the recipe to a higher environment, the user manually checks off each field one by one in the connected objects according to the taken notes.

The process is highly manual, and forgetting to track certain fields often causes recipe run failures. The run failures highlight one field at a time, and the process should be repeated until the first successful run.

The command, which can be executed locally or inserted into a CI/CD pipeline, verifies the required fields from the recipes and marks them in the environment within seconds.

## Issues

Please report any <a href="https://github.com/baslu93/plugin-analytics-connected-objects/issues/new?template=enhancement.md&title=feat%3A+%5BFEATURE+NAME%5D">new feature</a>
or <a href="https://github.com/baslu93/plugin-analytics-connected-objects/issues/new?template=issue.md&title=bug%3A+%5BBUG+NAME%5D">bug</a>
using this links.

## Contributing

1. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
2. Fork this repository.
3. Build the plugin locally.
4. Write appropriate tests for your changes. Try to achieve at least 75% code coverage on any new code.
   Nuts are required, but code coverage will be based on unit tests only.
5. Send us a pull request when you are done (linking the issue previously created).  
   We'll review your code, suggest any needed changes, and merge it in.

## Install

Run the following command:

```bash
sf plugins install plugin-analytics-connected-objects
```

You will be prompted to confirm that you want to install an unsigned plugin. Choose 'y'

```
This plugin is not digitally signed and its authenticity cannot be verified. Continue installation? (y/N)
```

To prevent this message from appearing, you can add this to the Allow List by adding an entry for it in [$HOME/.config/sfdx/unsignedPluginAllowList.json](https://developer.salesforce.com/blogs/2017/10/salesforce-dx-cli-plugin-update).

CI Users: As the plugin is not signed, to install it from a Dockerfile or a script:

```bash
echo 'y' | sf plugins install plugin-analytics-connected-objects
```

## Commands

<!-- commands -->

- [`sf analytics connected-objects upsert`](#sf-analytics-connected-objects-upsert)

## `sf analytics connected-objects upsert`

Create/update the analytics connected objects and fields according to the ones mentioned in the given recipes.

```
USAGE
  $ sf analytics connected-objects upsert -o <value> [--json] [-a <value>] [-n <value> | --all] [--verbose]

FLAGS
  -a, --api-version=<value>      Target API version for the callouts.
  -n, --recipe-names=<value>...  The name of the recipes you want to evaluate
  -o, --target-org=<value>       (required) Login username or alias for the target org.
  --all                          Evaluate all recipes in your repository
  --verbose                      Print the changed fields into the outcome table

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Create/update the analytics connected objects and fields according to the ones mentioned in the given recipes.

  Create/update the analytics connected object and fields, keeping the existing ones and adding the new detected.
  The diff check is perfomed comparing the target org connections and the object and fields in the input nodes of the
  given recipe or recipes (in your repository).
  Use "--all" to consider all recipes in your repository.
  In case a new object is added a connection, the connection mode will be the default one.

EXAMPLES
  - Create/update objects and fields in analytics connections given a recipe in your local repository
    sf analytics connected-objects upsert --recipe-names ApiName
  - Create/update objects and fields in analytics connections given multiple recipes in your local repository
  $ sf analytics connected-objects upsert --recipe-names ApiName1,ApiName2
  - Create/update objects and fields in analytics connections given all recipes in your local repository
    sf analytics connected-objects upsert --all

FLAG DESCRIPTIONS
  -a, --api-version=<value>  Target API version for the callouts.

    Use this flag to override the default API version, which is the latest version supported the CLI

  -n, --recipe-names=<value>...  The name of the recipes you want to evaluate

    The api name of the recipes in your repository, which objects and fields will be considered in the diff check the
    org connections

  -o, --target-org=<value>  Login username or alias for the target org.

    Overrides your default org.
```

<!-- commandsstop -->
