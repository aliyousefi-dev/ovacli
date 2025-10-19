# Process Queue

this feature is for processing and indexing and cooking the videos.
it using the watcher with pulling algorithm.

this feature can be more challenging.

the first stage is uploading and the next stage is processing.
processing have two sub-stage:

- Indexing
- Cooking

Cooking need more Power and can be optional or maybe some some how scheduled.

i thinking about how to optimize the cooking process and make it more efficient.

currently it processing with the when using the /uploading api
and when uploading a file also it try to process the video in the background. and then respond with the status of the processing.

but what happing if multiple files are uploaded at the same time?
and it will try to process all of them in the background.

this can lead to resource contention and slow down the processing of all videos.

we need to implement a queuing system to manage the processing of videos more effectively.

after uploading a file, it will be added to the queue for processing. the processing will be done in the order the files were uploaded, ensuring that each file gets the resources it needs without contention.

it process one by one in queue.

we using the multi index strategy to improve the processing speed.
it queues the videos for processing and assigns them to available resources as they become free.

but how monitor the progress of each video in the queue?

i thinking create and db that is tasks.
and we have task groups .. that can be queued and processed in order.

{
TaskId: string;
TaskType: 'INDEXING' | 'COOKING';
status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
VideoIds: string[];
}

i think ova must have an runtime task manager to handle these tasks efficiently.
