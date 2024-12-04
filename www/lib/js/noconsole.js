// ============================================================================
// Module      : noconsole.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : Disable calls to console log, info, warn, error
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 10-Feb-23 12:00 WIT   Denis  Deployment V. 2023 "RAYMOND CHANDLER"
//
// ============================================================================

window.console.log   = function() {};
window.console.info  = function() {};
window.console.warn  = function() {};
window.console.error = function() {};




// End of file: noconsole.js
// ============================================================================