import { z } from "zod";
import type { CartApiResponse } from "../types/api/cart-api.types";
import type { CartDataIssue, ServerCart } from "../types/domain/cart.types";
import { mapCart } from "./cart.mapper";

const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const amount = z.string().regex(/^\d+(?:\.\d+)?$/);
const text = z.string();
const timestamp = z.string().datetime({offset:true});
const list = z.array(z.unknown());
const object = z.record(z.string(), z.unknown());

/** Read-only recovery: preserve usable fields and report every absent/invalid consumed value. */
export function mapCartForDisplay(input: unknown): ServerCart {
  const diagnostics: CartDataIssue[] = [];
  const get = (path: string) => {
    let value: unknown = input;
    for (const part of path ? path.split(".") : []) {
      if (!value || typeof value !== "object" || !Object.hasOwn(value, part)) return {exists:false,value:undefined};
      value = (value as Record<string,unknown>)[part];
    }
    return {exists:true,value};
  };
  const note = (path: string) => {
    if (diagnostics.some((issue) => issue.path === path || !issue.path || path.startsWith(`${issue.path}.`))) return;
    const {exists,value} = get(path);
    diagnostics.push({path,status:!exists ? "missing" : value == null || (typeof value === "string" && !value.trim()) || (Array.isArray(value) && value.length === 0) ? "empty" : "invalid"});
  };
  const read = <T,>(path: string, schema: z.ZodType<T>, fallback: T): T => {
    const result = schema.safeParse(get(path).value);
    if (result.success) return result.data;
    note(path);
    return fallback;
  };
  const string = (path: string) => {
    const value = read(path,text,"");
    if (!value.trim()) note(path);
    return value;
  };
  const requiredText = (path: string) => read(path,text.trim().min(1),"");
  const number = (path: string) => read(path,count,NaN);
  const bool = (path: string) => read(path,z.boolean(),false);
  const money = (path: string) => read(path,amount,"");
  const optionalMoney = (path: string) => {
    if (get(path).value == null) note(path);
    return read(path,amount.optional(),undefined);
  };
  const nullableMoney = (path: string) => read(path,amount.nullable(),null);
  const nullableText = (path: string) => read(path,text.nullable(),null);
  const array = (path: string) => read(path,list,[]);
  const strings = (path: string) => read(path,z.array(text),[]);
  const record = (path: string) => read(path,object,{});
  record("");record("owner");
  const rows = array("items");
  const raw: CartApiResponse = {
    owner:{type:requiredText("owner.type"),user_id:read("owner.user_id",count.nullable(),null)},
    currency:requiredText("currency"),item_count:number("item_count"),total_quantity:number("total_quantity"),
    subtotal:money("subtotal"),discount_total:money("discount_total"),final_total:money("final_total"),
    checkout_ready:bool("checkout_ready"),issues:strings("issues"),related_products:get("related_products").exists ? array("related_products") : [],
    items: rows.map((_,index) => {
      const path = `items.${index}`;
      for (const key of ["", ".product", ".product.source", ".product.price", ".product.guarantee", ".selected_options", ".availability", ".pricing"]) record(path + key);
      const p = `${path}.product`, price = `${p}.price`, pricing = `${path}.pricing`, selected = `${path}.selected_options`, availability = `${path}.availability`;
      const attributes = array(`${selected}.attributes`).map((_,i) => ({
        name:requiredText(`${selected}.attributes.${i}.name`),value:requiredText(`${selected}.attributes.${i}.value`),
      })).filter((attribute) => attribute.name && attribute.value);
      const result = {
        id:number(`${path}.id`),catalog_id:requiredText(`${path}.catalog_id`),source:requiredText(`${path}.source`),
        product:{
          id:number(`${p}.id`),slug:requiredText(`${p}.slug`),title:requiredText(`${p}.title`),
          short_title:string(`${p}.short_title`),short_description:string(`${p}.short_description`),
          image:nullableText(`${p}.image`),source:{name:requiredText(`${p}.source.name`),label:requiredText(`${p}.source.label`),url:string(`${p}.source.url`)},
          colors:array(`${p}.colors`),brand:get(`${p}.brand`).value ?? null,seller:get(`${p}.seller`).value ?? null,
          price:{
            amount:money(`${price}.amount`),currency:requiredText(`${price}.currency`),amount_irr:money(`${price}.amount_irr`),
            amount_cny:optionalMoney(`${price}.amount_cny`),has_discount:bool(`${price}.has_discount`),
            original_amount:nullableMoney(`${price}.original_amount`),discount_amount:nullableMoney(`${price}.discount_amount`),
            discount_percentage:read(`${price}.discount_percentage`,z.number().min(0).max(100).nullable(),null),
          },
          guarantee:{available:bool(`${p}.guarantee.available`),type:nullableText(`${p}.guarantee.type`),label:nullableText(`${p}.guarantee.label`)},
          in_iranmobix_inventory:bool(`${p}.in_iranmobix_inventory`),official_url:string(`${p}.official_url`),marketable:bool(`${p}.marketable`),
        },
        selected_options:{color:get(`${selected}.color`).value ?? null,guarantee:get(`${selected}.guarantee`).value ?? null,attributes},
        quantity:number(`${path}.quantity`),
        availability:{marketable:bool(`${availability}.marketable`),available_quantity:read(`${availability}.available_quantity`,count.nullable(),null),is_available:bool(`${availability}.is_available`)},
        pricing:{
          currency:get(`${pricing}.currency`).exists ? requiredText(`${pricing}.currency`) : undefined,
          base_price_irr:optionalMoney(`${pricing}.base_price_irr`),unit_price_irr:optionalMoney(`${pricing}.unit_price_irr`),
          unit_discount_amount_irr:optionalMoney(`${pricing}.unit_discount_amount_irr`),final_unit_price_irr:optionalMoney(`${pricing}.final_unit_price_irr`),
          total_discount_amount_irr:optionalMoney(`${pricing}.total_discount_amount_irr`),final_total_price_irr:optionalMoney(`${pricing}.final_total_price_irr`),
          priced_at:read(`${pricing}.priced_at`,timestamp,""),base_price:money(`${pricing}.base_price`),unit_price:money(`${pricing}.unit_price`),
          final_unit_price:money(`${pricing}.final_unit_price`),final_total_price:money(`${pricing}.final_total_price`),
          is_available:bool(`${pricing}.is_available`),available_quantity:read(`${pricing}.available_quantity`,count.nullable(),null),
          effective_discount:get(`${pricing}.effective_discount`).value ?? null,color_price_increase:money(`${pricing}.color_price_increase`),
          unit_discount_amount:money(`${pricing}.unit_discount_amount`),total_discount_amount:money(`${pricing}.total_discount_amount`),
          guarantee_price_increase:money(`${pricing}.guarantee_price_increase`),attributes_price_increase:money(`${pricing}.attributes_price_increase`),inventory_tracking_enabled:bool(`${pricing}.inventory_tracking_enabled`),
        },
        issues:strings(`${path}.issues`),updated_at:read(`${path}.updated_at`,timestamp,""),
      };
      for (const key of [`${p}.image`,`${p}.seller`,`${selected}.color`,`${selected}.guarantee`]) {
        const {value} = get(key);
        if (value == null || (typeof value === "string" && !value.trim()) || (Array.isArray(value) && value.length === 0)) note(key);
      }
      return result;
    }),
  };
  const cart = mapCart(raw);
  cart.dataIssues = diagnostics.filter((issue) => !issue.path.startsWith("items."));
  const ids = new Map<string,number>();
  cart.items.forEach((item) => ids.set(item.id,(ids.get(item.id) ?? 0) + 1));
  cart.items.forEach((item,index) => {
    const prefix = `items.${index}.`;
    item.dataIssues = diagnostics.filter((issue) => issue.path === `items.${index}` || issue.path.startsWith(prefix)).map((issue) => ({...issue,path:issue.path === `items.${index}` ? "" : issue.path.slice(prefix.length)}));
    if (!/^[1-9]\d*$/.test(item.id) || (ids.get(item.id) ?? 0) > 1) {
      item.displayId = `incomplete-cart-row-${index}`;
      if (!item.dataIssues.some((issue) => issue.path === "id")) item.dataIssues.push({path:"id",status:"invalid"});
    }
  });
  return cart;
}
