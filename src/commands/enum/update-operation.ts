import { CustomEnum } from "@serenityjs/core";

class UpdateBalanceOperationEnum extends CustomEnum {
  public static readonly identifier = "update_balance_operation";
  public static readonly options = ["add", "subtract", "set"];
}

export { UpdateBalanceOperationEnum };
