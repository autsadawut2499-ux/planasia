-- Document hardcopy-3sets upsell stored in cart_orders.addons jsonb
-- (alongside boq-bundle). No schema change required; addons already jsonb.
comment on column public.cart_orders.addons is
  'Upsell addon ids JSON array, e.g. ["boq-bundle","hardcopy-3sets"]';
