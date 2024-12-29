INSERT INTO locations
(location_id, location_name, is_inventory, refrigerated)
VALUES
('STORE',        'Unassigned storage location',      'YES', 'NO' ),
('REFRIGERATED', 'Unassigned refrigerated location', 'YES', 'YES'),
('INBOUND',      'Arrival dock',                     'YES', 'NO' ),
('PREPARATION',  'Preparation area',                 'NO',  'NO' ),
('PACKAGING',    'Packaging area',                   'NO',  'NO' ),
('OUTBOUND',     'Departure dock',                   'NO',  'NO' ),
('TRANSIT',      'Goods in transit',                 'NO',  'NO' ),
('WASTE',        'Waste area',                       'NO',  'NO' );
