# Analytics Connected-Objects Plugin

[![npm](https://badgen.net/npm/v/plugin-analytics-connected-objects)](https://www.npmjs.com/package/plugin-analytics-connected-objects)
[![downloads](https://badgen.net/npm/dw/plugin-analytics-connected-objects)](https://www.npmjs.com/package/plugin-analytics-connected-objects)

This Salesforce CLI (`sf`) plugin automates the configuration of connected objects and fields within **CRM Analytics** > **Data Manager** > **Connections**.

The plugin upserts (creates if missing, or updates) connected objects (also called replicated datasets) and their fields in the target environment based on the input nodes of either specific recipes or all recipes in your repository.

If you manually configure CRM Analytics via the user interface in your target environments, this plugin is not required. However, if you deploy recipes from one environment to another, it eliminates the error-prone task of manually checking off individual objects and fields in the Data Manager, preventing recipe execution failures.

## Install

Run the following command (if you are still using the old CLI, relace `sf` with `sfdx` or [move to the new CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_move_to_sf_v2.htm)):

```bash
sf plugins install plugin-analytics-connected-objects
```

You will be prompted to confirm that you want to install an unsigned plugin. Choose `y`

To prevent this message from appearing, you can add this to the Allow List by adding an entry for it in [$HOME/.config/sfdx/unsignedPluginAllowList.json](https://developer.salesforce.com/blogs/2017/10/salesforce-dx-cli-plugin-update).

CI Users: As the plugin is not signed, to install it from a Dockerfile or a script:

```bash
echo 'y' | sf plugins install plugin-analytics-connected-objects
```

## Issues

Please report any <a href="https://github.com/baslu93/plugin-analytics-connected-objects/issues/new?template=enhancement.md&title=feat%3A+%5BFEATURE+NAME%5D">new feature</a>
or <a href="https://github.com/baslu93/plugin-analytics-connected-objects/issues/new?template=issue.md&title=bug%3A+%5BBUG+NAME%5D">bug</a>
using this links.

## Contributing

1. **Create a new issue** before starting your work so we can track what you want to add or fix. This allows us to offer suggestions or let you know if there is already an ongoing effort.
2. **Fork** this repository.
3. **Build** the plugin locally.
4. **Write appropriate tests** for your changes. Aim for at least 75% code coverage on any new code. NUTs (Non-Unit Tests) are required, though code coverage metrics are based on unit tests only.
5. Run `oclif readme` to update the documentation if commands or flags were changed.
6. **Submit a pull request** when you are finished, making sure to link the previously created issue. We will review your code, suggest any necessary changes, and merge it.

## Commands

<!-- commands -->
* [`sf analytics connected-objects upsert`](#sf-analytics-connected-objects-upsert)

## `sf analytics connected-objects upsert`

Create/update the analytics connected objects and fields according to the ones mentioned in the given recipes.

```
USAGE
  $ sf analytics connected-objects upsert -o <value> [--json] [--flags-dir <value>] [-a <value>] [-n <value>... | --all]
  [--verbose]

FLAGS
  -a, --api-version=<value>      Target API version for the callouts.
  -n, --recipe-names=<value>...  The names of the recipes to consider
  -o, --target-org=<value>       (required) Login username or alias for the target org.
      --all                      Consider all recipes in the repository
      --verbose                  Enriches the JSON output with a detailed list of the fields added to the target org

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Create/update the analytics connected objects and fields according to the ones mentioned in the given recipes.

  Upsert connected objects and fields in the target org based on the input nodes of your local recipes.
  Existing connections are preserved, and newly detected objects or fields are appended. If a new object connection is
  created, it uses the default connection mode. Use "--all" to evaluate all recipes in the repository.

EXAMPLES
  Create/update objects and fields in analytics connections given a recipe in your local repository

    $ sf analytics connected-objects upsert --recipe-names ApiName

  Create/update objects and fields in analytics connections given multiple recipes in your local repository

    $ sf analytics connected-objects upsert --recipe-names ApiName1,ApiName2

  Create/update objects and fields in analytics connections given all recipes in your local repository

    $ sf analytics connected-objects upsert --all

FLAG DESCRIPTIONS
  -a, --api-version=<value>  Target API version for the callouts.

    Use this flag to override the default API version, which is the latest version supported the CLI

  -n, --recipe-names=<value>...  The names of the recipes to consider

    The API names of the recipes in your repository whose input node objects and fields will be configured in the target
    org

  -o, --target-org=<value>  Login username or alias for the target org.

    Overrides your default org.
```
<!-- commandsstop -->
