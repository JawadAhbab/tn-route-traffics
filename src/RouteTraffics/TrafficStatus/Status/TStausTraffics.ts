export class TStausTraffics {
  private acceptCount = 0
  private rejectCount = 0

  public accept() {
    this.acceptCount += 1
  }
  public reject() {
    this.rejectCount += 1
  }

  public getStatus() {
    return {
      served: this.acceptCount,
      lost: this.rejectCount,
      percentage: (this.rejectCount / (this.acceptCount + this.rejectCount)) * 100,
    }
  }
}
