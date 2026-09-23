export type BlueprintOrder = {
  id: string;
  order_reference: string;
  client_name: string | null;
  client_email: string;
  unlock_price_centavos: number;
  drive_file_id: string;
  status: "pending" | "paid";
  paymongo_payment_intent_id: string | null;
  created_at: string;
  paid_at: string | null;
};

export type PaymongoWebhookEvent = {
  id: string;
  type: string;
  data: {
    id: string;
    attributes: {
      type: string;
      amount: number;
      metadata?: { order_reference?: string };
    };
  };
};
