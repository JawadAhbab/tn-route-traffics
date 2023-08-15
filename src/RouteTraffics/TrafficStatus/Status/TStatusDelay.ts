import { Traffic } from '../../Traffic/Traffic'

export class TStatusDelay {
  private startCount = 0
  private delayCount = 0
  private delayMax = 0
  private delayTotal = 0

  public push({ queuems, startms }: Traffic) {
    this.startCount += 1
    const delay = startms - queuems
    if (delay > 100) {
      this.delayCount += 1
      this.delayTotal += delay
      this.delayMax = Math.max(this.delayMax, delay)
    }
  }

  public getStatus() {
    return {
      count: this.delayCount,
      percentage: (this.delayCount / this.startCount) * 100,
      max: this.delayMax,
      ave: this.delayTotal / this.delayCount,
      total: this.delayTotal,
    }
  }
}
