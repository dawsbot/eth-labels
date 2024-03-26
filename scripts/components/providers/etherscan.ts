import PullComponent from "../pull-class";
import { parseError } from "../error/error-parse";

class etherscan extends PullComponent {
  name = "etherscan";

  constructor(browser: any, page: any, isDebug: boolean) {
    super(browser, page, isDebug);
    this.log("Etherscan created");
  }
  public async pull() {
    this.log("inside pull");
  }
}
export default etherscan;
