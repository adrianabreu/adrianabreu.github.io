+++
Description = ""
date = "2023-05-23T07:48:32Z"
title = "Enabling Unity Catalog"
tags = ["Databricks", "Terraform", "Unity Catalog"]
+++

I've spent the last few weeks setting up the unity catalog for my company. It's been an extremely tiring process. And there are several concepts to bring here. My main point is to have a clear view of the requirements.

Disclaimer: as of today with https://github.com/databricks/terraform-provider-databricks release 1.17.0, some steps should be done in an "awkward way" that is, the account API does not expose the catalog's endpoint and should be done through a workspace.

## Concepts to interiorize:

1. There is one catalog per databricks account/region. If you have several workspaces (release environments and such) they will share the same metastore. That's it.
2. You will need a bucket for it. That means it should be on your prod account containing dev / pre data.
3. Unity catalog works with account users, groups, and service principals, no with "local" identities. You must "import" your groups to give permissions. They should have different names from the local ones.
4. Unity catalog needs to be able to access all your buckets so it can create managed tables. You will need a role that can manage all your buckets.
5. You can keep everything working as is despite enabling Unity Catalog by assigning the default catalog to "hive_metastore".
6. Managed tables must be copied over to the new catalog
7. You need to create some new concepts for an external table. Locations would need to be encapsulated in "storage credentials" (representing a role to the bucket) and an external location within that bucker. We did use one bucket per layer, ending up with 4 storage credentials.
8. You can restrict one catalog for being accessed from other workspaces with a new feature called "catalog workspace bindings". That is only available through the UI. (At least for me the API didn't work).
9. You need to update all your jobs to have an "access_mode". Shared mode for interactive cluster does not yet support scala, only sql and python.


## Steps

### Account level 
(You will also need to configure a workspace as the account api isn't available so you will access the metastore through the workspace).
- Create the groups and add the users.
- Using the environment provider (workspace) create the metastore.
- Set up the data access, that means link the role for accessing the s3 bucket to your metastore. In my case I needed to assign the metastore to a workspace first, as the API complained. My debug results in that there is an object, the storage credentials, being created and there is some dependency with the workspace. I did that on dev environment.
- Assign the metastore owner to a group of admins that can manage permissions on it.

### Per environment project / step:
- You will need to assign your groups and service principals to your workspace by running `databricks_permission_assignment`. Note: importing the groups may take several minutes, in my case even more than 5 minutes, that's because databricks internally is merging the existing users with the one added for the groups.
- In order to access data an storage credential for each of the buckets and an external location for the path are needed.
- I would create the catalog of the environment as well as the schemas. Why? For assigning permissions afterwards.
- Now is time to start assigning permissions: you need to give permissions to both the external location and the table. (You may read files on a path and can't be able to select a table). Remember that permissions are inherited, so if you give select and use in a catalog the users will be able to query all the schemas and tables.
- After everything is set up, assign the metastore to your workspace.

### Restrict a catalog

{{< resp-image "/images/unity-catalog/1.png" >}}

### Final steps

In order to use Unity Catalog you will need to:
1. Upgrade your tables (https://docs.databricks.com/data-governance/unity-catalog/migrate.html)
2. Make sure that every cluster has an access_mode configure. 
3. Make sure they point to the right catalog, you can do by cli or a spark property: https://docs.databricks.com/data-governance/unity-catalog/hive-metastore.html#default-catalog
