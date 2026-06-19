+++
Description = "MWAA 3.2.1, deferred tasks, and what the Triggerer taught me the hard way"
date = "2026-06-19T10:00:00Z"
title = "When deferred tasks stop deferring"
tags = ["data engineering", "airflow", "cloud"]
+++

AWS released a hot patch on 3.2.1 fixing the recycle workers. We tested it thoroughly on dev for a week.

In the meantime I took the astronomer course which was genuinely  fun. The curriculum leaned hard into best practices—how to structure DAGs, think about observability, and gradually adopt the new Task SDK without turning every pipeline into a science project. There were some really neat bits around the new trigger API, including a pattern for merging cron schedules so you don't end up with fifteen nearly identical DAGs firing at slightly different minutes. Good stuff.

What it didn't prepare me for was the week that followed in production.

## The setup

We had just upgraded MWAA to Airflow 3.2.1. Night one went smoothly—validation passed, nothing alarming in the logs. Also it came with some advantages: insights on dag versioning showing that some dags were causing version increase. And our average workload went down from 80% to 10%. This probably came from old issues with dags affecting the database.

The next day we re-enabled OpenLineage (matching our pre-upgrade setup) and turned Airbyte sync tasks back on. Around 22:00 UTC, deferred tasks started sitting in `deferred` forever.

## What actually broke

Airflow handles deferred tasks through the Triggerer: a single-threaded `asyncio` loop that polls external systems and fires events when work is done. Under normal load, that loop is fine. Under ours, it wasn't.

CloudWatch logs for the Triggerer showed the async thread getting blocked right as the spike hit—0.89 seconds here, 0.54 seconds there. Small numbers, but enough to starve the event loop when you have a high volume of deferrable operators running in parallel.

OpenLineage made it worse. Its listener hooks into task lifecycle events to emit lineage metadata, and in the version we were running, that path involved `os.fork()` calls inside a multi-threaded process. Python warns about this for a reason: fork + threads in an async context is a recipe for deadlocks. The warnings showed up in our logs in a very predictable pattern:

```
Worker: execute() → defer
  └─ OpenLineage on_running → os.fork()
Triggerer: polls until done → fires event
Scheduler: re-queues task
Worker: supervisor.start() → os.fork()
  └─ child runs execute_complete()
      └─ OpenLineage on_success → os.fork()   ← deadlock here = stuck deferred
```

The Triggerer kept reporting healthy heartbeats to MWAA while silently failing to route resume events. From the outside, everything looked fine. Inside, tasks were frozen.

## Why night one was fine

No OpenLineage. The baseline 3.2.1 Triggerer was operating within safe bounds. We only crossed the threshold when metadata listeners and a batch of newly enabled deferrable Airbyte tasks landed at the same time during peak hours.

Our dev environment never saw it, in the workload on dev is way lower.

## What we tried

**Short-term:** flip high-frequency Airbyte syncs to synchronous execution. Setting `deferrable=False` bypasses the Triggerer entirely and pushes work onto workers with a hard timeout:

```python
from datetime import timedelta
from airflow.providers.airbyte.operators.airbyte import AirbyteTriggerSyncOperator

airbyte_sync = AirbyteTriggerSyncOperator(
    deferrable=False,
    execution_timeout=timedelta(hours=2),
)
```

That helped, but it didn't solve it.

**Medium-term:** upgraded providers—Airbyte 5.5.1 (which fixes async timeout propagation that was broken in 5.4.1), OpenLineage 2.18.0, and the matching `openlineage-*` pins. The 2.18 upgrade was supposed to eliminate the dangerous `fork()` behavior. We hoped that would let us re-enable deferrals safely.

It didn't. The deferred-task warnings dropped only after we disabled OpenLineage globally.

**Patch:** disable openlineage. 

## Lessons learned

1. **Deferrable operators are not free.** They move work off workers and onto the Triggerer, which is a single async loop. At scale, that loop becomes a bottleneck—and in 3.2.1, a brittle one.

2. **Metadata listeners run in the hot path.** OpenLineage hooks into every task state transition. When those hooks do synchronous network I/O or fork inside an async context, they compete directly with the Triggerer's core job of resuming deferred tasks.

3. **Healthy heartbeats lie.** The Triggerer reported fine while tasks were stuck. If you rely on deferrable operators, monitor Triggerer logs for `"async thread was blocked for..."` messages.

4. **Staging load matters.** Dev without production-scale deferral volume gave us false confidence. The combination only surfaced under real peak load.

## What's next

I've opened an AWS support case. The underlying issue looks like a core Airflow 3.2.1 Triggerer race condition under load—lock-based routing that can deadlock when the event loop stalls. MWAA 3.2.2 is expected to replace that with multiplexed request handling, which should address the root cause.

Until then, OpenLineage stays off, Airbyte runs synchronously, and I'm watching Triggerer logs like a hawk during evening orchestrations.

Managed Airflow is supposed to save you from running your own Triggerer. Ironically, that's exactly where the failure lived—and exactly where I couldn't touch it.

I'll keep you posted on 3.2.2.
