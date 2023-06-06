+++
Description = ""
date = "2023-03-20T09:50:32Z"
title = "Duplicates with delta, how can it be?"
tags = ["Spark", "Data Engineer", "Delta", "SQL"]
+++

Long time without writing!
On highlights: I left my job at **Schwarz It** in December last year, and now I'm a full-time employee at Wallbox! I'm really happy with my new job, and I've experienced interesting stuff. This one was just one of these strange cases where you start doubting the compiler.

## Context

One of my main tables represents sensor measures from our chargers with millisecond precision. The numbers are quite high, we are talking over 2 billion rows per day. So the analytic model doesn't handle that level of granularity. 
The analyst created a table that will make a window of 5 minutes, select some specific sensors and write there those values as a column. To keep the data consistent they were generating fake rows between sessions, so if a value was missing a synthetic value would be put in place.

And that was failing. I went there, saw the bug, fix it. And hell was unleashed.

Suddenly there were dups in the table. 

How could that be?

## The problem

The logic was fine, but suddenly two rows appeared for the same primary key on the table. There were no dups before writing as the table was at the minimum level of granularity and the data was grouped by that (some charger, some sensor, some timestamp).

How could I dig into this? 
First, we had two metadata fields, inserted_ts and updated_ts. Those fields helped me debug what was going on. 
Second, thanks to the metadata the rows were not _exactly_ identical, and I could use [delta time traveling](https://delta.io/blog/2023-02-01-delta-lake-time-travel/) and see the table in an earlier state.

So I started to question myself, can delta cause duplicates?

Seem so. [And with that in mind, I ran into the concept of non-deterministic ETLS](https://www.confessionsofadataguy.com/databricks-delta-lake-merge-duplicates-deterministic-vs-non-deterministic-etl/)

There are two delta passes, and the data has to be the same in both or duplicates will appear. (There is an inner and an outer join and both will be unioned).

But that cannot be possible. There wasn't anything that fragile in the code for being considered non-deterministic. Those were my thoughts until I ran into [this GitHub issue](https://github.com/delta-io/delta/issues/1218).

A single spill to the disk was causing the duplicates.

In my case there was a quite complicated way of getting the **last** value of a group with involved collecting all of the values in an array, ordering them, and looking for element_at -1. I rewrote it as a window function for all the rows using the proper framing and the dups were gone.

I've just summarized days of breaking my head in front of the table.

Hope you don't get here with the same problem!