-- ============================================================================
--
-- Module      : wmslite.sql
-- Version     : 3.0R0.0
-- SQL version : SQLITE 3
--
-- Author      : Denis Patrice <denispatrice@yahoo.com>
-- Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2024
--               All rights reserved
--
-- Application : WMS IMS Lite
-- Description : Database support
--
-- Date+Time of change   By     Description
-- --------------------- ------ ----------------------------------------------
-- 26-Dec-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
--
-- ============================================================================

-- ****************************************************************************
-- ****************************************************************************
--
-- BUSINESS
--
-- ****************************************************************************
-- ****************************************************************************

DROP TABLE IF EXISTS business;
CREATE TABLE IF NOT EXISTS business
(
	updated            TEXT DEFAULT '', -- Creation or update timestamp
	business_name      TEXT DEFAULT '', -- Business name
	business_address   TEXT DEFAULT '', -- Business address (multiline)
	business_LngLat    TEXT DEFAULT '', -- Longitude/latitude of business location (shareable)
	im_dataURL_fname   TEXT DEFAULT '', -- File storage for image/logo business dataURL
	bg_dataURL_fname   TEXT DEFAULT '', -- File storage for background image
	website            TEXT DEFAULT '', -- Official web site
	user_name          TEXT DEFAULT '', -- User name
	phone_no           TEXT DEFAULT '', -- User phone number
	user_dataURL_fname TEXT DEFAULT ''  -- File storage for User profile image dataURL
); 

INSERT INTO business
(updated, business_name, business_address, user_name, phone_no)
VALUES
('2024-12-26 10:30:00', 'My Business', 'Street-number-block-postcode-city', 'My Name', '');




DROP INDEX IF EXISTS Xproviders2;
DROP INDEX IF EXISTS Xproviders1;
DROP TABLE IF EXISTS providers;

CREATE TABLE IF NOT EXISTS providers
(
	updated          TEXT DEFAULT '', -- Creation or update timestamp
	provider_id      TEXT DEFAULT '', -- Provider identifier (generated, "0001", "0002", etc.)
	provider_name    TEXT DEFAULT '', -- Provider name
	provider_address TEXT DEFAULT ''  -- Provider address (multiline)
);

CREATE INDEX IF NOT EXISTS Xproviders1 ON providers(provider_id);
CREATE INDEX IF NOT EXISTS Xproviders2 ON providers(provider_name);




DROP INDEX IF EXISTS Xcustomers2;
DROP INDEX IF EXISTS Xcustomers1;
DROP TABLE IF EXISTS customers;

CREATE TABLE IF NOT EXISTS customers
(
	updated            TEXT DEFAULT '', -- Creation or update timestamp
	customer_id        TEXT DEFAULT '', -- customer identifier (generated, "0001", "0002", etc.)
	customer_name      TEXT DEFAULT '', -- customer name
	customer_address   TEXT DEFAULT ''  -- customer address (multiline)
);

CREATE INDEX IF NOT EXISTS Xcustomers1 ON customers(customer_id);
CREATE INDEX IF NOT EXISTS Xcustomers2 ON customers(customer_name);




DROP INDEX IF EXISTS Xtransporters2;
DROP INDEX IF EXISTS Xtransporters1;
DROP TABLE IF EXISTS transporters;

CREATE TABLE IF NOT EXISTS transporters
(
	updated             TEXT DEFAULT '', -- Creation or update timestamp
	transporter_id      TEXT DEFAULT '', -- transporter identifier (generated, "0001", "0002", etc.)
	transporter_name    TEXT DEFAULT '', -- transporter name
	transporter_address TEXT DEFAULT ''  -- transporter address (multiline)
);

CREATE INDEX IF NOT EXISTS Xtransporters1 ON transporters(transporter_id);
CREATE INDEX IF NOT EXISTS Xtransporters2 ON transporters(transporter_name);




-- ****************************************************************************
-- ****************************************************************************
--
-- INVENTORY
--
-- ****************************************************************************
-- ****************************************************************************

DROP INDEX IF EXISTS Xlocations1;
DROP TABLE IF EXISTS locations;

CREATE TABLE IF NOT EXISTS locations
(
	updated       TEXT DEFAULT '', -- Creation or update timestamp
	location_id   TEXT DEFAULT '', -- Location identifier
	location_name TEXT DEFAULT '', -- Name of the location
	is_inventory  TEXT DEFAULT '', -- "YES", "NO", "YES": The loccation counts as inventory location
	refrigerated  TEXT DEFAULT ''  -- "YES", "NO", "YES": The location is refrigerated
);

CREATE INDEX IF NOT EXISTS Xlocations1 ON locations(location_id);

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




DROP INDEX IF EXISTS Xproducts3;
DROP INDEX IF EXISTS Xproducts2;
DROP INDEX IF EXISTS Xproducts1;
DROP TABLE IF EXISTS products;

CREATE TABLE IF NOT EXISTS products
(
	updated             TEXT DEFAULT '', -- Creation or update timestamp
	barcode             TEXT DEFAULT '', -- Barcode value identifying the product
	product_id          TEXT DEFAULT '', -- Product identifier
	product_name        TEXT DEFAULT '', -- Product name
	product_description TEXT DEFAULT '', -- Textual product description
	im_dataURL_fname    TEXT DEFAULT '', -- File storage for product image dataURL
	storage_unit        TEXT DEFAULT '', -- Textual unit representation (uppercase always)
	reorder_quantity    TEXT DEFAULT '', -- Reorder minimal threshold
	refrigerated        TEXT DEFAULT ''  -- "YES", "NO", "YES": The product requires a refrigerated area
);

CREATE INDEX IF NOT EXISTS Xproducts1 ON products(product_id);
CREATE INDEX IF NOT EXISTS Xproducts2 ON products(product_name);
CREATE INDEX IF NOT EXISTS Xproducts3 ON products(barcode);



-- Inventory
-- History log
--
DROP INDEX IF EXISTS Xinventory4;
DROP INDEX IF EXISTS Xinventory3;
DROP INDEX IF EXISTS Xinventory2;
DROP INDEX IF EXISTS Xinventory1;
DROP TABLE IF EXISTS inventory;

CREATE TABLE IF NOT EXISTS inventory
(
	updated     TEXT DEFAULT '', -- Creation or update timestamp
	action_type TEXT DEFAULT '', -- Action type: "TAKING", "INBOUND", "PREPARATION", "MOVE", etc.
	DO          TEXT DEFAULT '', -- Delivery order identifier being in process at the moment of the action
	location_id TEXT DEFAULT '', -- Asociated location identifier
	product_id  TEXT DEFAULT '', -- Product identifier
	quantity    NUMERIC          -- Quantity on location
);

CREATE INDEX IF NOT EXISTS Xinventory1 ON inventory(updated);
CREATE INDEX IF NOT EXISTS Xinventory2 ON inventory(location_id);
CREATE INDEX IF NOT EXISTS Xinventory3 ON inventory(product_id);
CREATE INDEX IF NOT EXISTS Xinventory4 ON inventory(DO);




-- Cost of Goods on Stock PER UNIT (UNIT COST)
-- History log
-- Excepts waste products
--
DROP INDEX IF EXISTS Xcogs4;
DROP INDEX IF EXISTS Xcogs3;
DROP INDEX IF EXISTS Xcogs2;
DROP INDEX IF EXISTS Xcogs1;
DROP TABLE IF EXISTS cogs;

CREATE TABLE IF NOT EXISTS cogs
(
	updated           TEXT DEFAULT '', -- Creation or update timestamp
	product_id        TEXT DEFAULT '', -- Product identifier
	PO                TEXT DEFAULT '', -- Purchase order (PO) identifier
	DO                TEXT DEFAULT '', -- Delivery (DO) identifier (partial or complete)
	quantity_inbound  NUMERIC,         -- Quantity inbound/received
	unit_price        NUMERIC,         -- Unit price as of the PO
	quantity_on_stock NUMERIC,         -- Quantity already on stock
	previous_cogs     NUMERIC,         -- Current COGS applying to the quantity on stock
	computed_cogs     NUMERIC          -- Resulting COGS after inbound
);

CREATE INDEX IF NOT EXISTS Xcogs1 ON cogs(updated);
CREATE INDEX IF NOT EXISTS Xcogs2 ON cogs(product_id);
CREATE INDEX IF NOT EXISTS Xcogs3 ON cogs(PO);
CREATE INDEX IF NOT EXISTS Xcogs4 ON cogs(DO);




-- ****************************************************************************
-- ****************************************************************************
--
-- MOVEMENTS
--
-- ****************************************************************************
-- ****************************************************************************

DROP INDEX IF EXISTS Xmovements5;
DROP INDEX IF EXISTS Xmovements4;
DROP INDEX IF EXISTS Xmovements3;
DROP INDEX IF EXISTS Xmovements2;
DROP INDEX IF EXISTS Xmovements1;
DROP TABLE IF EXISTS movements;

CREATE TABLE IF NOT EXISTS movements
(
	updated           TEXT DEFAULT '', -- Creation or update timestamp
	on_action         TEXT DEFAULT '', -- One of action string values: "INBOUND","MOVE","PREPARE","SEND","WASTE", etc.
	PO                TEXT DEFAULT '', -- Associated PO number
	SO                TEXT DEFAULT '', -- Associated SO number
	DO                TEXT DEFAULT '', -- Associated delivery order (partial or full)
	product_id        TEXT DEFAULT '', -- Product identifier
	quantity_moved    NUMERIC,         -- Quantity moved
	from_location_id  TEXT DEFAULT '', -- Asociated "FROM" location identifier
	to_location_id    TEXT DEFAULT ''  -- Asociated "TO" location identifier
);

CREATE INDEX IF NOT EXISTS Xmovements1 ON movements(updated);
CREATE INDEX IF NOT EXISTS Xmovements2 ON movements(PO);
CREATE INDEX IF NOT EXISTS Xmovements3 ON movements(SO);
CREATE INDEX IF NOT EXISTS Xmovements4 ON movements(DO);
CREATE INDEX IF NOT EXISTS Xmovements5 ON movements(product_id);




DROP INDEX IF EXISTS Xstock_taking4;
DROP INDEX IF EXISTS Xstock_taking3;
DROP INDEX IF EXISTS Xstock_taking2;
DROP INDEX IF EXISTS Xstock_taking1;
DROP TABLE IF EXISTS stock_taking;

CREATE TABLE IF NOT EXISTS stock_taking
(
	updated          TEXT DEFAULT '', -- Creation or update timestamp
	stock_taking_id  TEXT DEFAULT '', -- Action identifier (generated)
	product_id       TEXT DEFAULT '', -- Product identifier
	location_id      TEXT DEFAULT '', -- Asociated location identifier
	quantity_counted NUMERIC          -- Quantity moved
);

CREATE INDEX IF NOT EXISTS Xstock_taking1 ON stock_taking(updated);
CREATE INDEX IF NOT EXISTS Xstock_taking2 ON stock_taking(product_id);
CREATE INDEX IF NOT EXISTS Xstock_taking3 ON stock_taking(location_id);
CREATE INDEX IF NOT EXISTS Xstock_taking4 ON stock_taking(stock_taking_id);




DROP INDEX IF EXISTS Xwaste4;
DROP INDEX IF EXISTS Xwaste3;
DROP INDEX IF EXISTS Xwaste2;
DROP INDEX IF EXISTS Xwaste1;
DROP TABLE IF EXISTS waste;

CREATE TABLE IF NOT EXISTS waste
(
	updated           TEXT DEFAULT '', -- Creation or update timestamp
	waste_action_id   TEXT DEFAULT '', -- Action identifier (generated)
	product_id        TEXT DEFAULT '', -- Product identifier
	quantity_removed  NUMERIC,         -- Quantity removed
	comments          TEXT DEFAULT '', -- Additional comments to the waste action
	from_location_id  TEXT DEFAULT ''  -- Asociated "FROM" location identifier
);

CREATE INDEX IF NOT EXISTS Xwaste1 ON waste(updated);
CREATE INDEX IF NOT EXISTS Xwaste2 ON waste(waste_action_id);
CREATE INDEX IF NOT EXISTS Xwaste3 ON waste(product_id);
CREATE INDEX IF NOT EXISTS Xwaste4 ON waste(from_location_id);




-- ****************************************************************************
-- ****************************************************************************
--
-- PROVIDERS TRANSACTIONS
--
-- ****************************************************************************
-- ****************************************************************************

DROP INDEX IF EXISTS Xpurchase_orders4;
DROP INDEX IF EXISTS Xpurchase_orders3;
DROP INDEX IF EXISTS Xpurchase_orders2;
DROP INDEX IF EXISTS Xpurchase_orders1;
DROP TABLE IF EXISTS purchase_orders;

CREATE TABLE IF NOT EXISTS purchase_orders
(
	updated            TEXT DEFAULT '', -- Creation or update timestamp
	provider_id        TEXT DEFAULT '', -- Provider identifier (generated, "0001", "0002", etc.)
	PO                 TEXT DEFAULT '', -- Purchase order document identifier
	expectedDate       TEXT DEFAULT '', -- Expected completed delivery data
	pctCompleted       NUMERIC,         -- Percentage of completion as of the last partial delivery order
	markAsCompleted    TEXT DEFAULT '', -- "YES", "NO", "YES" = the order has been marked as completed
	timestampCompleted TEXT DEFAULT ''  -- Timestamp of "mark as completed"
);

CREATE INDEX IF NOT EXISTS Xpurchase_orders1 ON purchase_orders(updated);
CREATE INDEX IF NOT EXISTS Xpurchase_orders2 ON purchase_orders(provider_id);
CREATE INDEX IF NOT EXISTS Xpurchase_orders3 ON purchase_orders(PO);
CREATE INDEX IF NOT EXISTS Xpurchase_orders4 ON purchase_orders(expectedDate);




DROP INDEX IF EXISTS Xpurchase_orders_items3;
DROP INDEX IF EXISTS Xpurchase_orders_items2;
DROP INDEX IF EXISTS Xpurchase_orders_items1;
DROP TABLE IF EXISTS purchase_orders_items;

CREATE TABLE IF NOT EXISTS purchase_orders_items
(
	updated          TEXT DEFAULT '', -- Creation or update timestamp
	PO               TEXT DEFAULT '', -- Purchase order document identifier
	product_id       TEXT DEFAULT '', -- Product identifier
	quantity_ordered NUMERIC,         -- Quantity delivered
	unit_price       NUMERIC          -- Unit price as of the PO for COGS computation
);

CREATE INDEX IF NOT EXISTS Xpurchase_orders_items1 ON purchase_orders_items(updated);
CREATE INDEX IF NOT EXISTS Xpurchase_orders_items2 ON purchase_orders_items(PO);
CREATE INDEX IF NOT EXISTS Xpurchase_orders_items3 ON purchase_orders_items(product_id);




DROP INDEX IF EXISTS Xpo_deliveries5;
DROP INDEX IF EXISTS Xpo_deliveries4;
DROP INDEX IF EXISTS Xpo_deliveries3;
DROP INDEX IF EXISTS Xpo_deliveries2;
DROP INDEX IF EXISTS Xpo_deliveries1;
DROP TABLE IF EXISTS po_deliveries;

CREATE TABLE IF NOT EXISTS po_deliveries
(
	updated            TEXT DEFAULT '', -- Creation or update timestamp
	PO                 TEXT DEFAULT '', -- Purchase order document identifier
	DO                 TEXT DEFAULT '', -- Delivery (DO) identifier (partial or complete)
	product_id         TEXT DEFAULT '', -- Product identifier
	quantity_delivered NUMERIC,         -- Quantity delivered
	transporter_id     TEXT DEFAULT '', -- Transporter identification
	vehicle_reg_no     TEXT DEFAULT ''  -- Transporter vehicle regitration number
);

CREATE INDEX IF NOT EXISTS Xpo_deliveries1 ON po_deliveries(updated);
CREATE INDEX IF NOT EXISTS Xpo_deliveries2 ON po_deliveries(PO);
CREATE INDEX IF NOT EXISTS Xpo_deliveries3 ON po_deliveries(DO);
CREATE INDEX IF NOT EXISTS Xpo_deliveries4 ON po_deliveries(product_id);
CREATE INDEX IF NOT EXISTS Xpo_deliveries5 ON po_deliveries(transporter_id);




DROP INDEX IF EXISTS Xpo_returns5;
DROP INDEX IF EXISTS Xpo_returns4;
DROP INDEX IF EXISTS Xpo_returns3;
DROP INDEX IF EXISTS Xpo_returns2;
DROP INDEX IF EXISTS Xpo_returns1;
DROP TABLE IF EXISTS po_returns;

CREATE TABLE IF NOT EXISTS po_returns
(
	updated           TEXT DEFAULT '', -- Creation or update timestamp
	PO                TEXT DEFAULT '', -- Purchase order document identifier
	DO                TEXT DEFAULT '', -- Delivery (DO) identifier (partial or complete)
	product_id        TEXT DEFAULT '', -- Product identifier
	quantity_returned NUMERIC,         -- Quantity returned
	transporter_id    TEXT DEFAULT '', -- Transporter identification
	vehicle_reg_no    TEXT DEFAULT ''  -- Transporter vehicle regitration number
);

CREATE INDEX IF NOT EXISTS Xpo_returns1 ON po_returns(updated);
CREATE INDEX IF NOT EXISTS Xpo_returns2 ON po_returns(PO);
CREATE INDEX IF NOT EXISTS Xpo_returns3 ON po_returns(DO);
CREATE INDEX IF NOT EXISTS Xpo_returns4 ON po_returns(product_id);
CREATE INDEX IF NOT EXISTS Xpo_returns5 ON po_returns(transporter_id);




-- ****************************************************************************
-- ****************************************************************************
--
-- SALES TRANSACTIONS
--
-- ****************************************************************************
-- ****************************************************************************

DROP INDEX IF EXISTS Xsales_orders4;
DROP INDEX IF EXISTS Xsales_orders3;
DROP INDEX IF EXISTS Xsales_orders2;
DROP INDEX IF EXISTS Xsales_orders1;
DROP TABLE IF EXISTS sales_orders;

CREATE TABLE IF NOT EXISTS sales_orders
(
	updated            TEXT DEFAULT '', -- Creation timestamp
	customer_id        TEXT DEFAULT '', -- Provider identifier (generated, "0001", "0002", etc.)
	SO                 TEXT DEFAULT '', -- Purchase order document identifier
	expectedDate       TEXT DEFAULT '', -- Expected completed delivery date
	timestampStartPrep TEXT DEFAULT '', -- Timestamp at preparation starting
	markAsCompleted    TEXT DEFAULT '', -- "YES", "NO", "YES" = the order has been marked as completed
	timestampCompleted TEXT DEFAULT ''  -- Timestamp at sales order send completed
);

CREATE INDEX IF NOT EXISTS Xsales_orders1 ON sales_orders(updated);
CREATE INDEX IF NOT EXISTS Xsales_orders2 ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS Xsales_orders3 ON sales_orders(SO);
CREATE INDEX IF NOT EXISTS Xsales_orders4 ON sales_orders(expectedDate);




DROP INDEX IF EXISTS Xsales_orders_items3;
DROP INDEX IF EXISTS Xsales_orders_items2;
DROP INDEX IF EXISTS Xsales_orders_items1;
DROP TABLE IF EXISTS sales_orders_items;

CREATE TABLE IF NOT EXISTS sales_orders_items
(
	updated          TEXT DEFAULT '', -- Creation or update timestamp
	SO               TEXT DEFAULT '', -- Purchase order document identifier
	product_id       TEXT DEFAULT '', -- Product identifier
	quantity_ordered NUMERIC          -- Quantity ordered
);

CREATE INDEX IF NOT EXISTS Xsales_orders_items1 ON sales_orders_items(updated);
CREATE INDEX IF NOT EXISTS Xsales_orders_items2 ON sales_orders_items(SO);
CREATE INDEX IF NOT EXISTS Xsales_orders_items3 ON sales_orders_items(product_id);




DROP INDEX IF EXISTS Xso_deliveries5;
DROP INDEX IF EXISTS Xso_deliveries4;
DROP INDEX IF EXISTS Xso_deliveries3;
DROP INDEX IF EXISTS Xso_deliveries2;
DROP INDEX IF EXISTS Xso_deliveries1;
DROP TABLE IF EXISTS so_deliveries;

CREATE TABLE IF NOT EXISTS so_deliveries
(
	updated           TEXT DEFAULT '', -- Creation or update timestamp
	SO                TEXT DEFAULT '', -- Purchase order document identifier
	DO                TEXT DEFAULT '', -- Delivery (DO) identifier (partial or complete)
	product_id        TEXT DEFAULT '', -- Product identifier
	quantity_sent     NUMERIC,         -- Quantity sent on delivery (partial or full)
	transporter_id    TEXT DEFAULT '', -- Transporter identification
	vehicle_reg_no    TEXT DEFAULT ''  -- Transporter vehicle regitration number
);

CREATE INDEX IF NOT EXISTS Xso_deliveries1 ON so_deliveries(updated);
CREATE INDEX IF NOT EXISTS Xso_deliveries2 ON so_deliveries(SO);
CREATE INDEX IF NOT EXISTS Xso_deliveries3 ON so_deliveries(DO);
CREATE INDEX IF NOT EXISTS Xso_deliveries4 ON so_deliveries(product_id);
CREATE INDEX IF NOT EXISTS Xso_deliveries5 ON so_deliveries(transporter_id);




DROP INDEX IF EXISTS Xso_returns5;
DROP INDEX IF EXISTS Xso_returns4;
DROP INDEX IF EXISTS Xso_returns3;
DROP INDEX IF EXISTS Xso_returns2;
DROP INDEX IF EXISTS Xso_returns1;
DROP TABLE IF EXISTS so_returns;

CREATE TABLE IF NOT EXISTS so_returns
(
	updated           TEXT DEFAULT '', -- Creation or update timestamp
	SO                TEXT DEFAULT '', -- Purchase order document identifier
	DO                TEXT DEFAULT '', -- Delivery (DO) identifier (partial or complete)
	product_id        TEXT DEFAULT '', -- Product identifier
	quantity_returned NUMERIC,         -- Quantity returned
	transporter_id    TEXT DEFAULT '', -- Transporter identification
	vehicle_reg_no    TEXT DEFAULT ''  -- Transporter vehicle regitration number
);

CREATE INDEX IF NOT EXISTS Xso_returns1 ON so_returns(updated);
CREATE INDEX IF NOT EXISTS Xso_returns2 ON so_returns(SO);
CREATE INDEX IF NOT EXISTS Xso_returns3 ON so_returns(DO);
CREATE INDEX IF NOT EXISTS Xso_returns4 ON so_returns(product_id);
CREATE INDEX IF NOT EXISTS Xso_returns5 ON so_returns(transporter_id);




-- End of file: wmslite.sql
