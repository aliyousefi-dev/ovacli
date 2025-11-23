export class GraphNodeData {
  constructor(
    public id: string,
    public label: string,
    public xPos: number = 100,
    public yPos: number = 100,
    public selected: boolean = false
  ) {}
}
