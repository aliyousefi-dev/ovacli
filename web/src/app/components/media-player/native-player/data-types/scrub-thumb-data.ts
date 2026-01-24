// Assuming these types are available/exported from your data layer
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
  spriteWidth: number;
  spriteHeight: number;
  thumbStats: ScrubThumbStat[];
}
