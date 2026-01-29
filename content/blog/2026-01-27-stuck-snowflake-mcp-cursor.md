+++
Description = "Stuck connecting snowflake integrated mcp and cursor"
date = "2026-01-27T11:40:43Z"
title = "Stuck connecting snowflake integrated mcp and cursor"
tags = ["data engineering","snowflkake","mcp "]
+++

Lately I'm not exactly enjoying my job. Snowflake step curve from a data engineer perspective is really hard.

Yesterday my boss asked me to test the Snowflake integrated MCP from Cursor. He’d been looking into Snowflake OAuth access, so I went to check the resources. Once again—as of January 27th, 2026—the Terraform resource for this still doesn't exist (though the data source does, for some reason).

For connecting to snowflake you need to define a [security integration](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp#set-up-oauth-authentication).

Looks straightforward on paper:

```sql
    CREATE OR REPLACE SECURITY INTEGRATION cursor_mcp_integration
      TYPE = OAUTH
      OAUTH_CLIENT = CUSTOM
      ENABLED = TRUE
      OAUTH_CLIENT_TYPE = 'CONFIDENTIAL'
      OAUTH_REDIRECT_URI = '<uri>>
```

But it’s not. [Cursor uses a fixed redirect URI](https://cursor.com/es/docs/context/mcp#static-oauth-for-remote-servers) `cursor://anysphere.cursor-mcp/oauth/callback`

Snowflake rejects this because the URL must be https (or http if you toggle a specific internal parameter). Snowflake basically won't let you use a custom protocol scheme for the callback.

I’ve written to support and I’ll probably post in the Snowflake community forum.

Update 2026-01-28: Support says that the recommended pat is to use a PAT token, after complaining about the 24 hour token duration without a network policy and the fail to log in with it if you are not in the allowed list, their answer is to create a Service User and create PAts from it (current maximum is 15).