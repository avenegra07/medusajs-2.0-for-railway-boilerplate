export type BookingAvailabilityLayerDTO = {
  source_type: "base" | "availability_rule" | "allocation";
  source_id?: string;
  source_name?: string;
  effect: "grant" | "block";
  priority: number;
  time_range: { start: string; end: string };
  metadata?: {
    allocation_type?: "reservation" | "booking" | "maintenance";
    allocation_status?: string;
    [key: string]: unknown;
  };
};

export type BookingAvailabilitySlot = {
  start: string;
  end: string;
  available: boolean;
  layers: BookingAvailabilityLayerDTO[];
  effective_layer?: BookingAvailabilityLayerDTO;
};

export type BookingAvailabilityDTO = {
  date: string;
  is_available: boolean;
  slots: BookingAvailabilitySlot[];
  layers?: BookingAvailabilityLayerDTO[];
  effective_layer?: BookingAvailabilityLayerDTO;
  view?: "month" | "week" | "day";
};

export type GetBookingResourceAvailabilityResponse = {
  booking_resource: Record<string, unknown>;
  availability: BookingAvailabilityDTO[];
  resolved_rules?: {
    require_payment?: boolean;
    reservation_ttl_seconds?: number;
    require_confirmation?: boolean;
    custom_config?: Record<string, unknown>;
  };
};
