-- TaxPilot AI tax rule registry seed data
-- Requires docs/supabase-tax-rules-schema.sql first.

insert into public.tax_sources (id, label, source_type, jurisdiction, official_url, verified_at, notes) values
  ('de-estg-4', 'EStG section 4', 'statute', 'DE', 'https://www.gesetze-im-internet.de/estg/__4.html', '2026-07-07', 'Business purpose and sensitive expense review.'),
  ('de-estg-6', 'EStG section 6', 'statute', 'DE', 'https://www.gesetze-im-internet.de/estg/__6.html', '2026-07-07', 'Equipment and asset review.'),
  ('de-ustg-14', 'UStG section 14', 'statute', 'DE', 'https://www.gesetze-im-internet.de/ustg_1980/__14.html', '2026-07-07', 'Invoice completeness and electronic invoice context.'),
  ('de-ustdv-33', 'UStDV section 33', 'statute', 'DE', 'https://www.gesetze-im-internet.de/ustdv_1980/__33.html', '2026-07-07', 'Small amount invoice path.'),
  ('de-ao-147', 'AO section 147', 'statute', 'DE', 'https://www.gesetze-im-internet.de/ao_1977/__147.html', '2026-07-07', 'Retention and evidence availability.'),
  ('de-bmf-gobd', 'BMF GoBD', 'administrative_guidance', 'DE', 'https://ao.bundesfinanzministerium.de/ao/2023/Anhaenge/BMF-Schreiben-und-gleichlautende-Laendererlasse/Anhang-64/inhalt.html', '2026-07-07', 'Electronic record traceability and auditability reminders.')
on conflict (id) do update set
  label = excluded.label,
  source_type = excluded.source_type,
  official_url = excluded.official_url,
  verified_at = excluded.verified_at,
  notes = excluded.notes,
  updated_at = now();

insert into public.tax_rules (id, title, category, jurisdiction, review_level, app_action, status, version, notes) values
  ('de-business-purpose-v2', 'Business purpose documentation', 'General expense', 'DE', 'medium', 'Ask for business context before export readiness.', 'active', '2026-07-07', 'Fallback rule for ordinary expense context.'),
  ('de-business-meal-v2', 'Business meal documentation', 'Business meals', 'DE', 'high', 'Require attendee and purpose fields and keep accountant review flag.', 'active', '2026-07-07', 'Business meals remain review-sensitive.'),
  ('de-equipment-asset-v2', 'Equipment and asset treatment review', 'Hardware / equipment', 'DE', 'high', 'Ask for business-use percentage and flag higher-value assets.', 'active', '2026-07-07', 'Avoid final depreciation or immediate-deduction conclusions.'),
  ('de-invoice-completeness-v2', 'Invoice completeness check', 'Invoice evidence', 'DE', 'medium', 'Surface missing invoice fields before export.', 'active', '2026-07-07', 'Invoice evidence check only; no VAT certainty.'),
  ('de-small-amount-invoice-v1', 'Small amount invoice path', 'Invoice evidence', 'DE', 'medium', 'Use separate simplified invoice checklist.', 'active', '2026-07-07', 'Separate small-amount invoice handling.'),
  ('de-home-office-v1', 'Home office special review', 'Rent / home office', 'DE', 'professional_review', 'Collect workspace facts but keep treatment behind review.', 'active', '2026-07-07', 'Home office is review-sensitive.'),
  ('de-gifts-v1', 'Gifts and client presents review', 'Marketing', 'DE', 'high', 'Ask for recipient and amount context; avoid threshold conclusions.', 'active', '2026-07-07', 'Threshold-sensitive category.'),
  ('de-travel-v1', 'Travel business context', 'Travel', 'DE', 'medium', 'Ask for trip purpose and mixed-use context.', 'active', '2026-07-07', 'Travel requires purpose and mixed-use review.'),
  ('de-electronic-invoice-v1', 'Electronic invoice readiness', 'Invoice evidence', 'DE', 'medium', 'Capture evidence format and source file availability.', 'active', '2026-07-07', 'Do not treat PDF as automatically compliant.'),
  ('de-retention-v2', 'Retention and electronic evidence', 'Record retention', 'DE', 'medium', 'Preserve export metadata and original-evidence reminders.', 'active', '2026-07-07', 'No GoBD certification claim.')
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  review_level = excluded.review_level,
  app_action = excluded.app_action,
  status = excluded.status,
  version = excluded.version,
  notes = excluded.notes,
  updated_at = now();

insert into public.tax_rule_sources (rule_id, source_id, relevance_note) values
  ('de-business-purpose-v2', 'de-estg-4', 'Business-purpose source anchor.'),
  ('de-business-meal-v2', 'de-estg-4', 'Meal and restricted expense review anchor.'),
  ('de-business-meal-v2', 'de-ustg-14', 'Invoice evidence anchor.'),
  ('de-equipment-asset-v2', 'de-estg-6', 'Asset treatment source anchor.'),
  ('de-invoice-completeness-v2', 'de-ustg-14', 'Invoice field source anchor.'),
  ('de-small-amount-invoice-v1', 'de-ustdv-33', 'Small amount invoice source anchor.'),
  ('de-small-amount-invoice-v1', 'de-ustg-14', 'Invoice context source anchor.'),
  ('de-home-office-v1', 'de-estg-4', 'Home-office review source anchor.'),
  ('de-gifts-v1', 'de-estg-4', 'Gift review source anchor.'),
  ('de-travel-v1', 'de-estg-4', 'Travel purpose source anchor.'),
  ('de-electronic-invoice-v1', 'de-ustg-14', 'Electronic invoice source anchor.'),
  ('de-electronic-invoice-v1', 'de-bmf-gobd', 'Electronic record source anchor.'),
  ('de-retention-v2', 'de-ao-147', 'Retention source anchor.'),
  ('de-retention-v2', 'de-bmf-gobd', 'Electronic record source anchor.')
on conflict (rule_id, source_id) do update set relevance_note = excluded.relevance_note;

insert into public.tax_rule_mappings (app_category, rule_id, priority, is_default) values
  ('General expense', 'de-business-purpose-v2', 100, true),
  ('Business meals', 'de-business-meal-v2', 10, true),
  ('Hardware / equipment', 'de-equipment-asset-v2', 10, true),
  ('Invoice evidence', 'de-invoice-completeness-v2', 10, true),
  ('Small amount invoice', 'de-small-amount-invoice-v1', 10, true),
  ('Rent / home office', 'de-home-office-v1', 10, true),
  ('Marketing', 'de-gifts-v1', 20, false),
  ('Travel', 'de-travel-v1', 10, true),
  ('Invoice evidence', 'de-electronic-invoice-v1', 20, false),
  ('Record retention', 'de-retention-v2', 10, true)
on conflict (app_category, rule_id) do update set
  priority = excluded.priority,
  is_default = excluded.is_default;
