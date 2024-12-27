INSERT INTO locations
(updated, location_id, location_name, is_inventory, refrigerated)
VALUES
('2024-12-26 10:30:00', 'STORE',        'Unassigned storage location',      'YES', 'NO' ),
('2024-12-26 10:30:00', 'REFRIGERATED', 'Unassigned refrigerated location', 'YES', 'YES'),
('2024-12-26 10:30:00', 'INBOUND',      'Arrival dock',                     'YES', 'NO' ),
('2024-12-26 10:30:00', 'PREPARATION',  'Preparation area',                 'NO',  'NO' ),
('2024-12-26 10:30:00', 'PACKAGING',    'Packaging area',                   'NO',  'NO' ),
('2024-12-26 10:30:00', 'OUTBOUND',     'Departure dock',                   'NO',  'NO' ),
('2024-12-26 10:30:00', 'TRANSIT',      'Goods in transit',                 'NO',  'NO' ),
('2024-12-26 10:30:00', 'WASTE',        'Waste area',                       'NO',  'NO' );
