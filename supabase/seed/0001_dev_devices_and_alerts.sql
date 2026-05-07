-- frontend/supabase/seed/0001_dev_devices_and_alerts.sql
--
-- Dev seed: synthetic devices and alerts for testing the /devices UI.
-- Tenant: jose99segura@gmail.com (7c66a774-2839-4793-8e10-bfa75bd1013a).
-- Adds 7 devices alongside any existing real ones in that tenant.
--
-- WARNING: dev only. Do NOT run on production tenants.
-- Re-running generates new UUIDs and APPENDS more devices/alerts (not idempotent).
--
-- Software canonical names follow the agent's curated table (docs/tech/agent.md).
-- Mapping was cross-checked against existing real-scan data on jose99segura
-- to avoid divergence (e.g. 'nodejs' not 'node', 'acrobat-reader' not 'acrobat').

DO $$
DECLARE
  v_tenant UUID := '7c66a774-2839-4793-8e10-bfa75bd1013a';

  v_dev_marketing UUID := gen_random_uuid();
  v_dev_ana       UUID := gen_random_uuid();
  v_dev_luis      UUID := gen_random_uuid();
  v_dev_old       UUID := gen_random_uuid();
  v_dev_files     UUID := gen_random_uuid();
  v_dev_new       UUID := gen_random_uuid();
  v_dev_clean     UUID := gen_random_uuid();

  v_scan_marketing UUID := gen_random_uuid();
  v_scan_ana       UUID := gen_random_uuid();
  v_scan_luis      UUID := gen_random_uuid();
  v_scan_old       UUID := gen_random_uuid();
  v_scan_files     UUID := gen_random_uuid();
  v_scan_clean     UUID := gen_random_uuid();
BEGIN
  -- ============== DEVICES ==============
  INSERT INTO public.devices (id, tenant_id, agent_id, device_name, os, os_version, architecture, agent_version, last_scanned, created_at) VALUES
    (v_dev_marketing, v_tenant, gen_random_uuid(), 'nuc-marketing',  'windows', 'Windows 11 23H2 build 22631', 'x64',   '0.5.0', NOW() - INTERVAL '2 hours',   NOW() - INTERVAL '14 days'),
    (v_dev_ana,       v_tenant, gen_random_uuid(), 'laptop-ana',     'windows', 'Windows 11 23H2 build 22631', 'x64',   '0.5.0', NOW() - INTERVAL '1 day',     NOW() - INTERVAL '30 days'),
    (v_dev_luis,      v_tenant, gen_random_uuid(), 'laptop-luis',    'windows', 'Windows 11 23H2 build 22631', 'arm64', '0.5.0', NOW() - INTERVAL '2 days',    NOW() - INTERVAL '20 days'),
    (v_dev_old,       v_tenant, gen_random_uuid(), 'desktop-old',    'windows', 'Windows 10 22H2 build 19045', 'x64',   '0.4.1', NOW() - INTERVAL '12 days',   NOW() - INTERVAL '90 days'),
    (v_dev_files,     v_tenant, gen_random_uuid(), 'srv-files',      'windows', 'Windows 10 22H2 build 19045', 'x64',   '0.4.1', NOW() - INTERVAL '21 days',   NOW() - INTERVAL '120 days'),
    (v_dev_new,       v_tenant, gen_random_uuid(), 'nuevo-portatil', 'windows', 'Windows 11 24H2 build 26100', 'arm64', '0.5.0', NULL,                           NOW() - INTERVAL '3 hours'),
    (v_dev_clean,     v_tenant, gen_random_uuid(), 'desktop-clean',  'windows', 'Windows 11 23H2 build 22631', 'x64',   '0.5.0', NOW() - INTERVAL '3 hours',   NOW() - INTERVAL '60 days');

  -- ============== SCANS ==============
  INSERT INTO public.scans (id, tenant_id, device_id, status, software_count, alerts_generated, started_at, completed_at) VALUES
    (v_scan_marketing, v_tenant, v_dev_marketing, 'completed', 78,  12, NOW() - INTERVAL '2 hours' - INTERVAL '90 seconds',  NOW() - INTERVAL '2 hours'),
    (v_scan_ana,       v_tenant, v_dev_ana,       'completed', 92,  23, NOW() - INTERVAL '1 day' - INTERVAL '90 seconds',    NOW() - INTERVAL '1 day'),
    (v_scan_luis,      v_tenant, v_dev_luis,      'completed', 60,   5, NOW() - INTERVAL '2 days' - INTERVAL '60 seconds',   NOW() - INTERVAL '2 days'),
    (v_scan_old,       v_tenant, v_dev_old,       'completed', 110, 40, NOW() - INTERVAL '12 days' - INTERVAL '180 seconds', NOW() - INTERVAL '12 days'),
    (v_scan_files,     v_tenant, v_dev_files,     'completed', 45,   3, NOW() - INTERVAL '21 days' - INTERVAL '60 seconds',  NOW() - INTERVAL '21 days'),
    (v_scan_clean,     v_tenant, v_dev_clean,     'completed', 70,   5, NOW() - INTERVAL '3 hours' - INTERVAL '90 seconds',  NOW() - INTERVAL '3 hours');

  -- ============== ALERTS: nuc-marketing (12 open) ==============
  INSERT INTO public.client_alerts (tenant_id, device_id, scan_id, alert_type, software_name, software_version, cve_id, cvss_score, cvss_severity, in_cisa_kev, fix_version, latest_stable, latest_version, eol_date, versions_behind, priority_score, status) VALUES
    (v_tenant, v_dev_marketing, v_scan_marketing, 'cve',      'chrome',         '128.0.6613.84',    'CVE-2024-7971',  9.6, 'critical', TRUE,  '128.0.6613.137', NULL,    NULL,    NULL,         NULL, 10.0, 'open'),
    (v_tenant, v_dev_marketing, v_scan_marketing, 'cve',      'firefox',        '127.0',            'CVE-2024-6604',  8.1, 'high',     FALSE, '128.0',          NULL,    NULL,    NULL,         NULL, 8.1,  'open'),
    (v_tenant, v_dev_marketing, v_scan_marketing, 'cve',      'edge',           '127.0.2651.74',    'CVE-2024-7969',  7.5, 'high',     FALSE, '128.0.2739.42',  NULL,    NULL,    NULL,         NULL, 7.5,  'open'),
    (v_tenant, v_dev_marketing, v_scan_marketing, 'cve',      'acrobat-reader', '24.001.20612',     'CVE-2024-39383', 6.1, 'medium',   FALSE, NULL,             NULL,    NULL,    NULL,         NULL, 6.1,  'open'),
    (v_tenant, v_dev_marketing, v_scan_marketing, 'cve',      'zoom',           '5.17.11.34207',    'CVE-2024-24690', 7.1, 'high',     FALSE, '5.18.0',         NULL,    NULL,    NULL,         NULL, 7.1,  'open'),
    (v_tenant, v_dev_marketing, v_scan_marketing, 'cve',      'java',           '17.0.10',          'CVE-2024-21002', 5.3, 'medium',   FALSE, NULL,             NULL,    NULL,    NULL,         NULL, 5.3,  'open'),
    (v_tenant, v_dev_marketing, v_scan_marketing, 'cve',      '7zip',           '23.01',            'CVE-2024-11477', 8.8, 'high',     FALSE, '24.07',          NULL,    NULL,    NULL,         NULL, 8.8,  'open'),
    (v_tenant, v_dev_marketing, v_scan_marketing, 'cve',      'putty',          '0.80',             'CVE-2024-31497', 6.5, 'high',     FALSE, '0.81',           NULL,    NULL,    NULL,         NULL, 7.5,  'open'),
    (v_tenant, v_dev_marketing, v_scan_marketing, 'eol',      'dotnet',         '4.7.2',             NULL,            NULL, NULL,      FALSE, NULL,             NULL,    '4.8.1', '2022-04-26', NULL, 6.0,  'open'),
    (v_tenant, v_dev_marketing, v_scan_marketing, 'outdated', 'nodejs',         '18.20.4',           NULL,            NULL, NULL,      FALSE, NULL,             '20.18.0',NULL,    NULL,         2,    4.5,  'open'),
    (v_tenant, v_dev_marketing, v_scan_marketing, 'outdated', 'python',         '3.11.9',            NULL,            NULL, NULL,      FALSE, NULL,             '3.13.0', NULL,    NULL,         2,    4.0,  'open'),
    (v_tenant, v_dev_marketing, v_scan_marketing, 'outdated', 'vlc',            '3.0.20',            NULL,            NULL, NULL,      FALSE, NULL,             '3.0.21', NULL,    NULL,         1,    3.5,  'open');

  -- ============== ALERTS: laptop-ana (23 open) ==============
  INSERT INTO public.client_alerts (tenant_id, device_id, scan_id, alert_type, software_name, software_version, cve_id, cvss_score, cvss_severity, in_cisa_kev, priority_score, status) VALUES
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'office',          '16.0.17029.20108', 'CVE-2024-43505',  9.8, 'critical', FALSE, 9.8, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'firefox',         '125.0',            'CVE-2024-3859',   9.5, 'critical', FALSE, 9.5, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'chrome',          '127.0.6533.122',   'CVE-2024-7965',   9.0, 'critical', FALSE, 9.0, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'edge',            '125.0.2535.92',    'CVE-2024-5274',   8.3, 'high',     FALSE, 8.3, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'acrobat-reader',  '24.001.20629',     'CVE-2024-39379',  8.6, 'high',     FALSE, 8.6, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'java',            '17.0.10',          'CVE-2024-21068',  7.8, 'high',     FALSE, 7.8, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'putty',           '0.79',             'CVE-2024-31496',  8.0, 'high',     FALSE, 8.0, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'libreoffice',     '7.6.6',            'CVE-2024-3044',   7.2, 'high',     FALSE, 7.2, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'wireshark',       '4.0.13',           'CVE-2024-2955',   7.5, 'high',     FALSE, 7.5, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'openssh',         '8.9p1',            'CVE-2024-6387',   8.1, 'high',     FALSE, 8.1, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'nodejs',          '20.10.0',          'CVE-2024-22019',  7.5, 'high',     FALSE, 7.5, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'python',          '3.11.7',           'CVE-2024-0397',   6.2, 'medium',   FALSE, 6.2, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', '7zip',            '23.00',            'CVE-2024-11472',  5.5, 'medium',   FALSE, 5.5, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'git',             '2.43.0',           'CVE-2024-32002',  4.7, 'medium',   FALSE, 4.7, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'curl',            '8.5.0',            'CVE-2024-2398',   5.2, 'medium',   FALSE, 5.2, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'vlc',             '3.0.18',           'CVE-2024-0228',   6.5, 'medium',   FALSE, 6.5, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'docker-desktop',  '4.27.0',           'CVE-2024-0220',   5.9, 'medium',   FALSE, 5.9, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'zoom',            '5.16.6',           'CVE-2024-22251',  4.3, 'medium',   FALSE, 4.3, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'cve', 'slack',           '4.36.140',         'CVE-2024-22252',  5.0, 'medium',   FALSE, 5.0, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'eol', 'dotnet',          '4.7.2',            NULL,              NULL,'low',      FALSE, 6.0, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'eol', 'vcredist',        '14.32.31332',      NULL,              NULL,'low',      FALSE, 5.0, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'outdated', 'thunderbird','115.10.0',         NULL,              NULL, NULL,      FALSE, 3.5, 'open'),
    (v_tenant, v_dev_ana, v_scan_ana, 'outdated', 'filezilla',  '3.66.0',           NULL,              NULL, NULL,      FALSE, 3.0, 'open');

  -- ============== ALERTS: laptop-luis (5 open) ==============
  INSERT INTO public.client_alerts (tenant_id, device_id, scan_id, alert_type, software_name, software_version, cve_id, cvss_score, cvss_severity, in_cisa_kev, priority_score, status) VALUES
    (v_tenant, v_dev_luis, v_scan_luis, 'cve',      'chrome',   '129.0.6668.69', 'CVE-2024-9120',  7.5, 'high',   FALSE, 7.5, 'open'),
    (v_tenant, v_dev_luis, v_scan_luis, 'cve',      'firefox',  '130.0',         'CVE-2024-9402',  6.5, 'medium', FALSE, 6.5, 'open'),
    (v_tenant, v_dev_luis, v_scan_luis, 'cve',      'vlc',      '3.0.20',        'CVE-2024-46461', 5.0, 'medium', FALSE, 5.0, 'open'),
    (v_tenant, v_dev_luis, v_scan_luis, 'eol',      'python',   '3.7.16',        NULL,             NULL,'low',    FALSE, 5.5, 'open'),
    (v_tenant, v_dev_luis, v_scan_luis, 'outdated', 'nodejs',   '20.10.0',       NULL,             NULL, NULL,    FALSE, 3.5, 'open');

  -- ============== ALERTS: desktop-old (40 open: 10 hardcoded "famosos" + 26 sintéticas + 4 EOL/OUTDATED) ==============
  INSERT INTO public.client_alerts (tenant_id, device_id, scan_id, alert_type, software_name, software_version, cve_id, cvss_score, cvss_severity, in_cisa_kev, priority_score, status, created_at) VALUES
    (v_tenant, v_dev_old, v_scan_old, 'cve', 'windows',   '10.0.19045', 'CVE-2017-0144',  8.8, 'high',     TRUE,  10.0, 'open', NOW() - INTERVAL '12 days'),
    (v_tenant, v_dev_old, v_scan_old, 'cve', 'windows',   '10.0.19045', 'CVE-2019-0708',  9.8, 'critical', FALSE, 9.8,  'open', NOW() - INTERVAL '12 days'),
    (v_tenant, v_dev_old, v_scan_old, 'cve', 'log4j',     '2.10.0',     'CVE-2021-44228',10.0, 'critical', FALSE, 10.0, 'open', NOW() - INTERVAL '12 days'),
    (v_tenant, v_dev_old, v_scan_old, 'cve', 'openssl',   '1.0.2k',     'CVE-2014-0160',  7.5, 'high',     FALSE, 7.5,  'open', NOW() - INTERVAL '12 days'),
    (v_tenant, v_dev_old, v_scan_old, 'cve', 'teams',     '1.5.00.4855','CVE-2023-29328', 9.8, 'critical', FALSE, 9.8,  'open', NOW() - INTERVAL '12 days'),
    (v_tenant, v_dev_old, v_scan_old, 'cve', 'java',      '1.8.0_181',  'CVE-2018-3149',  9.0, 'critical', FALSE, 9.0,  'open', NOW() - INTERVAL '12 days'),
    (v_tenant, v_dev_old, v_scan_old, 'cve', 'flash',     '32.0.0.330', 'CVE-2019-7096',  9.8, 'critical', FALSE, 9.8,  'open', NOW() - INTERVAL '12 days'),
    (v_tenant, v_dev_old, v_scan_old, 'cve', 'office',    '15.0.4885',  'CVE-2020-1349',  9.0, 'critical', FALSE, 9.0,  'open', NOW() - INTERVAL '12 days'),
    (v_tenant, v_dev_old, v_scan_old, 'cve', 'putty',     '0.70',       'CVE-2019-9894',  6.5, 'medium',   FALSE, 6.5,  'open', NOW() - INTERVAL '12 days'),
    (v_tenant, v_dev_old, v_scan_old, 'cve', 'wireshark', '2.6.5',      'CVE-2019-5717',  5.0, 'medium',   FALSE, 5.0,  'open', NOW() - INTERVAL '12 days');

  INSERT INTO public.client_alerts (tenant_id, device_id, scan_id, alert_type, software_name, software_version, cve_id, cvss_score, cvss_severity, in_cisa_kev, priority_score, status, created_at)
  SELECT
    v_tenant, v_dev_old, v_scan_old, 'cve',
    'lib-x' || LPAD(i::text, 2, '0'),
    '1.0.' || (10 - (i % 10)),
    'CVE-2024-' || LPAD((20000 + i)::text, 5, '0'),
    CASE WHEN i <  6 THEN 9.5 WHEN i < 19 THEN 7.5 WHEN i < 23 THEN 5.5 ELSE 3.5 END,
    CASE WHEN i <  6 THEN 'critical' WHEN i < 19 THEN 'high' WHEN i < 23 THEN 'medium' ELSE 'low' END,
    FALSE,
    CASE WHEN i <  6 THEN 9.5 WHEN i < 19 THEN 7.5 WHEN i < 23 THEN 5.5 ELSE 3.5 END,
    'open',
    NOW() - INTERVAL '12 days'
  FROM generate_series(1, 26) i;

  INSERT INTO public.client_alerts (tenant_id, device_id, scan_id, alert_type, software_name, software_version, cve_id, cvss_score, cvss_severity, in_cisa_kev, priority_score, status, created_at) VALUES
    (v_tenant, v_dev_old, v_scan_old, 'eol',      'dotnet',  '3.5',          NULL, NULL, 'low', FALSE, 7.0, 'open', NOW() - INTERVAL '12 days'),
    (v_tenant, v_dev_old, v_scan_old, 'eol',      'python',  '2.7.18',       NULL, NULL, 'low', FALSE, 6.0, 'open', NOW() - INTERVAL '12 days'),
    (v_tenant, v_dev_old, v_scan_old, 'outdated', 'chrome',  '83.0.4103.97', NULL, NULL, NULL,  FALSE, 5.0, 'open', NOW() - INTERVAL '12 days'),
    (v_tenant, v_dev_old, v_scan_old, 'outdated', 'firefox', '78.0.2',       NULL, NULL, NULL,  FALSE, 5.0, 'open', NOW() - INTERVAL '12 days');

  -- ============== ALERTS: srv-files (3 open) ==============
  INSERT INTO public.client_alerts (tenant_id, device_id, scan_id, alert_type, software_name, software_version, cve_id, cvss_score, cvss_severity, in_cisa_kev, priority_score, status, created_at) VALUES
    (v_tenant, v_dev_files, v_scan_files, 'cve',      'windows',        '10.0.19045', 'CVE-2024-38063', 9.8, 'critical', FALSE, 9.8, 'open', NOW() - INTERVAL '21 days'),
    (v_tenant, v_dev_files, v_scan_files, 'eol',      'windows-server', '2012',       NULL,              NULL,'low',     FALSE, 7.0, 'open', NOW() - INTERVAL '21 days'),
    (v_tenant, v_dev_files, v_scan_files, 'outdated', 'openssh',        '7.4p1',      NULL,              NULL, NULL,     FALSE, 4.0, 'open', NOW() - INTERVAL '21 days');

  -- ============== ALERTS: desktop-clean (5 patched, 0 open) ==============
  INSERT INTO public.client_alerts (tenant_id, device_id, scan_id, alert_type, software_name, software_version, cve_id, cvss_score, cvss_severity, in_cisa_kev, priority_score, status, created_at) VALUES
    (v_tenant, v_dev_clean, v_scan_clean, 'cve',      'chrome',  '129.0.6668.100', 'CVE-2024-9123',  6.5, 'medium', FALSE, 6.5, 'patched', NOW() - INTERVAL '5 days'),
    (v_tenant, v_dev_clean, v_scan_clean, 'cve',      'firefox', '130.0',          'CVE-2024-9405',  7.5, 'high',   FALSE, 7.5, 'patched', NOW() - INTERVAL '5 days'),
    (v_tenant, v_dev_clean, v_scan_clean, 'cve',      '7zip',    '24.07',          'CVE-2024-11470', 8.0, 'high',   FALSE, 8.0, 'patched', NOW() - INTERVAL '5 days'),
    (v_tenant, v_dev_clean, v_scan_clean, 'eol',      'dotnet',  '4.6.2',          NULL,             NULL,'low',    FALSE, 6.0, 'patched', NOW() - INTERVAL '10 days'),
    (v_tenant, v_dev_clean, v_scan_clean, 'outdated', 'nodejs',  '20.10.0',        NULL,             NULL, NULL,    FALSE, 3.5, 'patched', NOW() - INTERVAL '10 days');

END $$;
