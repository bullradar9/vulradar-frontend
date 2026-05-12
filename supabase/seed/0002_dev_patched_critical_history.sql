-- frontend/supabase/seed/0002_dev_patched_critical_history.sql
--
-- DEV SEED — datos SINTÉTICOS para la métrica "Tiempo medio de resolución
-- de alertas críticas" del Informe NIS2 (Art. 21.2.f).
--
-- Tenant: jose99segura@gmail.com (7c66a774-2839-4793-8e10-bfa75bd1013a).
-- Crea 1 device + 1 scan + 25 alertas con status='patched' repartidas en
-- los últimos 90 días, con priority_score >= 9.0 y tiempos de resolución
-- variados para que la media tenga sentido estadístico.
--
-- DISTRIBUCIÓN (25 alertas críticas resueltas):
--   ·  8 rápidas  → 1-3 días entre created_at y updated_at
--   · 10 medias   → 4-10 días
--   ·  7 lentas   → 15-30 días
-- Media teórica esperada ≈ 9,5 días.
--
-- WARNING: dev only. NO ejecutar en producción.
-- El schema NO tiene flag `is_synthetic`. La marca de "sintético" es
-- exclusivamente documental + device_name = 'synthetic-patched-history'.

DO $$
DECLARE
  v_tenant UUID := '7c66a774-2839-4793-8e10-bfa75bd1013a';
  v_dev    UUID := gen_random_uuid();
  v_scan   UUID := gen_random_uuid();
BEGIN
  INSERT INTO public.devices
    (id, tenant_id, agent_id, device_name, os, os_version, architecture, agent_version, last_scanned, created_at)
  VALUES
    (v_dev, v_tenant, gen_random_uuid(),
     'synthetic-patched-history', 'windows', 'Windows 11 23H2 build 22631',
     'x64', '0.5.0', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '95 days');

  INSERT INTO public.scans
    (id, tenant_id, device_id, status, software_count, alerts_generated, started_at, completed_at)
  VALUES
    (v_scan, v_tenant, v_dev, 'completed', 80, 25,
     NOW() - INTERVAL '1 hour' - INTERVAL '90 seconds', NOW() - INTERVAL '1 hour');

  -- 25 alertas críticas resueltas. updated_at = created_at + resolution_days.
  INSERT INTO public.client_alerts
    (tenant_id, device_id, scan_id, alert_type, software_name, software_version,
     cve_id, cvss_score, cvss_severity, in_cisa_kev, priority_score, status,
     created_at, updated_at)
  SELECT
    v_tenant, v_dev, v_scan, 'cve', s.software, s.version,
    s.cve, s.score, 'critical', s.kev, s.score, 'patched',
    s.created_at, s.created_at + (s.resolution_days || ' days')::INTERVAL
  FROM (VALUES
    -- 8 rápidas (1-3 días)
    ('chrome',  '128.0.6613.84',  'CVE-2024-7971',  9.6, TRUE,  NOW() - INTERVAL '87 days', 2),
    ('firefox', '127.0.1',        'CVE-2024-6604',  9.0, FALSE, NOW() - INTERVAL '80 days', 1),
    ('office',  '16.0.17029.20',  'CVE-2024-43505', 9.8, FALSE, NOW() - INTERVAL '75 days', 3),
    ('chrome',  '129.0.6668.69',  'CVE-2024-9120',  9.2, FALSE, NOW() - INTERVAL '68 days', 1),
    ('dotnet',  '6.0.20',         'CVE-2024-30045', 9.3, FALSE, NOW() - INTERVAL '60 days', 2),
    ('firefox', '128.0',          'CVE-2024-7522',  9.5, TRUE,  NOW() - INTERVAL '52 days', 3),
    ('office',  '16.0.17328.20',  'CVE-2024-38200', 9.1, FALSE, NOW() - INTERVAL '40 days', 2),
    ('chrome',  '130.0.6723.59',  'CVE-2024-10487', 9.7, FALSE, NOW() - INTERVAL '25 days', 1),
    -- 10 medias (4-10 días)
    ('office',  '16.0.16626.20',  'CVE-2024-26168', 9.4, FALSE, NOW() - INTERVAL '88 days', 6),
    ('dotnet',  '7.0.10',         'CVE-2024-21319', 9.0, FALSE, NOW() - INTERVAL '82 days', 5),
    ('chrome',  '127.0.6533.122', 'CVE-2024-7965',  9.0, FALSE, NOW() - INTERVAL '74 days', 7),
    ('firefox', '125.0.3',        'CVE-2024-3859',  9.5, FALSE, NOW() - INTERVAL '66 days', 4),
    ('office',  '16.0.16731.20',  'CVE-2024-30060', 9.2, FALSE, NOW() - INTERVAL '58 days', 8),
    ('dotnet',  '8.0.0',          'CVE-2024-0057',  9.1, FALSE, NOW() - INTERVAL '50 days', 10),
    ('chrome',  '128.0.6613.137', 'CVE-2024-8198',  9.3, FALSE, NOW() - INTERVAL '42 days', 6),
    ('firefox', '129.0',          'CVE-2024-8385',  9.0, FALSE, NOW() - INTERVAL '34 days', 9),
    ('office',  '16.0.17029.21',  'CVE-2024-38021', 9.8, FALSE, NOW() - INTERVAL '24 days', 5),
    ('dotnet',  '6.0.25',         'CVE-2024-21386', 9.4, FALSE, NOW() - INTERVAL '18 days', 7),
    -- 7 lentas (15-30 días)
    ('office',  '16.0.15601.20',  'CVE-2024-20677', 9.0, FALSE, NOW() - INTERVAL '85 days', 28),
    ('dotnet',  '4.7.2',          'CVE-2024-29059', 9.1, FALSE, NOW() - INTERVAL '78 days', 22),
    ('chrome',  '126.0.6478.114', 'CVE-2024-6100',  9.3, TRUE,  NOW() - INTERVAL '70 days', 17),
    ('firefox', '124.0.2',        'CVE-2024-2607',  9.0, FALSE, NOW() - INTERVAL '62 days', 25),
    ('office',  '16.0.16924.20',  'CVE-2024-30103', 9.5, FALSE, NOW() - INTERVAL '55 days', 19),
    ('dotnet',  '7.0.5',          'CVE-2024-21320', 9.0, FALSE, NOW() - INTERVAL '46 days', 30),
    ('chrome',  '127.0.6533.88',  'CVE-2024-7532',  9.2, FALSE, NOW() - INTERVAL '38 days', 15)
  ) AS s(software, version, cve, score, kev, created_at, resolution_days);

END $$;
