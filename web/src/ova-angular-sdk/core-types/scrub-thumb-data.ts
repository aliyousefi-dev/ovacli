export interface ScrubThumbStat {
  baseImgUrl: string;
  startTime: number;
  endTime: number;
  xPos: number;
  yPos: number;
}

export interface ScrubThumbStream {
  cropedWidth: number;
  cropedHeight: number;
  thumbStats: ScrubThumbStat[];
}
