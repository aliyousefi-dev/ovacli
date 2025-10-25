# Draft

i thinking about a feature that is board.
this board you can create and attach the videos to that.

also i thinking about a mechanism that a video can only be public when it checked all process that need like the approval from the user and the completion of all necessary rules.

i thinking about something that like channels or #topics for each user that can make and categorize Videos on that

i thikning about two creating empty projects.
and connect this projects to the global db.

creating board for the product and other things.

this project designed for the editors. who need more creativity. on the projects.

create new project and then

auto project that created by day and time specification .

each project support the publish and Text editor and .

some one create project and then allocate the teams to that .

project give more abilility like QC (Quality Control) and Auto Publish and also Version Control.

ok now i thinking about the recent and saved api.

we need also thinking about the searching api how we can doing this also ?

also supporting hte context menu can be good for pc and desktop.

i need thinking about the saved and watched .
i think its good to bundle them with batch ?

i Thinking for global as
what af

we can sort that localy but the problem is it using the bucket
and it not have a global sorting.

we need some how support global sorting.

sort them based the uploadtime ?

i think the

we need to update the search suggsion to support other things liek video or tags.
also contatin the video title with the video id .

and limit the suggsion results.

and adding a view all

when delete a user .. it delete completly her. also the content that he shared.

the searhcing what gives us ?
just video ids ? yes it give us just video ids.

we have the gallery fetcher
and it fetch the content based the route

we have two type of route . one is the playlist content that need parameters
and another is the like recent or global that don't need any parameters.

now we need to add another route that is search route that need multiple paramters . like query , tags , bucket

i thikning abuot make the centerla fetch separet function

- fetch serach
- fetch recents
- fetch global
- fetch saved
- fetch playlist content

then we have two type of ui (gallery-page , gallery-infinite)
tehy are fetch based the routes. but i thinking the maybe there is a better approace
like make the fetch logics outside of them like this
for the gallery page having this output funcitons

- OnPageSelect()
- @input Video Datas []
- @Total Videos

and for the Inifinite Fetch

- OnScrollHit()
- @TotalVideso
- Videos Data[]

for example the paginations have a fetcher funciton with
and an initialBucket

also the infinite have this

but i thinking about this fetcher must be something that same like interface
what doing with that fetchre that are complext ?
