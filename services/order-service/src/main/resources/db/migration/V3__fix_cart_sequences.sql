-- Fix cart sequence values after manual inserts

DO $$
BEGIN
  IF to_regclass('public.carts_id_seq') IS NOT NULL THEN
    PERFORM setval(
      'public.carts_id_seq',
      COALESCE((SELECT MAX(id) FROM carts), 0) + 1,
      false
    );
  END IF;

  IF to_regclass('public.cart_items_id_seq') IS NOT NULL THEN
    PERFORM setval(
      'public.cart_items_id_seq',
      COALESCE((SELECT MAX(id) FROM cart_items), 0) + 1,
      false
    );
  END IF;
END $$;
