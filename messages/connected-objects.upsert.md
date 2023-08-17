# summary

Create/update the analytics connected objects and fields according to the ones mentioned in the given recipes.

# description

Create/update the analytics connected object and fields, keeping the existing ones and adding the new detected.
The diff check is perfomed comparing the target org connections and the object and fields in the input nodes of the given recipe or recipes (in your repository).
Use "--all" to consider all recipes in your repository.
In case a new object is added a connection, the connection mode will be the default one.

# examples

- Create/update objects and fields in analytics connections given a recipe in your local repository

  <%= config.bin %> <%= command.id %> --recipe-names ApiName

- Create/update objects and fields in analytics connections given multiple recipes in your local repository

<%= config.bin %> <%= command.id %> --recipe-names ApiName1,ApiName2

- Create/update objects and fields in analytics connections given all recipes in your local repository

  <%= config.bin %> <%= command.id %> --all

# flags.recipe-names.summary

The name of the recipes you want to evaluate

# flags.recipe-names.description

The api name of the recipes in your repository, which objects and fields will be considered in the diff check the org connections

# flags.all.summary

Evaluate all recipes in your repository

# flags.verbose.summary

Print the changed fields into the outcome table

# recipes.not.found

Recipes not found in the repository

# nothing.changed

Nothing changed

# connector.not.found

Connector named %s not found. Create an empty data connection to proceed
