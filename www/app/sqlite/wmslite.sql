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
	business_name      TEXT DEFAULT '', -- Business name
	business_address   TEXT DEFAULT '', -- Business address (multiline)
	business_city      TEXT DEFAULT '', -- Business city (separate for document timestamp)
	business_LngLat    TEXT DEFAULT '', -- Longitude/latitude of business location (shareable)
	im_dataURL_fname   TEXT DEFAULT '', -- File storage for image/logo business dataURL
	bg_dataURL_fname   TEXT DEFAULT '', -- File storage for background image
	user_name          TEXT DEFAULT '', -- User name
	phone_no           TEXT DEFAULT '', -- User phone number
	user_dataURL_fname TEXT DEFAULT ''  -- File storage for User profile image dataURL
); 


DROP INDEX IF EXISTS Xcontacts4;
DROP INDEX IF EXISTS Xcontacts3;
DROP INDEX IF EXISTS Xcontacts2;
DROP INDEX IF EXISTS Xcontacts1;

DROP TABLE IF EXISTS contacts;
CREATE TABLE IF NOT EXISTS contacts
(
	contact_id         TEXT DEFAULT '', -- Generated, "0001", "0002", etc.
	contact_name       TEXT DEFAULT '', -- Contact name
	contact_address    TEXT DEFAULT '', -- Contact address (multiline)
	contact_city       TEXT DEFAULT '', -- Contact city
	is_supplier        TEXT DEFAULT '', -- "YES", "NO"
	is_customer        TEXT DEFAULT '', -- "YES", "NO"
	is_transporter     TEXT DEFAULT '', -- "YES", "NO"
	user_name          TEXT DEFAULT '', -- User name
	phone_no           TEXT DEFAULT '', -- User phone number
	user_dataURL_fname TEXT DEFAULT ''  -- File storage for User profile image dataURL
);

CREATE INDEX IF NOT EXISTS Xcontacts1 ON contacts(contact_id);
CREATE INDEX IF NOT EXISTS Xcontacts2 ON contacts(contact_name);
CREATE INDEX IF NOT EXISTS Xcontacts3 ON contacts(user_name);
CREATE INDEX IF NOT EXISTS Xcontacts4 ON contacts(phone_no);


-- ****************************************************************************
-- ****************************************************************************
--
-- MASTER DATA
--
-- ****************************************************************************
-- ****************************************************************************

DROP INDEX IF EXISTS Xlocations1;
DROP TABLE IF EXISTS locations;

CREATE TABLE IF NOT EXISTS locations
(
	location_id   TEXT DEFAULT '', -- Location identifier
	location_name TEXT DEFAULT '', -- Name of the location
	is_inventory  TEXT DEFAULT '', -- "YES", "NO", "YES": The loccation counts as inventory location
	refrigerated  TEXT DEFAULT ''  -- "YES", "NO", "YES": The location is refrigerated
);

CREATE INDEX IF NOT EXISTS Xlocations1 ON locations(location_id);


DROP INDEX IF EXISTS Xproducts1;
DROP TABLE IF EXISTS products;

CREATE TABLE IF NOT EXISTS products
(
	product_id         TEXT DEFAULT '', -- Product identifier or barcode value
	product_text       TEXT DEFAULT '', -- Searchable textual name and product description
	im_dataURL_fname   TEXT DEFAULT '', -- File storage for product image dataURL
	storage_unit       TEXT DEFAULT '', -- Textual unit representation (uppercase always)
	refrigerated       TEXT DEFAULT '', -- "YES", "NO", "YES": The product requires a refrigerated area
	reorder_quantity   NUMERIC,         -- Reorder minimal threshold
	initial_unit_price NUMERIC          -- Initial reference supply unit price as of product creation
);

CREATE INDEX IF NOT EXISTS Xproducts1 ON products(product_id);


-- ****************************************************************************
-- ****************************************************************************
--
-- INVENTORY
--
-- ****************************************************************************
-- ****************************************************************************

DROP INDEX IF EXISTS Xinventory4;
DROP INDEX IF EXISTS Xinventory3;
DROP INDEX IF EXISTS Xinventory2;
DROP INDEX IF EXISTS Xinventory1;
DROP TABLE IF EXISTS inventory;

CREATE TABLE IF NOT EXISTS inventory
(
	updated     TEXT DEFAULT '', -- Creation timestamp
	action_info TEXT DEFAULT '', -- Action info: "TAKING", "PREPARATION", etc. or processed DO
	location_id TEXT DEFAULT '', -- Asociated location identifier (most actions implying goods transfer create 2x inventory records)
	product_id  TEXT DEFAULT '', -- Product identifier
	qty_pulled  INTEGER,         -- Related removed quantity
	qty_pushed  INTEGER,         -- Related added quantity
	qty_on_hand INTEGER,         -- Estimated or real quantity on hand on location
	reconciled  TEXT DEFAULT ''  -- "YES","NO", "YES" = the value of "qty_on_hand" is verified at instant "updated" (always "YES" on stock taking action)
);

CREATE INDEX IF NOT EXISTS Xinventory1 ON inventory(updated);
CREATE INDEX IF NOT EXISTS Xinventory2 ON inventory(action_info);
CREATE INDEX IF NOT EXISTS Xinventory3 ON inventory(location_id);
CREATE INDEX IF NOT EXISTS Xinventory4 ON inventory(product_id);


-- Cost of Goods on Stock PER UNIT (UNIT COST) history log
-- Accounted for ("is_inventory" = "YES") locations
--
DROP INDEX IF EXISTS Xcogs3;
DROP INDEX IF EXISTS Xcogs2;
DROP INDEX IF EXISTS Xcogs1;
DROP TABLE IF EXISTS cogs;

CREATE TABLE IF NOT EXISTS cogs
(
	updated           TEXT DEFAULT '', -- Creation timestamp
	action_info       TEXT DEFAULT '', -- Action info: "INIT", "TAKING", "PREPARATION", etc. or processed DO
	product_id        TEXT DEFAULT '', -- Product identifier
	qty_pulled        INTEGER,         -- Related removed quantity
	qty_pushed        INTEGER,         -- Related added quantity
	qty_on_hand       INTEGER,         -- Quantity already on stock
	current_cogs      NUMERIC,         -- Current COGS applying to the quantity on stock
	supply_unit_price NUMERIC,         -- New reference supply unit price as of "updated"
	computed_cogs     NUMERIC          -- Resulting COGS after inbound
);

CREATE INDEX IF NOT EXISTS Xcogs1 ON cogs(updated);
CREATE INDEX IF NOT EXISTS Xcogs2 ON cogs(product_id);
CREATE INDEX IF NOT EXISTS Xcogs3 ON cogs(action_info);


-- ****************************************************************************
-- ****************************************************************************
--
-- MOVEMENTS
--
-- ****************************************************************************
-- ****************************************************************************

DROP INDEX IF EXISTS Xstock_taking4;
DROP INDEX IF EXISTS Xstock_taking3;
DROP INDEX IF EXISTS Xstock_taking2;
DROP INDEX IF EXISTS Xstock_taking1;
DROP TABLE IF EXISTS stock_taking;

CREATE TABLE IF NOT EXISTS stock_taking
(
	updated         TEXT DEFAULT '', -- Creation timestamp
	stock_taking_id TEXT DEFAULT '', -- Action identifier (generated)
	product_id      TEXT DEFAULT '', -- Product identifier
	location_id     TEXT DEFAULT '', -- Asociated location identifier
	qty_on_hand     INTEGER          -- Quantity verified on location
);

CREATE INDEX IF NOT EXISTS Xstock_taking1 ON stock_taking(updated);
CREATE INDEX IF NOT EXISTS Xstock_taking2 ON stock_taking(stock_taking_id);
CREATE INDEX IF NOT EXISTS Xstock_taking3 ON stock_taking(product_id);
CREATE INDEX IF NOT EXISTS Xstock_taking4 ON stock_taking(location_id);


DROP INDEX IF EXISTS Xwaste4;
DROP INDEX IF EXISTS Xwaste3;
DROP INDEX IF EXISTS Xwaste2;
DROP INDEX IF EXISTS Xwaste1;
DROP TABLE IF EXISTS waste;

CREATE TABLE IF NOT EXISTS waste
(
	updated         TEXT DEFAULT '', -- Creation timestamp
	waste_action_id TEXT DEFAULT '', -- Action identifier (generated)
	product_id      TEXT DEFAULT '', -- Product identifier
	location_id     TEXT DEFAULT '', -- Asociated location identifier
	qty_pulled      INTEGER,         -- Quantity removed
	comments        TEXT DEFAULT ''  -- Additional comments to the waste action
);

CREATE INDEX IF NOT EXISTS Xwaste1 ON waste(updated);
CREATE INDEX IF NOT EXISTS Xwaste2 ON waste(waste_action_id);
CREATE INDEX IF NOT EXISTS Xwaste3 ON waste(product_id);
CREATE INDEX IF NOT EXISTS Xwaste4 ON waste(location_id);


-- ****************************************************************************
-- ****************************************************************************
--
-- SUPPLY TRANSACTIONS
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
	contact_id         TEXT DEFAULT '', -- Contact as supplier identifier
	PO                 TEXT DEFAULT '', -- Purchase order document identifier (generated)
	expectedDate       TEXT DEFAULT '', -- Expected completed delivery data
	pctCompleted       NUMERIC,         -- Percentage of completion as of last partial delivery order
	markAsCompleted    TEXT DEFAULT '', -- "YES", "NO", "YES" = the order has been marked as completed
	timestampCompleted TEXT DEFAULT ''  -- "markAsCompleted" timestamp
);

CREATE INDEX IF NOT EXISTS Xpurchase_orders1 ON purchase_orders(updated);
CREATE INDEX IF NOT EXISTS Xpurchase_orders2 ON purchase_orders(contact_id);
CREATE INDEX IF NOT EXISTS Xpurchase_orders3 ON purchase_orders(PO);
CREATE INDEX IF NOT EXISTS Xpurchase_orders4 ON purchase_orders(expectedDate);


DROP INDEX IF EXISTS Xpurchase_orders_items2;
DROP INDEX IF EXISTS Xpurchase_orders_items1;
DROP TABLE IF EXISTS purchase_orders_items;

CREATE TABLE IF NOT EXISTS purchase_orders_items
(
	PO                TEXT DEFAULT '', -- Purchase order document identifier (generated)
	product_id        TEXT DEFAULT '', -- Product identifier 
	qty_ordered       INTEGER,         -- Quantity delivered
	supply_unit_price NUMERIC          -- Supply unit price as of PO creation
);

CREATE INDEX IF NOT EXISTS Xpurchase_orders_items1 ON purchase_orders_items(PO);
CREATE INDEX IF NOT EXISTS Xpurchase_orders_items2 ON purchase_orders_items(product_id);


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
	contact_id         TEXT DEFAULT '', -- Contact as customer identifier
	SO                 TEXT DEFAULT '', -- Purchase order document identifier
	expectedDate       TEXT DEFAULT '', -- Expected completed delivery date
	timestampStartPrep TEXT DEFAULT '', -- Timestamp at preparation starting
	pctCompleted       NUMERIC,         -- Percentage of completion as of last partial delivery order
	markAsCompleted    TEXT DEFAULT '', -- "YES", "NO", "YES" = the order has been marked as completed
	timestampCompleted TEXT DEFAULT ''  -- Timestamp at sales order send completed
);

CREATE INDEX IF NOT EXISTS Xsales_orders1 ON sales_orders(updated);
CREATE INDEX IF NOT EXISTS Xsales_orders2 ON sales_orders(contact_id);
CREATE INDEX IF NOT EXISTS Xsales_orders3 ON sales_orders(SO);
CREATE INDEX IF NOT EXISTS Xsales_orders4 ON sales_orders(expectedDate);


DROP INDEX IF EXISTS Xsales_orders_items2;
DROP INDEX IF EXISTS Xsales_orders_items1;
DROP TABLE IF EXISTS sales_orders_items;

CREATE TABLE IF NOT EXISTS sales_orders_items
(
	SO          TEXT DEFAULT '', -- Purchase order document identifier
	product_id  TEXT DEFAULT '', -- Product identifier
	qty_ordered INTEGER          -- Quantity delivered
);

CREATE INDEX IF NOT EXISTS Xsales_orders_items1 ON sales_orders_items(SO);
CREATE INDEX IF NOT EXISTS Xsales_orders_items2 ON sales_orders_items(product_id);


-- ****************************************************************************
-- ****************************************************************************
--
-- DELIVERY TRANSACTIONS (INBOUND-OUTBOUND)
--
-- ****************************************************************************
-- ****************************************************************************

DROP INDEX IF EXISTS Xdelivery_orders4;
DROP INDEX IF EXISTS Xdelivery_orders3;
DROP INDEX IF EXISTS Xdelivery_orders2;
DROP INDEX IF EXISTS Xdelivery_orders1;
DROP TABLE IF EXISTS delivery_orders;

CREATE TABLE IF NOT EXISTS delivery_orders
(
	updated        TEXT DEFAULT '', -- Creation or update timestamp
	document_id    TEXT DEFAULT '', -- PO or SO identifier (optional)
	DO             TEXT DEFAULT '', -- Delivery order identifier (generated)
	transporter_id TEXT DEFAULT '', -- Contact as transporter indentifier (optional)
	vehicle_reg_no TEXT DEFAULT ''  -- Transporter vehicle regitration number
);

CREATE INDEX IF NOT EXISTS Xdelivery_orders1 ON delivery_orders(updated);
CREATE INDEX IF NOT EXISTS Xdelivery_orders2 ON delivery_orders(document_id);
CREATE INDEX IF NOT EXISTS Xdelivery_orders3 ON delivery_orders(DO);
CREATE INDEX IF NOT EXISTS Xdelivery_orders4 ON delivery_orders(transporter_id);


DROP INDEX IF EXISTS Xdelivery_order_items2;
DROP INDEX IF EXISTS Xdelivery_order_items1;
DROP TABLE IF EXISTS delivery_order_items;

CREATE TABLE IF NOT EXISTS delivery_order_items
(
	DO            TEXT DEFAULT '', -- Delivery identifier (generated)
	product_id    TEXT DEFAULT '', -- Product identifier
	qty_delivered INTEGER          -- Quantity delivered
);

CREATE INDEX IF NOT EXISTS Xdelivery_order_items1 ON delivery_order_items(DO);
CREATE INDEX IF NOT EXISTS Xdelivery_order_items2 ON delivery_order_items(product_id);


DROP INDEX IF EXISTS Xreturn_orders4;
DROP INDEX IF EXISTS Xreturn_orders3;
DROP INDEX IF EXISTS Xreturn_orders2;
DROP INDEX IF EXISTS Xreturn_orders1;
DROP TABLE IF EXISTS return_orders;

CREATE TABLE IF NOT EXISTS return_orders
(
	updated        TEXT DEFAULT '', -- Creation or update timestamp
	DO             TEXT DEFAULT '', -- Delivery order identifier (generated)
	RO             TEXT DEFAULT '', -- Return order identifier (generated)
	transporter_id TEXT DEFAULT '', -- Contact as transporter indentifier (optional)
	vehicle_reg_no TEXT DEFAULT ''  -- Transporter vehicle regitration number
);

CREATE INDEX IF NOT EXISTS Xreturn_orders1 ON return_orders(updated);
CREATE INDEX IF NOT EXISTS Xreturn_orders2 ON return_orders(DO);
CREATE INDEX IF NOT EXISTS Xreturn_orders3 ON return_orders(RO);
CREATE INDEX IF NOT EXISTS Xreturn_orders4 ON return_orders(transporter_id);


DROP INDEX IF EXISTS Xreturn_order_items2;
DROP INDEX IF EXISTS Xreturn_order_items1;
DROP TABLE IF EXISTS return_order_items;

CREATE TABLE IF NOT EXISTS return_order_items
(
	RO           TEXT DEFAULT '', -- Delivery identifier (generated)
	product_id   TEXT DEFAULT '', -- Product identifier
	qty_returned INTEGER          -- Quantity returned
);

CREATE INDEX IF NOT EXISTS Xreturn_order_items1 ON return_order_items(RO);
CREATE INDEX IF NOT EXISTS Xreturn_order_items2 ON return_order_items(product_id);




-- End of file: wmslite.sql
