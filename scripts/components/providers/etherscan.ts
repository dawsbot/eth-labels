import PullComponent from "../pull-class.ts";
import { parseError } from "../error/error-parse.ts";

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
