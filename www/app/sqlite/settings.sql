DROP TABLE IF EXISTS settings;
CREATE TABLE IF NOT EXISTS settings
(
	DO_items_location   TEXT DEFAULT '', -- Default location ID for DO inbound goods (ex: "INBOUND", "STORE")
	RO_items_location   TEXT DEFAULT '', -- Default location ID for RO outbound goods (ex: "OUTBOUND")
	cogs_auto_reconcile TEXT DEFAULT '', -- "YES","NO", "YES" = automatically reconcile COGS
);
