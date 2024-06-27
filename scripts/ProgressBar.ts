import type { SingleBar } from "cli-progress";
import cliProgress from "cli-progress";

export class ProgressBar {
  private bar: SingleBar;

  constructor() {
    this.bar = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic,
    );
  }

  public start(total: number) {
    this.bar.start(total, 0);
  }

  public step() {
    this.bar.increment();
  }

  public update(value: number) {
    this.bar.update(value);
  }

  public stop() {
    this.bar.stop();
  }
}
