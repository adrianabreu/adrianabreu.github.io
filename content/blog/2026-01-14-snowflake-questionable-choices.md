+++
Description = "Snowflake questionable choices about their grant system"
date = "2026-01-14T20:14:10"
title = "Snowflake questionable choices"
tags = ["data engineering","snowflake", "rbac"]
+++

I switched jobs all over again. I'm working in a data company called Shalion, where we provide insights about retail products online. If you're brave enough to handle Snowflake's quirks, [we're hiring](https://shalion.teamtailor.com/jobs/6328344-data-engineer)...

I'm working on revamping our permission grant system from [permifrost](https://gitlab.com/gitlab-data/permifrost) to a terraform managed approach.

We also decided to embrace a 2 layer permission grant, using Access Roles (AR) and Functional Roles (FR). The former has access to the resources with the typical permissions (SELECT, USAGE, CREATE)..., while the latter is the one that we assign to people and just groups access roles. 

e.g the data engineering team with `FR_DATA_ENGINEERING` can have `AR_DB_BRONZE_READ`, `AR_DB_SILVER_READWRITE` and `AR_DB_GOLD_READWRITE`

Conceptually it was a solid model, in fact it is recommend across internet, check:
- https://docs.snowflake.com/en/user-guide/security-access-control-considerations#aligning-object-access-with-business-functions
- https://select.dev/posts/snowflake-roles



# Future Grants

Coming from Databricks I find quite hard to justify some decisions in snowflake, in fact future grants is one of them.

Usually if you define select on the container, you can see everything that exists within that container.

In snowflake no, you can define select on all existing objects at some point, with
`GRANT SELECT ON ALL TABLES IN SCHEMA d1.s1 TO ROLE r1;`

But new created tables (like created from created and replace or swapped tables) won't have that permission. So you need to use futures.

`GRANT SELECT ON FUTURE TABLES IN SCHEMA d1.s1 TO ROLE r1;`

So everything makes sense.

Now let's migrate a typical organization. 
Let's say we have bronze, silver and gold databases.

I want DATA ENGINEERS to be able to read the whole gold layer, so I prepare the following statements.

```
GRANT SELECT ON ALL TABLES IN DATABASE gold TO ROLE AR__DB__GOLD_READ;
GRANT SELECT ON FUTURE TABLES IN DATABASE gold TO ROLE AR__DB__GOLD_READ;
```

Then I create the `FR__DATA_ENGINEER` and assign the `AR__DB__GOLD_READ`. It works.

Now let's say I create an app to read a small mart and display insights in a web. It should only access the schema "sales".

```
GRANT SELECT ON ALL TABLES IN SCHEMA gold.sales TO ROLE AR__SCH__GOLD_SALES_READ;
GRANT SELECT ON FUTURE TABLES IN SCHEMA gold.sales TO ROLE AR__SCH__GOLD_SALES_READ;
```

And then I create a role `FR__SVC_SALES_SERVICE` and assign `AR__SCH__GOLD_SALES_READ`.

**And just like that, the Data Engineering team loses access to every new table created in that schema.**

From Snowflake docs https://docs.snowflake.com/en/sql-reference/sql/grant-privilege#considerations

``` 
When future grants are defined on the same object type for a database and a schema in the same database, the schema-level grants take precedence over the database level grants, and the database level grants are ignored. This behavior applies to privileges on future objects granted to one role or different roles.
```

This is quite questionable in my opinion. By trying to be specific for one app-service role, I accidentally nuked the broad permissions for the entire engineering team.

I can accept that if I have a database permission to the role `AR__SCH__GOLD_SALES_READ` and I define other permissions at the schema you can decide to overwrite it, but to do that for every other role? How can you overwrite every other grant given to that from the database level? This breaks the hierarchy inheritance. 


The solution is a blunder. We need to inherit the `AR__SCH__GOLD_SALES_READ` in the `AR__DB__GOLD_READ`.

But that means, that for every schema we create we need to do this. Create the schema permission, and add it. Also we mentioned that this is per object. 
So if you have a `AR__DB__GOLD_WRITE` we need to create `AR__SCH__GOLD_SALES_WRITE` despite the fact that we don't need it. This is a maintenance nightmare. And this is the recommended path.


# Secondary Roles

When migrating users to the new terraform version my `default_secondary_roles` value was set to `DEFAULT`. And suddenly no matter what role I selected on the UI I could see everything. One of my colleagues told me that this shouldn't happen. And it's ok. On [August 2024 Snowflake decided to modify the default secondary roles from null to all](https://docs.snowflake.com/en/release-notes/bcr-bundles/2024_08/bcr-1692), so every user should see a merge of all their permissions. 

I could take advantage of that for solving the future grant problem, users can be in both roles, and that means if the new ones are not properly provisioned we can fallback to the old roles managed by permifrost.

I created a new warehouse, assign it to the new FR and told the user he can use it.

And suddenly he complains that he can't access the table.

I debugged everything, all containers have permission on the old role.

I can select the wh, it works.

And then a colleague suggest, may he be using a dashboard?

And that's it

[Snowflake built a native "safety net" that only exists in the SQL editor. They made the UI a liar—it tricks you into thinking your migration is successful because your queries run fine in a worksheet. But the moment you move three inches to the left into a native Dashboard, the platform "truth-checks" you, the secondary roles vanish, and your dashboard turns into a graveyard of "Unauthorized" errors.

They didn't just break the migration; they built a trap where the platform's own "convenience" features mask your infrastructure gaps until it's too late.](https://docs.snowflake.com/en/release-notes/bcr-bundles/2024_08/bcr-1801)


Damn how I miss Databricks.