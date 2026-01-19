import { GameProduct } from "@/entities/game/model/types";
import { ServicePlanProduct } from "@/entities/service/model/types";
import { WalletProduct } from "@/entities/wallet/model/types";

export type TPaymentItem = GameProduct | ServicePlanProduct | WalletProduct