export enum BookingResourcePricingConfigUnit {
  second = "second",
  minute = "minute",
  hour = "hour",
  day = "day",
  custom = "custom",
}

export type BookingResourcePricingConfigDTO = {
  id: string;
  unit: BookingResourcePricingConfigUnit;
  unit_value: number;
  metadata?: Record<string, string>;
};

export type BookingResourcePricingDTO = {
  amount: number;
  currency_code: string;
};

export type BookingResourceAllocationDTO = {
  id: string;
  start_time: string;
  end_time: string;
  expires_at?: string;
  status: string;
  metadata?: Record<string, string>;
};

export type BookingResourceAvailabilityRuleDTO = {
  id: string;
  rule_type: string;
  name: string;
  description?: string;
  effect: string;
  priority: number;
  valid_from: string;
  valid_until: string;
  configuration: Record<string, string>;
  is_active: boolean;
  metadata?: Record<string, string>;
};

export type BookingResourceDTO = {
  id: string;
  resource_type: string;
  is_bookable: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  product_id?: string;
  pricing_unit?: string;
  pricing_unit_value?: number;
  status?: string;
  metadata?: Record<string, string>;
  booking_resource_availability_rules?: BookingResourceAvailabilityRuleDTO[];
  booking_resource_allocations?: BookingResourceAllocationDTO[];
  booking_resource_pricing_configs?: BookingResourcePricingConfigDTO[];
  product_title?: string;
  product?: ProductDTO;
};

export type ProductDTO = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  handle?: string;
  thumbnail?: string;
};

/** Single item from GET /store/booking-resources (list) */
export type BookingResourceListItem = {
  booking_resource: BookingResourceDTO;
  product?: ProductDTO;
};

/** Response from GET /store/booking-resources/{id} */
export type GetBookingResourceResponse = {
  bookingResource: BookingResourceDTO;
  product?: ProductDTO;
};
