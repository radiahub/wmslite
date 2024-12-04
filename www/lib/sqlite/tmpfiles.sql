-- MODULE: tmpfiles.sql
--
-- SQLITE 3
-- 
-- Registers temporary files due for deletion on application resume
--

DROP INDEX IF EXISTS Xtmpfiles1;
DROP TABLE IF EXISTS tmpfiles;

CREATE TABLE IF NOT EXISTS tmpfiles
(
	updated TEXT DEFAULT '', -- Creation timestamp
	fileURI TEXT DEFAULT '', -- Base-64 encoded local file URI
	fname   TEXT DEFAULT '', -- File name (not encoded)
);

CREATE INDEX IF NOT EXISTS Xtmpfiles1 ON tmpfiles(fileURI);


-- End of file: tmpfiles.sql
