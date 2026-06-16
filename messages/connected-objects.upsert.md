# summary

Upsert CRM Analytics Connected Objects and fields in the target org based on the input nodes of your local recipes.

# description

Create or update CRM Analytics Connected Objects (Replicated Datasets) and fields in the target org, using the input nodes of the local recipes passed to the command.
Existing connections are preserved, and newly detected objects or fields are added. If a new object connection is created, it uses the default connection mode. Use "--all" to evaluate all recipes in the repository.

# examples

- Create/update objects and fields in analytics connections given a recipe in your local repository

  <%= config.bin %> <%= command.id %> --recipe-names ApiName

- Create/update objects and fields in analytics connections given multiple recipes in your local repository

  <%= config.bin %> <%= command.id %> --recipe-names ApiName1,ApiName2

- Create/update objects and fields in analytics connections given all recipes in your local repository

  <%= config.bin %> <%= command.id %> --all

# flags.recipe-names.summary

The names of the recipes to consider

# flags.recipe-names.description

The API names of the recipes in your repository whose input node objects and fields will be configured in the target org

# flags.all.summary

Consider all recipes in the repository

# flags.verbose.summary

Enriches the JSON output with a detailed list of the fields added to the target org

# recipes.not.found

Recipes not found in the repository

# connector.not.found

Connector named %s not found. Create an empty data connection to proceed

# fields.not.found

The following field/s of %s (%s) is/are missing and cannot be updated: %s
