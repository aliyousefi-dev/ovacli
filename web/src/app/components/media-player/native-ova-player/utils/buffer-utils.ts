import { BufferedRangeData } from '../data-types/buffered-range-data';

export function mergeBufferedRanges(
  ranges: BufferedRangeData[]
): BufferedRangeData[] {
  // Return early if there's nothing to merge
  if (ranges.length === 0) {
    return [];
  }

  // 1. Sort the ranges by their starting time
  // We use a copy of the array to avoid mutating the input
  const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);

  let mergedRanges: BufferedRangeData[] = [];

  for (let range of sortedRanges) {
    // 2. If the merged list is empty, or the current range starts after
    // the end of the last merged range, push it as a new distinct range.
    if (
      mergedRanges.length === 0 ||
      mergedRanges[mergedRanges.length - 1].end < range.start
    ) {
      mergedRanges.push(range);
    } else {
      // 3. Otherwise, there is an overlap or adjacency. Merge the current range
      // by extending the end time of the last merged range.
      mergedRanges[mergedRanges.length - 1].end = Math.max(
        mergedRanges[mergedRanges.length - 1].end,
        range.end
      );
    }
  }
  return mergedRanges;
}
