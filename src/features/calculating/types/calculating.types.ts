export type CalculatingType = "cbm" | "dimensions";

export type ShippingMethod = "air" | "sea" | "land" | "combined";

export type CommonCalculatingFields = {
  cartonCount: number;
  actualWeight: number;
  shippingMethod: ShippingMethod;
  productValue: number;
  cargoCategory: string;
  hasBattery: boolean;
  hasMagnet: boolean;
  isBranded: boolean;
};

export type CbmCalculatingFields = CommonCalculatingFields & {
  type: "cbm";
  cbm: number;
};

export type DimensionsCalculatingFields = CommonCalculatingFields & {
  type: "dimensions";
  length: number;
  width: number;
  height: number;
};

export type CalculatingFormValues =
  CbmCalculatingFields | DimensionsCalculatingFields;

export type CommonCalculatingResult = {
  cbm: number | null;
  purchaseServicePercentage: number | null;
  volumetricWeight: number | null;
  actualWeight: number | null;
  cartonPrice: number | null;
  domesticShippingCost: number | null;
  purchasingServiceCost: number | null;
  totalCost: number | null;
  status: "calculated" | "quote_required";
  message: string;
};

export type CalculatingResult =
  | (CommonCalculatingResult & {
      type: "cbm";
    })
  | (CommonCalculatingResult & {
      type: "dimensions";
      cbm: number | null;
    });
