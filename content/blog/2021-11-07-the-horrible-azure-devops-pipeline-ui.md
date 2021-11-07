+++
Description = ""
date = "2021-11-07T16:32:32Z"
title = "The horrible azure devops ui"
tags = ["CI/CD", "Microsoft"]
+++

**Disclaimer: I read the docs, I know this is just complaining and not giving feedback, but man, this UI stills is horrible**.

So... Let's put into situation, there was a connection update between devops and bitbucket and suddenly most of our pipelines stopped working. They told me to change the connection in the yaml file and that didn't work. 

I know that there are three parts involving in a pipeline for sure:

1. The yml file in your repo, describing the jobs for the pipeline.
2. The pipeline in devops, handling the config and the run on the azure devops side.
3. And the webhooks section in the bitbucket repository configuring the needed trigger when the needed events are met. 

So... I started looking and the pipeline in devops. And ok, this has been there for ages, but I hadn't needed to touch it for ages too, so let's see.

From a pipeline click on edit.

![Edit Pipeline](/images/devops-ui/edit-pipeline.png)

Then on the 3 dots at right and go to triggers.

![Trigger section](/images/devops-ui/trigger_section.png)

And important note about this section, I came after this after my pull request build not being triggered. I just deleted all the webhooks on the bitbucket side and discover than you can recreate them from this section. A yellow display will appear and you can regenerate the connection. 

So now click on the yaml tab on the left and go for "get sources" under pipeline, and voilá! You can change the connection that was being used for your repo!

![Yaml Section](/images/devops-ui/yaml_section.png)

And please, microsoft, make it easier. I know this is not the normal case, but contextual submenus with no direct options are never good.

